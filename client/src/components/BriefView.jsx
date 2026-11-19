import React, { useState, useMemo } from 'react';
import {
  Camera,
  Film,
  Sparkles,
  ClipboardPaste,
  Trash2,
  Plus,
  Minus,
  Clock,
  MapPin,
  FileEdit,
  Award,
  Flame
} from 'lucide-react';

// Strictly 4 balanced 2x2 lifestyle presets per mode (Zero ragged orphan pills!)
const PHOTO_QUICK_IDEAS = [
  {
    id: 'photo_cafe',
    icon: '☕',
    title: 'คาเฟ่ไลฟ์สไตล์',
    sub: 'เซ็ต IG 6 มุม',
    aspect: '4:5',
    shots: 6,
    text: 'ไปนั่งคาเฟ่แสงสวยสไตล์มินิมอล สั่งมัทฉะกับขนมโฮมเมด อยากได้เซ็ตภาพนิ่งลง IG Carousel ที่ดูแพง มีมิติและเป็นธรรมชาติ'
  },
  {
    id: 'photo_temple',
    icon: '⛩️',
    title: 'วัด / เมืองเก่าแสงเย็น',
    sub: 'แสงเงาสไตล์ Fan Ho',
    aspect: '4:5',
    shots: 6,
    text: 'เดินเล่นถ่ายรูปที่วัดอรุณและย่านเมืองเก่าช่วง 5 โมงเย็น แสงสีทองสวยมาก อยากได้รูปแนวไลฟ์สไตล์เท่ๆ มีมิติแสงเงา'
  },
  {
    id: 'photo_beach',
    icon: '🏖️',
    title: 'ทะเล / พูลวิลล่า',
    sub: 'OOTD ไม่เกร็งกล้อง',
    aspect: '4:5',
    shots: 6,
    text: 'ไปเที่ยวทะเลหัวหินพักพูลวิลล่า ช่วงบ่ายแก่ถึงพระอาทิตย์ตก อยากได้มุมถ่ายรูปไลฟ์สไตล์ริมทะเลแบบไม่เกร็งกล้อง'
  },
  {
    id: 'photo_camp',
    icon: '🏕️',
    title: 'แคมป์ปิ้ง / ภูเขา',
    sub: 'ฟีลนิตยสาร Kinfolk',
    aspect: '4:5',
    shots: 6,
    text: 'ทริปแคมป์ปิ้งดริปกาแฟกลางหมอกเช้าบนดอย อยากได้เซ็ตภาพนิ่งฟีลอบอุ่นเหมือนนิตยสาร Kinfolk'
  }
];

const VIDEO_QUICK_IDEAS = [
  {
    id: 'vid_cafe',
    icon: '☕',
    title: 'ป้ายยาคาเฟ่ลับ',
    sub: 'ไวรัลกระชับ 15 วิ',
    aspect: '9:16',
    shots: 5,
    text: 'แวะคาเฟ่ลับสวนญี่ปุ่น มัทฉะอร่อยและแสงสวยทุกมุม อยากถ่ายคลิปสั้นไลฟ์สไตล์ลง TikTok ให้คนอยากกดเซฟตามรอย'
  },
  {
    id: 'vid_temple',
    icon: '⛩️',
    title: 'เที่ยววัดแสงเย็น',
    sub: 'POV เล่าเรื่อง 18 วิ',
    aspect: '9:16',
    shots: 6,
    text: 'ไปเที่ยววัดอรุณช่วงเย็น 5 โมง แสงพระอาทิตย์ตกสวยมาก อยากถ่ายคลิปพาชมมุมลับและจุดถ่ายรูปเช็กอิน'
  },
  {
    id: 'vid_beach',
    icon: '🏖️',
    title: 'ทริปทะเล & ที่พัก',
    sub: 'Mini-Vlog ฮีลใจ',
    aspect: '9:16',
    shots: 6,
    text: 'ทริปเที่ยวทะเลพักพูลวิลล่าริมหาด เปิดห้องเจอวิวทะเล เดินเล่นรับลมเย็นๆ แบบ Mini-Vlog ไลฟ์สไตล์ชิลล์ๆ'
  },
  {
    id: 'vid_food',
    icon: '🍜',
    title: 'ตะลุยของกินกลางคืน',
    sub: 'รีวิวสไตล์เพื่อนเล่า',
    aspect: '9:16',
    shots: 5,
    text: 'เดินเที่ยวถนนคนเดินหาของกินสตรีทฟู้ดร้านเด็ด ย่างสดควันหอมฉุย รีวิวสไตล์เพื่อนชวนกิน'
  }
];

const VIDEO_VIRAL_STYLES = [
  { id: 'ไวรัลป้ายยาเปิด Hook หยุดนิ้วใน 2 วิแรก สนุกเป็นกันเอง', label: '🔥 ป้ายยาไวรัล หยุดนิ้ว' },
  { id: 'Aesthetic Mini-Vlog แสงธรรมชาติละมุน สวยดูแพง ชวนเซฟคลิป', label: '✨ Mini-Vlog ดูแพงละมุน' },
  { id: 'รีวิวจริงใจสไตล์เพื่อนเล่า ชวนคุยกระตุ้นคอมเมนต์', label: '🗣️ เพื่อนเล่าจริงใจ' },
  { id: 'ASMR เน้นเสียงบรรยากาศจริงและภาพมุมใกล้คมชัดชวนดูวนซ้ำ', label: '🎧 ASMR ภาพ+เสียงจริง' }
];

const PHOTO_STYLE_MOODS = [
  { id: 'Kinfolk Editorial โทนฟิล์ม Kodak Portra แสงธรรมชาติอบอุ่น', label: '🎞️ ฟิล์ม Editorial อบอุ่น' },
  { id: 'Chiaroscuro แสงเงาคมชัดมีมิติลุ่มลึกสไตล์ Fan Ho', label: '🌓 แสงเงามิติลึก (Fan Ho)' },
  { id: 'Soft Layered Candid ถ่ายลอดฉากหน้าละมุนสไตล์ Saul Leiter', label: '🌿 เบลอฉากหน้าละมุน (Leiter)' },
  { id: 'Vibrant Travel สีสันสดชัดเล่าเรื่องสไตล์ National Geographic', label: '🎨 สีสันเล่าเรื่อง (McCurry)' }
];

const VIDEO_DURATION_PRESETS = [
  { label: '⚡ 15 วิ', shots: 5, desc: '5 ฉาก กระชับ' },
  { label: '🎬 18 วิ', shots: 6, desc: '6 ฉาก ลงตัว' },
  { label: '🌟 24 วิ', shots: 8, desc: '8 ฉาก เต็มอิ่ม' }
];

const PHOTO_COUNT_PRESETS = [
  { label: '📸 4 ภาพ', shots: 4, desc: 'เซ็ตสั้นคมๆ' },
  { label: '🖼️ 6 ภาพ', shots: 6, desc: 'IG Carousel พอดี' },
  { label: '📚 8 ภาพ', shots: 8, desc: 'อัลบั้มจัดเต็ม' }
];

function detectShotCountFromText(text) {
  if (!text) return null;
  const match = text.match(/(?:ขอ|เอา|อยากได้|สร้าง|ทำ|จำนวน)?\s*(\d+)\s*(?:ฉาก|ช็อต|ซีน|ภาพ|รูป|shots?|scenes?|photos?)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 2 && num <= 10) return num;
  }
  return null;
}

export default function BriefView({
  mode = 'video',
  onChangeMode,
  darkMode = false,
  onPlanAndAutoRender,
  onPlanForReview,
  isPlanning = false
}) {
  const isPhoto = mode === 'photo';

  const [storyConcept, setStoryConcept] = useState(() => {
    try {
      return localStorage.getItem('cineboard_draft_concept') || '';
    } catch (_) {
      return '';
    }
  });
  const [selectedStyle, setSelectedStyle] = useState(
    isPhoto ? PHOTO_STYLE_MOODS[0].id : VIDEO_VIRAL_STYLES[0].id
  );
  const [aspectRatio, setAspectRatio] = useState(isPhoto ? '4:5' : '9:16');
  const [selectedShotCount, setSelectedShotCount] = useState(6);
  const [autoRenderImages, setAutoRenderImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handleModeSwitch = (nextMode) => {
    if (onChangeMode) onChangeMode(nextMode);
    if (nextMode === 'photo') {
      setAspectRatio('4:5');
      setSelectedStyle(PHOTO_STYLE_MOODS[0].id);
    } else {
      setAspectRatio('9:16');
      setSelectedStyle(VIDEO_VIRAL_STYLES[0].id);
    }
  };

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

  const textMentionedCount = useMemo(() => detectShotCountFromText(storyConcept), [storyConcept]);
  const effectiveCount = textMentionedCount || selectedShotCount;
  const estimatedDurationSec = Math.round(effectiveCount * 2.7);

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        updateConcept(clipText.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 1800);
      }
    } catch (_) {
      setErrorMsg('กรุณากดวาง (Paste) ในช่องข้อความได้เลยครับ');
    }
  };

  const handleApplyQuickIdea = (idea) => {
    updateConcept(idea.text);
    setAspectRatio(idea.aspect);
    setSelectedShotCount(idea.shots);
  };

  const handleSubmit = async (reviewFirst = false) => {
    if (!storyConcept.trim()) {
      setErrorMsg(
        isPhoto
          ? 'กรุณาพิมพ์สถานที่หรือแนวภาพนิ่งไลฟ์สไตล์ที่อยากถ่ายก่อนครับ'
          : 'กรุณาพิมพ์สถานที่หรือโจทย์วิดีโอไลฟ์สไตล์ที่อยากถ่ายก่อนครับ'
      );
      return;
    }
    setErrorMsg('');
    const payload = {
      mode,
      story_concept: storyConcept.trim(),
      num_shots: effectiveCount,
      target_duration: isPhoto ? 0 : estimatedDurationSec,
      pacing: 'normal',
      visual_style: selectedStyle,
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

  const quickIdeas = isPhoto ? PHOTO_QUICK_IDEAS : VIDEO_QUICK_IDEAS;
  const styleOptions = isPhoto ? PHOTO_STYLE_MOODS : VIDEO_VIRAL_STYLES;
  const countPresets = isPhoto ? PHOTO_COUNT_PRESETS : VIDEO_DURATION_PRESETS;

  return (
    <aside
      className="w-full lg:w-[400px] xl:w-[420px] shrink-0 lg:border-r flex flex-col lg:h-[calc(100dvh-3.5rem)] lg:sticky lg:top-14 overflow-y-auto no-print transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Centered max-w-lg on iPhone 17 / Tablet for immaculate visual symmetry */}
      <div className="p-4 sm:p-5 pb-28 lg:pb-6 space-y-5 flex-1 w-full max-w-lg mx-auto lg:max-w-none">
        {/* DUAL MODE SWITCHER (Symmetrical 2-Column Equal Tiles) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              เลือกประเภทสตอรี่บอร์ด
            </span>
            <span className="text-[11px] font-semibold text-amber-600">
              {isPhoto ? '📸 โหมดภาพนิ่ง' : '🎬 โหมดวิดีโอ'}
            </span>
          </div>

          <div
            className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => handleModeSwitch('photo')}
              className={`btn-tactile min-h-[58px] px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer transition-all ${
                isPhoto
                  ? darkMode
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-white shadow-sm'
                  : 'hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <Camera className="w-4 h-4 shrink-0" />
                <span>ภาพนิ่ง (Photo)</span>
              </div>
              <span className={`text-[10px] leading-tight ${isPhoto ? 'opacity-85' : 'opacity-65'}`}>
                เรฟช่างภาพโลก • มิติ
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('video')}
              className={`btn-tactile min-h-[58px] px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer transition-all ${
                !isPhoto
                  ? darkMode
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-white shadow-sm'
                  : 'hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <Film className="w-4 h-4 shrink-0" />
                <span>วิดีโอ (Viral Video)</span>
              </div>
              <span className={`text-[10px] leading-tight ${!isPhoto ? 'opacity-85' : 'opacity-65'}`}>
                ไวรัลไลฟ์สไตล์ • พากย์
              </span>
            </button>
          </div>
        </div>

        {/* Mode Info Callout */}
        <div
          className="p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5"
          style={{
            backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
            borderColor: darkMode ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A'
          }}
        >
          {isPhoto ? (
            <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div style={{ color: darkMode ? '#FDE68A' : '#78350F' }}>
            {isPhoto ? (
              <>
                <span className="font-bold block">สตอรี่บอร์ดภาพนิ่งระดับช่างภาพโลก</span>
                <span className="text-[11px] opacity-90">
                  อ้างอิงมุมและแสงเงาจาก Fan Ho, Saul Leiter, Steve McCurry, Cartier-Bresson & Peter Lindbergh
                </span>
              </>
            ) : (
              <>
                <span className="font-bold block">สตอรี่บอร์ดวิดีโอไวรัลไลฟ์สไตล์</span>
                <span className="text-[11px] opacity-90">
                  วางแผนครบ กี่ฉาก ฉากละกี่วิ มุมกล้อง จุดเชื่อมฉาก โซนเว้นข้อความหลบปุ่ม TikTok และบทพากย์
                </span>
              </>
            )}
          </div>
        </div>

        {/* STEP 1: Topic / Location */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                {isPhoto ? 'สถานที่หรือแนวภาพนิ่งที่อยากถ่าย' : 'สถานที่หรือโจทย์วิดีโอที่อยากถ่าย'}
              </span>
            </label>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="btn-tactile h-8 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
                <span>{pasteSuccess ? 'วางแล้ว!' : 'วาง'}</span>
              </button>
              {storyConcept && (
                <button
                  type="button"
                  onClick={() => updateConcept('')}
                  title="ล้างข้อความ"
                  className="btn-tactile h-8 w-8 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
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
            placeholder={
              isPhoto
                ? "เช่น 'ไปคาเฟ่แสงสวยย่านอารีย์', 'เดินถ่ายรูปวัดอรุณตอนเย็น', 'เที่ยวทะเลหัวหินอยากได้รูปลง IG'..."
                : "เช่น 'แวะคาเฟ่ลับสวนญี่ปุ่น', 'ไปเที่ยววัดอรุณตอน 5 โมงเย็น', 'ทริปทะเลกับเพื่อนลง TikTok'..."
            }
            className={`w-full p-3.5 rounded-2xl border text-sm leading-relaxed resize-y focus:outline-none transition-colors ${
              errorMsg ? 'border-rose-500' : 'focus:border-amber-600'
            }`}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: errorMsg ? '#F43F5E' : 'var(--border-strong)',
              color: 'var(--text-primary)'
            }}
          />

          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold">⚠️ {errorMsg}</p>
          )}

          {/* Symmetrical 2x2 Lifestyle Quick Ideas Grid */}
          <div className="space-y-2 pt-0.5">
            <span
              className="text-[11px] font-semibold flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <MapPin className="w-3 h-3 text-amber-600" />
              <span>หรือจิ้มเลือกโจทย์ไลฟ์สไตล์ยอดนิยม:</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickIdeas.map((idea) => (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => handleApplyQuickIdea(idea)}
                  className="btn-tactile min-h-[54px] p-2.5 rounded-xl border text-left hover:border-amber-500 transition-all cursor-pointer flex items-start gap-2"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)'
                  }}
                >
                  <span className="text-base leading-none mt-0.5 shrink-0">{idea.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {idea.title}
                    </div>
                    <div className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {idea.sub}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 2: Shot Count & Aspect Ratio (Symmetrical 3-Col + 2-Col) */}
        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                2
              </span>
              <span>{isPhoto ? 'จำนวนภาพ & สัดส่วน' : 'ความยาว & จำนวนฉาก'}</span>
            </label>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
              {isPhoto ? (
                <span>{effectiveCount} มุมภาพ</span>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  <span>
                    {effectiveCount} ฉาก (~{estimatedDurationSec} วิ)
                  </span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {countPresets.map((preset) => {
              const active = effectiveCount === preset.shots;
              return (
                <button
                  key={preset.shots}
                  type="button"
                  onClick={() => setSelectedShotCount(preset.shots)}
                  className={`btn-tactile min-h-[52px] p-2 rounded-xl border text-center flex flex-col items-center justify-center cursor-pointer ${
                    active ? 'border-amber-600 bg-amber-500/10' : 'hover:border-amber-500/40'
                  }`}
                  style={{
                    backgroundColor: active ? undefined : 'var(--bg-surface)',
                    borderColor: active ? '#D97706' : 'var(--border-subtle)'
                  }}
                >
                  <div className={`text-xs font-extrabold ${active ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                    {preset.label}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {preset.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Symmetrical Stepper + Aspect Ratio Row */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div
              className="h-10 flex items-center justify-between rounded-xl border px-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedShotCount(Math.max(2, effectiveCount - 1))}
                disabled={effectiveCount <= 2}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-extrabold text-amber-600">
                {effectiveCount} {isPhoto ? 'ภาพ' : 'ฉาก'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedShotCount(Math.min(10, effectiveCount + 1))}
                disabled={effectiveCount >= 10}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="h-10 grid gap-1 p-1 rounded-xl border"
              style={{
                gridTemplateColumns: isPhoto ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              {(isPhoto ? ['4:5', '1:1', '16:9'] : ['9:16', '16:9']).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center ${
                    aspectRatio === ratio
                      ? darkMode
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-900 text-white'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {ratio === '9:16' ? '9:16' : ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 3: Style / Viral Formula (Symmetrical 2x2 Grid) */}
        <div className="space-y-2">
          <label className="text-xs font-bold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
              3
            </span>
            <span>{isPhoto ? 'โทนภาพ & สไตล์ช่างภาพหลัก' : 'สูตรคอนเทนต์ไวรัลไลฟ์สไตล์'}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {styleOptions.map((opt) => {
              const active = selectedStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedStyle(opt.id)}
                  className={`btn-tactile min-h-[44px] px-3 py-2 rounded-xl text-[11px] font-semibold border text-left flex items-center cursor-pointer ${
                    active ? 'border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: active ? undefined : 'var(--bg-elevated)',
                    borderColor: active ? '#D97706' : 'var(--border-subtle)'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto AI Image Option */}
        <label
          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-bold block">วาดภาพตัวอย่าง AI ให้อัตโนมัติทันที</span>
            <span className="text-[11px] block leading-snug" style={{ color: 'var(--text-muted)' }}>
              ปิดไว้จะได้แผนภาพไกด์จัดเฟรมทันทีใน 1 วิ (ประหยัดเน็ตมือถือ) แล้วค่อยกดวาดเฉพาะช็อตที่ชอบ
            </span>
          </div>
          <input
            type="checkbox"
            checked={autoRenderImages}
            onChange={(e) => setAutoRenderImages(e.target.checked)}
            className="w-5 h-5 accent-amber-600 rounded cursor-pointer shrink-0"
          />
        </label>

        {/* Symmetrical Primary & Secondary CTAs */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(false)}
            className="btn-tactile min-h-[50px] w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isPlanning
                ? 'กำลังออกแบบสตอรี่บอร์ด...'
                : isPhoto
                ? `สร้างเซ็ตภาพนิ่งระดับโลก (${effectiveCount} มุม)`
                : `สร้างสตอรี่บอร์ดวิดีโอไวรัล (${effectiveCount} ฉาก)`}
            </span>
          </button>

          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(true)}
            className="btn-tactile min-h-[44px] w-full py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-secondary)'
            }}
          >
            <FileEdit className="w-3.5 h-3.5 text-amber-600" />
            <span>ตรวจและปรับแก้แผนทุกช็อตก่อนสร้าง</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
