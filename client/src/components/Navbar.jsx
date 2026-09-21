import React from 'react';
import { Film, Clapperboard, ShieldCheck, Sparkles, CopyCheck, BookOpen } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, stats }) {
  return (
    <header className="sticky top-0 z-50 bg-[#12100d]/90 backdrop-blur-md border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setCurrentView('visitor')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-900/40 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="text-base font-extrabold text-stone-100 group-hover:text-amber-300 transition-colors flex items-center gap-2">
              <span>CinePrompt Studio</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                1980s Film Look
              </span>
            </div>
            <div className="text-xs text-stone-400 font-medium">
              สตูดิโอคลัง Prompt หนังไทยวินเทจ & AI Video Mastery
            </div>
          </div>
        </div>

        {/* Center Stats Pill */}
        {stats && (
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-xs text-stone-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {stats.totalPrompts || 10} พรอมป์พร้อมใช้
            </span>
            <span className="w-1 h-1 rounded-full bg-stone-700" />
            <span className="flex items-center gap-1.5">
              <CopyCheck className="w-3.5 h-3.5 text-emerald-400" />
              คัดลอกแล้ว {(stats.totalCopies || 0).toLocaleString()} ครั้ง
            </span>
          </div>
        )}

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView(currentView === 'visitor' ? 'admin' : 'visitor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md ${
              currentView === 'admin'
                ? 'bg-amber-600 text-stone-950 shadow-amber-900/30'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 hover:border-amber-600/50'
            }`}
          >
            {currentView === 'admin' ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าบ้าน (Visitor View)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>ระบบหลังบ้าน (Admin Dashboard)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
