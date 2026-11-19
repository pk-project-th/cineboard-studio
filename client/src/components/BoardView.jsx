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
  X,
  FileEdit,
  CheckCircle2,
  Circle,
  Type,
  Smartphone,
  LayoutGrid,
  Play,
  Square,
  Award,
  Sun,
  Compass,
  Scissors,
  Edit3,
  Heart,
  SlidersHorizontal
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

// Speak Thai voiceover cleanly using Web Speech API
function speakThaiText(text, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }
  window.speechSynthesis.cancel();
  const cleanSpeech = String(text || '')
    .replace(/\([^)]*\)/g, '')
    .replace(/["“”]/g, '')
    .trim();
  if (!cleanSpeech) {
    if (onEnd) onEnd();
    return false;
  }
  const utter = new SpeechSynthesisUtterance(cleanSpeech);
  utter.lang = 'th-TH';
  utter.rate = 1.04;
  utter.onend = () => onEnd && onEnd();
  utter.onerror = () => onEnd && onEnd();
  window.speechSynthesis.speak(utter);
  return true;
}

// Compress uploaded smartphone image on client to <= 1200px JPEG for rock-solid speed & persistence
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ShotCard({
  shot,
  index,
  totalShots,
  projectMode,
  darkMode,
  isRendering,
  pocketMode,
  onUpdateShot,
  onRenderShotImage,
  onDeleteShot,
  onUploadShotImage,
  onOpenLightbox,
  onNotify
}) {
  const isPhoto = (shot.mode || projectMode) === 'photo';
  const [isEditing, setIsEditing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  // Editable draft state (only shown when user clicks Edit!)
  const [draft, setDraft] = useState({});

  const startEdit = () => {
    setDraft({
      title: shot.title || '',
      camera_angle: shot.camera_angle || 'Medium Shot',
      camera_movement: shot.camera_movement || '',
      duration_seconds: shot.duration_seconds || 2.5,
      action_description: shot.action_description || '',
      on_screen_text: shot.on_screen_text || '',
      live_action_guide: shot.live_action_guide || '',
      dialogue_script: shot.dialogue_script || '',
      depth_technique: shot.depth_technique || '',
      story_meaning: shot.story_meaning || '',
      pose_guide: shot.pose_guide || '',
      lighting_tip: shot.lighting_tip || '',
      transition_tip: shot.transition_tip || '',
      content: shot.content || ''
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdateShot(shot.id, draft);
    setIsEditing(false);
    if (onNotify) onNotify('บันทึกการแก้ไขเรียบร้อยครับ', 'success');
  };

  const isSvgGuide = !shot.image_url || shot.image_url.startsWith('data:image/svg+xml');
  const isCompleted = !!shot.is_completed;
  const roleBadge =
    shot.shot_role ||
    shot.scene_title ||
    (isPhoto ? `📸 มุมที่ ${index + 1}` : `🎬 ฉากที่ ${index + 1}`);

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onNotify) onNotify('คัดลอกข้อความเรียบร้อยครับ', 'success');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const ok = speakThaiText(shot.dialogue_script, () => setIsSpeaking(false));
      if (!ok && onNotify) {
        onNotify('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียงครับ', 'info');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      await onUploadShotImage(shot.id, compressed, file.name);
      if (onNotify) onNotify('อัปโหลดภาพประกอบช็อตนี้เรียบร้อยครับ', 'success');
    } catch (_) {
      if (onNotify) onNotify('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ครับ', 'error');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <article
      className={`editorial-card rounded-2xl overflow-hidden flex flex-col ${
        isCompleted ? 'ring-2 ring-emerald-500/60' : ''
      }`}
    >
      {/* 1. Clean Top Card Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between gap-2"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-lg font-extrabold text-xs shrink-0 ${
              darkMode ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-white'
            }`}
          >
            {isPhoto ? `ภาพที่ ${index + 1}` : `ฉากที่ ${index + 1}`}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-amber-500/12 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold truncate">
            {roleBadge}
          </span>

          {!isPhoto && (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              <span>{shot.duration_seconds || 2.5} วิ</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 no-print">
          <button
            type="button"
            onClick={() => onUpdateShot(shot.id, { is_completed: isCompleted ? 0 : 1 })}
            className={`btn-tactile min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'hover:border-emerald-500/60'
            }`}
            style={{
              backgroundColor: isCompleted ? undefined : 'var(--bg-surface)',
              borderColor: isCompleted ? undefined : 'var(--border-strong)',
              color: isCompleted ? undefined : 'var(--text-secondary)'
            }}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
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
            onClick={() => (isEditing ? setIsEditing(false) : startEdit())}
            title="แก้ไขรายละเอียดช็อตนี้"
            className={`btn-tactile min-h-[34px] w-8 flex items-center justify-center rounded-lg border cursor-pointer ${
              isEditing ? 'bg-amber-600 text-white border-amber-600' : ''
            }`}
            style={{
              backgroundColor: isEditing ? undefined : 'var(--bg-surface)',
              borderColor: isEditing ? undefined : 'var(--border-subtle)'
            }}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteShot(shot.id)}
            title="ลบช็อตนี้"
            className="btn-tactile min-h-[34px] w-8 flex items-center justify-center rounded-lg border text-rose-500 hover:bg-rose-500/10 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Visual Composition Frame (Hidden in Pocket Shoot Mode for maximum text readability) */}
      {!pocketMode && (
        <div
          className="relative aspect-video w-full overflow-hidden group border-b"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          {shot.image_url && (
            <img
              src={shot.image_url}
              alt={shot.title}
              onClick={() => onOpenLightbox(shot)}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
            />
          )}

          {/* Safe-Zone Text Banner Overlay on Real AI Photos */}
          {!isSvgGuide && showOverlay && shot.on_screen_text && (
            <div className="absolute top-3 inset-x-4 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-xs border border-dashed border-amber-400/80 text-center shadow-lg">
                <span className="text-[10px] font-semibold text-amber-300 block">
                  📐 โซนเว้นพื้นที่วางข้อความพาดหัว
                </span>
                <span className="text-xs font-extrabold text-white">“{shot.on_screen_text}”</span>
              </div>
            </div>
          )}

          {/* Rendering Overlay */}
          {isRendering && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <span className="text-xs font-bold text-white">กำลังวาดภาพตัวอย่างด้วย AI...</span>
              <span className="text-[11px] text-amber-200/80 mt-0.5">
                อ่านไกด์การถ่ายด้านล่างรอได้เลยครับ
              </span>
            </div>
          )}

          {/* Clean Action Floating Bar */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 no-print">
            {!isSvgGuide && shot.on_screen_text && (
              <button
                type="button"
                onClick={() => setShowOverlay(!showOverlay)}
                className="btn-tactile px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-amber-300 text-[11px] font-bold backdrop-blur-md cursor-pointer"
              >
                {showOverlay ? 'ซ่อนกรอบข้อความ' : 'แสดงกรอบข้อความ'}
              </button>
            )}

            <button
              type="button"
              onClick={() => onRenderShotImage(shot.id, shot.content)}
              disabled={isRendering}
              className="btn-tactile px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-md flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSvgGuide ? 'วาดภาพจริง AI' : 'วาดใหม่'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="แนบรูปที่คุณถ่ายจริงเพื่อเทียบหรือเก็บในบอร์ด"
              className="btn-tactile px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ใส่รูปจริง</span>
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
              title="ขยายเต็มจอ"
              className="btn-tactile p-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Card Content: Clean Editorial Reading Mode vs Inline Edit Mode */}
      <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col">
        {isEditing ? (
          /* CLEAN INLINE EDIT FORM */
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-600">✏️ แก้ไขรายละเอียดช็อตนี้</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border font-semibold cursor-pointer"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold cursor-pointer"
                >
                  บันทึก
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">ชื่อช็อต</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold block mb-1">มุมกล้อง</label>
                <select
                  value={draft.camera_angle}
                  onChange={(e) => setDraft({ ...draft, camera_angle: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                >
                  {CAMERA_ANGLES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              {!isPhoto && (
                <div>
                  <label className="font-bold block mb-1">ความยาว (วินาที)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={draft.duration_seconds}
                    onChange={(e) =>
                      setDraft({ ...draft, duration_seconds: parseFloat(e.target.value) || 2.5 })
                    }
                    className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="font-bold block mb-1">ถ่ายอะไรบ้าง / แอคชั่น</label>
              <textarea
                rows={2}
                value={draft.action_description}
                onChange={(e) => setDraft({ ...draft, action_description: e.target.value })}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:border-amber-600"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
              />
            </div>

            {isPhoto ? (
              <>
                <div>
                  <label className="font-bold block mb-1">วิธีสร้างมิติ (Composition & Depth)</label>
                  <textarea
                    rows={2}
                    value={draft.depth_technique}
                    onChange={(e) => setDraft({ ...draft, depth_technique: e.target.value })}
                    className="w-full p-2.5 rounded-xl border focus:outline-none focus:border-amber-600"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">ท่าโพสไลฟ์สไตล์</label>
                  <input
                    type="text"
                    value={draft.pose_guide}
                    onChange={(e) => setDraft({ ...draft, pose_guide: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="font-bold block mb-1">เสียงพากย์ (Voiceover)</label>
                <textarea
                  rows={2}
                  value={draft.dialogue_script}
                  onChange={(e) => setDraft({ ...draft, dialogue_script: e.target.value })}
                  className="w-full p-2.5 rounded-xl border focus:outline-none focus:border-amber-600"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                />
              </div>
            )}

            <div>
              <label className="font-bold block mb-1">ข้อความพาดหัว / แคปชั่นบนภาพ</label>
              <input
                type="text"
                value={draft.on_screen_text}
                onChange={(e) => setDraft({ ...draft, on_screen_text: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
              />
            </div>

            <div>
              <label className="font-bold block mb-1 font-mono text-[11px] opacity-75">
                AI Image Prompt (EN)
              </label>
              <textarea
                rows={2}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                className="w-full p-2.5 rounded-xl border font-mono text-[11px] focus:outline-none focus:border-amber-600"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
              />
            </div>
          </div>
        ) : isPhoto ? (
          /* ==========================================================
             PHOTO MODE — EDITORIAL MASTER PHOTOGRAPHER READING LAYOUT
             ========================================================== */
          <div className="space-y-3.5">
            <div>
              <h3 className="text-base font-extrabold tracking-tight leading-snug">
                {shot.title}
              </h3>

              {/* World-Class Master Photographer Reference Pill */}
              {shot.master_photographer && (
                <div
                  className="mt-2 px-3 py-2 rounded-xl border flex items-start gap-2"
                  style={{
                    backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
                    borderColor: darkMode ? 'rgba(245, 158, 11, 0.28)' : '#FDE68A'
                  }}
                >
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-snug">
                    <span className="font-bold text-amber-700 dark:text-amber-300 block">
                      เรฟเฟอเร้นช่างภาพระดับโลก
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {shot.master_photographer}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Block 1: Angle, Lens & Depth Technique */}
            <div
              className="p-3.5 rounded-xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>วิธีถ่ายให้ได้มิติ & มุมกล้อง</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/12 text-sky-700 dark:text-sky-300 text-[11px] font-bold">
                  📱 {shot.shot_size || 'เลนส์ 1x'}
                </span>
              </div>

              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                📐 {shot.subtitle || shot.camera_angle}
              </p>

              {shot.depth_technique && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {shot.depth_technique}
                </p>
              )}

              {shot.lighting_tip && (
                <div
                  className="pt-2 border-t text-xs leading-relaxed flex items-start gap-1.5"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{shot.lighting_tip.replace(/^☀️\s*/, '')}</span>
                </div>
              )}
            </div>

            {/* Block 2: Meaning & Natural Lifestyle Pose */}
            <div
              className="p-3.5 rounded-xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                <span>ความหมายของภาพ & ท่าโพสไลฟ์สไตล์</span>
              </span>

              {shot.story_meaning && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-bold">ความหมาย: </span>
                  {shot.story_meaning}
                </p>
              )}

              {shot.pose_guide && (
                <p
                  className="text-xs leading-relaxed pt-1.5 border-t"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <span className="font-bold">🧍 ท่าโพสแนะนำ: </span>
                  {shot.pose_guide}
                </p>
              )}
            </div>

            {/* Block 3: Caption & Framing Space */}
            {(shot.on_screen_text || shot.live_action_guide) && (
              <div
                className="p-3 rounded-xl border space-y-1.5"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Type className="w-3.5 h-3.5" />
                    <span>ข้อความปก / แคปชั่น & พื้นที่ว่าง</span>
                  </span>
                  {shot.on_screen_text && (
                    <button
                      type="button"
                      onClick={() => handleCopy('cap', shot.on_screen_text)}
                      className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cap' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'cap' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  )}
                </div>
                {shot.on_screen_text && (
                  <p className="text-xs font-bold">“{shot.on_screen_text}”</p>
                )}
                {shot.live_action_guide && (
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {shot.live_action_guide}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ==========================================================
             VIDEO MODE — VIRAL LIFESTYLE REELS / TIKTOK READING LAYOUT
             ========================================================== */
          <div className="space-y-3.5">
            <h3 className="text-base font-extrabold tracking-tight leading-snug">
              {shot.title}
            </h3>

            {/* Block 1: What to Shoot + Camera Angle + Transition */}
            <div
              className="p-3.5 rounded-xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>1. ถ่ายอะไร & มุมกล้องไหน</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/12 text-sky-700 dark:text-sky-300 text-[11px] font-bold">
                  📱 {shot.shot_size || 'เลนส์ 1x'}
                </span>
              </div>

              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                {shot.action_description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span
                  className="px-2 py-1 rounded-lg border font-semibold"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  🎥 {shot.camera_movement || shot.camera_angle}
                </span>
                {shot.timecode && (
                  <span
                    className="px-2 py-1 rounded-lg border font-mono font-semibold"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    ⏱️ {shot.timecode}
                  </span>
                )}
              </div>

              {shot.transition_tip && (
                <div
                  className="pt-2 border-t text-[11px] leading-relaxed flex items-start gap-1.5"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{shot.transition_tip.replace(/^✂️\s*/, '')}</span>
                </div>
              )}

              {shot.lighting_tip && (
                <div
                  className="text-[11px] leading-relaxed flex items-start gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{shot.lighting_tip.replace(/^📱\s*/, '')}</span>
                </div>
              )}
            </div>

            {/* Block 2: On-Screen Text & Safe-Zone */}
            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{
                backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.07)' : '#FFFBEB',
                borderColor: darkMode ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A'
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  <span>2. ข้อความพาดหัว & โซนเว้นพื้นที่</span>
                </span>
                {shot.on_screen_text && (
                  <button
                    type="button"
                    onClick={() => handleCopy('text', shot.on_screen_text)}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'text' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'text' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                )}
              </div>

              <p className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
                “{shot.on_screen_text || 'ไม่จำเป็นต้องใส่ข้อความในฉากนี้'}”
              </p>

              {shot.live_action_guide && (
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {shot.live_action_guide}
                </p>
              )}
            </div>

            {/* Block 3: Viral Voiceover Script + TTS Listen Button */}
            <div
              className="p-3.5 rounded-xl border space-y-2"
              style={{
                backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                borderColor: darkMode ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0'
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>3. เสียงพากย์ (Voiceover)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    className={`btn-tactile px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      isSpeaking
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="w-2.5 h-2.5 fill-current" />
                        <span>หยุด</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>ฟังเสียงพากย์</span>
                      </>
                    )}
                  </button>
                  {shot.dialogue_script && (
                    <button
                      type="button"
                      onClick={() => handleCopy('vo', shot.dialogue_script)}
                      className="p-1.5 rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/25 cursor-pointer"
                      title="คัดลอกบทพากย์"
                    >
                      {copiedKey === 'vo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                {shot.dialogue_script || 'ปล่อยเสียงบรรยากาศจริง'}
              </p>

              {shot.audio_foley && (
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  🎵 {shot.audio_foley}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function BoardView({
  prompts = [],
  currentSeries,
  activeMode = 'video',
  darkMode = false,
  renderingIds = {},
  onUpdateShot,
  onRenderShotImage,
  onBatchRenderAll,
  onDeleteShot,
  onAddShot,
  onUploadShotImage,
  onSwitchToBulkEditor,
  onOpenSidebar,
  onNotify
}) {
  const [columns, setColumns] = useState(2);
  const [pocketMode, setPocketMode] = useState(false);
  const [lightboxShot, setLightboxShot] = useState(null);
  const [playingAllVo, setPlayingAllVo] = useState(false);

  const projectMode = currentSeries?.mode || prompts[0]?.mode || activeMode;
  const isPhotoProject = projectMode === 'photo';

  const missingRealImagesCount = prompts.filter(
    (p) => !p.image_url || p.image_url.startsWith('data:image/svg+xml')
  ).length;

  const completedCount = prompts.filter((p) => !!p.is_completed).length;
  const totalDuration = prompts.reduce(
    (acc, p) => acc + (parseFloat(p.duration_seconds) || 0),
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
    ? 'grid-cols-1 xl:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Project Editorial Summary Header */}
      {prompts.length > 0 && (
        <div
          className="editorial-card rounded-2xl p-4 sm:p-5 space-y-4 no-print"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold ${
                    isPhotoProject
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-900 text-amber-400'
                  }`}
                >
                  {isPhotoProject ? '📸 โหมดภาพนิ่งระดับช่างภาพโลก' : '🎬 โหมดวิดีโอไวรัลไลฟ์สไตล์'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  ✅ ถ่ายแล้ว {completedCount}/{prompts.length} {isPhotoProject ? 'ภาพ' : 'ฉาก'}
                </span>
                {!isPhotoProject && totalDuration > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                    ⏱️ รวม {Math.round(totalDuration)} วินาที
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {currentSeries ? currentSeries.title : 'แผนสตอรี่บอร์ดพร้อมถ่าย'}
              </h1>

              {(currentSeries?.viral_hook || currentSeries?.music_vibe) && (
                <div className="space-y-1 pt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {currentSeries?.viral_hook && <p>{currentSeries.viral_hook}</p>}
                  {currentSeries?.music_vibe && (
                    <p className="font-semibold text-amber-700 dark:text-amber-300">
                      {currentSeries.music_vibe}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex items-center p-1 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setPocketMode(false)}
                  className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    !pocketMode
                      ? darkMode
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-900 text-white'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>บอร์ดภาพ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPocketMode(true)}
                  className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    pocketMode
                      ? darkMode
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-900 text-white'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>โหมดถือถ่ายหน้างาน</span>
                </button>
              </div>

              {!isPhotoProject && (
                <button
                  type="button"
                  onClick={handlePlayAllVoiceover}
                  className={`btn-tactile min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    playingAllVo
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {playingAllVo ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>หยุดฟัง</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>ฟังบทพากย์ทั้งคลิป</span>
                    </>
                  )}
                </button>
              )}

              {missingRealImagesCount > 0 && !pocketMode && (
                <button
                  type="button"
                  onClick={() => onBatchRenderAll(true)}
                  className="btn-tactile min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>วาดภาพ AI ({missingRealImagesCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={onSwitchToBulkEditor}
                className="btn-tactile min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)'
                }}
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                <span>แก้ทุกช็อต</span>
              </button>

              <button
                type="button"
                onClick={onAddShot}
                className="btn-tactile min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม{isPhotoProject ? 'ภาพ' : 'ฉาก'}</span>
              </button>

              {!pocketMode && (
                <div
                  className="hidden 2xl:flex items-center p-1 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)'
                  }}
                >
                  {[2, 3].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColumns(col)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        columns === col
                          ? 'bg-amber-600 text-white'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {col} คอลัมน์
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${prompts.length > 0 ? Math.round((completedCount / prompts.length) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid or Editorial Empty State */}
      {prompts.length === 0 ? (
        <div className="editorial-card rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 mx-auto">
            <Camera className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">
              เริ่มต้นสร้างสตอรี่บอร์ดไลฟ์สไตล์ระดับมืออาชีพ
            </h2>
            <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              เลือกโหมดที่ต้องการจากแผงด้านซ้าย:
              <br />
              <strong className="text-amber-700 dark:text-amber-400">📸 โหมดภาพนิ่ง</strong> — แนะนำมุมกล้องสร้างมิติและแสงเงาแบบช่างภาพระดับโลก
              <br />
              <strong className="text-emerald-700 dark:text-emerald-400">🎬 โหมดวิดีโอไวรัล</strong> — วางแผนครบกี่ฉาก กี่วิ ถ่ายอะไร ข้อความบนจอ และบทพากย์
            </p>
          </div>

          <div className="pt-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="btn-tactile px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>เปิดแผงโยนโจทย์สร้างสตอรี่บอร์ด</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-6`}>
          {prompts.map((shot, idx) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              index={idx}
              totalShots={prompts.length}
              projectMode={projectMode}
              darkMode={darkMode}
              isRendering={!!renderingIds[shot.id]}
              pocketMode={pocketMode}
              onUpdateShot={onUpdateShot}
              onRenderShotImage={onRenderShotImage}
              onDeleteShot={onDeleteShot}
              onUploadShotImage={onUploadShotImage}
              onOpenLightbox={(s) => setLightboxShot(s)}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxShot && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxShot(null)}
        >
          <div
            className="max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-strong)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between gap-2"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white font-bold text-xs shrink-0">
                  {lightboxShot.mode === 'photo' ? `ภาพที่ ${lightboxShot.step_number}` : `ฉากที่ ${lightboxShot.step_number}`}
                </span>
                <h3 className="text-sm font-extrabold truncate">{lightboxShot.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxShot(null)}
                className="p-2 rounded-lg hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-zinc-950 flex items-center justify-center max-h-[68vh] overflow-hidden">
              <img
                src={lightboxShot.image_url}
                alt={lightboxShot.title}
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {lightboxShot.master_photographer && (
                <div className="p-3 rounded-xl border md:col-span-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                  <span className="font-bold text-amber-600">🏆 เรฟเฟอเร้นช่างภาพระดับโลก: </span>
                  <span>{lightboxShot.master_photographer}</span>
                </div>
              )}
              <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <span className="font-bold text-sky-600 block mb-1">📐 รายละเอียดการถ่าย</span>
                <p>{lightboxShot.depth_technique || lightboxShot.action_description}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <span className="font-bold text-emerald-600 block mb-1">
                  {lightboxShot.mode === 'photo' ? '💫 ความหมาย & ท่าโพส' : '🎙️ เสียงพากย์'}
                </span>
                <p>{lightboxShot.mode === 'photo' ? `${lightboxShot.story_meaning || ''} ${lightboxShot.pose_guide || ''}` : (lightboxShot.dialogue_script || '-')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
