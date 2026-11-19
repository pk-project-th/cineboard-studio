import React from 'react';
import { Sparkles, LayoutGrid, FileEdit, Table2 } from 'lucide-react';

export default function MobileBottomNav({
  activeTab, // 'create' | 'board' | 'bulk_editor' | 'shotlist'
  onSelectTab,
  totalShots = 0,
  darkMode = false
}) {
  const tabs = [
    { id: 'create', label: 'สร้างโจทย์', icon: Sparkles },
    { id: 'board', label: 'บอร์ดถ่ายทำ', icon: LayoutGrid, badge: totalShots > 0 ? totalShots : null },
    { id: 'bulk_editor', label: 'แก้ทุกช็อต', icon: FileEdit },
    { id: 'shotlist', label: 'สรุปตาราง', icon: Table2 }
  ];

  return (
    <nav
      aria-label="เมนูหลักสำหรับมือถือ"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl no-print transition-colors"
      style={{
        backgroundColor: darkMode ? 'rgba(12, 14, 19, 0.90)' : 'rgba(255, 255, 255, 0.92)',
        borderColor: 'var(--border-subtle)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
      }}
    >
      <div className="grid grid-cols-4 gap-1 px-2 pt-1.5 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`btn-tactile relative min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? darkMode
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-amber-500/12 text-amber-700'
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : darkMode
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'bg-zinc-900 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
