import React, { useState } from 'react';
import { Play, Copy, Video, Film, ChevronRight, Hash, Check, Sparkles, Layers, Maximize2, Trash2, ShieldAlert, Clock } from 'lucide-react';
import { getStoryboardFallback, getShotDisplayImage } from '../utils/storyboardHelper';

export default function BoardView({
  prompts,
  selectedItem,
  onSelectItem,
  onDeletePrompt,
  zoomLevel,
  filterType,
  onOpenGroqModal,
  onExploreTab,
  onOpenImageViewer,
  onOpenVideoStudio
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedScene, setSelectedScene] = useState('all');

  const handleQuickCopy = (e, p) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p.content);
    setCopiedId(p.id);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#F71C25', '#bef264', '#ffffff']
    });

    fetch(`/api/prompts/${p.id}/copy`, { method: 'POST' }).catch(console.error);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Distinct scenes detection for multi-scene storyboards (30-50 shots)
  const scenes = Array.from(new Set(prompts.map((p) => p.scene_number || 1))).sort((a, b) => a - b);
  const hasMultipleScenes = scenes.length > 1;

  // Filter prompts by scene and type
  const filteredPrompts = prompts.filter((p) => {
    if (selectedScene !== 'all' && (p.scene_number || 1) !== selectedScene) return false;
    if (filterType === 'all') return true;
    if (filterType === 'image') return p.prompt_type === 'character' || p.prompt_type === 'first_frame';
    if (filterType === 'video') return p.prompt_type === 'video';
    if (filterType === 'audio') return p.prompt_type === 'audio';
    if (filterType === 'global') return p.prompt_type === 'style' || p.prompt_type === 'negative';
    return true;
  });

  const getGridTemplateColumns = () => {
    if (zoomLevel === 1) return 'repeat(auto-fill, minmax(120px, 1fr))'; // Contact sheet
    if (zoomLevel === 3) return 'repeat(auto-fill, minmax(300px, 1fr))'; // Detailed HD view
    return 'repeat(auto-fill, minmax(160px, 1fr))'; // Responsive Grid (2 columns on mobile, 3-5 on desktop)
  };

  const handleJumpToShot = (p) => {
    onSelectItem(p);
    const el = document.getElementById('shot-card-' + p.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (filteredPrompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center select-none min-h-[42vh] bg-white rounded-3xl border border-stone-200 shadow-sm mx-auto max-w-2xl my-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] flex items-center justify-center text-[#F71C25] mb-4 shadow-2xs">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">กระดานสตอรี่บอร์ดยังว่างเปล่า</h3>
        <p className="text-xs text-stone-600 font-mono mt-1.5 max-w-md leading-relaxed">
          เริ่มต้นวางโครงเรื่องใหม่ด้วยระบบคิดช็อตอัจฉริยะ หรือเลือกแรงบันดาลใจจากคลังภาพยนตร์
        </p>
        <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
          <button
            onClick={onOpenGroqModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm shadow-red-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>สร้างสตอรี่บอร์ดด้วย AI</span>
          </button>
          <button
            onClick={onExploreTab}
            className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#FBEFC5] active:scale-[0.98] border border-stone-200 hover:border-[#E5D7A3] text-stone-800 hover:text-stone-900 font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            คลังไอเดียภาพยนตร์ 8 สไตล์
          </button>
        </div>
      </div>
    );
  }

  // To prevent single cards from becoming overly wide on large screens:
  const isFewItems = filteredPrompts.length <= 2;

  const isContactSheet = zoomLevel === 1;

  return (
    <div className="p-2.5 sm:p-6 pb-28 md:pb-6 select-none space-y-3 sm:space-y-4">
      {/* Sticky Timeline & Quick Jump Ribbon (Ideal for 30-50 Shots Production) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left: Total Shots & Scene Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FDF8EE] border border-[#EADBBD] text-stone-900 font-mono text-xs font-bold shadow-2xs">
              <Film className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>{prompts.length} ช็อต {hasMultipleScenes ? `(${scenes.length} ซีน)` : ''}</span>
            </div>

            {hasMultipleScenes && (
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setSelectedScene('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedScene === 'all'
                      ? 'bg-[#F71C25] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  ทุกซีน ({prompts.length})
                </button>
                {scenes.map((sNum) => {
                  const sceneShotCount = prompts.filter((p) => (p.scene_number || 1) === sNum).length;
                  return (
                    <button
                      key={sNum}
                      onClick={() => setSelectedScene(sNum)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedScene === sNum
                          ? 'bg-[#FBEFC5] text-stone-900 font-bold border border-[#E5D7A3] shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      ซีน {sNum} ({sceneShotCount})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Active Shot Indicator */}
          {selectedItem && (
            <div className="text-[11px] font-mono text-stone-600 flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
              <span className="text-[#F71C25] font-bold">กำลังตรวจ:</span>
              <span className="text-stone-900 font-bold truncate max-w-[180px]">
                {selectedItem.step_title ? selectedItem.step_title.split('—')[0].trim() : `SHOT ${selectedItem.step_number}`}
              </span>
            </div>
          )}
        </div>

        {/* Numbered Quick Jump Strip (1 to N) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-0.5">
          <span className="text-[10px] font-mono text-stone-400 font-bold uppercase mr-1 flex-shrink-0">
            JUMP:
          </span>
          {filteredPrompts.map((p, idx) => {
            const isCurrent = selectedItem && selectedItem.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleJumpToShot(p)}
                className={`w-7 h-7 flex-shrink-0 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-[#F71C25] to-[#FF4438] text-white scale-110 shadow-md shadow-red-500/30'
                    : 'bg-white text-stone-700 hover:text-[#F71C25] border border-stone-200 hover:border-[#F71C25] shadow-2xs'
                }`}
                title={`ช็อตที่ ${idx + 1}: ${p.title} (${p.camera_angle || 'Shot'})`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div 
        className="grid gap-4 sm:gap-5 transition-all duration-300" 
        style={{ gridTemplateColumns: getGridTemplateColumns() }}
      >
        {filteredPrompts.map((p) => {
          const isSelected = selectedItem && selectedItem.id === p.id;
          const isVideo = p.prompt_type === 'video' || p.aspect_ratio === '9:16';
          const isCharacterSheet = p.prompt_type === 'character';

          return (
            <div
              id={'shot-card-' + p.id}
              key={p.id}
              onClick={() => onSelectItem(p)}
              className={`group relative rounded-2xl overflow-hidden bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl ${isFewItems ? 'max-w-[340px]' : ''} ${
                isSelected
                  ? 'border-[#F71C25] ring-2 ring-[#F71C25]/20 shadow-xl shadow-red-500/10 scale-[1.02] z-10'
                  : 'border-stone-200/90 hover:border-[#F71C25]/50 hover:-translate-y-1'
              }`}
            >
              {/* Media Visual Container */}
              <div
                className={`relative w-full overflow-hidden bg-[#FCFBF8] flex items-center justify-center border-b border-stone-100 ${
                  isCharacterSheet ? 'aspect-[16/9] max-h-[300px]' : 'aspect-[9/16] max-h-[460px]'
                }`}
                title="คลิกเพื่อตรวจสอบการ์ด"
              >
                <img
                  src={getShotDisplayImage(p)}
                  alt={p.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getStoryboardFallback(p);
                  }}
                  className="w-full h-full object-cover object-center filter saturate-95 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Overlay Bar */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 flex-wrap max-w-[80%] pointer-events-auto">
                    <div className="flex items-center gap-1">
                      {p.scene_number && (
                        <div className="px-1.5 py-0.5 rounded-lg bg-stone-900/90 backdrop-blur-md text-[9px] font-mono font-bold text-white">
                          S{p.scene_number}
                        </div>
                      )}
                      <div className="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-[10px] font-mono font-black text-[#F71C25] border border-[#F71C25]/30 shadow-xs">
                        SHOT {filteredPrompts.indexOf(p) + 1}
                      </div>
                      {p.duration_seconds && (
                        <div className="px-2 py-0.5 rounded-lg bg-[#FDF8EE]/95 backdrop-blur-md text-[10px] font-mono font-bold text-stone-800 border border-[#EADBBD] flex items-center gap-1 shadow-2xs">
                          <span>⏱️ {Number(p.duration_seconds).toFixed(1)}s</span>
                        </div>
                      )}
                    </div>
                    {p.visual_style === 'sketch' && (
                      <div className="px-1.5 py-0.5 rounded-lg bg-stone-100/90 backdrop-blur-md text-[9px] font-mono font-bold text-stone-700 border border-stone-200 flex items-center gap-1">
                        <span>✏️ สเก็ตช์</span>
                      </div>
                    )}
                    {p.video_prompt && (
                      <div className="px-1.5 py-0.5 rounded-lg bg-indigo-50/95 backdrop-blur-md text-[9px] font-mono font-bold text-indigo-700 border border-indigo-200">
                        🎥 Video Ready
                      </div>
                    )}
                    {p.camera_angle && (
                      <div className="px-2 py-0.5 rounded-lg bg-[#FBEFC5]/95 backdrop-blur-md text-[9px] font-mono font-bold text-stone-900 border border-[#E5D7A3]">
                        {p.camera_angle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pointer-events-auto">
                    {p.aspect_ratio && p.aspect_ratio !== 'N/A' && (
                      <div className="px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-md text-[9px] font-mono text-stone-700 border border-stone-200 shadow-2xs">
                        {p.aspect_ratio}
                      </div>
                    )}
                    {/* Delete Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeletePrompt) onDeletePrompt(p);
                      }}
                      className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 transition-all shadow-md cursor-pointer"
                      title="ลบช็อตนี้ออกจากบอร์ด"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hover Action Bar at Bottom of Image */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(p);
                      if (onOpenImageViewer) onOpenImageViewer(p);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 border border-stone-200 text-[10px] font-mono font-bold flex items-center justify-center gap-1 backdrop-blur-md transition-all shadow-md"
                  >
                    <Maximize2 className="w-3 h-3 text-[#F71C25]" />
                    <span>ดูภาพเต็ม HD</span>
                  </button>

                  {p.video_prompt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(p.video_prompt);
                        alert(`คัดลอก Video Prompt (ช็อตที่ ${p.step_number || ''}) แล้ว! นำไปวางใน Kling หรือ Runway ได้ทันที`);
                      }}
                      className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 text-xs font-mono font-semibold transition-all shadow-md backdrop-blur-md"
                      title="คัดลอก Video AI Prompt (สำหรับ Kling / Runway)"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleQuickCopy(e, p)}
                    className={`p-1.5 rounded-xl backdrop-blur-md border text-xs font-mono font-semibold transition-all shadow-md ${
                      copiedId === p.id
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-white/90 hover:bg-gradient-to-tr hover:from-[#F71C25] hover:to-[#FF4438] text-stone-800 hover:text-white border-stone-200'
                    }`}
                    title="คัดลอก Master Prompt ของช็อตนี้"
                  >
                    {copiedId === p.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Storyboard Shot Meta Footer */}
              <div className="p-3 bg-[#FAF9F6] border-t border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-[#F71C25] transition-colors">
                    {p.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    {p.timecode && (
                      <span className="text-[#F71C25] font-bold">{p.timecode.split('(')[0].trim()}</span>
                    )}
                    <span className="text-stone-400">{p.shot_size || '35mm'}</span>
                  </div>
                </div>

                {/* Action Note / Dialogue preview */}
                {p.dialogue_script && (
                  <p className="text-[11px] text-stone-700 font-sans line-clamp-2 leading-relaxed bg-white p-2 rounded-xl border border-stone-200/80 shadow-2xs">
                    {p.dialogue_script.split('\n')[0].replace(/^[0-9]+\.\s*/, '')}
                  </p>
                )}

                {/* Camera Movement Note */}
                {p.camera_movement && (
                  <div className="text-[10px] text-stone-800 font-mono truncate flex items-center gap-1 bg-[#FDF8EE] px-2 py-0.5 rounded-lg border border-[#EADBBD]">
                    <span>🎥</span>
                    <span className="truncate">{p.camera_movement}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1">
                  <span className="text-stone-600 font-bold truncate max-w-[150px]">
                    {p.subtitle || p.camera_angle || 'CineBoard Director'}
                  </span>
                  <span>{p.copy_count || 0} copies</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
