import React from 'react';
import { Film, Folder, Sparkles, Layers, Zap, Plus } from 'lucide-react';

export default function MobileBottomNav({
  activeBoardTab,
  setActiveBoardTab,
  onOpenStoryboardBuilder,
  onOpenAssetManager,
  onOpenGroqModal,
  seriesCount = 0
}) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <div className="flex items-center justify-around">
        
        {/* 1. Board View */}
        <button
          onClick={() => setActiveBoardTab('board')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeBoardTab === 'board'
              ? 'text-[#F71C25] font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Film className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">บอร์ดภาพ</span>
        </button>

        {/* 2. Storyboard History */}
        <button
          onClick={() => setActiveBoardTab('projects')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeBoardTab === 'projects' || activeBoardTab === 'inspirations'
              ? 'text-[#F71C25] font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">ประวัติ</span>
          {seriesCount > 0 && (
            <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-[#F71C25] text-white font-black text-[9px] flex items-center justify-center shadow-xs">
              {seriesCount}
            </span>
          )}
        </button>

        {/* 3. Center CTA: Big Create Storyboard Button */}
        <button
          onClick={onOpenStoryboardBuilder}
          className="flex flex-col items-center -mt-5 cursor-pointer group"
          title="สร้างสตอรี่บอร์ดใหม่ด้วย AI"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F71C25] to-[#FF4438] hover:brightness-105 text-white flex items-center justify-center shadow-lg shadow-red-500/25 group-active:scale-95 transition-all">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] font-black text-[#F71C25] mt-1 tracking-tight">สร้าง AI</span>
        </button>

        {/* 4. Asset Vault */}
        <button
          onClick={onOpenAssetManager}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-stone-500 hover:text-stone-900 transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Assets</span>
        </button>

        {/* 5. Groq Script AI */}
        <button
          onClick={onOpenGroqModal}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#F71C25]/80 hover:text-[#F71C25] transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">คิดบท</span>
        </button>

      </div>
    </div>
  );
}
