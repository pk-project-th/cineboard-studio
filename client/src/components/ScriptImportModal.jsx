import React, { useState, useMemo } from 'react';
import {
  X, FileText, Sparkles, Check, Play, Film, Copy, ArrowRight,
  Layers, Clapperboard, Camera, Zap, CheckCircle2, Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseMultiSceneScript } from '../utils/scriptParser';

export const SAMPLE_ASMR_SCRIPT = `🎬 Prompt 1: Pure ASMR “The Sound of Japanese Craftsmanship”
Visual Style: Macro photography, extremely detailed, hyper-realistic, soft natural daylight, premium automotive commercial style.

Scene 1: Smart Access
Prompt: Close-up shot at waist level. A person's hand holding a sleek premium car smart key approaching the car door handle. Soft natural daylight, hyper-realistic, depth of field, premium automotive commercial style.

Scene 2: Unpeeling Screen
Prompt: Macro over-the-shoulder shot. A hand slowly peeling off a clear plastic protective film from a glossy digital center console screen inside a luxury car. Crisp details, cinematic lighting, shallow depth of field.

Scene 3: Tactile Controls
Prompt: Extreme close-up shot. A finger pressing a premium metallic climate control dial on a car's dashboard. Elegant interior, soft ambient lighting highlighting the metallic texture, highly detailed.

Scene 4: Leather & Stitching
Prompt: Macro shot. A hand gently tracing the perfect stitching on a soft premium leather steering wheel. Warm natural sunlight filtering through the window, Japanese craftsmanship concept, luxurious mood.

Scene 5: The Solid "Thud"
Prompt: Medium close-up shot from the outside. A hand pushing a sleek SUV car door fully closed. The car has a deep, glossy paint finish reflecting the surroundings. High-end automotive photography.`;

export const SAMPLE_CAFE_SCRIPT = `🎬 Special Roast: The Barista Journey
Visual Style: Warm editorial lighting, 35mm film grain, cinematic depth of field, cozy aesthetic.

Scene 1: Morning Light
Prompt: Wide establishing shot of an artisan coffee shop storefront with soft morning sunlight casting long shadows. Wood and brass accents.

Scene 2: Precision Weighing
Prompt: Extreme close-up shot of whole roasted specialty coffee beans pouring onto a digital scale plate, single origin Ethiopia Yirgacheffe.

Scene 3: The Grind
Prompt: Macro shot of grounds falling from conical burr grinder into a portafilter basket, rich aromatic textures.

Scene 4: Espresso Extraction
Prompt: Close-up eye level shot of rich golden crema espresso extracting smoothly into a clear glass demitasse cup.

Scene 5: Milk Steaming Velvet
Prompt: Medium shot of barista gently spinning silky microfoam milk in a stainless pitcher with steam wand.

Scene 6: Latte Art Flourish
Prompt: Over-the-shoulder top-down view pouring an intricate tulip latte art pattern into a ceramic cup.`;

export default function ScriptImportModal({
  isOpen,
  onClose,
  onStoryboardCommitted
}) {
  const [rawScript, setRawScript] = useState(SAMPLE_ASMR_SCRIPT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsed = useMemo(() => {
    return parseMultiSceneScript(rawScript);
  }, [rawScript]);

  if (!isOpen) return null;

  const handleCommit = async () => {
    if (!parsed || !parsed.shots || parsed.shots.length === 0) {
      alert('ไม่พบฉากที่สามารถนำเข้าได้ กรุณาตรวจสอบรูปแบบ เช่น Scene 1: ... หรือ ฉากที่ 1: ...');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: parsed.shots,
          project_title: parsed.project_title,
          visual_style: parsed.visual_style,
          target_duration: parsed.total_duration
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#F71C25', '#bef264', '#facc15']
        });

        if (onStoryboardCommitted) {
          onStoryboardCommitted({
            series_id: data.series_id,
            project_title: parsed.project_title,
            data: data.data
          });
        }
        onClose();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการนำเข้าสตอรี่บอร์ด');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-stone-900 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F5]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25] font-black shadow-2xs">
              <FileText className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F71C25] px-2 py-0.5 rounded-md bg-red-50 border border-red-200">
                  Direct Script Importer
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                  100% Offline • ไม่ต้องใช้ Groq
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-950 mt-0.5">
                นำเข้าบทสคริปต์หลายฉาก (Multi-Scene Storyboard)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 font-mono">
              เลือกบทตัวอย่าง:
            </span>
            <button
              type="button"
              onClick={() => setRawScript(SAMPLE_ASMR_SCRIPT)}
              className="px-3 py-1.5 rounded-xl bg-[#FDF8EE] hover:bg-[#FBEFC5] border border-[#EADBBD] text-xs font-bold text-stone-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>🎬 ASMR งานประกอบญี่ปุ่น (5 ฉาก)</span>
            </button>
            <button
              type="button"
              onClick={() => setRawScript(SAMPLE_CAFE_SCRIPT)}
              className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Film className="w-3.5 h-3.5 text-stone-600" />
              <span>☕ ไวรัลคาเฟ่กาแฟ Specialty (6 ฉาก)</span>
            </button>
            <button
              type="button"
              onClick={() => setRawScript('')}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-600 border border-stone-200 text-xs font-medium text-stone-500 transition-all cursor-pointer ml-auto"
            >
              ล้างข้อความ
            </button>
          </div>

          {/* Script Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>วางบทหรือ Prompt ที่มีหลายฉากที่นี่:</span>
                <span className="text-[11px] font-normal text-stone-500">
                  (รองรับ Scene 1..N, ฉากที่ 1..N, Shot 1..N)
                </span>
              </label>
              {parsed && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  ✓ ตรวจพบ {parsed.shots.length} ฉากสำเร็จ
                </span>
              )}
            </div>

            <textarea
              rows={9}
              value={rawScript}
              onChange={(e) => setRawScript(e.target.value)}
              placeholder="วาง Prompt ที่นี่ เช่น...&#10;🎬 Prompt 1: Pure ASMR “The Sound of Japanese Craftsmanship”&#10;Scene 1: Smart Access&#10;Prompt: Close-up shot...&#10;Scene 2: Unpeeling Screen&#10;Prompt: Macro shot..."
              className="w-full bg-[#FAF9F5] border border-stone-300 focus:border-[#F71C25] rounded-2xl p-4 text-xs font-mono text-stone-900 focus:outline-none transition-colors shadow-inner resize-y leading-relaxed"
            />
          </div>

          {/* Live Parsed Preview Rail */}
          {parsed && parsed.shots && parsed.shots.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ตัวอย่างช็อตที่จะถูกสร้างลงบอร์ด ({parsed.shots.length} ช็อต)</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    เรื่อง: <strong className="text-stone-900 font-bold">{parsed.project_title}</strong> • สไตล์: {parsed.visual_style}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {parsed.shots.map((shot, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FDF8EE]/60 border border-[#EADBBD] rounded-2xl p-3 shadow-2xs hover:border-[#F71C25]/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#FBEFC5] border border-[#E5D7A3] text-[10px] font-mono font-bold text-stone-900">
                          ช็อตที่ {shot.shot_number}
                        </span>
                        <span className="text-[10px] font-mono text-stone-600 font-bold">
                          {shot.camera_angle} ({shot.lens_focal})
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-950 line-clamp-1 mb-1">
                        {shot.title}
                      </h4>
                      <p className="text-[11px] text-stone-700 line-clamp-2 leading-relaxed">
                        {shot.prompt}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#EADBBD]/80 flex items-center justify-between text-[10px] font-mono text-stone-600">
                      <span className="truncate max-w-[160px]" title={shot.audio_foley}>
                        🔊 {shot.audio_foley}
                      </span>
                      <span className="text-[#F71C25] font-bold">
                        {shot.duration_seconds}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF9F5] flex items-center justify-between">
          <div className="text-xs font-mono text-stone-500">
            {parsed && parsed.shots ? (
              <span>พร้อมสร้าง <strong className="text-stone-900 font-bold">{parsed.shots.length} ช็อต</strong> เป็นโปรเจกต์ใหม่</span>
            ) : (
              <span>กรุณากรอกสคริปต์เพื่อตรวจจับฉาก</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleCommit}
              disabled={isSubmitting || !parsed || !parsed.shots || parsed.shots.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {isSubmitting
                  ? 'กำลังนำเข้าช็อต...'
                  : `สร้างโปรเจกต์ทั้ง ${parsed?.shots?.length || 0} ช็อตทันที`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
