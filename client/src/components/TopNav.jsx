import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
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
  FolderKanban,
  Sun,
  Moon,
  Square
} from 'lucide-react';

export default function TopNav({
  activeView,
  onChangeView,
  sidebarOpen,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  seriesList = [],
  selectedSeriesId,
  onSelectSeries,
  onNewProject,
  onDeleteSeries,
  onClearAllData,
  onBatchRenderAll,
  onStopBatchRender,
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
    <header
      className="safe-top sticky top-0 z-40 no-print backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: darkMode ? 'rgba(12, 14, 19, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="h-14 px-3 lg:px-5 flex items-center justify-between gap-2 max-w-[1680px] mx-auto">
        {/* Left: Sidebar Toggle + Brand + Project Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'ซ่อนแผงสร้างโจทย์' : 'เปิดแผงสร้างโจทย์ใหม่'}
            className={`btn-tactile min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
              sidebarOpen
                ? darkMode
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200/70'
                : 'bg-amber-600 hover:bg-amber-700 border-amber-600 text-white shadow-sm'
            }`}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{sidebarOpen ? 'ซ่อนแผง' : '+ โจทย์ใหม่'}</span>
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 pr-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-amber-500 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <Camera className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="hidden xl:block leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight">CineBoard</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                ภาพนิ่งช่างภาพโลก & วิดีโอไวรัล
              </p>
            </div>
          </div>

          {/* Project Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn-tactile min-h-[38px] flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs max-w-[175px] sm:max-w-[260px] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate font-semibold">
                {currentSeries
                  ? `${currentSeries.mode === 'photo' ? '📸 ' : '🎬 '}${currentSeries.title}`
                  : seriesList.length > 0
                  ? 'เลือกโปรเจกต์'
                  : 'ยังไม่มีโปรเจกต์'}
              </span>
              {totalShots > 0 && (
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 font-bold shrink-0">
                  {totalShots} {currentSeries?.mode === 'photo' ? 'ภาพ' : 'ฉาก'}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-80 rounded-2xl border shadow-2xl py-2 z-50 overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)'
                }}
              >
                <div
                  className="px-4 py-2.5 border-b flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    โปรเจกต์ของคุณ ({seriesList.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNewProject();
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>สร้างใหม่</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {seriesList.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                      ยังไม่มีโปรเจกต์ เลือกโหมดภาพนิ่งหรือวิดีโอทางด้านซ้ายได้เลยครับ
                    </div>
                  ) : (
                    seriesList.map((s) => (
                      <div
                        key={s.id}
                        className={`px-4 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                          selectedSeriesId === s.id
                            ? 'bg-amber-500/10 border-l-2 border-amber-500'
                            : 'hover:bg-black/5'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSeries(s.id);
                            setDropdownOpen(false);
                          }}
                          className="flex-1 text-left min-w-0 cursor-pointer"
                        >
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{s.mode === 'photo' ? '📸' : '🎬'}</span>
                            <span className="truncate">{s.title}</span>
                          </div>
                          <div className="text-[11px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <span>
                              {s.mode === 'photo' ? 'ภาพนิ่ง' : 'วิดีโอไวรัล'} • {s.shot_count || 0}{' '}
                              {s.mode === 'photo' ? 'ภาพ' : 'ฉาก'}
                            </span>
                            {s.mode !== 'photo' && s.total_duration > 0 && (
                              <span>• {Math.round(s.total_duration)} วิ</span>
                            )}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSeries(s.id, s.title);
                            setDropdownOpen(false);
                          }}
                          title="ลบโปรเจกต์นี้"
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {seriesList.length > 0 && (
                  <div
                    className="px-4 py-2 border-t flex items-center justify-between"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-subtle)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onClearAllData();
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
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

        {/* Center: View Switcher */}
        <div
          className="hidden md:flex items-center p-1 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          {[
            { id: 'board', label: 'บอร์ดถ่ายทำ', icon: LayoutGrid },
            { id: 'bulk_editor', label: 'แก้ทุกช็อต', icon: FileEdit },
            { id: 'shotlist', label: 'ตารางพิมพ์ PDF', icon: Table2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeView(tab.id)}
                className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  active
                    ? darkMode
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-900 text-white shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions + Theme Toggle */}
        <div className="flex items-center gap-1.5">
          {totalShots > 0 && (
            isRenderingBatch ? (
              <div className="flex items-center gap-1">
                <span className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 text-xs font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    วาด {batchRenderProgress.current}/{batchRenderProgress.total}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onStopBatchRender}
                  title="หยุดการวาดภาพ AI"
                  className="btn-tactile min-h-[36px] px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">หยุด</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onBatchRenderAll(false)}
                title="สั่ง AI วาดภาพตัวอย่างครบทุกช็อต"
                className="btn-tactile min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">วาดภาพ AI ครบชุด</span>
                <span className="lg:hidden">วาด AI</span>
              </button>
            )
          )}

          {totalShots > 0 && (
            <button
              type="button"
              onClick={onCopyAllPrompts}
              className="btn-tactile min-h-[38px] hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              title="คัดลอกสคริปต์ทั้งหมดไปวางใน LINE หรือ Notes"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xl:inline">คัดลอกสคริปต์</span>
                </>
              )}
            </button>
          )}

          {totalShots > 0 && (
            <button
              type="button"
              onClick={() => window.print()}
              title="พิมพ์หรือบันทึกเป็น PDF"
              className="btn-tactile min-h-[38px] hidden sm:flex items-center justify-center w-9 rounded-xl border cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle (Light Editorial / Dark Studio) */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'เปลี่ยนเป็นโหมดสว่าง (อ่านง่ายกลางแจ้ง)' : 'เปลี่ยนเป็นโหมดมืด (Studio Dark)'}
            className="btn-tactile min-h-[38px] w-9 flex items-center justify-center rounded-xl border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="ตั้งค่า API Key"
            className="btn-tactile min-h-[38px] w-9 flex items-center justify-center rounded-xl border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
