import React, { useState, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Upload,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Plus,
  Camera,
  Clock,
  Volume2,
  Film,
  X,
  FileEdit,
  CheckCircle2,
  Circle,
  Type,
  Smartphone,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Play,
  Square
} from 'lucide-react';

const CAMERA_ANGLES = [
  'Wide Establishing Shot',
  'Medium Shot',
  'Medium Close-up',
  'Close-up Shot',
  'Extreme Close-up / Macro',
  'Low Angle Hero Shot',
  'Over-the-Shoulder Shot',
  'POV Reveal Shot',
  'High Angle / Bird Eye'
];

// Helper to speak Thai voiceover script using Web Speech API
function speakThaiText(text, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('เบราว์เซอร์ของคุณไม่รองรับระบบอ่านออกเสียงอัตโนมัติครับ');
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  // Strip parenthetical tone instructions like (น้ำเสียงตื่นเต้น) before speaking
  const cleanSpeech = String(text || '')
    .replace(/\([^)]*\)/g, '')
    .replace(/["“”]/g, '')
    .trim();
  if (!cleanSpeech) {
    if (onEnd) onEnd();
    return;
  }
  const utter = new SpeechSynthesisUtterance(cleanSpeech);
  utter.lang = 'th-TH';
  utter.rate = 1.05;
  utter.onend = () => {
    if (onEnd) onEnd();
  };
  utter.onerror = () => {
    if (onEnd) onEnd();
  };
  window.speechSynthesis.speak(utter);
}

function ShotCard({
  shot,
  index,
  totalShots,
  isRendering,
  pocketMode,
  onUpdateShot,
  onRenderShotImage,
  onDeleteShot,
  onUploadShotImage,
  onOpenLightbox
}) {
  const [localTitle, setLocalTitle] = useState(shot.title || '');
  const [localAction, setLocalAction] = useState(shot.action_description || '');
  const [localOnScreenText, setLocalOnScreenText] = useState(shot.on_screen_text || '');
  const [localSpaceGuide, setLocalSpaceGuide] = useState(
    shot.live_action_guide || '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความพาดหัวไม่ให้บังใบหน้า'
  );
  const [localDialogue, setLocalDialogue] = useState(shot.dialogue_script || '');
  const [localPrompt, setLocalPrompt] = useState(shot.content || '');
  const [showTextSafeZoneOverlay, setShowTextSafeZoneOverlay] = useState(true);
  const [showAiPromptDrawer, setShowAiPromptDrawer] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    setLocalTitle(shot.title || '');
    setLocalAction(shot.action_description || '');
    setLocalOnScreenText(shot.on_screen_text || '');
    setLocalSpaceGuide(
      shot.live_action_guide || '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความพาดหัวไม่ให้บังใบหน้า'
    );
    setLocalDialogue(shot.dialogue_script || '');
    setLocalPrompt(shot.content || '');
  }, [
    shot.id,
    shot.title,
    shot.action_description,
    shot.on_screen_text,
    shot.live_action_guide,
    shot.dialogue_script,
    shot.content
  ]);

  const isSvgGuide = !shot.image_url || shot.image_url.startsWith('data:image/svg+xml');
  const isCompleted = !!shot.is_completed;
  const roleBadge =
    shot.shot_role ||
    shot.scene_title ||
    (index === 0
      ? '🎯 HOOK เปิดคลิปหยุดนิ้ว'
      : index === totalShots - 1
      ? '📌 สรุป & ชวนตามรอย'
      : `✨ ไฮไลท์ฉากที่ ${index + 1}`);

  const handleSaveField = (field, value) => {
    if (shot[field] !== value) {
      onUpdateShot(shot.id, { [field]: value });
    }
  };

  const handleCopyText = (key, text) => {
    navigator.clipboard.writeText(text || '');
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleToggleCompleted = () => {
    onUpdateShot(shot.id, { is_completed: isCompleted ? 0 : 1 });
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakThaiText(localDialogue, () => setIsSpeaking(false));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUploadShotImage(shot.id, reader.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`studio-card rounded-2xl overflow-hidden flex flex-col transition-all ${
        isCompleted ? 'border-emerald-500/50 bg-[#0F1715]' : ''
      }`}
    >
      {/* 1. Top Card Bar: Scene Number + Role + Duration + Completed Check */}
      <div className="px-3.5 py-2.5 bg-[#0D1017] border-b border-slate-800/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs shrink-0">
            ฉากที่ {index + 1}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/30 text-[11px] font-bold truncate">
            {roleBadge}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[11px] flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            <span>{shot.duration_seconds || 3} วิ</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 no-print">
          {/* Mark as Shot / Completed Button */}
          <button
            type="button"
            onClick={handleToggleCompleted}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="ติ๊กเมื่อถ่ายฉากนี้เสร็จแล้ว"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ถ่ายแล้ว</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                <span>รอถ่าย</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDeleteShot(shot.id)}
            title="ลบฉากนี้"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Visual Composition Frame (Shows either Real AI Photo + Safe-Zone Overlay OR Illustrated Framing Diagram) */}
      {!pocketMode && (
        <div className="relative bg-[#080A0F] aspect-video w-full overflow-hidden group border-b border-slate-800/80">
          {shot.image_url ? (
            <img
              src={shot.image_url}
              alt={shot.title}
              onClick={() => onOpenLightbox(shot)}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
            />
          ) : null}

          {/* When a real AI photo is shown, display the visual Text Safe-Zone Overlay so user sees where text goes! */}
          {!isSvgGuide && showTextSafeZoneOverlay && localOnScreenText && (
            <div className="absolute top-2.5 inset-x-4 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-xs border border-dashed border-amber-400/80 text-center shadow-lg">
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-300 block">
                  📐 โซนเว้นวางข้อความพาดหัวบนจอ
                </span>
                <span className="text-xs font-extrabold text-white drop-shadow">
                  “{localOnScreenText}”
                </span>
              </div>
            </div>
          )}

          {/* Rendering Spinner Overlay */}
          {isRendering && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <span className="text-xs font-bold text-white">กำลังวาดภาพประกอบฉากนี้ด้วย AI...</span>
              <span className="text-[11px] text-amber-300/80 mt-0.5">คุณสามารถอ่านไกด์การถ่ายด้านล่างได้เลย</span>
            </div>
          )}

          {/* Floating Action Pill on Image */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 no-print">
            {!isSvgGuide && (
              <button
                type="button"
                onClick={() => setShowTextSafeZoneOverlay(!showTextSafeZoneOverlay)}
                className="px-2 py-1 rounded-lg bg-black/80 hover:bg-slate-800 text-amber-300 text-[10px] font-bold backdrop-blur-md border border-white/15 cursor-pointer"
                title="เปิด/ปิดกรอบโซนข้อความบนภาพ"
              >
                {showTextSafeZoneOverlay ? 'ซ่อนกรอบ Text' : 'แสดงกรอบ Text'}
              </button>
            )}

            <button
              type="button"
              onClick={() => onRenderShotImage(shot.id, localPrompt)}
              disabled={isRendering}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold shadow-md flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isSvgGuide ? 'วาดภาพจริง AI' : 'วาดใหม่'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="อัปโหลดรูปที่ถ่ายเองใส่ฉากนี้"
              className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => onOpenLightbox(shot)}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer"
              title="ขยายภาพเต็มจอ"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Card Body: The 4 Clear Shooting Pillars */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Editable Scene Title + Duration Adjuster */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => handleSaveField('title', localTitle)}
              placeholder="ชื่อฉาก..."
              className="w-full bg-transparent text-sm font-extrabold text-white focus:outline-none focus:bg-[#0B0D11] focus:px-2 focus:py-1 focus:rounded-lg border border-transparent focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* PILLAR 1: มุมกล้องไหน & ถ่ายอะไรบ้าง (Camera Angle & What to Shoot) */}
          <div className="p-3 rounded-xl bg-[#0D111A] border border-sky-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold text-sky-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>1. ถ่ายอะไร & มุมกล้องไหน</span>
              </span>

              <div className="flex items-center gap-1.5">
                <select
                  value={shot.camera_angle || 'Medium Shot'}
                  onChange={(e) => onUpdateShot(shot.id, { camera_angle: e.target.value })}
                  className="bg-[#151C2B] border border-sky-500/30 rounded-lg px-2 py-0.5 text-[11px] font-bold text-sky-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CAMERA_ANGLES.map((ang) => (
                    <option key={ang} value={ang} className="bg-[#131720] text-slate-100">
                      🎥 {ang}
                    </option>
                  ))}
                  {!CAMERA_ANGLES.includes(shot.camera_angle) && shot.camera_angle && (
                    <option value={shot.camera_angle} className="bg-[#131720] text-slate-100">
                      🎥 {shot.camera_angle}
                    </option>
                  )}
                </select>
                {shot.shot_size && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 text-[10px] font-mono font-bold">
                    {shot.shot_size}
                  </span>
                )}
              </div>
            </div>

            {shot.camera_movement && (
              <div className="text-[11px] text-slate-300 font-medium bg-[#131926] px-2.5 py-1 rounded-lg border border-slate-800">
                📱 <span className="text-slate-400">การถือกล้อง:</span>{' '}
                <span className="text-amber-300 font-semibold">{shot.camera_movement}</span>
              </div>
            )}

            <textarea
              rows={2}
              value={localAction}
              onChange={(e) => setLocalAction(e.target.value)}
              onBlur={() => handleSaveField('action_description', localAction)}
              placeholder="อธิบายว่าฉากนี้ต้องหันกล้องไปถ่ายอะไร..."
              className="w-full p-2 rounded-lg bg-[#090C12] border border-slate-800/90 focus:border-sky-400 focus:outline-none text-xs text-slate-100 leading-relaxed resize-none"
            />
          </div>

          {/* PILLAR 2: ต้องเว้นใส่ข้อความอะไรมั้ย (On-Screen Text & Framing Space Guide) */}
          <div className="p-3 rounded-xl bg-[#0D111A] border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                <span>2. ข้อความพาดหัวบนจอ & การเว้นพื้นที่เฟรม</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyText('text', localOnScreenText)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'text' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>คัดลอกข้อความ</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={localOnScreenText}
              onChange={(e) => setLocalOnScreenText(e.target.value)}
              onBlur={() => handleSaveField('on_screen_text', localOnScreenText)}
              placeholder="ข้อความสั้นๆ ที่จะขึ้นบนจอในฉากนี้..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090C12] border border-slate-800 focus:border-amber-400 text-xs font-bold text-amber-200 focus:outline-none"
            />

            <input
              type="text"
              value={localSpaceGuide}
              onChange={(e) => setLocalSpaceGuide(e.target.value)}
              onBlur={() => handleSaveField('live_action_guide', localSpaceGuide)}
              className="w-full px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 focus:outline-none"
            />
          </div>

          {/* PILLAR 3: เสียงพากย์จะเป็นประมาณไหน (Voiceover Script + Listen TTS Button) */}
          <div className="p-3 rounded-xl bg-[#0D111A] border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>3. บทพากย์เสียง (Voiceover) & เสียงบรรยากาศ</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleToggleSpeak}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                  }`}
                  title="กดฟังเสียงอ่านบทพากย์ฉากนี้เพื่อซ้อมจังหวะพูด"
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>หยุดฟัง</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>ฟังเสียงพากย์</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText('vo', localDialogue)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'vo' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={localDialogue}
              onChange={(e) => setLocalDialogue(e.target.value)}
              onBlur={() => handleSaveField('dialogue_script', localDialogue)}
              placeholder="บทพูดพากย์เสียงในฉากนี้..."
              className="w-full p-2 rounded-lg bg-[#090C12] border border-slate-800 focus:border-emerald-400 text-xs text-emerald-100 leading-relaxed focus:outline-none resize-none"
            />

            {shot.audio_foley && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>🎵</span>
                <span className="truncate">{shot.audio_foley}</span>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible AI Image Prompt Drawer (Hidden by default to keep UI clean!) */}
        <div className="pt-2 border-t border-slate-800/80 no-print">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAiPromptDrawer(!showAiPromptDrawer)}
              className="text-[11px] font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Film className="w-3 h-3 text-amber-400" />
              <span>ตั้งค่า Prompt วาดภาพ AI (สำหรับ Midjourney / FLUX.1)</span>
              {showAiPromptDrawer ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAiPromptDrawer && (
              <button
                type="button"
                onClick={() => onRenderShotImage(shot.id, localPrompt)}
                disabled={isRendering}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold cursor-pointer"
              >
                วาดภาพใหม่ตามนี้
              </button>
            )}
          </div>

          {showAiPromptDrawer && (
            <div className="mt-2 space-y-1.5">
              <textarea
                rows={2}
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                onBlur={() => handleSaveField('content', localPrompt)}
                placeholder="English prompt for AI image generator..."
                className="w-full p-2 rounded-lg bg-[#07090D] border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoardView({
  prompts = [],
  currentSeries,
  renderingIds = {},
  onUpdateShot,
  onRenderShotImage,
  onBatchRenderAll,
  onDeleteShot,
  onAddShot,
  onUploadShotImage,
  onSwitchToBulkEditor
}) {
  const [columns, setColumns] = useState(2); // Default 2 columns so cards are spacious and easy to read!
  const [pocketMode, setPocketMode] = useState(false);
  const [lightboxShot, setLightboxShot] = useState(null);
  const [playingAllVo, setPlayingAllVo] = useState(false);

  const missingRealImagesCount = prompts.filter(
    (p) => !p.image_url || p.image_url.startsWith('data:image/svg+xml')
  ).length;

  const completedCount = prompts.filter((p) => !!p.is_completed).length;
  const totalDuration = prompts.reduce(
    (acc, p) => acc + (parseFloat(p.duration_seconds) || 3),
    0
  );

  const handlePlayAllVoiceover = () => {
    if (playingAllVo) {
      window.speechSynthesis?.cancel();
      setPlayingAllVo(false);
      return;
    }
    const allScript = prompts
      .map((p, idx) => `ฉากที่ ${idx + 1}. ${p.dialogue_script || p.action_description || ''}`)
      .join(' ... ');
    setPlayingAllVo(true);
    speakThaiText(allScript, () => setPlayingAllVo(false));
  };

  const gridClass = pocketMode
    ? 'grid-cols-1 max-w-2xl mx-auto'
    : columns === 2
    ? 'grid-cols-1 lg:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Top Project Overview & Shooting Control Bar */}
      <div className="bg-[#111622] p-4 rounded-2xl border border-slate-800/90 space-y-3 no-print shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {currentSeries ? currentSeries.title : 'แผนการถ่ายทำสตอรี่บอร์ด'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                {prompts.length} ฉาก • รวม {Math.round(totalDuration)} วินาที
              </span>
              {prompts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  ✅ ถ่ายแล้ว {completedCount}/{prompts.length} ฉาก
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              แต่ละฉากระบุครบทั้ง <span className="text-sky-300 font-semibold">มุมกล้อง & วิธีถ่าย</span>,{' '}
              <span className="text-amber-300 font-semibold">ข้อความบนจอ & จุดเว้นที่ว่าง</span> และ{' '}
              <span className="text-emerald-300 font-semibold">บทพากย์เสียงพร้อมกดฟังได้ทันที</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Toggle: Visual Board vs Mobile Pocket Checklist */}
            <div className="flex items-center bg-[#090C12] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPocketMode(false)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !pocketMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>โหมดสตอรี่บอร์ด</span>
              </button>
              <button
                type="button"
                onClick={() => setPocketMode(true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  pocketMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="โหมดอ่านง่ายหน้างานสำหรับถือถ่ายด้วยมือถือมือเดียว"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>โหมดถือถ่ายหน้างาน</span>
              </button>
            </div>

            {prompts.length > 0 && (
              <button
                type="button"
                onClick={handlePlayAllVoiceover}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  playingAllVo
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {playingAllVo ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>หยุดฟังเสียงพากย์</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>ฟังบทพากย์ต่อเนื่องทั้งคลิป</span>
                  </>
                )}
              </button>
            )}

            {missingRealImagesCount > 0 && !pocketMode && (
              <button
                type="button"
                onClick={() => onBatchRenderAll(true)}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/15 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>วาดภาพจริง AI ({missingRealImagesCount} ฉาก)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSwitchToBulkEditor}
              className="px-3 py-2 rounded-xl bg-[#181E2C] hover:bg-[#222A3D] border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5 text-amber-400" />
              <span>แก้ทุกฉากในหน้าเดียว</span>
            </button>

            <button
              type="button"
              onClick={onAddShot}
              className="px-3 py-2 rounded-xl bg-[#181E2C] hover:bg-[#222A3D] border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มฉาก</span>
            </button>

            {!pocketMode && (
              <div className="hidden xl:flex items-center bg-[#090C12] p-1 rounded-xl border border-slate-800">
                {[2, 3].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColumns(col)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      columns === col ? 'bg-slate-800 text-amber-300' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {col} คอลัมน์
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Story Flow Timeline Bar */}
        {prompts.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1">
            {prompts.map((p, idx) => (
              <div
                key={p.id || idx}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 shrink-0 ${
                  p.is_completed
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0B0E16] border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-mono font-bold text-amber-400">{idx + 1}.</span>
                <span className="max-w-[140px] truncate">{p.title?.replace(/^ฉากที่\s*\d+:\s*/, '')}</span>
                <span className="text-[10px] font-mono text-slate-500">({p.duration_seconds || 3}s)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storyboard Cards Grid */}
      {prompts.length === 0 ? (
        <div className="py-20 text-center bg-[#11151E]/70 rounded-2xl border border-dashed border-slate-800 p-8 max-w-2xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-white mb-1.5">
            พร้อมคิดสตอรี่บอร์ดและไกด์ถ่ายคอนเทนต์ให้คุณทันที!
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            พิมพ์สถานที่เที่ยวหรือโจทย์คอนเทนต์ในแผงด้านซ้าย (หรือจิ้มโจทย์ตัวอย่าง) แล้วกดปุ่ม{' '}
            <span className="text-amber-300 font-bold">“คิดสตอรี่บอร์ดพร้อมถ่าย”</span> ระบบจะวางแผนจำนวนฉาก เวลา มุมกล้อง ข้อความบนจอ และบทพากย์ที่เชื่อมโยงกันให้ครบครับ
          </p>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-5`}>
          {prompts.map((shot, idx) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              index={idx}
              totalShots={prompts.length}
              isRendering={!!renderingIds[shot.id]}
              pocketMode={pocketMode}
              onUpdateShot={onUpdateShot}
              onRenderShotImage={onRenderShotImage}
              onDeleteShot={onDeleteShot}
              onUploadShotImage={onUploadShotImage}
              onOpenLightbox={(s) => setLightboxShot(s)}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxShot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxShot(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#121620] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-xs">
                  ฉากที่ {lightboxShot.step_number} ({lightboxShot.duration_seconds || 3} วิ)
                </span>
                <h3 className="text-sm font-bold text-white">{lightboxShot.title}</h3>
              </div>
              <button
                onClick={() => setLightboxShot(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[68vh] overflow-hidden relative">
              <img
                src={lightboxShot.image_url}
                alt={lightboxShot.title}
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-[#0E1118] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-sky-400 block mb-1">🎥 ถ่ายอะไร & มุมกล้อง</span>
                <p className="text-slate-200">{lightboxShot.action_description}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 block mb-1">🔤 ข้อความพาดหัว & การเว้นเฟรม</span>
                <p className="text-amber-200 font-bold">“{lightboxShot.on_screen_text || '-'}”</p>
                <p className="text-[11px] text-slate-400 mt-1">{lightboxShot.live_action_guide}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400 block mb-1">🎙️ เสียงพากย์ (Voiceover)</span>
                <p className="text-emerald-200">{lightboxShot.dialogue_script || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
