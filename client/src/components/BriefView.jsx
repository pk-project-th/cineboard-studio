import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  FileText,
  Wand2,
  Edit3,
  Film,
  Layers,
  Ratio,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    id: 'mazda_cx6e',
    badge: '🚗 ส่งมอบรถ Mazda CX-6e',
    mode: 'brief',
    style: 'Commercial Luxury',
    aspect: '16:9',
    shots: 6,
    text: `ส่งมอบรถยนต์ไฟฟ้าพรีเมียม Mazda CX-6e ในโชว์รูมหรู
1. เปิดตัวรถ Mazda CX-6e คลุมผ้าซาตินสีดำในโชว์รูมกระจก แสงไฟสะท้อนหรูหรา
2. พนักงานขายค่อยๆ ดึงผ้าคลุมออก เผยให้เห็นไฟหน้า LED ดีไซน์โฉบเฉี่ยวและกระจังหน้าเรืองแสง
3. พนักงานขายถือกล่องกุญแจหนังส่งมอบให้ลูกค้าด้วยรอยยิ้มอบอุ่น
4. ลูกค้าหญิงยิ้มดีใจ รับกุญแจสมาร์ทคีย์และถ่ายรูปร่วมกับครอบครัวหน้ารถติดโบว์แดง
5. มุมใกล้ภายในห้องโดยสาร มือสัมผัสพวงมาลัยหนังแท้และหน้าจอดิจิทัล روشنขึ้น
6. รถยนต์ไฟฟ้า Mazda CX-6e เคลื่อนตัวออกจากโชว์รูมสู่ถนนยามเย็น แสงอาทิตย์สีทองสะท้อนตัวถังเงางาม`
  },
  {
    id: 'pure_asmr_8',
    badge: '🎧 Pure ASMR 8 ฉาก',
    mode: 'script',
    style: 'Macro ASMR Photography',
    aspect: '16:9',
    shots: 8,
    text: `🎬 Content 1: Pure ASMR “The Sound of Japanese Craftsmanship”
Visual Style Reference: macro photography, hyper-realistic, soft natural daylight, premium automotive commercial style, sharp details.

Scene 1: เปิดพอร์ตชาร์จ (Charging Port)
Prompt: Macro close-up shot. A finger gently opening the sleek charging port door of a modern premium electric vehicle. Soft natural daylight reflecting on the glossy paint. High-end automotive photography, hyper-realistic.

Scene 2: ปลดล็อกฝากระโปรง (The Hood)
Prompt: Medium close-up shot from a low angle. A hand gently lifting the front hood of a sleek modern SUV. Focus on the solid mechanical joints and metallic texture. Cinematic lighting, photorealistic.

Scene 3: เสียงปิดประตู (The Solid Thud)
Prompt: Medium shot from the outside. A hand pushing a heavy, glossy SUV car door fully closed. The car has a deep, rich paint finish reflecting the modern surroundings. Premium automotive commercial style.

Scene 4: สัมผัสพวงมาลัย (Japanese Craftsmanship)
Prompt: Extreme close-up shot. A hand gently tracing the perfect stitching on a soft premium black leather steering wheel inside a luxury car. Warm natural sunlight filtering through the window, highlighting the rich texture. Japanese craftsmanship concept.

Scene 5: แป้นควบคุม (Center Commander)
Prompt: Macro shot. A finger rotating a premium metallic control dial on a luxury car's center console. Elegant interior, soft ambient lighting highlighting the brushed metal texture, highly detailed and precise.

Scene 6: ปุ่มปรับแอร์ (Human-Centric Design)
Prompt: Close-up shot. A finger turning a high-quality climate control knob on a modern car dashboard. Minimalist and elegant interior design, soft lighting, hyper-realistic.

Scene 7: หลังคาแก้ว (Panoramic Sunroof)
Prompt: Medium shot looking up from the back seat. A panoramic glass sunroof sliding open, revealing a clear blue sky. Bright natural light flooding into a premium car cabin with leather seats.

Scene 8: เปิดระบบ EV (Boot-up Screen)
Prompt: Macro shot. A glowing, futuristic digital dashboard instrument cluster in a modern electric vehicle waking up. Dark elegant cabin, high contrast, cinematic lighting, modern technology concept.`
  },
  {
    id: 'glass_skin',
    badge: '✨ โฆษณาเซรั่ม Glass Skin',
    mode: 'brief',
    style: 'Commercial Luxury',
    aspect: '9:16',
    shots: 6,
    text: `โฆษณาเซรั่มบำรุงผิวหน้า Glass Skin พรีเมียม
1. ขวดเซรั่มแก้วใสวางบนผิวน้ำที่มีคลื่นเบาๆ แสงแดดเช้าส่องประกายระยิบระยับ
2. ดรอปเปอร์หยดเนื้อเซรั่มใสเข้มข้นลงบนหลังมือ ภาพมาโครเห็นความชุ่มชื้นชัดเจน
3. นางแบบสาวผิวใสเกลี่ยเนื้อเซรั่มลงบนแก้มอย่างนุ่มนวล แสงธรรมชาติอบอุ่น
4. ภาพโคลสอัพผิวหน้าที่ดูฉ่ำวาว อิ่มน้ำ สุขภาพดีหลังทาเสร็จ
5. นางแบบยิ้มมั่นใจหน้ากระจกในห้องแต่งตัวมินิมอลแสงคลีน
6. ช็อตจบสินค้าขวดเซรั่มคู่กับหยดน้ำและดอกไม้สีขาว พร้อมพื้นที่วางโลโก้แบรนด์`
  },
  {
    id: 'tiktok_viral',
    badge: '🔥 คลิปสั้นไวรัล TikTok',
    mode: 'brief',
    style: 'Cinematic Film',
    aspect: '9:16',
    shots: 4,
    text: `คลิปสั้นไวรัล รีวิวคาเฟ่ลับเปิดใหม่สไตล์ญี่ปุ่นในกรุงเทพฯ
1. เปิดด้วยช็อตเดินผลักประตูไม้โบราณเข้าไปเจอสวนญี่ปุ่นสีเขียวร่มรื่นกลางกรุง
2. บาริสต้ากำลังตีมัทฉะเกรดพรีเมียมในถ้วยเซรามิกทำมือและเทลงบนนมสดแยกชั้นสวยงาม
3. ช็อตตักเค้กมัทฉะลาวาเยิ้มๆ น่ากินแบบ Extreme Close-up
4. ลูกค้านั่งจิบกาแฟริมหน้าต่างไม้กระจกกลม แสงแดดบ่ายส่องอบอุ่น บรรยากาศเหมือนอยู่เกียวโต`
  }
];

const VISUAL_STYLES = [
  { id: 'Commercial Luxury', label: '✨ โฆษณาพรีเมียม (Commercial Luxury)' },
  { id: 'Macro ASMR Photography', label: '🔍 มาโครคมชัดสูง (Macro ASMR)' },
  { id: 'Cinematic Film', label: '🎬 ภาพยนตร์ (Cinematic 35mm)' },
  { id: 'Warm Natural Lifestyle', label: '☀️ แสงธรรมชาติอบอุ่น (Lifestyle)' },
  { id: 'Neon Cyberpunk', label: '🌃 นีออนอนาคต (Futuristic / EV)' },
  { id: '3D Animation Pixar', label: '🧸 แอนิเมชัน 3 มิติ (3D Pixar)' }
];

export default function BriefView({
  onPlanAndAutoRender,
  onPlanForReview,
  isPlanning = false
}) {
  const [inputMode, setInputMode] = useState('brief'); // 'brief' | 'script'
  const [storyConcept, setStoryConcept] = useState(PRESET_TEMPLATES[1].text);
  const [visualStyle, setVisualStyle] = useState('Macro ASMR Photography');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [numShots, setNumShots] = useState(8);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-detect scene count when user pastes Scene 1..N or numbered lines
  const detectedScenesCount = useMemo(() => {
    if (!storyConcept.trim()) return 0;
    const sceneMatches = storyConcept.match(/(?:Scene|SCENE|ฉากที่|ช็อตที่|Shot|SHOT)\s*\d+/g);
    if (sceneMatches && sceneMatches.length >= 2) {
      return sceneMatches.length;
    }
    const numberedLines = storyConcept
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^\d+[\.\)]\s+.+/.test(l));
    if (numberedLines.length >= 2) {
      return numberedLines.length;
    }
    return 0;
  }, [storyConcept]);

  const handleApplyPreset = (preset) => {
    setInputMode(preset.mode);
    setStoryConcept(preset.text);
    setVisualStyle(preset.style);
    setAspectRatio(preset.aspect);
    setNumShots(preset.shots);
    setErrorMsg('');
  };

  const handleSubmit = async (reviewFirst = false) => {
    if (!storyConcept.trim()) {
      setErrorMsg('กรุณาพิมพ์บรีฟหรือวางบทสคริปต์ก่อนครับ');
      return;
    }
    setErrorMsg('');
    const effectiveShots = detectedScenesCount >= 2 ? detectedScenesCount : numShots;
    const payload = {
      story_concept: storyConcept.trim(),
      num_shots: effectiveShots,
      target_duration: effectiveShots * 3,
      pacing: 'normal',
      visual_style: visualStyle,
      aspect_ratio: aspectRatio
    };

    if (reviewFirst) {
      await onPlanForReview(payload);
    } else {
      await onPlanAndAutoRender(payload);
    }
  };

  return (
    <aside className="w-full lg:w-[370px] xl:w-[395px] shrink-0 bg-[#10131B] border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14 overflow-y-auto no-print">
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>ผู้กำกับสตอรี่บอร์ด AI</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              พิมพ์บรีฟภาษาไทย หรือวางบท Scene 1..N เพื่อสร้างภาพจริงทันที
            </p>
          </div>
          {detectedScenesCount >= 2 && (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>พบ {detectedScenesCount} ฉาก</span>
            </span>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0D11] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setInputMode('brief')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              inputMode === 'brief'
                ? 'bg-slate-800 text-amber-300 border border-amber-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI คิดช็อตจากบรีฟ</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('script')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              inputMode === 'script'
                ? 'bg-slate-800 text-amber-300 border border-amber-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>วางบท Scene 1..N</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>ตัวอย่างพร้อมใช้ (คลิกเพื่อลองทันที):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#171C28] hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-500/40 text-[11px] font-semibold text-slate-200 hover:text-amber-300 transition-all cursor-pointer"
              >
                {preset.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Script / Brief Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">
              {inputMode === 'script'
                ? 'วางบทสคริปต์หลายฉาก (Scene 1..N หรือ 1..N)'
                : 'รายละเอียดบรีฟ / พล็อตเรื่องที่ต้องการ'}
            </label>
            {storyConcept && (
              <button
                type="button"
                onClick={() => setStoryConcept('')}
                className="text-[11px] text-slate-500 hover:text-rose-400 cursor-pointer"
              >
                ล้างข้อความ
              </button>
            )}
          </div>
          <textarea
            value={storyConcept}
            onChange={(e) => setStoryConcept(e.target.value)}
            rows={8}
            placeholder={
              inputMode === 'script'
                ? 'วางสคริปต์ที่มี Scene 1: ... Prompt: ... ระบบจะแยกทุกฉากตามต้นฉบับ 100%'
                : 'พิมพ์ไอเดีย เช่น ส่งมอบรถใหม่ในโชว์รูม, รีวิวสินค้า, หรือเขียนเป็นข้อๆ 1, 2, 3...'
            }
            className="w-full p-3.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500/70 focus:outline-none text-xs text-slate-100 placeholder:text-slate-600 leading-relaxed resize-y font-sans"
          />
        </div>

        {/* Visual Style & Aspect Ratio */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>สไตล์ภาพและแสง (Visual Style)</span>
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {VISUAL_STYLES.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#10131B] text-slate-100">
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Aspect Ratio */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1.5">
                <Ratio className="w-3.5 h-3.5 text-amber-400" />
                <span>สัดส่วนภาพ</span>
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B0D11] rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  16:9 แนวนอน
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  9:16 แนวตั้ง
                </button>
              </div>
            </div>

            {/* Number of Shots */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>จำนวนช็อต</span>
              </label>
              {detectedScenesCount >= 2 ? (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 text-center">
                  ตามบท ({detectedScenesCount} ช็อต)
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B0D11] rounded-xl border border-slate-800">
                  {[4, 6, 8, 12].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumShots(n)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        numShots === n
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dual Action Buttons */}
        <div className="pt-2 space-y-2.5">
          {/* Primary: Create + Auto-Render AI Images */}
          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(false)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isPlanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังแตกช็อตและเตรียมวาดภาพ AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>
                  สร้างสตอรี่บอร์ด + วาดภาพ AI ทันที ({detectedScenesCount >= 2 ? detectedScenesCount : numShots} ช็อต)
                </span>
              </>
            )}
          </button>

          {/* Secondary: Break into shots & review/edit prompts BEFORE rendering */}
          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#171C28] hover:bg-[#1F2637] border border-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>แตกช็อตเพื่อตรวจ / แก้ไข Prompt ทั้งหมดก่อนวาดภาพ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
