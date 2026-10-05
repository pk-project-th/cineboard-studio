import React from 'react';
import {
  Search, Folder, Bell, Layers, Sparkles, Film, Video,
  Image as ImageIcon, Volume2, ShieldCheck, Compass, Flame, Zap, FileText
} from 'lucide-react';

export default function TopNav({
  activeNav,
  setActiveNav,
  onOpenStoryboardBuilder,
  onOpenAssetManager,
  onOpenAudio,
  onOpenViralGuide,
  onOpenGroqModal,
  onOpenScriptImporter,
  currentView,
  setCurrentView
}) {
  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-6 flex items-center justify-between text-xs text-stone-700 select-none z-40 relative shadow-2xs">
      {/* Left Section: Logo & Studio Navigation */}
      <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-1">
        {/* Studio Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group"
          onClick={() => {
            setCurrentView('visitor');
            setActiveNav('image');
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F71C25] to-[#FF4D4D] flex items-center justify-center text-white font-black shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-4.5 h-4.5 fill-current text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-stone-950 text-sm flex items-center gap-1.5">
            CineBoard <span className="text-[10px] font-mono text-stone-900 font-bold px-1.5 py-0.5 rounded-lg bg-[#FBEFC5] border border-[#E5D7A3]">STUDIO</span>
          </span>
        </div>

        {/* Primary Functional Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-2 font-medium">
          {/* 1. New Storyboard Wizard (Primary Action) */}
          <button
            onClick={onOpenStoryboardBuilder}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white flex items-center gap-2 font-bold shadow-sm shadow-red-500/20 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
            title="เปิดวิซาร์ดสร้างสตอรี่บอร์ดพร้อมแนะนำมุมกล้อง"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>+ สร้างสตอรี่บอร์ดใหม่</span>
          </button>

          {/* 2. Asset Vault (Characters, Scenes, Products) */}
          <button
            onClick={onOpenAssetManager}
            className="px-3 py-2 rounded-xl bg-[#FAF9F6] border border-stone-200 hover:border-[#F71C25]/40 text-stone-700 hover:text-stone-950 flex items-center gap-2 font-bold transition-all cursor-pointer shadow-2xs hover:bg-[#FBEFC5]/30 active:scale-[0.98]"
            title="คลังแนบตัวละคร ฉาก และสินค้า"
          >
            <Layers className="w-3.5 h-3.5 text-[#F71C25]" />
            <span>คลัง Asset</span>
          </button>

          {/* 2.1 Direct Script Importer (Offline Multi-Scene) */}
          {onOpenScriptImporter && (
            <button
              onClick={onOpenScriptImporter}
              className="px-3 py-2 rounded-xl bg-[#FDF8EE] hover:bg-[#FBEFC5] border border-[#EADBBD] text-stone-900 flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              title="วางบทสคริปต์หลายฉาก (Scene 1..N) เพื่อสร้างสตอรี่บอร์ดทันที โดยไม่ต้องใช้ Groq"
            >
              <FileText className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>นำเข้าบทสคริปต์</span>
            </button>
          )}

          {/* 3. Board View */}
          <button
            onClick={() => setActiveNav('image')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 font-bold cursor-pointer active:scale-[0.98] ${
              activeNav === 'image'
                ? 'text-[#F71C25] bg-[#FBEFC5] border border-[#E5D7A3] shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 border border-transparent'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>บอร์ดช็อต (Shots)</span>
          </button>

          {/* 4. Explore Storyboard Templates */}
          <button
            onClick={() => setActiveNav('explore')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 font-bold cursor-pointer active:scale-[0.98] ${
              activeNav === 'explore'
                ? 'text-[#F71C25] bg-[#FBEFC5] border border-[#E5D7A3] shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>เทมเพลต 8 สไตล์</span>
          </button>

          {/* 5. Groq Script Generator */}
          <button
            onClick={onOpenGroqModal}
            className="px-3 py-2 rounded-xl bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200 hover:border-orange-300 text-orange-900 flex items-center gap-1.5 font-bold shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
            title="ผู้ช่วยคิดบทและ Prompt อัตโนมัติด้วย Groq Cloud LPU"
          >
            <Zap className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>Groq AI คิดบท</span>
          </button>
        </nav>
      </div>

      {/* Right Section: Director Profile & Admin Switch */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile Quick Action: Create Storyboard */}
        <button
          onClick={onOpenStoryboardBuilder}
          className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] text-white font-bold text-xs shadow-sm cursor-pointer active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>+ สร้าง</span>
        </button>

        {/* Mode Toggle (Visitor vs Admin) */}
        <button
          onClick={() => setCurrentView(currentView === 'visitor' ? 'admin' : 'visitor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-[0.98] ${
            currentView === 'admin'
              ? 'bg-[#FBEFC5] text-stone-900 border-[#E5D7A3] shadow-xs'
              : 'bg-[#FAF9F6] text-stone-700 border-stone-200 hover:bg-stone-100 shadow-2xs'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
          <span>{currentView === 'admin' ? 'หน้าหลัก' : 'หลังบ้าน Admin'}</span>
        </button>

        {/* User Profile Avatar: CineBoard Director */}
        <div
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          onClick={() => alert('เข้าสู่ระบบในชื่อบัญชี: CineBoard Director (เชื่อมต่อ AI Director Engine แล้ว)')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F71C25] to-[#FF5533] border border-red-200 flex items-center justify-center text-white font-black text-[11px] shadow-sm group-hover:scale-105 transition-transform">
            CB
          </div>
          <span className="font-mono text-xs font-bold text-stone-900 hidden sm:inline">
            Director
          </span>
        </div>
      </div>
    </header>
  );
}
