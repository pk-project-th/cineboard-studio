import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import BoardHeader from './components/BoardHeader';
import BoardView from './components/BoardView';
import InspirationsView from './components/InspirationsView';
import ProjectHistoryView from './components/ProjectHistoryView';
import ExploreView from './components/ExploreView';
import FloatingPromptBar from './components/FloatingPromptBar';
import DetailInspector from './components/DetailInspector';
import MobileBottomNav from './components/MobileBottomNav';
import StoryboardBuilderModal from './components/StoryboardBuilderModal';
import AssetManagerModal from './components/AssetManagerModal';
import VideoStudioModal from './components/VideoStudioModal';
import ImageViewerModal from './components/ImageViewerModal';
import ClipEditorModal from './components/ClipEditorModal';
import AudioSimulatorModal from './components/AudioSimulatorModal';
import ProductionGuideModal from './components/ProductionGuideModal';
import GroqScriptModal from './components/GroqScriptModal';
import ScriptImportModal from './components/ScriptImportModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EditShotModal from './components/EditShotModal';
import AdminDashboard from './admin/AdminDashboard';
import { RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentView, setCurrentView] = useState('visitor'); // 'visitor' | 'admin'
  const [activeNav, setActiveNav] = useState('image'); // 'explore' | 'image' | 'video'
  const [activeBoardTab, setActiveBoardTab] = useState('board'); // 'board' | 'inspirations'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'image' | 'video' | 'audio' | 'global'
  const [zoomLevel, setZoomLevel] = useState(2); // 1, 2, 3
  const [selectedItem, setSelectedItem] = useState(null);

  // Modals
  const [storyboardBuilderOpen, setStoryboardBuilderOpen] = useState(false);
  const [assetManagerOpen, setAssetManagerOpen] = useState(false);
  const [scriptImportOpen, setScriptImportOpen] = useState(false);
  const [scriptSeedText, setScriptSeedText] = useState('');
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [clipEditorOpen, setClipEditorOpen] = useState(false);
  const [editShotModalOpen, setEditShotModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [viralGuideOpen, setViralGuideOpen] = useState(false);
  const [groqModalOpen, setGroqModalOpen] = useState(false);
  const [customPromptSeed, setCustomPromptSeed] = useState(null);
  
  // Delete Modal State
  const [deleteModalConfig, setDeleteModalConfig] = useState(null); // { title, message, onConfirm }
  const [isDeleting, setIsDeleting] = useState(false);

  const [prompts, setPrompts] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('all');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  // Initial load: Default to saved active project or latest available project
  useEffect(() => {
    const init = async () => {
      const series = await fetchSeries();
      const lastActiveId = localStorage.getItem('cineprompt_last_active_series');
      let targetId = 'all';

      if (series && series.length > 0) {
        if (lastActiveId && series.some(s => s.id === lastActiveId)) {
          targetId = lastActiveId;
        } else {
          targetId = series[0].id;
        }
      } else {
        targetId = 'all';
      }

      setSelectedSeriesId(targetId);
      await fetchPrompts(targetId);
      await fetchStats();
    };
    init();
  }, []);

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
  };

  const handleSelectOtherItem = (promptId) => {
    const found = prompts.find(p => p.id === promptId);
    if (found) setSelectedItem(found);
  };

  // Dedicated Start New Project handler
  const handleStartNewProject = () => {
    setCustomPromptSeed('');
    setStoryboardBuilderOpen(true);
  };

  // Dedicated handler for appending a single shot into active project
  const handleAppendShotToCurrent = async (newShot) => {
    if (!newShot) return;
    setPrompts((prev) => [...prev, newShot]);
    setSelectedItem(newShot);
    await fetchSeries();
  };

  // Dedicated handler when a new storyboard project is committed
  const handleStoryboardCommitted = async (payload) => {
    let seriesId = null;
    let shots = [];
    if (payload && payload.data && Array.isArray(payload.data)) {
      seriesId = payload.series_id || payload.data[0]?.series_id;
      shots = payload.data;
    } else if (Array.isArray(payload)) {
      shots = payload;
      seriesId = payload[0]?.series_id;
    }

    const updatedSeries = await fetchSeries();
    if (seriesId) {
      setSelectedSeriesId(seriesId);
      try { localStorage.setItem('cineprompt_last_active_series', seriesId); } catch (_) {}
      await fetchPrompts(seriesId);
    } else if (updatedSeries && updatedSeries.length > 0) {
      setSelectedSeriesId(updatedSeries[0].id);
      try { localStorage.setItem('cineprompt_last_active_series', updatedSeries[0].id); } catch (_) {}
      await fetchPrompts(updatedSeries[0].id);
    } else {
      setPrompts(shots);
      if (shots.length > 0) setSelectedItem(shots[0]);
    }

    setActiveNav('image');
    setActiveBoardTab('board');
  };

  // Real AI generation callback: add to prompts list and inspect
  const handleGenerateNewPrompt = (newItem) => {
    setPrompts((prev) => [newItem, ...prev]);
    setSelectedItem(newItem);
    setActiveNav('image');
    setActiveBoardTab('board');
  };

  // Handle when a single shot is edited and updated
  const handleShotUpdated = (updatedShot) => {
    if (!updatedShot) return;
    setPrompts((prev) => prev.map(p => p.id === updatedShot.id ? updatedShot : p));
    setSelectedItem(updatedShot);
  };

  // When clicking template in Explore tab
  const handleUseTemplate = async (tpl) => {
    if (tpl.shots && Array.isArray(tpl.shots)) {
      try {
        const res = await fetch('/api/storyboard/commit-shots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shots: tpl.shots,
            project_title: tpl.title,
            visual_style: tpl.visual_style
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setPrompts((prev) => [...data.data, ...prev]);
          setSelectedItem(data.data[0]);
          setActiveNav('image');
          setActiveBoardTab('board');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          return;
        }
      } catch (err) {
        console.error('Error applying storyboard template', err);
      }
    }

    handleGenerateNewPrompt({
      id: 'tpl-gen-' + Date.now(),
      title: tpl.title,
      subtitle: tpl.category,
      prompt_type: 'first_frame',
      aspect_ratio: tpl.aspect || '9:16',
      recommended_tool: 'Studio Engine (Groq & Gemini)',
      content: tpl.prompt || tpl.summary,
      dialogue_script: tpl.dialogue || '',
      image_url: tpl.image,
      copy_count: 1
    });
  };

  // Handle delete a single shot
  const handleDeletePrompt = (p) => {
    if (!p) return;
    setDeleteModalConfig({
      title: 'ยืนยันการลบการ์ดช็อต',
      message: (
        <span>
          คุณแน่ใจหรือไม่ว่าต้องการลบการ์ด <span className="font-bold text-stone-200">"{p.title}"</span> ออกจากบอร์ด? การกระทำนี้ไม่สามารถย้อนกลับได้
        </span>
      ),
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/prompts/${p.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setPrompts((prev) => prev.filter((item) => item.id !== p.id));
            if (selectedItem?.id === p.id) {
              setSelectedItem(null);
            }
            await fetchSeries();
            setDeleteModalConfig(null);
            confetti({ particleCount: 30, spread: 50, colors: ['#ff4d4f', '#ffffff'] });
          } else {
            alert(data.error || 'ลบไม่สำเร็จ');
          }
        } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการลบการ์ด');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  // Handle delete an entire storyboard project (series)
  const handleDeleteSeries = (seriesItemOrId) => {
    const s = typeof seriesItemOrId === 'object'
      ? seriesItemOrId
      : seriesList.find(item => item.id === seriesItemOrId) || { id: seriesItemOrId, title: 'โปรเจกต์นี้' };

    setDeleteModalConfig({
      title: 'ยืนยันการลบโปรเจกต์สตอรี่บอร์ด',
      message: (
        <span>
          คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์ <span className="font-bold text-stone-200">"{s.title}"</span> และช็อตทั้งหมดในโปรเจกต์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้
        </span>
      ),
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          // Optimistically remove from state immediately
          setSeriesList(prev => prev.filter(item => item.id !== s.id));

          const res = await fetch(`/api/series/${encodeURIComponent(s.id)}`, { method: 'DELETE' });
          const data = await res.json();

          await fetchSeries();
          if (selectedSeriesId === s.id) {
            try { localStorage.removeItem('cineprompt_last_active_series'); } catch (_) {}
            setSelectedSeriesId('all');
            await fetchPrompts('all');
          } else {
            await fetchPrompts(selectedSeriesId);
          }
          confetti({ particleCount: 35, spread: 60, colors: ['#ff4d4f', '#ffffff'] });
        } catch (err) {
          console.error(err);
          await fetchSeries();
        } finally {
          setIsDeleting(false);
          setDeleteModalConfig(null);
        }
      }
    });
  };

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
        confetti({ particleCount: 40, spread: 70, colors: ['#F71C25', '#ff4d4f', '#ffffff'] });
      } else {
        alert(data.error || 'ล้างข้อมูลไม่สำเร็จ');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการล้างข้อมูล');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#FAF9F5] text-stone-900 flex flex-col overflow-hidden font-sans select-none selection:bg-[#F71C25]/20 selection:text-[#F71C25]">
      {/* 1. Global Studio Navigation Bar */}
      <TopNav
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'video') setFilterType('video');
          else if (nav === 'image') setFilterType('all');
        }}
        onOpenStoryboardBuilder={() => setStoryboardBuilderOpen(true)}
        onOpenAssetManager={() => setAssetManagerOpen(true)}
        onOpenAudio={() => setAudioModalOpen(true)}
        onOpenViralGuide={() => setViralGuideOpen(true)}
        onOpenGroqModal={() => setGroqModalOpen(true)}
        onOpenScriptImporter={() => {
          setScriptSeedText('');
          setScriptImportOpen(true);
        }}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {currentView === 'admin' ? (
        /* BACKEND ADMIN VIEW */
        <div className="flex-1 overflow-y-auto">
          <AdminDashboard
            onBackToVisitor={() => {
              setCurrentView('visitor');
              fetchPrompts();
              fetchStats();
            }}
          />
        </div>
      ) : activeNav === 'explore' ? (
        /* EXPLORE VIEW */
        <div className="flex-1 overflow-y-auto pb-32">
          <ExploreView onUseTemplate={handleUseTemplate} />
        </div>
      ) : (
        /* MAIN STUDIO CANVAS VIEW */
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Sub-header & Toolbar */}
          <BoardHeader
            activeTab={activeBoardTab}
            setActiveTab={setActiveBoardTab}
            filterType={filterType}
            setFilterType={setFilterType}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            onOpenViralGuide={() => setViralGuideOpen(true)}
            onOpenGroqModal={() => setGroqModalOpen(true)}
            onClearBoard={handleClearAllBoard}
            seriesList={seriesList}
            selectedSeriesId={selectedSeriesId}
            onSelectSeries={handleSelectSeries}
            onDeleteSeries={handleDeleteSeries}
            onStartNewProject={handleStartNewProject}
            promptsCount={prompts.length}
            prompts={prompts}
            onBatchUpdated={() => {
              fetchPrompts(selectedSeriesId);
            }}
          />

          {/* Canvas & Detail Inspector Split */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden">
            {/* Center Canvas Area (Constrains Floating Bar!) */}
            <div className="flex-1 flex flex-col relative min-w-0">
              
              {/* Scrollable Board */}
              <div className="flex-1 overflow-y-auto pb-44">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-stone-500 py-32 font-mono text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#F71C25]" />
                    <span>กำลังโหลด CineBoard Studio...</span>
                  </div>
                ) : activeBoardTab === 'board' ? (
                  <BoardView
                    prompts={prompts}
                    selectedItem={selectedItem}
                    onSelectItem={(p) => setSelectedItem(p)}
                    onDeletePrompt={handleDeletePrompt}
                    zoomLevel={zoomLevel}
                    filterType={filterType}
                    onOpenGroqModal={() => setGroqModalOpen(true)}
                    onExploreTab={() => setActiveNav('explore')}
                    onOpenImageViewer={(p) => {
                      setSelectedItem(p);
                      setImageViewerOpen(true);
                    }}
                    onOpenVideoStudio={(p) => {
                      setSelectedItem(p);
                      setVideoModalOpen(true);
                    }}
                  />
                ) : (
                  <ProjectHistoryView
                    seriesList={seriesList}
                    selectedSeriesId={selectedSeriesId}
                    onSelectSeries={(id) => {
                      handleSelectSeries(id);
                      setActiveBoardTab('board');
                    }}
                    onDeleteSeries={handleDeleteSeries}
                    onSelectItem={(item) => setSelectedItem(item)}
                    onStoryboardCommitted={handleStoryboardCommitted}
                    onOpenDirectorWizard={handleStartNewProject}
                    onSwitchToBoard={() => setActiveBoardTab('board')}
                  />
                )}
              </div>

              {/* Floating Bottom Generation Bar (Docked gracefully in Canvas) */}
              <div className="absolute bottom-16 md:bottom-5 inset-x-0 flex justify-center px-3 sm:px-4 pointer-events-none z-30">
                <div className="w-full max-w-3xl pointer-events-auto">
                  <FloatingPromptBar
                    onGenerateNewPrompt={handleGenerateNewPrompt}
                    onStoryboardCommitted={handleStoryboardCommitted}
                    selectedItem={selectedItem}
                    onOpenGroqModal={() => setGroqModalOpen(true)}
                    onOpenScriptImporter={(seed) => {
                      if (typeof seed === 'string') setScriptSeedText(seed);
                      setScriptImportOpen(true);
                    }}
                    customPromptSeed={customPromptSeed}
                    selectedSeriesId={selectedSeriesId}
                    seriesList={seriesList}
                    onStartNewProject={handleStartNewProject}
                    onAppendShotToCurrent={handleAppendShotToCurrent}
                  />
                </div>
              </div>
            </div>

            {/* Right Detail Inspector Panel */}
            {selectedItem && (
              <DetailInspector
                item={selectedItem}
                promptsList={prompts}
                onClose={() => setSelectedItem(null)}
                onDeletePrompt={handleDeletePrompt}
                onSelectOtherItem={handleSelectOtherItem}
                onOpenVideoModal={() => setVideoModalOpen(true)}
                onOpenClipEditor={() => setClipEditorOpen(true)}
                onOpenImageViewer={(item) => {
                  setSelectedItem(item);
                  setImageViewerOpen(true);
                }}
                onOpenEditShot={() => setEditShotModalOpen(true)}
                onRecreate={(text) => {
                  alert('นำเข้าคำสั่ง Prompt สู่ช่องสร้างภาพด้านล่างเรียบร้อยแล้ว! สามารถกด Generate ได้ทันที');
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Smartphones) */}
      <MobileBottomNav
        activeBoardTab={activeBoardTab}
        setActiveBoardTab={setActiveBoardTab}
        onOpenStoryboardBuilder={handleStartNewProject}
        onOpenAssetManager={() => setAssetManagerOpen(true)}
        onOpenGroqModal={() => setGroqModalOpen(true)}
        seriesCount={seriesList.length}
      />

      {/* Storyboard Director & Asset Management Modals */}
      <StoryboardBuilderModal
        isOpen={storyboardBuilderOpen}
        onClose={() => setStoryboardBuilderOpen(false)}
        initialConcept={customPromptSeed}
        onOpenAssetManager={() => {
          setStoryboardBuilderOpen(false);
          setAssetManagerOpen(true);
        }}
        onStoryboardCommitted={handleStoryboardCommitted}
      />

      <AssetManagerModal
        isOpen={assetManagerOpen}
        onClose={() => setAssetManagerOpen(false)}
        onAssetCreated={() => {
          // Re-fetch or pass through
        }}
      />

      {/* Direct Multi-Scene Script Importer Modal */}
      <ScriptImportModal
        isOpen={scriptImportOpen}
        onClose={() => setScriptImportOpen(false)}
        onStoryboardCommitted={handleStoryboardCommitted}
        initialScript={scriptSeedText}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteModalConfig}
        title={deleteModalConfig?.title}
        message={deleteModalConfig?.message}
        isDeleting={isDeleting}
        onClose={() => setDeleteModalConfig(null)}
        onConfirm={deleteModalConfig?.onConfirm}
      />

      {/* Interactive Modals */}
      <ImageViewerModal
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        item={selectedItem}
        onOpenVideoStudio={(itm) => {
          setSelectedItem(itm);
          setVideoModalOpen(true);
        }}
      />

      <VideoStudioModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        item={selectedItem}
      />

      <ClipEditorModal
        isOpen={clipEditorOpen}
        onClose={() => setClipEditorOpen(false)}
        item={selectedItem}
      />

      <EditShotModal
        isOpen={editShotModalOpen}
        onClose={() => setEditShotModalOpen(false)}
        shot={selectedItem}
        onSaved={handleShotUpdated}
      />

      <AudioSimulatorModal
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        item={selectedItem}
      />

      <ProductionGuideModal
        isOpen={viralGuideOpen}
        onClose={() => setViralGuideOpen(false)}
      />

      <GroqScriptModal
        isOpen={groqModalOpen}
        onClose={() => setGroqModalOpen(false)}
        onOpenStoryboardBuilder={(conceptText) => {
          setCustomPromptSeed(conceptText);
          setStoryboardBuilderOpen(true);
        }}
        onApplyPrompt={(prompt) => {
          setCustomPromptSeed(prompt);
          setActiveNav('image');
          setActiveBoardTab('board');
        }}
        onApplyDialogue={(dialogue) => {
          setAudioModalOpen(true);
        }}
      />
    </div>
  );
}
