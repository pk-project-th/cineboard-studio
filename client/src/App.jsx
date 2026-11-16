import React, { useState, useEffect, useRef } from 'react';
import TopNav from './components/TopNav';
import BriefView from './components/BriefView';
import BoardView from './components/BoardView';
import ShotListView from './components/ShotListView';
import SettingsModal from './components/SettingsModal';
import { RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Views: 'board' | 'bulk_editor' | 'shotlist'
  const [activeView, setActiveView] = useState('board');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Data States
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('all');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Planning & Rendering States
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

  // Fetch Series List
  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/series');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSeriesList(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Failed to fetch series:', err);
    }
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
      if (data.success && Array.isArray(data.data)) {
        setPrompts(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
    return [];
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const series = await fetchSeries();
      const savedSeriesId = localStorage.getItem('cineboard_active_series');
      let targetId = 'all';

      if (series.length > 0) {
        if (savedSeriesId && series.some((s) => s.id === savedSeriesId)) {
          targetId = savedSeriesId;
        } else {
          targetId = series[0].id;
        }
        setSelectedSeriesId(targetId);
        await fetchPrompts(targetId);
      } else {
        setSelectedSeriesId('all');
        await fetchPrompts('all');
      }
    };
    init();
  }, []);

  // Select Project
  const handleSelectSeries = async (id) => {
    setPreCommitDraft(null);
    setSelectedSeriesId(id);
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

      if (customPrompt && targetShot && customPrompt !== targetShot.content) {
        await fetch(`/api/prompts/${shotId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: customPrompt })
        });
      }

      const res = await fetch(`/api/prompts/${shotId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          aspect_ratio: targetShot?.aspect_ratio || '9:16'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPrompts((prev) =>
          prev.map((item) => (item.id === shotId ? data.data : item))
        );
        return data.data;
      }
    } catch (err) {
      console.error('Failed to render shot image:', err);
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

    if (targets.length === 0) return;

    abortBatchRef.current = false;
    setBatchRenderProgress({ active: true, current: 0, total: targets.length });

    for (let i = 0; i < targets.length; i++) {
      if (abortBatchRef.current) break;
      const shot = targets[i];
      setBatchRenderProgress({
        active: true,
        current: i + 1,
        total: targets.length
      });
      await handleRenderShotImage(shot.id, shot.content);
    }

    setBatchRenderProgress({ active: false, current: 0, total: 0 });
    await fetchSeries();
  };

  // Option 1: Plan Storyboard -> Commit to Board -> Optionally Auto-Render Real AI Images
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
        alert(planJson.error || 'ไม่สามารถวางแผนฉากได้ กรุณาลองใหม่อีกครั้งครับ');
        return;
      }

      const planData = planJson.data;
      const commitRes = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_title: planData.project_title,
          visual_style: payload.visual_style,
          target_duration: planData.target_duration || payload.target_duration,
          pacing: payload.pacing || 'normal',
          aspect_ratio: payload.aspect_ratio || '9:16',
          shots: planData.shots
        })
      });
      const commitJson = await commitRes.json();
      if (commitJson.success && commitJson.data) {
        const newSeriesId = commitJson.series_id;
        await fetchSeries();
        setSelectedSeriesId(newSeriesId);
        try {
          localStorage.setItem('cineboard_active_series', newSeriesId);
          localStorage.removeItem('cineboard_draft_concept');
        } catch (_) {}

        setPrompts(commitJson.data);
        setActiveView('board');

        // On mobile screen, auto-collapse sidebar so user immediately sees their storyboard!
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setSidebarOpen(false);
        }

        try {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        } catch (_) {}

        if (payload.auto_render_images !== false) {
          runBatchImageRender(commitJson.data, false);
        }
      }
    } catch (err) {
      console.error('Plan and auto render error:', err);
    } finally {
      setIsPlanning(false);
    }
  };

  // Option 2: Plan Storyboard -> Open in Bulk Editor BEFORE Committing/Rendering
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
        alert(planJson.error || 'ไม่สามารถวางแผนฉากได้ กรุณาลองใหม่อีกครั้งครับ');
        return;
      }

      setPreCommitDraft({
        project_title: planJson.data.project_title,
        visual_style: payload.visual_style,
        target_duration: planJson.data.target_duration || payload.target_duration,
        aspect_ratio: payload.aspect_ratio || '9:16',
        shots: planJson.data.shots
      });
      setActiveView('bulk_editor');
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Plan for review error:', err);
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
          project_title: draftPayload.project_title,
          visual_style: draftPayload.visual_style || 'แสงธรรมชาติคมชัด',
          target_duration: draftPayload.target_duration || 20,
          aspect_ratio: draftPayload.aspect_ratio || '9:16',
          shots: draftPayload.shots
        })
      });
      const commitJson = await commitRes.json();
      if (commitJson.success && commitJson.data) {
        setPreCommitDraft(null);
        const newSeriesId = commitJson.series_id;
        await fetchSeries();
        setSelectedSeriesId(newSeriesId);
        try {
          localStorage.setItem('cineboard_active_series', newSeriesId);
          localStorage.removeItem('cineboard_draft_concept');
        } catch (_) {}
        setPrompts(commitJson.data);
        setActiveView('board');

        if (shouldRenderAll) {
          runBatchImageRender(commitJson.data, false);
        }
      }
    } catch (err) {
      console.error('Commit draft error:', err);
    }
  };

  // Update a single shot inline
  const handleUpdateShot = async (id, updatedFields) => {
    setPrompts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    try {
      await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.error('Update shot failed:', err);
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
            shot: {
              title: s.title,
              shot_role: s.shot_role,
              camera_angle: s.camera_angle,
              camera_movement: s.camera_movement,
              duration_seconds: s.duration_seconds,
              action_description: s.action_description,
              on_screen_text: s.on_screen_text,
              live_action_guide: s.live_action_guide,
              dialogue: s.dialogue_script,
              prompt: s.content,
              aspect_ratio: s.aspect_ratio || '9:16'
            }
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
    await fetchSeries();
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
      if (seriesList.length > 0) {
        targetSeries = seriesList[0].id;
      } else {
        return;
      }
    }

    try {
      const res = await fetch('/api/storyboard/append-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series_id: targetSeries,
          shot: {
            title: `ฉากเพิ่มเติมที่ ${prompts.length + 1}`,
            shot_role: '✨ ฉากเสริม',
            camera_angle: 'Medium Shot',
            camera_movement: 'ถือกล้องนิ่งระดับสายตา',
            action_description: 'ระบุสิ่งที่ต้องการถ่ายในฉากนี้...',
            on_screen_text: `ข้อความพาดหัวฉากที่ ${prompts.length + 1}`,
            live_action_guide: '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความพาดหัว',
            prompt: 'Medium shot, natural daylight, lifestyle travel photography, 8k',
            aspect_ratio: prompts[0]?.aspect_ratio || '9:16'
          }
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPrompts((prev) => [...prev, data.data]);
        fetchSeries();
      }
    } catch (err) {
      console.error('Add shot failed:', err);
    }
  };

  // Delete a single shot
  const handleDeleteShot = async (id) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      fetchSeries();
    } catch (err) {
      console.error('Delete shot failed:', err);
    }
  };

  // Upload custom image for a shot
  const handleUploadShotImage = async (shotId, base64Data, filename) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, filename })
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        await handleUpdateShot(shotId, { image_url: data.data.url });
      }
    } catch (err) {
      console.error('Upload image failed:', err);
    }
  };

  // Delete a project series
  const handleDeleteSeries = async (id, title) => {
    if (!window.confirm(`ต้องการลบโปรเจกต์ "${title}" หรือไม่ครับ?`)) return;
    try {
      const res = await fetch(`/api/series/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const remaining = await fetchSeries();
        if (remaining.length > 0) {
          handleSelectSeries(remaining[0].id);
        } else {
          localStorage.removeItem('cineboard_active_series');
          setSelectedSeriesId('all');
          setPrompts([]);
        }
      }
    } catch (err) {
      console.error('Delete series failed:', err);
    }
  };

  // Clear all projects
  const handleClearAllData = async () => {
    if (!window.confirm('ต้องการล้างประวัติโปรเจกต์ทั้งหมดบนกระดานใช่หรือไม่ครับ?')) return;
    try {
      await fetch('/api/admin/clear', { method: 'POST' });
      localStorage.removeItem('cineboard_active_series');
      localStorage.removeItem('cineboard_draft_concept');
      setSeriesList([]);
      setPrompts([]);
      setSelectedSeriesId('all');
    } catch (err) {
      console.error('Clear all failed:', err);
    }
  };

  // Copy Complete Shooting & Voiceover Script
  const handleCopyAllPrompts = () => {
    if (prompts.length === 0) return;
    const currentSeriesObj = seriesList.find((s) => s.id === selectedSeriesId);
    const header = `🎬 สคริปต์ถ่ายทำ: ${currentSeriesObj?.title || 'สตอรี่บอร์ดคอนเทนต์'} (${prompts.length} ฉาก)\n====================================\n\n`;
    const body = prompts
      .map(
        (p, idx) =>
          `📍 ฉากที่ ${idx + 1}: ${p.title} (${p.duration_seconds || 3} วินาที)\n` +
          `• มุมกล้อง: ${p.camera_angle || 'Medium Shot'} (${p.camera_movement || 'ถือกล้องนิ่ง'})\n` +
          `• ถ่ายอะไร: ${p.action_description || '-'}\n` +
          `• ข้อความบนจอ: "${p.on_screen_text || '-'}" (${p.live_action_guide || ''})\n` +
          `• เสียงพากย์: ${p.dialogue_script || '-'}`
      )
      .join('\n\n------------------------------------\n\n');

    navigator.clipboard.writeText(header + body);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const currentSeries = seriesList.find((s) => s.id === selectedSeriesId);

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F1F5F9] flex flex-col">
      {/* Top Studio Bar */}
      <TopNav
        activeView={activeView}
        onChangeView={(v) => {
          if (v !== 'bulk_editor') setPreCommitDraft(null);
          setActiveView(v);
        }}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        seriesList={seriesList}
        selectedSeriesId={selectedSeriesId}
        onSelectSeries={handleSelectSeries}
        onNewProject={() => setSidebarOpen(true)}
        onDeleteSeries={handleDeleteSeries}
        onClearAllData={handleClearAllData}
        onBatchRenderAll={(onlyMissing) => runBatchImageRender(prompts, onlyMissing)}
        batchRenderProgress={batchRenderProgress}
        onCopyAllPrompts={handleCopyAllPrompts}
        copiedAll={copiedAll}
        onOpenSettings={() => setSettingsModalOpen(true)}
        totalShots={prompts.length}
      />

      {/* Main Studio Workspace: Left Collapsible Director Dock + Right Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
        {sidebarOpen && (
          <BriefView
            onPlanAndAutoRender={handlePlanAndAutoRender}
            onPlanForReview={handlePlanForReview}
            isPlanning={isPlanning}
          />
        )}

        <main className="flex-1 min-w-0 overflow-y-auto">
          {loading ? (
            <div className="py-28 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-mono">กำลังโหลดกระดานสตอรี่บอร์ด...</span>
            </div>
          ) : activeView === 'board' && !preCommitDraft ? (
            <BoardView
              prompts={prompts}
              currentSeries={currentSeries}
              renderingIds={renderingIds}
              onUpdateShot={handleUpdateShot}
              onRenderShotImage={handleRenderShotImage}
              onBatchRenderAll={(onlyMissing) => runBatchImageRender(prompts, onlyMissing)}
              onDeleteShot={handleDeleteShot}
              onAddShot={handleAddShot}
              onUploadShotImage={handleUploadShotImage}
              onSwitchToBulkEditor={() => setActiveView('bulk_editor')}
            />
          ) : (
            <ShotListView
              mode={activeView === 'shotlist' ? 'shotlist' : 'bulk_editor'}
              prompts={prompts}
              preCommitDraft={preCommitDraft}
              onCancelDraft={() => {
                setPreCommitDraft(null);
                setActiveView('board');
              }}
              onCommitDraftAndRender={handleCommitDraftAndRender}
              onSaveBulkEdits={handleSaveBulkEdits}
              onSaveBulkAndRenderAll={handleSaveBulkAndRenderAll}
              onRenderSingleShot={handleRenderShotImage}
              renderingIds={renderingIds}
              onBackToBoard={() => setActiveView('board')}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}
