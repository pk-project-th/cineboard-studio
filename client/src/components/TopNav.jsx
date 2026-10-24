import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  LayoutGrid,
  FileEdit,
  Table2,
  Sparkles,
  Copy,
  Check,
  Printer,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  FolderKanban
} from 'lucide-react';

export default function TopNav({
  activeView,
  onChangeView,
  sidebarOpen,
  onToggleSidebar,
  seriesList = [],
  selectedSeriesId,
  onSelectSeries,
  onNewProject,
  onDeleteSeries,
  onClearAllData,
  onBatchRenderAll,
  batchRenderProgress,
  onCopyAllPrompts,
  copiedAll,
  onOpenSettings,
  totalShots = 0
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSeries = seriesList.find((s) => s.id === selectedSeriesId);
  const isRenderingBatch = batchRenderProgress && batchRenderProgress.active;

  return (
    <header className="h-14 bg-[#0F1219]/95 backdrop-blur-md border-b border-slate-800/80 px-3 lg:px-5 flex items-center justify-between gap-2 sticky top-0 z-40 no-print">
      {/* Left: Sidebar Toggle + Brand + Project Switcher */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'ซ่อนแผงสร้างสตอรี่บอร์ด' : 'เปิดแผงสร้างสตอรี่บอร์ด'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            sidebarOpen
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          <span className="hidden sm:inline">{sidebarOpen ? 'ซ่อนแผงบรีฟ' : 'สร้าง/แก้บรีฟ'}</span>
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 pr-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Film className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="hidden md:block leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-white">CINEBOARD</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                STUDIO 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400">AI Storyboard & FLUX.1 Visual Director</p>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161B26] hover:bg-[#1C2230] border border-slate-700/80 text-xs text-slate-200 max-w-[200px] sm:max-w-[260px] transition-colors cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate font-semibold">
              {currentSeries ? currentSeries.title : seriesList.length > 0 ? 'ทุกโปรเจกต์รวมกัน' : 'ยังไม่มีโปรเจกต์'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
              {totalShots} ช็อต
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-[#131722] border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  โปรเจกต์สตอรี่บอร์ด ({seriesList.length})
                </span>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNewProject();
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>สร้างโปรเจกต์ใหม่</span>
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                {seriesList.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    ยังไม่มีโปรเจกต์ กดสร้างจากแผงด้านซ้ายได้เลยครับ
                  </div>
                ) : (
                  seriesList.map((s) => (
                    <div
                      key={s.id}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/60 transition-colors ${
                        selectedSeriesId === s.id ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectSeries(s.id);
                          setDropdownOpen(false);
                        }}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="text-xs font-semibold text-slate-100 truncate">{s.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{s.shot_count || 0} ช็อต</span>
                          {s.total_duration && <span>• {Math.round(s.total_duration)} วินาที</span>}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSeries(s.id, s.title);
                          setDropdownOpen(false);
                        }}
                        title="ลบโปรเจกต์นี้"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {seriesList.length > 0 && (
                <div className="px-3.5 py-2 border-t border-slate-800 bg-[#0F1219] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onClearAllData();
                    }}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างประวัติทั้งหมด</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: View Mode Switcher */}
      <div className="flex items-center bg-[#0B0D11] p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onChangeView('board')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeView === 'board'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>บอร์ดภาพสตอรี่บอร์ด</span>
        </button>

        <button
          onClick={() => onChangeView('bulk_editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeView === 'bulk_editor'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>แก้ไขบท & Prompt ทั้งหมด</span>
        </button>

        <button
          onClick={() => onChangeView('shotlist')}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeView === 'shotlist'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>ตารางกำกับช็อต</span>
        </button>
      </div>

      {/* Right: Studio Actions */}
      <div className="flex items-center gap-2">
        {/* Batch AI Render All Shots */}
        {totalShots > 0 && (
          <button
            onClick={() => onBatchRenderAll(false)}
            disabled={isRenderingBatch}
            title="สั่ง AI (FLUX.1) วาดภาพจริงให้ครบทุกช็อตในโปรเจกต์นี้"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isRenderingBatch
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isRenderingBatch ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>
                  กำลังวาดภาพ {batchRenderProgress.current}/{batchRenderProgress.total}...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">วาดภาพ AI ครบทุกช็อต</span>
                <span className="lg:hidden">วาดครบทุกช็อต</span>
              </>
            )}
          </button>
        )}

        {/* Copy All Prompts */}
        {totalShots > 0 && (
          <button
            onClick={onCopyAllPrompts}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161B26] hover:bg-[#1E2534] border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline">คัดลอกทุก Prompt</span>
              </>
            )}
          </button>
        )}

        {/* Print / PDF */}
        {totalShots > 0 && (
          <button
            onClick={() => window.print()}
            title="พิมพ์สตอรี่บอร์ด หรือบันทึกเป็น PDF"
            className="hidden sm:flex p-2 rounded-xl bg-[#161B26] hover:bg-[#1E2534] border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="ตั้งค่าระบบ AI"
          className="p-2 rounded-xl bg-[#161B26] hover:bg-[#1E2534] border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
