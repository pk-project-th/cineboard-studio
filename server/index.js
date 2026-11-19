const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');
const aiService = require('./aiService');
const cloudSync = require('./cloudSync');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directory exists and is served statically in BOTH dev & production
const uploadsDir = path.join(__dirname, '..', 'client', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Request logger
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.url.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. SERIES / PROJECT ENDPOINTS
// ==========================================

let initialCloudPullDone = false;

app.get('/api/series', async (req, res) => {
  try {
    let series = db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS shot_count,
        (SELECT p.image_url FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1 ORDER BY p.step_number ASC, p.sort_order ASC LIMIT 1) AS preview_image,
        (SELECT SUM(p.duration_seconds) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS total_duration
      FROM series s 
      ORDER BY s.created_at DESC
    `).all();

    // If Render just rebooted with an empty DB, automatically hydrate from Cloud Vault!
    if (series.length === 0 && !initialCloudPullDone) {
      initialCloudPullDone = true;
      await cloudSync.pullFromCloudIntoDb(db, req.query.sync_code);
      series = db.prepare(`
        SELECT s.*, 
          (SELECT COUNT(*) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS shot_count,
          (SELECT p.image_url FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1 ORDER BY p.step_number ASC, p.sort_order ASC LIMIT 1) AS preview_image,
          (SELECT SUM(p.duration_seconds) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS total_duration
        FROM series s 
        ORDER BY s.created_at DESC
      `).all();
    }

    res.json({
      success: true,
      data: series,
      synced_at: cloudSync.getLastSyncTime()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/series/:id', (req, res) => {
  try {
    const { id } = req.params;
    const s = db.prepare('SELECT * FROM series WHERE id = ?').get(id);
    if (!s) {
      return res.status(404).json({ success: false, error: 'ไม่พบโปรเจกต์สตอรี่บอร์ด' });
    }
    const shots = db.prepare('SELECT * FROM prompts WHERE series_id = ? AND is_active = 1 ORDER BY step_number ASC, sort_order ASC').all(id);
    res.json({
      success: true,
      data: {
        ...s,
        shots: shots.map(p => ({
          ...p,
          variables_schema: p.variables_schema ? JSON.parse(p.variables_schema) : null
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/series/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM prompts WHERE series_id = ?').run(id);
    const result = db.prepare('DELETE FROM series WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'ไม่พบโปรเจกต์ที่ต้องการลบ' });
    }
    cloudSync.scheduleCloudPush(db);
    res.json({ success: true, message: 'ลบโปรเจกต์สตอรี่บอร์ดและช็อตทั้งหมดเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PROMPT & SHOT ENDPOINTS
// ==========================================

app.get('/api/prompts', (req, res) => {
  try {
    const { series_id } = req.query;
    let query = 'SELECT * FROM prompts WHERE is_active = 1';
    const params = [];

    if (series_id && series_id !== 'all') {
      query += ' AND series_id = ?';
      params.push(series_id);
    }
    query += ' ORDER BY step_number ASC, sort_order ASC';

    const prompts = db.prepare(query).all(...params);
    res.json({
      success: true,
      data: prompts.map(p => ({
        ...p,
        variables_schema: p.variables_schema ? JSON.parse(p.variables_schema) : null
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate or Regenerate real AI image for a specific shot
app.post('/api/prompts/:id/generate-image', async (req, res) => {
  try {
    const { id } = req.params;
    const promptRow = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);

    const {
      prompt = promptRow?.content || promptRow?.title || 'aesthetic lifestyle travel photography',
      aspect_ratio = promptRow?.aspect_ratio || '9:16'
    } = req.body;

    console.log(`[AI Shot Image] Generating image for shot ${id}...`);
    const imgUrl = await aiService.generateAIImage(prompt, { aspect_ratio });

    if (imgUrl) {
      if (promptRow) {
        db.prepare('UPDATE prompts SET image_url = ?, aspect_ratio = ? WHERE id = ?').run(imgUrl, aspect_ratio, id);
        const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
        return res.json({ success: true, data: updated, image_url: imgUrl });
      }
      // Support client-cached shots even if Render DB was reset!
      return res.json({ success: true, data: { id, image_url: imgUrl }, image_url: imgUrl });
    } else {
      return res.status(503).json({
        success: false,
        error: 'ระบบวาดภาพ AI ใช้งานหนาแน่นชั่วคราว ลองกดวาดใหม่อีกครั้งได้เลยครับ'
      });
    }
  } catch (err) {
    console.error('[Generate Shot Image Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update an individual shot
app.put('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    if (!existing) {
      return res.json({ success: true, data: { id, ...req.body }, localOnly: true });
    }

    const {
      title,
      content,
      dialogue_script,
      camera_angle,
      camera_movement,
      shot_size,
      action_description,
      audio_foley,
      on_screen_text,
      live_action_guide,
      shot_role,
      is_completed,
      master_photographer,
      depth_technique,
      story_meaning,
      pose_guide,
      lighting_tip,
      transition_tip,
      video_prompt,
      visual_style,
      duration_seconds,
      image_url,
      aspect_ratio
    } = req.body;

    db.prepare(`
      UPDATE prompts SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        dialogue_script = COALESCE(?, dialogue_script),
        camera_angle = COALESCE(?, camera_angle),
        camera_movement = COALESCE(?, camera_movement),
        shot_size = COALESCE(?, shot_size),
        action_description = COALESCE(?, action_description),
        audio_foley = COALESCE(?, audio_foley),
        on_screen_text = COALESCE(?, on_screen_text),
        live_action_guide = COALESCE(?, live_action_guide),
        shot_role = COALESCE(?, shot_role),
        is_completed = COALESCE(?, is_completed),
        master_photographer = COALESCE(?, master_photographer),
        depth_technique = COALESCE(?, depth_technique),
        story_meaning = COALESCE(?, story_meaning),
        pose_guide = COALESCE(?, pose_guide),
        lighting_tip = COALESCE(?, lighting_tip),
        transition_tip = COALESCE(?, transition_tip),
        video_prompt = COALESCE(?, video_prompt),
        visual_style = COALESCE(?, visual_style),
        duration_seconds = COALESCE(?, duration_seconds),
        image_url = COALESCE(?, image_url),
        aspect_ratio = COALESCE(?, aspect_ratio)
      WHERE id = ?
    `).run(
      title,
      content,
      dialogue_script,
      camera_angle,
      camera_movement,
      shot_size,
      action_description,
      audio_foley,
      on_screen_text,
      live_action_guide,
      shot_role,
      is_completed !== undefined ? (is_completed ? 1 : 0) : null,
      master_photographer,
      depth_technique,
      story_meaning,
      pose_guide,
      lighting_tip,
      transition_tip,
      video_prompt,
      visual_style,
      duration_seconds,
      image_url,
      aspect_ratio,
      id
    );

    const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    cloudSync.scheduleCloudPush(db);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Batch update prompts
app.put('/api/prompts-batch', (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: 'ข้อมูลอัปเดตไม่ถูกต้อง' });
    }

    const updateStmt = db.prepare(`
      UPDATE prompts SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        step_number = COALESCE(?, step_number),
        sort_order = COALESCE(?, sort_order),
        camera_angle = COALESCE(?, camera_angle),
        camera_movement = COALESCE(?, camera_movement),
        duration_seconds = COALESCE(?, duration_seconds),
        action_description = COALESCE(?, action_description),
        dialogue_script = COALESCE(?, dialogue_script),
        on_screen_text = COALESCE(?, on_screen_text),
        live_action_guide = COALESCE(?, live_action_guide),
        shot_role = COALESCE(?, shot_role),
        master_photographer = COALESCE(?, master_photographer),
        depth_technique = COALESCE(?, depth_technique),
        story_meaning = COALESCE(?, story_meaning),
        pose_guide = COALESCE(?, pose_guide),
        lighting_tip = COALESCE(?, lighting_tip),
        transition_tip = COALESCE(?, transition_tip),
        video_prompt = COALESCE(?, video_prompt),
        audio_foley = COALESCE(?, audio_foley)
      WHERE id = ?
    `);

    for (const item of updates) {
      if (item.id) {
        updateStmt.run(
          item.title,
          item.content,
          item.step_number,
          item.sort_order,
          item.camera_angle,
          item.camera_movement,
          item.duration_seconds,
          item.action_description,
          item.dialogue_script,
          item.on_screen_text,
          item.live_action_guide,
          item.shot_role,
          item.master_photographer,
          item.depth_technique,
          item.story_meaning,
          item.pose_guide,
          item.lighting_tip,
          item.transition_tip,
          item.video_prompt,
          item.audio_foley,
          item.id
        );
      }
    }

    cloudSync.scheduleCloudPush(db);
    res.json({ success: true, message: `อัปเดต ${updates.length} ช็อตเรียบร้อย` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a shot
app.delete('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM prompts WHERE id = ?').run(id);
    cloudSync.scheduleCloudPush(db);
    res.json({ success: true, message: 'ลบช็อตเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/prompts/:id/copy', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE prompts SET copy_count = copy_count + 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. STORYBOARD DIRECTOR & PLANNING PIPELINE
// ==========================================

app.post('/api/storyboard/ai-plan', async (req, res) => {
  try {
    const {
      mode = 'video',
      story_concept,
      num_shots = 0,
      target_duration = 18,
      pacing = 'normal',
      style = 'auto',
      visual_style = 'auto',
      camera_breakdown = 'auto_story',
      aspect_ratio
    } = req.body;

    if (!story_concept || !story_concept.trim()) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุโจทย์หรือสถานที่ที่ต้องการถ่ายครับ' });
    }

    const chosenStyle = visual_style || style || 'auto';
    const planData = await aiService.planStoryboard({
      mode,
      story_concept,
      num_shots,
      target_duration,
      pacing,
      visual_style: chosenStyle,
      camera_breakdown,
      aspect_ratio
    });

    res.json({
      success: true,
      data: planData,
      visual_style: chosenStyle
    });
  } catch (err) {
    console.error('[Storyboard AI Plan Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/storyboard/commit-shots', async (req, res) => {
  try {
    const {
      mode = 'video',
      shots,
      project_title,
      viral_hook = '',
      music_vibe = '',
      visual_style = 'Editorial Lifestyle Natural',
      target_duration = 18,
      pacing = 'normal',
      aspect_ratio
    } = req.body;

    if (!shots || !Array.isArray(shots) || shots.length === 0) {
      return res.status(400).json({ success: false, error: 'ไม่พบรายการช็อต' });
    }

    const activeMode = mode === 'photo' ? 'photo' : 'video';
    const finalAspect = aspect_ratio || (activeMode === 'photo' ? '4:5' : '9:16');
    const seriesId = 'series-sb-' + Date.now();
    const finalTitle = project_title || (activeMode === 'photo' ? `เซ็ตภาพนิ่ง (${shots.length} มุม)` : `สตอรี่บอร์ดวิดีโอ (${shots.length} ฉาก)`);

    let timeSec = 0;
    const formatSec = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secPart = seconds % 60;
      const sStr = secPart < 10 ? '0' + secPart.toFixed(1) : secPart.toFixed(1);
      return `${mins}:${sStr}`;
    };

    const finalShots = shots.map((s, idx) => {
      const dur = activeMode === 'photo' ? 0 : (parseFloat(s.duration_seconds) || 2.5);
      const startSec = timeSec;
      const endSec = Math.round((startSec + dur) * 10) / 10;
      timeSec = endSec;

      return {
        ...s,
        mode: activeMode,
        step_number: idx + 1,
        sort_order: idx + 1,
        duration_seconds: dur,
        aspect_ratio: s.aspect_ratio || finalAspect,
        timecode: activeMode === 'photo' ? `Slide ${idx + 1}/${shots.length}` : `${formatSec(startSec)} - ${formatSec(endSec)}`
      };
    });

    const totalDurationSec = Math.round(timeSec * 10) / 10;

    db.prepare(`
      INSERT INTO series (id, title, description, summary, target_duration, pacing, mode, viral_hook, music_vibe)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      seriesId,
      finalTitle,
      activeMode === 'photo'
        ? `เซ็ตภาพนิ่ง ${shots.length} มุม • แรงบันดาลใจช่างภาพระดับโลก`
        : `วิดีโอไลฟ์สไตล์ ${shots.length} ฉาก • ความยาวรวม ${totalDurationSec} วิ`,
      viral_hook || `แผนการถ่ายทำฉบับสมบูรณ์`,
      totalDurationSec,
      pacing,
      activeMode,
      viral_hook,
      music_vibe
    );

    const insertPrompt = db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle,
        prompt_type, recommended_tool, aspect_ratio, content,
        dialogue_script, variables_schema, image_url, reference_image,
        copy_count, sort_order, is_active, camera_angle, shot_size,
        video_prompt, audio_foley, on_screen_text, live_action_guide,
        shot_role, is_completed, mode,
        master_photographer, depth_technique, story_meaning, pose_guide, lighting_tip, transition_tip,
        camera_movement, action_description, visual_style, scene_number, scene_title,
        duration_seconds, timecode
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        0, ?, 1, ?, ?,
        ?, ?, ?, ?,
        ?, 0, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    const createdRows = [];
    const labelPrefix = activeMode === 'photo' ? 'ภาพที่' : 'ฉากที่';

    for (const s of finalShots) {
      const pId = 'shot-' + Date.now() + '-' + s.step_number;
      let finalImg = s.image_url;
      if (!finalImg || !finalImg.trim()) {
        finalImg = getStoryboardSketch({
          ...s,
          mode: activeMode,
          step_number: s.step_number,
          aspect_ratio: s.aspect_ratio || finalAspect
        });
      }

      const roleText = s.shot_role || s.scene_title || `${labelPrefix} ${s.step_number}`;

      insertPrompt.run(
        pId,
        seriesId,
        s.step_number,
        `${labelPrefix} ${s.step_number}`,
        s.title || `${labelPrefix} ${s.step_number}`,
        s.camera_angle_th || s.camera_angle || 'Medium Shot',
        activeMode === 'photo' ? 'photo' : 'first_frame',
        activeMode === 'photo' ? 'Master Photo Guide' : 'Viral Reels Director',
        s.aspect_ratio || finalAspect,
        s.prompt || s.content || s.title,
        s.dialogue || s.dialogue_script || '',
        null,
        finalImg,
        s.reference_image || null,
        s.sort_order,
        s.camera_angle || 'Medium Shot',
        s.lens_focal || s.shot_size || 'เลนส์ 1x',
        s.video_prompt || '',
        s.audio_foley || '',
        s.on_screen_text || '',
        s.live_action_guide || '',
        roleText,
        activeMode,
        s.master_photographer || null,
        s.depth_technique || null,
        s.story_meaning || null,
        s.pose_guide || null,
        s.lighting_tip || null,
        s.transition_tip || null,
        s.camera_movement || '',
        s.action_description || s.title,
        visual_style,
        s.scene_number || s.step_number,
        roleText,
        s.duration_seconds,
        s.timecode
      );

      createdRows.push(db.prepare('SELECT * FROM prompts WHERE id = ?').get(pId));
    }

    const createdSeries = db.prepare('SELECT * FROM series WHERE id = ?').get(seriesId);
    cloudSync.scheduleCloudPush(db);

    res.json({
      success: true,
      series_id: seriesId,
      series: { ...createdSeries, shot_count: createdRows.length, total_duration: totalDurationSec },
      total_shots: createdRows.length,
      total_duration: totalDurationSec,
      data: createdRows
    });
  } catch (err) {
    console.error('[Commit Storyboard Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Append a single shot into current active project
app.post('/api/storyboard/append-shot', async (req, res) => {
  try {
    const { series_id, shot } = req.body;
    if (!series_id || !shot) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const parentSeries = db.prepare('SELECT * FROM series WHERE id = ?').get(series_id);
    const activeMode = shot.mode || parentSeries?.mode || 'video';
    const currentShots = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE series_id = ?').get(series_id);
    const nextStep = (currentShots.count || 0) + 1;
    const pId = 'shot-' + Date.now() + '-' + nextStep;
    const labelPrefix = activeMode === 'photo' ? 'ภาพที่' : 'ฉากที่';

    const sketch = getStoryboardSketch({
      ...shot,
      mode: activeMode,
      step_number: nextStep,
      aspect_ratio: shot.aspect_ratio || (activeMode === 'photo' ? '4:5' : '9:16')
    });

    db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle,
        prompt_type, recommended_tool, aspect_ratio, content,
        dialogue_script, image_url, copy_count, sort_order,
        is_active, camera_angle, shot_size, video_prompt,
        audio_foley, on_screen_text, live_action_guide, shot_role,
        is_completed, mode,
        master_photographer, depth_technique, story_meaning, pose_guide, lighting_tip, transition_tip,
        camera_movement, action_description,
        visual_style, scene_number, scene_title, duration_seconds, timecode
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 0, ?,
        1, ?, ?, ?,
        ?, ?, ?, ?,
        0, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?
      )
    `).run(
      pId,
      series_id,
      nextStep,
      `${labelPrefix} ${nextStep}`,
      shot.title || `${labelPrefix} ${nextStep}`,
      shot.camera_angle || 'Medium Shot',
      activeMode === 'photo' ? 'photo' : 'first_frame',
      activeMode === 'photo' ? 'Master Photo Guide' : 'Viral Reels Director',
      shot.aspect_ratio || (activeMode === 'photo' ? '4:5' : '9:16'),
      shot.prompt || shot.action_description || 'ช็อตเพิ่มเติม',
      shot.dialogue || '',
      shot.image_url || sketch,
      nextStep,
      shot.camera_angle || 'Medium Shot',
      shot.lens_focal || 'เลนส์ 1x',
      shot.video_prompt || '',
      shot.audio_foley || '',
      shot.on_screen_text || '',
      shot.live_action_guide || '📐 เว้นพื้นที่ว่างด้านบน 25% สำหรับใส่ข้อความ',
      shot.shot_role || (activeMode === 'photo' ? '✨ มุมเสริมไลฟ์สไตล์' : '✨ ฉากเสริม'),
      activeMode,
      shot.master_photographer || (activeMode === 'photo' ? 'Henri Cartier-Bresson — จังหวะธรรมชาติ' : null),
      shot.depth_technique || (activeMode === 'photo' ? 'จัดองค์ประกอบ 3 ระยะ (ฉากหน้า-ตัวแบบ-ฉากหลัง)' : null),
      shot.story_meaning || (activeMode === 'photo' ? 'เพิ่มมิติและเรื่องราวให้เซ็ตภาพสมบูรณ์ขึ้น' : null),
      shot.pose_guide || (activeMode === 'photo' ? 'โพสท่าสบายๆ เป็นธรรมชาติ' : null),
      shot.lighting_tip || '☀️ ใช้แสงธรรมชาติเฉียง 45°',
      shot.transition_tip || (activeMode === 'video' ? '✂️ ตัดเข้าจังหวะบีทเพลง' : null),
      shot.camera_movement || 'ถือกล้องนิ่ง / เคลื่อนตามเบาๆ',
      shot.action_description || shot.prompt || '',
      shot.visual_style || 'Editorial Lifestyle Natural',
      nextStep,
      shot.scene_title || 'ช็อตเพิ่มเติม',
      activeMode === 'photo' ? 0 : (shot.duration_seconds || 2.5),
      activeMode === 'photo' ? `Slide ${nextStep}` : `${nextStep * 2.5}s`
    );

    const inserted = db.prepare('SELECT * FROM prompts WHERE id = ?').get(pId);
    cloudSync.scheduleCloudPush(db);
    res.json({ success: true, data: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. SETTINGS & UTILITY ENDPOINTS
// ==========================================

app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      has_pollinations_key: !!config.POLLINATIONS_API_KEY,
      has_gemini_key: !!config.GEMINI_API_KEY,
      has_openai_key: !!config.OPENAI_API_KEY
    }
  });
});

app.post('/api/settings', (req, res) => {
  try {
    const { pollinations_key, gemini_key, openai_key } = req.body;
    if (pollinations_key !== undefined) config.POLLINATIONS_API_KEY = pollinations_key.trim();
    if (gemini_key !== undefined) config.GEMINI_API_KEY = gemini_key.trim();
    if (openai_key !== undefined) config.OPENAI_API_KEY = openai_key.trim();

    res.json({
      success: true,
      data: {
        has_pollinations_key: !!config.POLLINATIONS_API_KEY,
        has_gemini_key: !!config.GEMINI_API_KEY,
        has_openai_key: !!config.OPENAI_API_KEY
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'กรุณาแนบไฟล์รูปภาพ' });
    }
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'รูปแบบรูปภาพไม่ถูกต้อง' });
    }
    // Also save a copy on disk AND return the data URI so it NEVER 404s even on Render ephemeral restarts!
    const ext = filename ? path.extname(filename).toLowerCase() || '.jpg' : '.jpg';
    const cleanBaseName = filename ? path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_') : 'image';
    const uniqueFileName = `ref_${Date.now()}_${cleanBaseName}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      data: {
        url: image, // Safe persistent Data URI (compressed on client)
        disk_url: `/uploads/${uniqueFileName}`,
        size_mb: (buffer.length / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM prompts').run();
    db.prepare('DELETE FROM series').run();
    cloudSync.scheduleCloudPush(db);
    res.json({ success: true, message: 'ล้างกระดานสตอรี่บอร์ดทั้งหมดเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4B. AUTOMATIC CLOUD SYNC ENDPOINTS (iPhone 17 <-> Home PC)
// ==========================================

app.get('/api/sync/state', async (req, res) => {
  try {
    const syncCode = req.query.sync_code || '';
    const forceCloudPull = req.query.pull === '1';
    const currentCount = db.prepare('SELECT COUNT(*) as c FROM series').get().c;

    if (forceCloudPull || currentCount === 0) {
      await cloudSync.pullFromCloudIntoDb(db, syncCode);
    }

    const snapshot = cloudSync.exportDbSnapshot(db);
    // Attach full image_url (including SVGs) for client display
    const allPrompts = db
      .prepare('SELECT * FROM prompts WHERE is_active = 1 ORDER BY step_number ASC, sort_order ASC')
      .all();
    const fullShotsBySeries = {};
    for (const p of allPrompts) {
      if (!fullShotsBySeries[p.series_id]) fullShotsBySeries[p.series_id] = [];
      fullShotsBySeries[p.series_id].push(p);
    }

    res.json({
      success: true,
      synced_at: cloudSync.getLastSyncTime() || new Date().toISOString(),
      data: {
        series: snapshot.series,
        shotsBySeries: fullShotsBySeries
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sync/push', async (req, res) => {
  try {
    const { series, shotsBySeries, sync_code = '' } = req.body;
    if (Array.isArray(series) && series.length > 0) {
      cloudSync.importSnapshotIntoDb(db, { series, shotsBySeries });
    }
    const pushRes = await cloudSync.pushDbToCloudNow(db, sync_code);
    const snapshot = cloudSync.exportDbSnapshot(db);
    const allPrompts = db
      .prepare('SELECT * FROM prompts WHERE is_active = 1 ORDER BY step_number ASC, sort_order ASC')
      .all();
    const fullShotsBySeries = {};
    for (const p of allPrompts) {
      if (!fullShotsBySeries[p.series_id]) fullShotsBySeries[p.series_id] = [];
      fullShotsBySeries[p.series_id].push(p);
    }

    res.json({
      success: true,
      synced_at: pushRes.synced_at || new Date().toISOString(),
      data: {
        series: snapshot.series,
        shotsBySeries: fullShotsBySeries
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. PRODUCTION STATIC FILE SERVING
// ==========================================

const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving production frontend build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, async () => {
  console.log(`🚀 CineBoard Studio Server running on http://localhost:${PORT}`);
  // Automatically hydrate SQLite from Cloud Vault on startup!
  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM series').get().c;
    if (count === 0) {
      initialCloudPullDone = true;
      await cloudSync.pullFromCloudIntoDb(db);
    }
  } catch (e) {
    console.warn('[Startup Cloud Hydrate Notice]:', e.message);
  }
});
