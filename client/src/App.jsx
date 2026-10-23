import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import BoardHeader from './components/BoardHeader';
import BoardView from './components/BoardView';
import ShotListView from './components/ShotListView';
import BriefView from './components/BriefView';
import DetailInspector from './components/DetailInspector';
import SettingsModal from './components/SettingsModal';
import ImageViewerModal from './components/ImageViewerModal';
import EditShotModal from './components/EditShotModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Step Navigation: 'brief' (Step 1) | 'shotlist' (Step 2) | 'board' (Step 3)
  const [activeStep, setActiveStep] = useState('board');
  const [zoomLevel, setZoomLevel] = useState(2); // 1, 2, 3
  const [selectedItem, setSelectedItem] = useState(null);

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [editShotModalOpen, setEditShotModalOpen] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState(null);

  // Data
  const [prompts, setPrompts] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch Series
  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/series');
      const data = await res.json();
      if (data.success && data.data) {
        setSeriesList(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Failed to fetch series', err);
    }
    return [];
  };

  // Fetch Prompts
  const fetchPrompts = async (seriesId = selectedSeriesId) => {
    setLoading(true);
    try {
      const url = seriesId && seriesId !== 'all' ? `/api/prompts?series_id=${seriesId}` : '/api/prompts';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data);
        if (data.data.length > 0) {
          setSelectedItem(data.data[0]);
        } else {
          setSelectedItem(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch prompts', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load: Restore last active project or latest
  useEffect(() => {
    const init = async () => {
      const series = await fetchSeries();
      const lastActiveId = localStorage.getItem('cineprompt_last_active_series');
      let targetId = 'all';

      if (series && series.length > 0) {
        if (lastActiveId && series.some((s) => s.id === lastActiveId)) {
          targetId = lastActiveId;
        } else {
          targetId = series[0].id;
        }
        setSelectedSeriesId(targetId);
        await fetchPrompts(targetId);
        setActiveStep('board');
      } else {
        targetId = 'all';
        setSelectedSeriesId('all');
        await fetchPrompts('all');
        setActiveStep('brief');
      }
    };
    init();
  }, []);

  // Handle Project Selection
  const handleSelectSeries = (id) => {
    setSelectedSeriesId(id);
    try {
      if (id && id !== 'all') {
        localStorage.setItem('cineprompt_last_active_series', id);
      } else {
        localStorage.removeItem('cineprompt_last_active_series');
      }
    } catch (_) {}
    fetchPrompts(id);
    setActiveStep('board');
  };

  // Start New Project
  const handleStartNewProject = () => {
    setActiveStep('brief');
  };

  // When a new storyboard is created from Step 1
  const handleStoryboardCreated = async (payload) => {
    const seriesId = payload?.series_id;
    await fetchSeries();
    if (seriesId) {
      setSelectedSeriesId(seriesId);
      try {
        localStorage.setItem('cineprompt_last_active_series', seriesId);
      } catch (_) {}
      await fetchPrompts(seriesId);
    }
    // Switch to Step 2: Shot List Breakdown
    setActiveStep('shotlist');
  };

  // Generate real AI image for a specific shot
  const handleGenerateImageForShot = async (shot) => {
    if (!shot || !shot.id) return;
    const promptText = shot.content || shot.prompt || shot.title;
    const res = await fetch(`/api/prompts/${shot.id}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        aspect_ratio: shot.aspect_ratio || '16:9'
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'สร้างภาพไม่สำเร็จ');
    }

    // Update local state immediately
    const updated = data.data;
    setPrompts((prev) => prev.map((p) => (p.id === shot.id ? updated : p)));
    if (selectedItem?.id === shot.id) {
      setSelectedItem(updated);
    }
    return updated;
  };

  // Handle Shot Updated from modal or inline editor
  const handleShotUpdated = (updatedShot) => {
    if (!updatedShot) return;
    setPrompts((prev) => prev.map((p) => (p.id === updatedShot.id ? updatedShot : p)));
    if (selectedItem?.id === updatedShot.id) {
      setSelectedItem(updatedShot);
    }
  };

  // Delete an individual shot
  const handleDeletePrompt = (id) => {
    setDeleteModalConfig({
      title: 'ยืนยันการลบช็อต',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบช็อตนี้ออกจากสตอรี่บอร์ด?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setPrompts((prev) => prev.filter((p) => p.id !== id));
            if (selectedItem?.id === id) {
              setSelectedItem(null);
            }
          } else {
            alert(data.error || 'ลบไม่สำเร็จ');
          }
        } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการลบช็อต');
        } finally {
          setDeleteModalConfig(null);
        }
      }
    });
  };

  // Delete an entire project
  const handleDeleteSeries = (seriesId) => {
    const s = seriesList.find((item) => item.id === seriesId) || { id: seriesId, title: 'โปรเจกต์นี้' };
    setDeleteModalConfig({
      title: 'ยืนยันการลบโปรเจกต์สตอรี่บอร์ด',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์ "${s.title}" และช็อตทั้งหมดในโปรเจกต์นี้?`,
      onConfirm: async () => {
        try {
          await fetch(`/api/series/${encodeURIComponent(s.id)}`, { method: 'DELETE' });
          await fetchSeries();
          if (selectedSeriesId === s.id) {
            try {
              localStorage.removeItem('cineprompt_last_active_series');
            } catch (_) {}
            setSelectedSeriesId('all');
            await fetchPrompts('all');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setDeleteModalConfig(null);
        }
      }
    });
  };

  // Clear all board data
  const handleClearAllBoard = async () => {
    if (!window.confirm('คุณต้องการล้างการ์ดบนบอร์ดทั้งหมดเพื่อเริ่มสร้างสตอรี่บอร์ดใหม่ใช่หรือไม่?')) return;
    try {
      const res = await fetch('/api/admin/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        try {
          localStorage.removeItem('cineprompt_last_active_series');
          localStorage.removeItem('cineprompt_draft_text');
        } catch (_) {}
        setPrompts([]);
        setSeriesList([]);
        setSelectedSeriesId('all');
        setSelectedItem(null);
        setActiveStep('brief');
        confetti({ particleCount: 30, spread: 60, colors: ['#F71C25', '#FF4D4D', '#ffffff'] });
      } else {
        alert(data.error || 'ล้างข้อมูลไม่สำเร็จ');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการล้างข้อมูล');
    }
  };

  // Current active series object
  const activeSeries = seriesList.find((s) => s.id === selectedSeriesId);

  return (
    <div className="h-screen w-screen bg-[#FAF9F5] text-stone-900 flex flex-col overflow-hidden font-sans select-none selection:bg-[#F71C25]/20 selection:text-[#F71C25]">
      {/* 1. Global Studio Navigation Bar */}
      <TopNav
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onStartNewProject={handleStartNewProject}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onPrintStoryboard={() => window.print()}
        totalShots={prompts.length}
      />

      {/* 2. Sub-Header Toolbar (Shown on Step 2 & 3) */}
      {activeStep !== 'brief' && (
        <BoardHeader
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          onClearBoard={handleClearAllBoard}
          seriesList={seriesList}
          selectedSeriesId={selectedSeriesId}
          onSelectSeries={handleSelectSeries}
          onDeleteSeries={handleDeleteSeries}
          onStartNewProject={handleStartNewProject}
          promptsCount={prompts.length}
          prompts={prompts}
          onBatchUpdated={() => fetchPrompts(selectedSeriesId)}
        />
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Center Content View */}
        <div className="flex-1 flex flex-col relative min-w-0 overflow-y-auto">
          {loading && activeStep !== 'brief' ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-stone-500 py-32 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-[#F71C25]" />
              <span>กำลังโหลด CineBoard Studio...</span>
            </div>
          ) : activeStep === 'brief' ? (
            /* STEP 1: BRIEF & SCRIPT CREATOR */
            <BriefView
              onStoryboardCreated={handleStoryboardCreated}
              onGoToBoard={() => setActiveStep('board')}
            />
          ) : activeStep === 'shotlist' ? (
            /* STEP 2: SHOT LIST & BREAKDOWN EDITOR */
            <ShotListView
              prompts={prompts}
              seriesTitle={activeSeries?.title || 'รวมทุกโปรเจกต์สตอรี่บอร์ด'}
              onEditPrompt={(p) => {
                setSelectedItem(p);
                setEditShotModalOpen(true);
              }}
              onDeletePrompt={handleDeletePrompt}
              onAppendShot={() => setActiveStep('brief')}
              onGoToBoard={() => setActiveStep('board')}
              onGenerateImageForShot={handleGenerateImageForShot}
            />
          ) : (
            /* STEP 3: STORYBOARD CANVAS BOARD */
            <BoardView
              prompts={prompts}
              selectedItem={selectedItem}
              onSelectItem={(p) => setSelectedItem(p)}
              onDeletePrompt={handleDeletePrompt}
              zoomLevel={zoomLevel}
              onStartNewProject={handleStartNewProject}
              onOpenImageViewer={(p) => {
                setSelectedItem(p);
                setImageViewerOpen(true);
              }}
              onGenerateImageForShot={handleGenerateImageForShot}
              onEditPrompt={(p) => {
                setSelectedItem(p);
                setEditShotModalOpen(true);
              }}
            />
          )}
        </div>

        {/* Right Detail Inspector (Desktop Only, on Board View) */}
        {activeStep === 'board' && selectedItem && (
          <div className="hidden lg:block w-80 xl:w-96 border-l border-stone-200 bg-white overflow-y-auto shadow-xs">
            <DetailInspector
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onDelete={handleDeletePrompt}
              onOpenEditModal={(p) => {
                setSelectedItem(p);
                setEditShotModalOpen(true);
              }}
              onGenerateImage={() => handleGenerateImageForShot(selectedItem)}
              onOpenImageViewer={(p) => {
                setSelectedItem(p);
                setImageViewerOpen(true);
              }}
              prompts={prompts}
              onSelectOtherItem={(id) => {
                const found = prompts.find((p) => p.id === id);
                if (found) setSelectedItem(found);
              }}
            />
          </div>
        )}
      </div>

      {/* 4. Modals */}
      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Image Viewer Fullscreen Modal */}
      {imageViewerOpen && selectedItem && (
        <ImageViewerModal
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          prompt={selectedItem}
        />
      )}

      {/* Edit Shot Modal */}
      {editShotModalOpen && selectedItem && (
        <EditShotModal
          isOpen={editShotModalOpen}
          onClose={() => setEditShotModalOpen(false)}
          shot={selectedItem}
          onShotUpdated={handleShotUpdated}
          onGenerateImage={() => handleGenerateImageForShot(selectedItem)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalConfig && (
        <DeleteConfirmModal
          isOpen={!!deleteModalConfig}
          onClose={() => setDeleteModalConfig(null)}
          title={deleteModalConfig.title}
          message={deleteModalConfig.message}
          onConfirm={deleteModalConfig.onConfirm}
        />
      )}
    </div>
  );
}
