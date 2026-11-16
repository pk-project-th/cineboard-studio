import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Wand2,
  Camera,
  CheckCircle2,
  ClipboardPaste,
  Trash2,
  Plus,
  Minus,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Compass,
  FileEdit,
  Zap
} from 'lucide-react';

const TRAVEL_QUICK_IDEAS = [
  {
    id: 'temple_sunset',
    badge: '⛩️ เที่ยววัด / แลนด์มาร์คแสงเย็น',
    aspect: '9:16',
    shots: 6,
    text: 'ไปเที่ยววัดอรุณฯ ช่วงเย็น 5 โมง แสงพระอาทิตย์ตกสะท้อนพระปรางค์สวยมาก อยากถ่ายคลิปพาชมมุมเด็ดและจุดถ่ายรูปเช็กอิน'
  },
  {
    id: 'cafe_hopping',
    badge: '☕ รีวิวคาเฟ่ & ของกินร้านเด็ด',
    aspect: '9:16',
    shots: 6,
    text: 'แวะคาเฟ่ลับบรรยากาศสวนญี่ปุ่น มัทฉะลาเต้เข้มข้นและเค้กโฮมเมด แสงธรรมชาติส่องผ่านหน้าต่างสวยทุกมุม'
  },
  {
    id: 'beach_trip',
    badge: '🏖️ ทริปทะเล / พูลวิลล่ากับเพื่อน',
    aspect: '9:16',
    shots: 6,
    text: 'ทริปเที่ยวทะเลหัวหินพักพูลวิลล่าริมหาด เปิดห้องเจอวิวทะเล เดินเล่นชายหาดยามเย็นบรรยากาศสุดชิลล์'
  },
  {
    id: 'street_food',
    badge: '🍜 ตะลุยของกินตลาดกลางคืน',
    aspect: '9:16',
    shots: 5,
    text: 'เดินเที่ยวถนนคนเดินหาของกินสตรีทฟู้ดตอนเย็น ร้านเด็ดคิวยาว ย่างสดๆ ควันหอมฉุย ชิมแล้วอร่อยฟิน'
  },
  {
    id: 'mountain_camp',
    badge: '🏕️ แคมป์ปิ้ง / ภูเขาหมอกเช้า',
    aspect: '9:16',
    shots: 6,
    text: 'กางเต็นท์แคมป์ปิ้งริมอ่างเก็บน้ำ ตื่นเช้ามาเจอทะเลหมอก ดริปกาแฟร้อนๆ สูดอากาศบริสุทธิ์ฮีลใจ'
  },
  {
    id: 'car_delivery',
    badge: '🚗 ส่งมอบรถใหม่ / ขับรถเที่ยว',
    aspect: '16:9',
    shots: 6,
    text: 'ส่งมอบรถยนต์ไฟฟ้าพรีเมียมในโชว์รูม เปิดผ้าคลุมเผยไฟหน้าโฉบเฉี่ยว มอบกุญแจให้ลูกค้าพร้อมรอยยิ้มและขับออกสู่ถนนยามเย็น'
  }
];

const MOOD_PRESETS = [
  { id: 'รีวิวป้ายยา น่าตามรอย สนุกเป็นกันเอง', label: '✨ รีวิวป้ายยา ชวนตามรอย' },
  { id: 'ชิลล์ฮีลใจ แสงธรรมชาติอบอุ่นละมุน', label: '🍃 ชิลล์ฮีลใจ แสงละมุน' },
  { id: 'ไวรัลตัดสลับไว ดึงคนดูตั้งแต่วินาทีแรก', label: '🔥 ไวรัลกระชับ หยุดนิ้วคนดู' },
  { id: 'เน้นเสียงธรรมชาติ ASMR และภาพมุมใกล้คมชัด', label: '🎧 ASMR เน้นดีเทล & เสียง' }
];

const DURATION_PRESETS = [
  { label: '⚡ คลิปสั้น 15 วิ', shots: 5, desc: 'กระชับ ทันใจ (5 ฉาก)' },
  { label: '🎬 มาตรฐาน 18 วิ', shots: 6, desc: 'เล่าเรื่องครบ (6 ฉาก)' },
  { label: '🌟 เต็มอิ่ม 25 วิ', shots: 8, desc: 'Vlog ละเอียด (8 ฉาก)' }
];

function detectShotCountFromText(text) {
  if (!text) return null;
  const match = text.match(/(?:ขอ|เอา|อยากได้|สร้าง|ทำ|จำนวน)?\s*(\d+)\s*(?:ฉาก|ช็อต|ซีน|ช้อต|ตอน|shots?|scenes?|cuts?)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 2 && num <= 12) return num;
  }
  return null;
}

export default function BriefView({
  onPlanAndAutoRender,
  onPlanForReview,
  isPlanning = false
}) {
  const [storyConcept, setStoryConcept] = useState(() => {
    try {
      return localStorage.getItem('cineboard_draft_concept') || '';
    } catch (_) {
      return '';
    }
  });
  const [selectedMood, setSelectedMood] = useState(MOOD_PRESETS[0].id);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [selectedShotCount, setSelectedShotCount] = useState(6);
  const [autoRenderImages, setAutoRenderImages] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const updateConcept = (val) => {
    setStoryConcept(val);
    setErrorMsg('');
    try {
      if (val && val.trim()) {
        localStorage.setItem('cineboard_draft_concept', val);
      } else {
        localStorage.removeItem('cineboard_draft_concept');
      }
    } catch (_) {}
  };

  const textMentionedCount = useMemo(() => {
    return detectShotCountFromText(storyConcept);
  }, [storyConcept]);

  const effectiveScenesCount = textMentionedCount || selectedShotCount;
  const estimatedDurationSec = Math.round(effectiveScenesCount * 2.8);

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        updateConcept(clipText.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 1800);
      }
    } catch (err) {
      setErrorMsg('กรุณากดวาง (Paste) ในช่องข้อความได้เลยครับ');
    }
  };

  const handleApplyQuickIdea = (idea) => {
    updateConcept(idea.text);
    setAspectRatio(idea.aspect || '9:16');
    setSelectedShotCount(idea.shots || 6);
  };

  const handleStepCount = (delta) => {
    const nextVal = Math.max(2, Math.min(12, effectiveScenesCount + delta));
    setSelectedShotCount(nextVal);
  };

  const handleSubmit = async (reviewFirst = false) => {
    if (!storyConcept.trim()) {
      setErrorMsg('กรุณาพิมพ์สถานที่ หรือโจทย์คอนเทนต์ที่อยากถ่ายก่อนครับ');
      return;
    }
    setErrorMsg('');
    const payload = {
      story_concept: storyConcept.trim(),
      num_shots: effectiveScenesCount,
      target_duration: estimatedDurationSec,
      pacing: 'normal',
      visual_style: selectedMood,
      camera_breakdown: 'auto_story',
      aspect_ratio: aspectRatio,
      auto_render_images: autoRenderImages
    };

    if (reviewFirst) {
      await onPlanForReview(payload);
    } else {
      await onPlanAndAutoRender(payload);
    }
  };

  return (
    <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 bg-[#0E121B] border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14 overflow-y-auto no-print">
      <div className="p-4 sm:p-5 space-y-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold mb-1.5">
              <Compass className="w-3 h-3" />
              <span>ON-THE-GO CONTENT DIRECTOR</span>
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              ผู้ช่วยคิดช็อต & กำกับคอนเทนต์ด่วน
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              โยนโจทย์หรือสถานที่เที่ยวเข้ามา ระบบจะวางแผนให้ครบว่า <span className="text-slate-200 font-semibold">กี่ฉาก ฉากละกี่วิ ถ่ายอะไร มุมไหน เว้นที่ใส่ข้อความตรงไหน และพากย์ยังไง</span>
            </p>
          </div>
        </div>

        {/* Step 1: Topic / Location Input */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center">1</span>
              <span>ตอนนี้ไปเที่ยวไหน หรืออยากถ่ายคอนเทนต์อะไร?</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ClipboardPaste className="w-3 h-3 text-amber-400" />
                <span>{pasteSuccess ? 'วางแล้ว!' : 'วางข้อความ'}</span>
              </button>
              {storyConcept && (
                <button
                  type="button"
                  onClick={() => updateConcept('')}
                  title="ล้างข้อความ"
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={storyConcept}
            onChange={(e) => updateConcept(e.target.value)}
            rows={4}
            placeholder="พิมพ์สั้นๆ ได้เลย เช่น 'มาเที่ยววัดอรุณตอนเย็น อยากถ่ายคลิปลง TikTok', 'พาแฟนมากินคาเฟ่ริมทะเลหัวหิน', 'เดินตลาดนัดกลางคืนเชียงใหม่'..."
            className={`w-full p-3.5 rounded-xl bg-[#090B10] border ${
              errorMsg ? 'border-rose-500' : 'border-slate-700/90 focus:border-amber-400'
            } focus:outline-none text-xs sm:text-sm text-white placeholder:text-slate-500 leading-relaxed resize-y font-sans shadow-inner`}
          />

          {errorMsg && (
            <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
              <span>⚠️ {errorMsg}</span>
            </p>
          )}

          {/* Quick Travel & Content Idea Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>หรือจิ้มเลือกโจทย์ตัวอย่างเพื่อดูผลลัพธ์ทันที:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_QUICK_IDEAS.map((idea) => (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => handleApplyQuickIdea(idea)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#151A26] hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-500/50 text-[11px] font-semibold text-slate-200 hover:text-amber-300 transition-all cursor-pointer text-left"
                >
                  {idea.badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: How Many Scenes & Duration */}
        <div className="p-3.5 rounded-xl bg-[#131824] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center">2</span>
              <span>ความยาวคลิป & จำนวนฉาก</span>
            </label>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{effectiveScenesCount} ฉาก (~{estimatedDurationSec} วิ)</span>
            </span>
          </div>

          {/* 3 Standard Duration Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            {DURATION_PRESETS.map((preset) => {
              const active = effectiveScenesCount === preset.shots;
              return (
                <button
                  key={preset.shots}
                  type="button"
                  onClick={() => setSelectedShotCount(preset.shots)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500/15 border-amber-400 text-white'
                      : 'bg-[#0B0E16] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className={`text-[11px] font-extrabold ${active ? 'text-amber-300' : 'text-white'}`}>
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Fine-tune Stepper + Aspect Ratio */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">ปรับจำนวนฉาก:</span>
              <div className="flex items-center rounded-lg bg-[#090B10] border border-slate-700 p-0.5">
                <button
                  type="button"
                  onClick={() => handleStepCount(-1)}
                  disabled={effectiveScenesCount <= 2}
                  className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2.5 text-xs font-extrabold text-amber-300 font-mono">
                  {effectiveScenesCount} ฉาก
                </span>
                <button
                  type="button"
                  onClick={() => handleStepCount(1)}
                  disabled={effectiveScenesCount >= 12}
                  className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Aspect Ratio Toggle */}
            <div className="flex items-center rounded-lg bg-[#090B10] border border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="แนวตั้ง 9:16 (TikTok / Reels / Shorts)"
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16 มือถือ</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="แนวนอน 16:9 (YouTube / Facebook)"
              >
                <Monitor className="w-3 h-3" />
                <span>16:9</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Mood & Voiceover Style */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center">3</span>
            <span>สไตล์การเล่าเรื่อง & โทนเสียงพากย์</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {MOOD_PRESETS.map((m) => {
              const active = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500/15 border-amber-400 text-amber-200 font-bold'
                      : 'bg-[#131824] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle Auto AI Image Rendering */}
        <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#131824]/80 border border-slate-800 cursor-pointer">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200 block">
              วาดภาพประกอบ AI จริงให้อัตโนมัติ
            </span>
            <span className="text-[11px] text-slate-400 block">
              แสดงภาพไกด์จัดเฟรมทันที และทยอยวาดภาพ AI ประกอบทุกฉาก
            </span>
          </div>
          <input
            type="checkbox"
            checked={autoRenderImages}
            onChange={(e) => setAutoRenderImages(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(false)}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>
              {isPlanning
                ? 'กำลังวางแผนฉาก มุมกล้อง และบทพากย์...'
                : `คิดสตอรี่บอร์ดพร้อมถ่าย (${effectiveScenesCount} ฉาก)`}
            </span>
          </button>

          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#151A26] hover:bg-[#1C2333] border border-slate-700/80 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileEdit className="w-3.5 h-3.5 text-amber-400" />
            <span>ตรวจและแก้ไขแผนทุกฉากในตารางก่อน</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
