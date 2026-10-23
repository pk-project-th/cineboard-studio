import React from 'react';
import { Film, Sparkles, ListChecks, LayoutGrid, Plus, Settings, Printer } from 'lucide-react';

export default function TopNav({
  activeStep,
  setActiveStep,
  onStartNewProject,
  onOpenSettings,
  onPrintStoryboard,
  totalShots = 0
}) {
  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-3 sm:px-6 flex items-center justify-between text-xs text-stone-700 select-none z-40 relative shadow-2xs">
      {/* Left: Studio Logo */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveStep('board')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="กลับไปหน้าหลัก"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F71C25] to-[#FF4D4D] flex items-center justify-center text-white font-black shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-4.5 h-4.5 fill-current text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-stone-950 text-sm flex items-center gap-1.5 leading-none">
              CineBoard <span className="text-[10px] font-mono text-stone-900 font-bold px-1.5 py-0.5 rounded bg-[#FBEFC5] border border-[#E5D7A3]">STUDIO</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">AI Storyboard Director</span>
          </div>
        </div>
      </div>

      {/* Center: The 3 Core Production Steps */}
      <nav className="flex items-center gap-1 p-1 bg-stone-100/80 rounded-xl border border-stone-200/80">
        <button
          onClick={() => setActiveStep('brief')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
            activeStep === 'brief'
              ? 'bg-white text-stone-950 shadow-xs border border-stone-200/60'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
          title="ระบุพล็อต หรือ วางสคริปต์ฉาก"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
          <span>1. บรีฟ & สคริปต์</span>
        </button>

        <button
          onClick={() => setActiveStep('shotlist')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
            activeStep === 'shotlist'
              ? 'bg-white text-stone-950 shadow-xs border border-stone-200/60'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
          title="ดูและแก้ไขรายละเอียดช็อต"
        >
          <ListChecks className="w-3.5 h-3.5 text-stone-700" />
          <span>2. รายการช็อต</span>
          {totalShots > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-mono">
              {totalShots}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStep('board')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
            activeStep === 'board'
              ? 'bg-white text-stone-950 shadow-xs border border-stone-200/60'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
          title="กระดานภาพสตอรี่บอร์ดเสมือนจริง"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-stone-700" />
          <span>3. กระดานภาพ</span>
        </button>
      </nav>

      {/* Right Actions: New Project, Print/PDF, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onStartNewProject}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white flex items-center gap-1.5 font-bold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          title="เริ่มต้นสร้างสตอรี่บอร์ดโปรเจกต์ใหม่"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">สร้างโปรเจกต์ใหม่</span>
          <span className="sm:hidden">ใหม่</span>
        </button>

        <button
          onClick={onPrintStoryboard}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-950 flex items-center gap-1 font-bold transition-colors cursor-pointer"
          title="สั่งพิมพ์ หรือ บันทึกเป็น PDF สตอรี่บอร์ด"
        >
          <Printer className="w-4 h-4 text-stone-600" />
          <span className="hidden md:inline text-xs">พิมพ์/PDF</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          title="การตั้งค่าระบบและ API Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
