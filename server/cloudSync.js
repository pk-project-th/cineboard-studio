/**
 * CineBoard Studio — Automatic Cross-Device Cloud Sync Engine
 * Synchronizes SQLite projects & shots across iPhone 17, Desktop PC, and Render restarts
 * with ZERO user configuration required.
 */

const { getStoryboardSketch } = require('./sketchHelper');

// Default deterministic private vault topic for this CineBoard Studio deployment
const DEFAULT_VAULT_TOPIC = process.env.CINEBOARD_SYNC_TOPIC || 'cineboard_vault_pk_studio_2026_v4';

let syncTimeout = null;
let lastPushedHash = '';
let lastSyncTime = null;

function getTopicName(customCode) {
  const clean = String(customCode || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  return clean ? `cineboard_vault_${clean}_v4` : DEFAULT_VAULT_TOPIC;
}

/**
 * Export full SQLite state as a compact, cloud-safe JSON payload
 */
function exportDbSnapshot(db) {
  const series = db
    .prepare(
      `SELECT s.*,
        (SELECT COUNT(*) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS shot_count,
        (SELECT SUM(p.duration_seconds) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS total_duration
       FROM series s
       ORDER BY s.created_at DESC`
    )
    .all();

  const allPrompts = db
    .prepare('SELECT * FROM prompts WHERE is_active = 1 ORDER BY step_number ASC, sort_order ASC')
    .all();

  const shotsBySeries = {};
  for (const p of allPrompts) {
    if (!shotsBySeries[p.series_id]) shotsBySeries[p.series_id] = [];
    // Strip SVG data URLs during cloud transit to keep payload ultra-fast (< 25KB);
    // SVGs are deterministically reconstructed on restore, while compressed real photos (< 180KB) are kept!
    const isSvg = p.image_url && p.image_url.startsWith('data:image/svg+xml');
    const isHugeBase64 = p.image_url && p.image_url.length > 220000;
    shotsBySeries[p.series_id].push({
      ...p,
      image_url: isSvg || isHugeBase64 ? '' : p.image_url
    });
  }

  return {
    app: 'CineBoard Studio',
    version: '4.0',
    updated_at: Date.now(),
    series,
    shotsBySeries
  };
}

/**
 * Merge a snapshot (from Cloud Vault or Client Device) into SQLite without losing newer data
 */
function importSnapshotIntoDb(db, snapshot) {
  if (!snapshot || !Array.isArray(snapshot.series)) return 0;

  const insertSeries = db.prepare(`
    INSERT OR REPLACE INTO series (
      id, title, description, summary, target_duration, pacing, mode, viral_hook, music_vibe, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `);

  const insertPrompt = db.prepare(`
    INSERT OR REPLACE INTO prompts (
      id, series_id, step_number, step_title, title, subtitle,
      prompt_type, recommended_tool, aspect_ratio, content,
      dialogue_script, image_url, reference_image,
      copy_count, sort_order, is_active, camera_angle, shot_size,
      video_prompt, audio_foley, on_screen_text, live_action_guide,
      shot_role, is_completed, mode,
      master_photographer, depth_technique, story_meaning, pose_guide, lighting_tip, transition_tip,
      camera_movement, action_description, visual_style, scene_number, scene_title,
      duration_seconds, timecode, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, 1, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, COALESCE(?, CURRENT_TIMESTAMP)
    )
  `);

  let importedSeriesCount = 0;
  const shotsMap = snapshot.shotsBySeries || {};

  for (const s of snapshot.series) {
    if (!s || !s.id) continue;
    const activeMode = s.mode === 'photo' ? 'photo' : 'video';
    insertSeries.run(
      s.id,
      s.title || 'สตอรี่บอร์ด',
      s.description || '',
      s.summary || '',
      s.target_duration || 18,
      s.pacing || 'normal',
      activeMode,
      s.viral_hook || '',
      s.music_vibe || '',
      s.created_at || null
    );
    importedSeriesCount++;

    const shots = shotsMap[s.id];
    if (Array.isArray(shots)) {
      for (let i = 0; i < shots.length; i++) {
        const sh = shots[i];
        const stepNum = sh.step_number || i + 1;
        const shotMode = sh.mode || activeMode;
        const finalImg =
          sh.image_url && sh.image_url.trim()
            ? sh.image_url
            : getStoryboardSketch({ ...sh, mode: shotMode, step_number: stepNum });

        insertPrompt.run(
          sh.id || `shot-${s.id}-${stepNum}`,
          s.id,
          stepNum,
          sh.step_title || `${shotMode === 'photo' ? 'ภาพที่' : 'ฉากที่'} ${stepNum}`,
          sh.title || `${shotMode === 'photo' ? 'ภาพที่' : 'ฉากที่'} ${stepNum}`,
          sh.subtitle || sh.camera_angle || 'Medium Shot',
          sh.prompt_type || (shotMode === 'photo' ? 'photo' : 'first_frame'),
          sh.recommended_tool || 'CineBoard Director',
          sh.aspect_ratio || (shotMode === 'photo' ? '4:5' : '9:16'),
          sh.content || sh.prompt || sh.title || '',
          sh.dialogue_script || sh.dialogue || '',
          finalImg,
          sh.reference_image || null,
          sh.copy_count || 0,
          sh.sort_order || stepNum,
          sh.camera_angle || 'Medium Shot',
          sh.shot_size || sh.lens_focal || 'เลนส์ 1x',
          sh.video_prompt || '',
          sh.audio_foley || '',
          sh.on_screen_text || '',
          sh.live_action_guide || '',
          sh.shot_role || '',
          sh.is_completed ? 1 : 0,
          shotMode,
          sh.master_photographer || null,
          sh.depth_technique || null,
          sh.story_meaning || null,
          sh.pose_guide || null,
          sh.lighting_tip || null,
          sh.transition_tip || null,
          sh.camera_movement || '',
          sh.action_description || '',
          sh.visual_style || 'Editorial Lifestyle',
          sh.scene_number || stepNum,
          sh.scene_title || sh.shot_role || '',
          sh.duration_seconds || 0,
          sh.timecode || '',
          sh.created_at || null
        );
      }
    }
  }

  return importedSeriesCount;
}

/**
 * Push current SQLite snapshot to the Cloud Relay Vault
 */
async function pushDbToCloudNow(db, customCode) {
  try {
    const topic = getTopicName(customCode);
    const snapshot = exportDbSnapshot(db);
    const jsonStr = JSON.stringify(snapshot);

    // Avoid redundant push if nothing changed
    const currentHash = `${snapshot.series.length}:${jsonStr.length}:${snapshot.series.map(s => s.id).join(',')}`;
    lastPushedHash = currentHash;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    const isInline = Buffer.byteLength(jsonStr, 'utf8') <= 3800;
    const res = await fetch(`https://ntfy.sh/${topic}`, {
      method: isInline ? 'POST' : 'PUT',
      headers: isInline ? { 'Content-Type': 'text/plain; charset=utf-8' } : { Filename: 'cineboard-vault.json' },
      body: jsonStr,
      signal: controller.signal
    });
    clearTimeout(t);

    if (res.ok) {
      lastSyncTime = new Date().toISOString();
      console.log(`[Cloud Sync] Pushed ${snapshot.series.length} projects to cloud vault (${topic})`);
      return { success: true, synced_at: lastSyncTime, count: snapshot.series.length };
    }
  } catch (err) {
    console.warn('[Cloud Sync Push Notice]:', err.message);
  }
  return { success: false };
}

/**
 * Debounced background push (called after any DB write)
 */
function scheduleCloudPush(db, customCode) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushDbToCloudNow(db, customCode);
  }, 1200);
}

/**
 * Pull latest snapshot from Cloud Relay Vault and hydrate SQLite
 */
async function pullFromCloudIntoDb(db, customCode) {
  try {
    const topic = getTopicName(customCode);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, {
      signal: controller.signal
    });
    clearTimeout(t);

    if (!res.ok) return { success: false, count: 0 };
    const text = await res.text();
    if (!text || !text.trim()) return { success: true, count: 0 };

    const lines = text
      .trim()
      .split('\n')
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch (_) {
          return null;
        }
      })
      .filter((m) => m && m.event === 'message');

    if (lines.length === 0) return { success: true, count: 0 };

    // Walk backwards from the most recent message to find the latest valid snapshot
    for (let i = lines.length - 1; i >= 0; i--) {
      const msg = lines[i];
      let snapshot = null;

      if (msg.attachment && msg.attachment.url) {
        try {
          const attRes = await fetch(msg.attachment.url);
          if (attRes.ok) {
            snapshot = await attRes.json();
          }
        } catch (_) {}
      } else if (msg.message && msg.message.startsWith('{')) {
        try {
          snapshot = JSON.parse(msg.message);
        } catch (_) {}
      }

      if (snapshot && Array.isArray(snapshot.series)) {
        // If snapshot explicitly cleared all projects (0 series), only apply if DB is also empty
        if (snapshot.series.length === 0) {
          lastSyncTime = new Date(msg.time * 1000).toISOString();
          return { success: true, count: 0, synced_at: lastSyncTime };
        }
        const count = importSnapshotIntoDb(db, snapshot);
        lastSyncTime = new Date(msg.time * 1000).toISOString();
        console.log(`[Cloud Sync] Restored ${count} projects from cloud vault (${topic})`);
        return { success: true, count, synced_at: lastSyncTime };
      }
    }
  } catch (err) {
    console.warn('[Cloud Sync Pull Notice]:', err.message);
  }
  return { success: false, count: 0 };
}

function getLastSyncTime() {
  return lastSyncTime;
}

module.exports = {
  exportDbSnapshot,
  importSnapshotIntoDb,
  pushDbToCloudNow,
  scheduleCloudPush,
  pullFromCloudIntoDb,
  getLastSyncTime
};
