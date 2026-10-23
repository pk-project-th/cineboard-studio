import React, { useState } from 'react';
import {
  Copy, Video, Film, Check, Sparkles, Layers, Maximize2, Trash2, Clock,
  Loader2, Edit3, Plus, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getShotDisplayImage } from '../utils/storyboardHelper';

export default function BoardView({
  prompts = [],
  selectedItem,
  onSelectItem,
  onDeletePrompt,
  zoomLevel = 2,
  filterType = 'all',
  onStartNewProject,
  onOpenImageViewer,
  onGenerateImageForShot,
  onEditPrompt
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedScene, setSelectedScene] = useState('all');
  const [generatingShotId, setGeneratingShotId] = useState(null);

  const handleQuickCopy = (e, p) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p.content || p.prompt || p.title);
    setCopiedId(p.id);

    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#F71C25', '#FF4D4D', '#FBEFC5']
    });

    fetch(`/api/prompts/${p.id}/copy`, { method: 'POST' }).catch(console.error);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyVideoPrompt = (e, p) => {
    e.stopPropagation();
    const vp = p.video_prompt || `Cinematic camera motion capturing ${p.title}`;
    navigator.clipboard.writeText(vp);
    setCopiedId(`v-${p.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateShot = async (e, p) => {
    e.stopPropagation();
    if (!onGenerateImageForShot) return;
    setGeneratingShotId(p.id);
    try {
      await onGenerateImageForShot(p);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#F71C25', '#bef264', '#ffffff']
      });
    } catch (err) {
      alert('สร้างภาพไม่สำเร็จ: ' + err.message);
    } finally {
      setGeneratingShotId(null);
    }
  };

  // Distinct scenes detection
  const scenes = Array.from(new Set(prompts.map((p) => p.scene_number || 1))).sort((a, b) => a - b);
  const hasMultipleScenes = scenes.length > 1;

  // Filter prompts by scene
  const filteredPrompts = prompts.filter((p) => {
    if (selectedScene !== 'all' && (p.scene_number || 1) !== selectedScene) return false;
    return true;
  });

  const getGridTemplateColumns = () => {
    if (zoomLevel === 1) return 'repeat(auto-fill, minmax(180px, 1fr))'; // Contact sheet
    if (zoomLevel === 3) return 'repeat(auto-fill, minmax(380px, 1fr))'; // Large cinematic
    return 'repeat(auto-fill, minmax(260px, 1fr))'; // Standard
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center select-none min-h-[50vh] bg-white rounded-3xl border border-stone-200 shadow-sm mx-auto max-w-xl my-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] flex items-center justify-center text-[#F71C25] shadow-xs">
          <Film className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-stone-900 tracking-tight">กระดานสตอรี่บอร์ดยังไม่มีช็อต</h3>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
            เริ่มต้นวางเรื่องราวด้วยระบบ AI Director ในขั้นตอนที่ 1 หรือวางสคริปต์ฉากเพื่อแตกเป็นช็อตทันที
          </p>
        </div>
        <button
          onClick={onStartNewProject}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm shadow-red-500/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>＋ สร้างสตอรี่บอร์ดโปรเจกต์ใหม่</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 pb-24 md:pb-8 select-none space-y-4">
      {/* Timeline Bar & Scene Pills */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDF8EE] border border-[#EADBBD] text-stone-900 font-mono text-xs font-bold">
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
                ทั้งหมด
              </button>
              {scenes.map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScene(sc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedScene === sc
                      ? 'bg-[#F71C25] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  ซีน {sc}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono text-stone-500">
          คลิกที่การ์ดเพื่อดูรายละเอียด หรือกด "⚡ เจนภาพ AI" บนรูปภาพ
        </div>
      </div>

      {/* Storyboard Grid */}
      <div
        className="grid gap-4 sm:gap-5"
        style={{ gridTemplateColumns: getGridTemplateColumns() }}
      >
        {filteredPrompts.map((p, idx) => {
          const displayImg = getShotDisplayImage(p);
          const isSelected = selectedItem?.id === p.id;
          const isGeneratingThis = generatingShotId === p.id;
          const isRealAiImg = displayImg && !displayImg.startsWith('data:image/svg');

          return (
            <div
              key={p.id || idx}
              id={`shot-card-${p.id}`}
              onClick={() => onSelectItem && onSelectItem(p)}
              className={`group flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-[#F71C25] ring-2 ring-[#F71C25]/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {/* Image Frame (Cinematic 16:9 or 9:16) */}
              <div className="relative aspect-video bg-stone-900 overflow-hidden">
                <img
                  src={displayImg}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* Loading Overlay */}
                {isGeneratingThis && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-1.5 text-white text-xs font-mono">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F71C25]" />
                    <span>กำลังสร้างภาพ AI...</span>
                  </div>
                )}

                {/* Top Badge: Shot Number */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-xs text-[11px] font-mono font-bold text-white shadow-xs">
                    #{p.step_number || idx + 1}
                  </span>
                  {p.duration_seconds && (
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-stone-300">
                      {p.duration_seconds}s
                    </span>
                  )}
                </div>

                {/* Top Right: AI Gen Button & Zoom */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    onClick={(e) => handleGenerateShot(e, p)}
                    disabled={isGeneratingThis}
                    className="px-2.5 py-1 rounded-lg bg-[#FBEFC5]/95 hover:bg-[#F5E6B8] text-stone-950 font-bold text-[11px] font-mono flex items-center gap-1 shadow-sm backdrop-blur-xs cursor-pointer active:scale-95 transition-all"
                    title="สั่งสร้างภาพ AI คุณภาพสูงสำหรับช็อตนี้"
                  >
                    {isGeneratingThis ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#F71C25]" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-[#F71C25]" />
                    )}
                    <span>{isRealAiImg ? 'สร้างใหม่' : '⚡ เจนภาพ AI'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenImageViewer && onOpenImageViewer(p);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                    title="ขยายดูภาพขนาดใหญ่"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom Overlay Ribbon: Copy Buttons */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopyVideoPrompt(e, p)}
                    className="px-2 py-1 rounded-md bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-[10px] font-mono font-bold backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
                    title="คัดลอก Video Prompt สำหรับ Kling/Runway/Luma"
                  >
                    {copiedId === `v-${p.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Video className="w-3 h-3" />}
                    <span>Video</span>
                  </button>

                  <button
                    onClick={(e) => handleQuickCopy(e, p)}
                    className="px-2 py-1 rounded-md bg-black/80 hover:bg-stone-800 text-white text-[10px] font-mono font-bold backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
                    title="คัดลอก Image Prompt"
                  >
                    {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Prompt</span>
                  </button>
                </div>
              </div>

              {/* Shot Details Box */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between bg-white">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#F71C25] font-bold truncate">
                      {p.camera_angle || 'Medium Shot'}
                    </span>
                    <span className="text-stone-400">
                      {p.shot_size || '35mm'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-[#F71C25] transition-colors">
                    {p.title}
                  </h4>

                  {p.action_description && (
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed font-sans">
                      {p.action_description}
                    </p>
                  )}
                </div>

                {/* Bottom Meta Bar */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span className="truncate max-w-[160px] text-stone-500">
                    🎥 {p.camera_movement || 'Static Lock-off'}
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
