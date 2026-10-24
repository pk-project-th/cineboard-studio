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
  Grid,
  Columns
} from 'lucide-react';

const CAMERA_ANGLES = [
  'Wide Establishing Shot',
  'Medium Shot',
  'Medium Close-up',
  'Close-up Shot',
  'Extreme Close-up / Macro',
  'Low Angle Hero Shot',
  'Over-the-Shoulder Shot',
  'High Angle / Bird Eye'
];

function ShotCard({
  shot,
  index,
  isRendering,
  onUpdateShot,
  onRenderShotImage,
  onDeleteShot,
  onUploadShotImage,
  onOpenLightbox
}) {
  const [localTitle, setLocalTitle] = useState(shot.title || '');
  const [localAction, setLocalAction] = useState(shot.action_description || '');
  const [localPrompt, setLocalPrompt] = useState(shot.content || '');
  const [localDialogue, setLocalDialogue] = useState(shot.dialogue_script || '');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(true);
  const fileInputRef = useRef(null);

  // Sync local states when shot prop changes from external updates
  React.useEffect(() => {
    setLocalTitle(shot.title || '');
    setLocalAction(shot.action_description || '');
    setLocalPrompt(shot.content || '');
    setLocalDialogue(shot.dialogue_script || '');
  }, [shot.id, shot.title, shot.action_description, shot.content, shot.dialogue_script]);

  const isSvgPlaceholder =
    !shot.image_url || shot.image_url.startsWith('data:image/svg+xml');
  const isVertical = shot.aspect_ratio === '9:16';

  const handleSaveField = (field, value) => {
    if (shot[field] !== value) {
      onUpdateShot(shot.id, { [field]: value });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(localPrompt || shot.content || '');
    setCopiedPrompt(true);
    fetch(`/api/prompts/${shot.id}/copy`, { method: 'POST' }).catch(() => {});
    setTimeout(() => setCopiedPrompt(false), 1500);
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
    <div className="studio-card rounded-2xl overflow-hidden flex flex-col">
      {/* Card Top Header */}
      <div className="px-3.5 py-2.5 bg-[#0E1118] border-b border-slate-800/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono font-black text-[11px] shrink-0">
            SHOT {String(index + 1).padStart(2, '0')}
          </span>
          <select
            value={shot.camera_angle || 'Medium Shot'}
            onChange={(e) => onUpdateShot(shot.id, { camera_angle: e.target.value })}
            className="bg-[#161B26] border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-amber-500 truncate cursor-pointer"
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
        </div>

        <div className="flex items-center gap-1 shrink-0 no-print">
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/70 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {shot.duration_seconds || 3}s
          </span>

          <button
            type="button"
            onClick={() => onRenderShotImage(shot.id, localPrompt)}
            disabled={isRendering}
            title="สั่ง AI (FLUX.1) วาดภาพช็อตนี้ใหม่"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRendering ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="อัปโหลดรูปภาพใส่ช็อตนี้เอง"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
            onClick={() => onDeleteShot(shot.id)}
            title="ลบช็อตนี้"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Frame */}
      <div
        className={`relative bg-[#090B0E] overflow-hidden group ${
          isVertical ? 'aspect-[9/16] max-h-[380px] mx-auto w-full' : 'aspect-video w-full'
        }`}
      >
        {shot.image_url && !isSvgPlaceholder ? (
          <img
            src={shot.image_url}
            alt={shot.title}
            onClick={() => onOpenLightbox(shot)}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#111520] to-[#0B0D12]">
            <Camera className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-300 mb-1 line-clamp-1">{localTitle}</p>
            <p className="text-[11px] text-slate-500 max-w-xs line-clamp-2 mb-3">
              {localAction || localPrompt}
            </p>
            {!isRendering && (
              <button
                type="button"
                onClick={() => onRenderShotImage(shot.id, localPrompt)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>กดวาดภาพจริง AI (FLUX.1)</span>
              </button>
            )}
          </div>
        )}

        {/* Rendering Overlay */}
        {isRendering && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2.5">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <span className="text-xs font-bold text-white">กำลังวาดภาพจริงด้วย FLUX.1 AI...</span>
            <span className="text-[11px] text-amber-300/80 mt-0.5">ใช้เวลาประมาณ 4-6 วินาที</span>
          </div>
        )}

        {/* Hover Quick Action Bar on Real Image */}
        {!isRendering && !isSvgPlaceholder && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
            <button
              type="button"
              onClick={() => onRenderShotImage(shot.id, localPrompt)}
              className="px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-amber-500 text-white hover:text-slate-950 text-[11px] font-bold backdrop-blur-md border border-white/15 flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>วาดใหม่</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLightbox(shot)}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer"
              title="ดูภาพขยายเต็มจอ"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Body: Inline Editable Title, Action Description & Prompt */}
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Editable Title */}
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => handleSaveField('title', localTitle)}
            placeholder="ชื่อช็อต / ฉาก..."
            className="w-full bg-transparent text-sm font-bold text-white focus:outline-none focus:bg-[#0B0D11] focus:px-2 focus:py-1 focus:rounded-lg border border-transparent focus:border-amber-500/50 transition-all"
          />

          {/* Editable Thai Action Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              รายละเอียดการแสดง / แอคชั่นในฉาก
            </label>
            <textarea
              rows={2}
              value={localAction}
              onChange={(e) => setLocalAction(e.target.value)}
              onBlur={() => handleSaveField('action_description', localAction)}
              placeholder="อธิบายสิ่งที่เกิดขึ้นในช็อตนี้..."
              className="w-full p-2 rounded-xl bg-[#0B0D11]/90 border border-slate-800/90 focus:border-amber-500/60 focus:outline-none text-xs text-slate-200 leading-relaxed resize-none"
            />
          </div>

          {/* Optional Dialogue / Audio */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={localDialogue}
              onChange={(e) => setLocalDialogue(e.target.value)}
              onBlur={() => handleSaveField('dialogue_script', localDialogue)}
              placeholder="บทพูด / เสียงพากย์ / เสียง ASMR (ถ้ามี)..."
              className="w-full bg-transparent border-b border-slate-800 focus:border-amber-500/50 py-1 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Editable English Image Prompt Box */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="text-[10px] font-mono font-bold text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Film className="w-3 h-3" />
              <span>AI IMAGE PROMPT (แก้แล้วกดวาดใหม่ได้ทันที)</span>
            </button>

            <div className="flex items-center gap-1 no-print">
              <button
                type="button"
                onClick={() => onRenderShotImage(shot.id, localPrompt)}
                disabled={isRendering}
                className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-colors cursor-pointer"
              >
                วาดตาม Prompt นี้
              </button>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showPromptEditor && (
            <textarea
              rows={2}
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              onBlur={() => handleSaveField('content', localPrompt)}
              placeholder="English visual prompt for FLUX.1 / Midjourney..."
              className="w-full p-2 rounded-xl bg-[#080A0E] border border-slate-800/90 focus:border-amber-500/60 focus:outline-none text-[11px] font-mono text-slate-300 leading-relaxed resize-y"
            />
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
  const [columns, setColumns] = useState(3); // 2, 3, 4
  const [lightboxShot, setLightboxShot] = useState(null);

  const missingRealImagesCount = prompts.filter(
    (p) => !p.image_url || p.image_url.startsWith('data:image/svg+xml')
  ).length;

  const gridClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Sub-header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11151E] p-3.5 rounded-2xl border border-slate-800/80 no-print">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>{currentSeries ? currentSeries.title : 'สตอรี่บอร์ดปัจจุบัน'}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {prompts.length} ช็อต
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            คลิกที่ข้อความใต้ภาพเพื่อแก้ไขชื่อช็อต บทแอคชั่น หรือ Prompt ภาษาอังกฤษ แล้วกดวาดภาพใหม่ได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {missingRealImagesCount > 0 && (
            <button
              type="button"
              onClick={() => onBatchRenderAll(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/15 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>วาดภาพจริงให้ครบ ({missingRealImagesCount} ช็อตที่ยังไม่มีภาพ)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSwitchToBulkEditor}
            className="px-3 py-2 rounded-xl bg-[#181E2C] hover:bg-[#222A3D] border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5 text-amber-400" />
            <span>แก้ไข Prompt ทั้งหมดในหน้าเดียว</span>
          </button>

          <button
            type="button"
            onClick={onAddShot}
            className="px-3 py-2 rounded-xl bg-[#181E2C] hover:bg-[#222A3D] border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มช็อต</span>
          </button>

          {/* Column Zoom Switcher */}
          <div className="hidden lg:flex items-center bg-[#0B0D11] p-1 rounded-xl border border-slate-800">
            {[2, 3, 4].map((col) => (
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
        </div>
      </div>

      {/* Storyboard Cards Grid */}
      {prompts.length === 0 ? (
        <div className="py-20 text-center bg-[#11151E]/60 rounded-2xl border border-dashed border-slate-800 p-8">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">ยังไม่มีช็อตในกระดานสตอรี่บอร์ด</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            เลือกตัวอย่างบรีฟ หรือวางบทสคริปต์ในแผงผู้กำกับด้านซ้าย แล้วกดปุ่มสีส้มเพื่อสร้างสตอรี่บอร์ดพร้อมวาดภาพ AI จริงทันทีครับ
          </p>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-5`}>
          {prompts.map((shot, idx) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              index={idx}
              isRendering={!!renderingIds[shot.id]}
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
            className="max-w-5xl w-full bg-[#121620] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-xs">
                  SHOT {lightboxShot.step_number}
                </span>
                <h3 className="text-sm font-bold text-white">{lightboxShot.title}</h3>
                <span className="text-xs text-slate-400">({lightboxShot.camera_angle})</span>
              </div>
              <button
                onClick={() => setLightboxShot(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[72vh] overflow-hidden">
              <img
                src={lightboxShot.image_url}
                alt={lightboxShot.title}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-[#0E1118] space-y-1.5">
              <p className="text-xs text-slate-200">{lightboxShot.action_description}</p>
              <p className="text-[11px] font-mono text-amber-300/90">{lightboxShot.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
