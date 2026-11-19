import React, { useState, useEffect, useRef } from 'react';
import TopNav from './components/TopNav';
import BriefView from './components/BriefView';
import BoardView from './components/BoardView';
import ShotListView from './components/ShotListView';
import SettingsModal from './components/SettingsModal';
import MobileBottomNav from './components/MobileBottomNav';
import { RefreshCw, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const LOCAL_CACHE_KEY = 'cineboard_local_store_v4';

// Safe Hybrid Local Storage helpers (prevents Render Free Tier sleep from ever wiping user work!)
function readLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return { series: [], shotsBySeries: {} };
    const parsed = JSON.parse(raw);
    return {
      series: Array.isArray(parsed.series) ? parsed.series : [],
      shotsBySeries: parsed.shotsBySeries || {}
    };
  } catch (_) {
    return { series: [], shotsBySeries: {} };
  }
}

function writeLocalStore(series, shotsBySeries) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ series, shotsBySeries }));
  } catch (_) {
    // If quota exceeded due to large base64 images, save text & SVG guides safely without crashing
    try {
      const leanShotsBySeries = {};
      for (const [sid, list] of Object.entries(shotsBySeries || {})) {
        leanShotsBySeries[sid] = (list || []).map((s) => ({
          ...s,
          image_url:
            s.image_url && s.image_url.length > 180000 && !s.image_url.startsWith('data:image/svg+xml')
              ? ''
              : s.image_url
        }));
      }
      localStorage.setItem(
        LOCAL_CACHE_KEY,
        JSON.stringify({ series, shotsBySeries: leanShotsBySeries })
      );
    } catch (__) {}
  }
}

export default function App() {
  // Theme: Light Warm Editorial (Default) | Dark Studio
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('cineboard_theme') === 'dark';
    } catch (_) {
      return false;
    }
  });

  // Active Creation Mode: 'photo' | 'video'
  const [activeMode, setActiveMode] = useState(() => {
    try {
      return localStorage.getItem('cineboard_mode') === 'photo' ? 'photo' : 'video';
    } catch (_) {
      return 'video';
    }
  });

  // Views: 'board' | 'bulk_editor' | 'shotlist'
  const [activeView, setActiveView] = useState('board');
  // Dedicated iPhone / Mobile native tab: 'create' | 'board' | 'bulk_editor' | 'shotlist'
  const [mobileTab, setMobileTab] = useState('create');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Toast & Confirm Dialog (Zero browser alert/confirm popups!)
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastTimerRef = useRef(null);

  // Data States
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('all');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Planning & Rendering States
  const [isPlanning, setIsPlanning] = useState(false);
  const [preCommitDraft, setPreCommitDraft] = useState(null);
  const [renderingIds, setRenderingIds] = useState({});
  const [batchRenderProgress, setBatchRenderProgress] = useState({
    active: false,
    current: 0,
    total: 0
  });
  const [copiedAll, setCopiedAll] = useState(false);
  const abortBatchRef = useRef(false);

  // Sync theme class on document root + iPhone 17 Dynamic Island theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', darkMode ? '#0C0E13' : '#F7F5F0');
    }
    try {
      localStorage.setItem('cineboard_theme', darkMode ? 'dark' : 'light');
    } catch (_) {}
  }, [darkMode]);

  const showToast = (message, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  // Sync current state into local hybrid backup
  const mirrorToLocalStore = (nextSeriesList, seriesId, nextShots) => {
    const store = readLocalStore();
    const updatedSeries = nextSeriesList || store.series;
    const updatedMap = { ...store.shotsBySeries };
    if (seriesId && seriesId !== 'all' && Array.isArray(nextShots)) {
      updatedMap[seriesId] = nextShots;
    }
    writeLocalStore(updatedSeries, updatedMap);
  };

  // Fetch Series List (with automatic local fallback if Render restarted)
  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/series');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSeriesList(data.data);
        return data.data;
      }
    } catch (err) {
      console.warn('Server series fetch notice:', err.message);
    }
    // Fallback to local mirror if server DB is empty after sleep
    const local = readLocalStore();
    if (local.series.length > 0) {
      setSeriesList(local.series);
      return local.series;
    }
    setSeriesList([]);
    return [];
  };

  // Fetch Shots for Series
  const fetchPrompts = async (seriesId = selectedSeriesId) => {
    setLoading(true);
    try {
      const url =
        seriesId && seriesId !== 'all'
          ? `/api/prompts?series_id=${seriesId}`
          : '/api/prompts';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPrompts(data.data);
        if (seriesId && seriesId !== 'all') {
          mirrorToLocalStore(null, seriesId, data.data);
        }
        return data.data;
      }
    } catch (err) {
      console.warn('Server prompts fetch notice:', err.message);
    } finally {
      setLoading(false);
    }

    // Fallback to local mirror
    const local = readLocalStore();
    if (seriesId && local.shotsBySeries[seriesId]) {
      setPrompts(local.shotsBySeries[seriesId]);
      return local.shotsBySeries[seriesId];
    }
    setPrompts([]);
    return [];
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const series = await fetchSeries();
      const savedSeriesId = localStorage.getItem('cineboard_active_series');
      if (series.length > 0) {
        const target =
          savedSeriesId && series.some((s) => s.id === savedSeriesId)
            ? savedSeriesId
            : series[0].id;
        setSelectedSeriesId(target);
        const targetObj = series.find((s) => s.id === target);
        if (targetObj?.mode) setActiveMode(targetObj.mode);
        await fetchPrompts(target);
        setMobileTab('board');
      } else {
        setSelectedSeriesId('all');
        setMobileTab('create');
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleChangeMode = (nextMode) => {
    setActiveMode(nextMode);
    try {
      localStorage.setItem('cineboard_mode', nextMode);
    } catch (_) {}
  };

  // Select Project
  const handleSelectSeries = async (id) => {
    setPreCommitDraft(null);
    setSelectedSeriesId(id);
    const chosen = seriesList.find((s) => s.id === id);
    if (chosen?.mode) setActiveMode(chosen.mode);
    try {
      localStorage.setItem('cineboard_active_series', id);
    } catch (_) {}
    await fetchPrompts(id);
    setActiveView('board');
  };

  // Render a single shot's AI image
  const handleRenderShotImage = async (shotId, customPrompt) => {
    if (!shotId) return null;
    setRenderingIds((prev) => ({ ...prev, [shotId]: true }));

    try {
      const targetShot = prompts.find((p) => p.id === shotId);
      const promptToUse = customPrompt || targetShot?.content || targetShot?.title || '';

      const res = await fetch(`/api/prompts/${shotId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspect_ratio: targetShot?.aspect_ratio || (targetShot?.mode === 'photo' ? '4:5' : '9:16')
        })
      });
      const data = await res.json();
      if (data.success && (data.data?.image_url || data.image_url)) {
        const newImgUrl = data.data?.image_url || data.image_url;
        setPrompts((prev) => {
          const updated = prev.map((item) =>
            item.id === shotId ? { ...item, image_url: newImgUrl } : item
          );
          mirrorToLocalStore(seriesList, selectedSeriesId, updated);
          return updated;
        });
        showToast('วาดภาพตัวอย่าง AI สำเร็จครับ!', 'success');
        return data.data;
      } else {
        showToast(data.error || 'ระบบวาดภาพ AI หนาแน่นชั่วคราว ลองกดใหม่อีกครั้งครับ', 'error');
      }
    } catch (_) {
      showToast('ไม่สามารถเชื่อมต่อระบบวาดภาพ AI ได้ในขณะนี้', 'error');
    } finally {
      setRenderingIds((prev) => {
        const next = { ...prev };
        delete next[shotId];
        return next;
      });
    }
    return null;
  };

  // Sequentially render AI images for a list of shots
  const runBatchImageRender = async (shotsList, onlyMissing = false) => {
    const targets = onlyMissing
      ? shotsList.filter(
          (s) => !s.image_url || s.image_url.startsWith('data:image/svg+xml')
        )
      : shotsList;

    if (targets.length === 0) {
      showToast('ทุกช็อตมีภาพเรียบร้อยแล้วครับ', 'info');
      return;
    }

    abortBatchRef.current = false;
    setBatchRenderProgress({ active: true, current: 0, total: targets.length });

    for (let i = 0; i < targets.length; i++) {
      if (abortBatchRef.current) {
        showToast('หยุดการวาดภาพ AI เรียบร้อยครับ', 'info');
        break;
      }
      const shot = targets[i];
      setBatchRenderProgress({
        active: true,
        current: i + 1,
        total: targets.length
      });
      await handleRenderShotImage(shot.id, shot.content);
    }

    setBatchRenderProgress({ active: false, current: 0, total: 0 });
  };

  const handleStopBatchRender = () => {
    abortBatchRef.current = true;
  };

  // Plan Storyboard -> Commit to Board -> Optionally Auto-Render AI Images
  const handlePlanAndAutoRender = async (payload) => {
    setIsPlanning(true);
    setPreCommitDraft(null);
    try {
      const planRes = await fetch('/api/storyboard/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const planJson = await planRes.json();
      if (!planJson.success || !planJson.data?.shots) {
        showToast(planJson.error || 'ไม่สามารถวางแผนช็อตได้ กรุณาลองใหม่อีกครั้งครับ', 'error');
        return;
      }

      const planData = planJson.data;
      const commitRes = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: payload.mode || planData.mode || 'video',
          project_title: planData.project_title,
          viral_hook: planData.viral_hook || '',
          music_vibe: planData.music_vibe || '',
          visual_style: payload.visual_style,
          target_duration: planData.target_duration || payload.target_duration,
          pacing: payload.pacing || 'normal',
          aspect_ratio: payload.aspect_ratio,
          shots: planData.shots
        })
      });
      const commitJson = await commitRes.json();
      if (commitJson.success && commitJson.data) {
        const newSeriesId = commitJson.series_id;
        const nextSeriesList = commitJson.series
          ? [commitJson.series, ...seriesList.filter((s) => s.id !== newSeriesId)]
          : await fetchSeries();

        setSeriesList(nextSeriesList);
        setSelectedSeriesId(newSeriesId);
        setPrompts(commitJson.data);
        setActiveView('board');
        setMobileTab('board');

        mirrorToLocalStore(nextSeriesList, newSeriesId, commitJson.data);
        try {
          localStorage.setItem('cineboard_active_series', newSeriesId);
          localStorage.removeItem('cineboard_draft_concept');
        } catch (_) {}

        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        showToast(
          payload.mode === 'photo'
            ? `สร้างเซ็ตภาพนิ่งระดับโลก "${planData.project_title}" (${commitJson.data.length} มุม) สำเร็จ!`
            : `สร้างสตอรี่บอร์ดวิดีโอไวรัล "${planData.project_title}" (${commitJson.data.length} ฉาก) สำเร็จ!`,
          'success'
        );

        try {
          confetti({ particleCount: 38, spread: 55, origin: { y: 0.65 } });
        } catch (_) {}

        if (payload.auto_render_images) {
          runBatchImageRender(commitJson.data, false);
        }
      }
    } catch (_) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่ครับ', 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  // Plan Storyboard -> Review in Bulk Editor first
  const handlePlanForReview = async (payload) => {
    setIsPlanning(true);
    try {
      const planRes = await fetch('/api/storyboard/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const planJson = await planRes.json();
      if (!planJson.success || !planJson.data?.shots) {
        showToast(planJson.error || 'ไม่สามารถวางแผนช็อตได้ครับ', 'error');
        return;
      }

      setPreCommitDraft({
        mode: payload.mode || planJson.data.mode || 'video',
        project_title: planJson.data.project_title,
        viral_hook: planJson.data.viral_hook || '',
        music_vibe: planJson.data.music_vibe || '',
        visual_style: payload.visual_style,
        target_duration: planJson.data.target_duration || payload.target_duration,
        aspect_ratio: payload.aspect_ratio,
        shots: planJson.data.shots
      });
      setActiveView('bulk_editor');
      setMobileTab('bulk_editor');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ครับ', 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  // Commit reviewed draft from Bulk Editor
  const handleCommitDraftAndRender = async (draftPayload, shouldRenderAll = true) => {
    try {
      const commitRes = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: draftPayload.mode || 'video',
          project_title: draftPayload.project_title,
          viral_hook: draftPayload.viral_hook || '',
          music_vibe: draftPayload.music_vibe || '',
          visual_style: draftPayload.visual_style || 'Editorial Lifestyle',
          target_duration: draftPayload.target_duration || 18,
          aspect_ratio: draftPayload.aspect_ratio,
          shots: draftPayload.shots
        })
      });
      const commitJson = await commitRes.json();
      if (commitJson.success && commitJson.data) {
        setPreCommitDraft(null);
        const newSeriesId = commitJson.series_id;
        const nextSeriesList = commitJson.series
          ? [commitJson.series, ...seriesList.filter((s) => s.id !== newSeriesId)]
          : await fetchSeries();

        setSeriesList(nextSeriesList);
        setSelectedSeriesId(newSeriesId);
        setPrompts(commitJson.data);
        setActiveView('board');

        mirrorToLocalStore(nextSeriesList, newSeriesId, commitJson.data);
        try {
          localStorage.setItem('cineboard_active_series', newSeriesId);
          localStorage.removeItem('cineboard_draft_concept');
        } catch (_) {}

        showToast('บันทึกแผนสตอรี่บอร์ดลงบอร์ดเรียบร้อยครับ!', 'success');
        if (shouldRenderAll) {
          runBatchImageRender(commitJson.data, false);
        }
      }
    } catch (_) {
      showToast('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้งครับ', 'error');
    }
  };

  // Update a single shot inline (optimistic + local mirror + server)
  const handleUpdateShot = async (id, updatedFields) => {
    setPrompts((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
      mirrorToLocalStore(seriesList, selectedSeriesId, updated);
      return updated;
    });
    try {
      await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn('Update shot sync notice:', err.message);
    }
  };

  // Save Bulk Edits for an existing board
  const handleSaveBulkEdits = async (editedShots) => {
    const existingUpdates = [];
    for (const s of editedShots) {
      if (s.isNew) {
        await fetch('/api/storyboard/append-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            series_id: selectedSeriesId,
            shot: s
          })
        });
      } else {
        existingUpdates.push(s);
      }
    }

    if (existingUpdates.length > 0) {
      await fetch('/api/prompts-batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: existingUpdates })
      });
    }

    const keptIds = new Set(existingUpdates.map((u) => u.id));
    for (const oldShot of prompts) {
      if (!keptIds.has(oldShot.id)) {
        await fetch(`/api/prompts/${oldShot.id}`, { method: 'DELETE' });
      }
    }

    const refreshed = await fetchPrompts(selectedSeriesId);
    showToast('บันทึกการแก้ไขทั้งหมดเรียบร้อยครับ', 'success');
    return refreshed;
  };

  const handleSaveBulkAndRenderAll = async (editedShots) => {
    const refreshed = await handleSaveBulkEdits(editedShots);
    setActiveView('board');
    if (refreshed && refreshed.length > 0) {
      runBatchImageRender(refreshed, false);
    }
  };

  // Add a single shot to current board
  const handleAddShot = async () => {
    let targetSeries = selectedSeriesId;
    if (!targetSeries || targetSeries === 'all') {
      if (seriesList.length > 0) targetSeries = seriesList[0].id;
      else return;
    }

    const currentSeriesObj = seriesList.find((s) => s.id === targetSeries);
    const modeForNew = currentSeriesObj?.mode || activeMode;

    try {
      const res = await fetch('/api/storyboard/append-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series_id: targetSeries,
          shot: {
            mode: modeForNew,
            title: `${modeForNew === 'photo' ? 'ภาพเพิ่มเติมที่' : 'ฉากเพิ่มเติมที่'} ${prompts.length + 1}`,
            camera_angle: 'Medium Shot',
            action_description: 'ระบุสิ่งที่ต้องการถ่ายในช็อตนี้...',
            aspect_ratio: modeForNew === 'photo' ? '4:5' : '9:16'
          }
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPrompts((prev) => {
          const next = [...prev, data.data];
          mirrorToLocalStore(seriesList, targetSeries, next);
          return next;
        });
        showToast(`เพิ่ม${modeForNew === 'photo' ? 'ภาพ' : 'ฉาก'}ใหม่เรียบร้อยครับ`, 'success');
      }
    } catch (_) {
      showToast('ไม่สามารถเพิ่มช็อตได้ในขณะนี้', 'error');
    }
  };

  // Delete a single shot
  const handleDeleteShot = async (id) => {
    setPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      mirrorToLocalStore(seriesList, selectedSeriesId, next);
      return next;
    });
    try {
      await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
    } catch (_) {}
    showToast('ลบช็อตเรียบร้อยครับ', 'info');
  };

  // Upload custom compressed photo for a shot
  const handleUploadShotImage = async (shotId, compressedBase64, filename) => {
    // Update immediately locally for zero-latency feedback
    await handleUpdateShot(shotId, { image_url: compressedBase64 });
    try {
      await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedBase64, filename })
      });
    } catch (_) {}
  };

  // Delete a project series with clean In-App Confirm Dialog
  const handleDeleteSeries = (id, title) => {
    setConfirmDialog({
      title: 'ยืนยันการลบโปรเจกต์',
      message: `ต้องการลบโปรเจกต์ "${title}" ออกจากรายการใช่หรือไม่ครับ?`,
      confirmLabel: 'ลบโปรเจกต์นี้',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await fetch(`/api/series/${id}`, { method: 'DELETE' });
        } catch (_) {}

        const store = readLocalStore();
        const nextSeries = seriesList.filter((s) => s.id !== id);
        delete store.shotsBySeries[id];
        writeLocalStore(nextSeries, store.shotsBySeries);
        setSeriesList(nextSeries);

        if (nextSeries.length > 0) {
          handleSelectSeries(nextSeries[0].id);
        } else {
          localStorage.removeItem('cineboard_active_series');
          setSelectedSeriesId('all');
          setPrompts([]);
        }
        showToast('ลบโปรเจกต์เรียบร้อยครับ', 'info');
      }
    });
  };

  // Clear all projects with clean In-App Confirm Dialog
  const handleClearAllData = () => {
    setConfirmDialog({
      title: 'ล้างประวัติโปรเจกต์ทั้งหมด',
      message: 'ข้อมูลโปรเจกต์และสตอรี่บอร์ดทั้งหมดบนกระดานจะถูกล้างเพื่อเริ่มต้นใหม่ ต้องการดำเนินการต่อหรือไม่ครับ?',
      confirmLabel: 'ล้างข้อมูลทั้งหมด',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await fetch('/api/admin/clear', { method: 'POST' });
        } catch (_) {}
        try {
          localStorage.removeItem(LOCAL_CACHE_KEY);
          localStorage.removeItem('cineboard_active_series');
          localStorage.removeItem('cineboard_draft_concept');
        } catch (_) {}
        setSeriesList([]);
        setPrompts([]);
        setSelectedSeriesId('all');
        showToast('ล้างประวัติทั้งหมดเรียบร้อยครับ', 'info');
      }
    });
  };

  // Export All Projects Backup (.json) for Cross-Device Transfer (iPhone 17 <-> Home PC)
  const handleExportBackup = async () => {
    try {
      const store = readLocalStore();
      const allSeries = seriesList.length > 0 ? seriesList : store.series;
      if (allSeries.length === 0) {
        showToast('ยังไม่มีโปรเจกต์ให้สำรองข้อมูลครับ', 'info');
        return;
      }

      const shotsBySeries = { ...store.shotsBySeries };
      if (selectedSeriesId && selectedSeriesId !== 'all' && prompts.length > 0) {
        shotsBySeries[selectedSeriesId] = prompts;
      }

      // Ensure every series in list has its shots included
      for (const s of allSeries) {
        if (!shotsBySeries[s.id] || shotsBySeries[s.id].length === 0) {
          try {
            const res = await fetch(`/api/prompts?series_id=${s.id}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              shotsBySeries[s.id] = data.data;
            }
          } catch (_) {}
        }
      }

      const backupPayload = {
        app: 'CineBoard Studio',
        version: '4.0',
        exported_at: new Date().toISOString(),
        series: allSeries,
        shotsBySeries
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json'
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `cineboard-backup-${dateStr}.json`;

      // Use Web Share API on iPhone if file sharing is supported, otherwise clean download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      showToast(`สำรองข้อมูล ${allSeries.length} โปรเจกต์เป็นไฟล์ ${filename} เรียบร้อย!`, 'success');
    } catch (_) {
      showToast('ไม่สามารถสร้างไฟล์สำรองข้อมูลได้ครับ', 'error');
    }
  };

  // Import Projects Backup (.json) with Smart Merge (never overwrites existing other projects!)
  const handleImportBackup = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.series) || typeof parsed.shotsBySeries !== 'object') {
        showToast('ไฟล์สำรองข้อมูลไม่ถูกต้อง กรุณาเลือกไฟล์ .json ที่ส่งออกจาก CineBoard ครับ', 'error');
        return;
      }

      const currentStore = readLocalStore();
      const existingSeriesMap = new Map();
      (seriesList.length > 0 ? seriesList : currentStore.series).forEach((s) =>
        existingSeriesMap.set(s.id, s)
      );

      const mergedShotsBySeries = { ...currentStore.shotsBySeries };
      let importedCount = 0;

      for (const s of parsed.series) {
        if (!s || !s.id) continue;
        existingSeriesMap.set(s.id, s);
        if (Array.isArray(parsed.shotsBySeries[s.id])) {
          mergedShotsBySeries[s.id] = parsed.shotsBySeries[s.id];
        }
        importedCount++;
      }

      const mergedSeries = Array.from(existingSeriesMap.values()).sort((a, b) =>
        String(b.created_at || b.id).localeCompare(String(a.created_at || a.id))
      );

      writeLocalStore(mergedSeries, mergedShotsBySeries);
      setSeriesList(mergedSeries);

      if (parsed.series.length > 0) {
        const newestImported = parsed.series[0];
        setSelectedSeriesId(newestImported.id);
        if (newestImported.mode) setActiveMode(newestImported.mode);
        setPrompts(mergedShotsBySeries[newestImported.id] || []);
        setActiveView('board');
        setMobileTab('board');
        try {
          localStorage.setItem('cineboard_active_series', newestImported.id);
        } catch (_) {}
      }

      showToast(`นำเข้าข้อมูลสำเร็จ ${importedCount} โปรเจกต์ พร้อมใช้งานทันทีครับ!`, 'success');
    } catch (_) {
      showToast('ไม่สามารถอ่านไฟล์สำรองได้ กรุณาตรวจสอบว่าเป็นไฟล์ .json ครับ', 'error');
    }
  };

  // Copy Complete Shooting Guide (Adapts automatically for Photo Mode vs Video Mode!)
  const handleCopyAllPrompts = () => {
    if (prompts.length === 0) return;
    const currentSeriesObj = seriesList.find((s) => s.id === selectedSeriesId);
    const isPhotoProj = (currentSeriesObj?.mode || prompts[0]?.mode) === 'photo';

    const header = isPhotoProj
      ? `📸 แผนถ่ายภาพนิ่งระดับช่างภาพโลก: ${currentSeriesObj?.title || 'Photo Set'} (${prompts.length} ภาพ)\n====================================\n\n`
      : `🎬 สคริปต์ถ่ายทำวิดีโอไวรัล: ${currentSeriesObj?.title || 'Viral Reels'} (${prompts.length} ฉาก)\n====================================\n\n`;

    const body = prompts
      .map((p, idx) => {
        if (isPhotoProj) {
          return (
            `📸 ภาพที่ ${idx + 1}: ${p.title}\n` +
            `• เรฟช่างภาพโลก: ${p.master_photographer || '-'}\n` +
            `• มุมกล้อง & เลนส์: ${p.subtitle || p.camera_angle} (${p.shot_size || '1x'})\n` +
            `• วิธีสร้างมิติ: ${p.depth_technique || p.action_description || '-'}\n` +
            `• ความหมายภาพ: ${p.story_meaning || '-'}\n` +
            `• ท่าโพส: ${p.pose_guide || '-'}\n` +
            `• แสงแนะนำ: ${p.lighting_tip || '-'}\n` +
            `• แคปชั่น/ข้อความปก: "${p.on_screen_text || '-'}"`
          );
        }
        return (
          `📍 ฉากที่ ${idx + 1}: ${p.title} (${p.duration_seconds || 2.5} วินาที)\n` +
          `• มุมกล้อง: ${p.camera_angle} • ${p.shot_size || '1x'} (${p.camera_movement || '-'})\n` +
          `• ถ่ายอะไร: ${p.action_description || '-'}\n` +
          `• จุดเชื่อมฉาก: ${p.transition_tip || '-'}\n` +
          `• ข้อความบนจอ: "${p.on_screen_text || '-'}" (${p.live_action_guide || ''})\n` +
          `• เสียงพากย์: ${p.dialogue_script || '-'}`
        );
      })
      .join('\n\n------------------------------------\n\n');

    navigator.clipboard.writeText(header + body);
    setCopiedAll(true);
    showToast('คัดลอกสคริปต์ครบชุดเรียบร้อย! นำไปวางใน LINE หรือ Notes ได้ทันที', 'success');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const currentSeries = seriesList.find((s) => s.id === selectedSeriesId);

  const handleMobileTabSelect = (tabId) => {
    setMobileTab(tabId);
    if (tabId === 'create') {
      setSidebarOpen(true);
    } else {
      if (tabId !== 'bulk_editor') setPreCommitDraft(null);
      setActiveView(tabId);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col transition-colors"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      {/* Top Studio Bar */}
      <TopNav
        activeView={activeView}
        onChangeView={(v) => {
          if (v !== 'bulk_editor') setPreCommitDraft(null);
          setActiveView(v);
          setMobileTab(v);
        }}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        seriesList={seriesList}
        selectedSeriesId={selectedSeriesId}
        onSelectSeries={(id) => {
          handleSelectSeries(id);
          setMobileTab('board');
        }}
        onNewProject={() => {
          setSidebarOpen(true);
          setMobileTab('create');
        }}
        onDeleteSeries={handleDeleteSeries}
        onClearAllData={handleClearAllData}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onBatchRenderAll={(onlyMissing) => runBatchImageRender(prompts, onlyMissing)}
        onStopBatchRender={handleStopBatchRender}
        batchRenderProgress={batchRenderProgress}
        onCopyAllPrompts={handleCopyAllPrompts}
        copiedAll={copiedAll}
        onOpenSettings={() => setSettingsModalOpen(true)}
        totalShots={prompts.length}
      />

      {/* Main Workspace: Symmetrical 2-Pane Studio on Desktop (lg+) | Native App Tabs on iPhone 17 (< lg) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100dvh-3.5rem)]">
        {/* Desktop Collapsible Left Dock + Mobile Full-Screen 'create' Tab */}
        <div className={`${mobileTab === 'create' ? 'block' : 'hidden'} ${sidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
          <BriefView
            mode={activeMode}
            onChangeMode={handleChangeMode}
            darkMode={darkMode}
            onPlanAndAutoRender={handlePlanAndAutoRender}
            onPlanForReview={handlePlanForReview}
            isPlanning={isPlanning}
          />
        </div>

        {/* Right Canvas on Desktop | Full-Screen Active Content Tab on iPhone 17 */}
        <main className={`${mobileTab === 'create' ? 'hidden lg:block' : 'block'} flex-1 min-w-0 overflow-y-auto`}>
          {loading ? (
            <div className="py-28 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-muted)' }}>
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
              <span className="text-xs font-semibold">กำลังโหลดสตอรี่บอร์ดของคุณ...</span>
            </div>
          ) : activeView === 'board' && !preCommitDraft ? (
            <BoardView
              prompts={prompts}
              currentSeries={currentSeries}
              activeMode={activeMode}
              darkMode={darkMode}
              renderingIds={renderingIds}
              onUpdateShot={handleUpdateShot}
              onRenderShotImage={handleRenderShotImage}
              onBatchRenderAll={(onlyMissing) => runBatchImageRender(prompts, onlyMissing)}
              onDeleteShot={handleDeleteShot}
              onAddShot={handleAddShot}
              onUploadShotImage={handleUploadShotImage}
              onSwitchToBulkEditor={() => {
                setActiveView('bulk_editor');
                setMobileTab('bulk_editor');
              }}
              onOpenSidebar={() => {
                setSidebarOpen(true);
                setMobileTab('create');
              }}
              onNotify={showToast}
            />
          ) : (
            <ShotListView
              mode={activeView === 'shotlist' ? 'shotlist' : 'bulk_editor'}
              projectMode={currentSeries?.mode || activeMode}
              prompts={prompts}
              preCommitDraft={preCommitDraft}
              onCancelDraft={() => {
                setPreCommitDraft(null);
                setActiveView('board');
                setMobileTab('board');
              }}
              onCommitDraftAndRender={async (draftPayload, renderAll) => {
                await handleCommitDraftAndRender(draftPayload, renderAll);
                setMobileTab('board');
              }}
              onSaveBulkEdits={handleSaveBulkEdits}
              onSaveBulkAndRenderAll={async (edited) => {
                await handleSaveBulkAndRenderAll(edited);
                setMobileTab('board');
              }}
              onRenderSingleShot={handleRenderShotImage}
              renderingIds={renderingIds}
              onBackToBoard={() => {
                setActiveView('board');
                setMobileTab('board');
              }}
            />
          )}
        </main>
      </div>

      {/* Native-Style Frosted Bottom Tab Bar for iPhone 17 & Mobile */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleMobileTabSelect}
        totalShots={prompts.length}
        darkMode={darkMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        totalProjects={seriesList.length}
      />

      {/* In-App Confirm Dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-strong)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold">{confirmDialog.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {confirmDialog.message}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="btn-tactile px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                style={{ borderColor: 'var(--border-strong)' }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="btn-tactile px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                {confirmDialog.confirmLabel || 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level 5 Floating Toast Notification (Elevated cleanly above iPhone 17 Bottom Tab Bar!) */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-5 right-4 left-4 sm:left-auto z-[60] flex justify-center sm:justify-end pointer-events-none">
          <div
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-zinc-900 text-white border-zinc-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Info className="w-4 h-4 shrink-0" />
            )}
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-0.5 hover:opacity-75 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
