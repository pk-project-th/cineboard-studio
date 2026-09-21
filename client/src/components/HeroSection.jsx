import React from 'react';
import { Film, Clapperboard, Sparkles, Search, Layers, Flame, CheckCircle2 } from 'lucide-react';

export default function HeroSection({
  searchTerm,
  setSearchTerm,
  selectedStep,
  setSelectedStep,
  selectedType,
  setSelectedType
}) {
  const steps = [
    { id: null, label: 'ทั้งหมด (All Prompts)', icon: Layers },
    { id: 1, label: 'STEP 1: บล็อกคงที่ (Global)', icon: Film },
    { id: 2, label: 'STEP 2: คาแรกเตอร์ (Characters)', icon: Sparkles },
    { id: 3, label: 'STEP 3: ภาพนิ่งฉากแรก (First Frame)', icon: Clapperboard },
    { id: 4, label: 'STEP 4: กำกับวิดีโอ (Video Prompts)', icon: Flame },
  ];

  return (
    <div className="relative overflow-hidden pt-10 pb-12 border-b border-amber-900/30">
      {/* Film Strip Accents & Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold mb-4 tracking-wide shadow-inner">
          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
          <span>ซีรีส์คอนเทนต์ AI ยอดนิยม — สูตร Viral โดย PKShortClips Studio</span>
        </div>

        {/* Big Catchy Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-100 tracking-tight leading-tight max-w-4xl">
          ซีรีส์คอสตูมการ์ตูน <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">สไตล์หนังไทยเก่า</span>
          <span className="block text-xl sm:text-2xl font-normal text-stone-400 mt-2 font-serif">
            โพสต์ + Prompt ทั้งชุด (ศักดิ์, จอย, เจ้าหนูสายฟ้า)
          </span>
        </h1>

        {/* Synopsis & Joke Formula */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono text-amber-500 font-bold uppercase tracking-wider mb-1">
              สูตรมุก (The Formula)
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-medium">
              สถานการณ์มหากาพย์ของการ์ตูน × ปัญหาปากท้องจริงของคนไทย (เช่น ตะกร้อจับปลาช่อนไปทำต้มยำ)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono text-amber-500 font-bold uppercase tracking-wider mb-1">
              อัตลักษณ์งานภาพ (Cinematic Look)
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-medium">
              ฟิล์ม 16mm หมดอายุยุค 2520-2530 เกรนหนา สีซีดติดเหลืองอมเขียว กล้องแฮนด์เฮลด์ ไม่ตัดต่อหวือหวา
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono text-amber-500 font-bold uppercase tracking-wider mb-1">
              งานเสียงพากย์ (Audio Profile)
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-medium">
              Optical Soundtrack เสียงโมโนแคบ ไร้รีเวิร์บ เสียงพากย์สดในห้องอัดแบบแห้งๆ พร้อมเสียงซ่าของฟิล์ม
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Step Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {steps.map((st) => {
              const Icon = st.icon;
              const isSelected = selectedStep === st.id;
              return (
                <button
                  key={String(st.id)}
                  onClick={() => setSelectedStep(st.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-amber-600 border-amber-500 text-stone-950 shadow-md shadow-amber-900/30'
                      : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาในชุด Prompt..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono placeholder:font-sans placeholder:text-stone-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
