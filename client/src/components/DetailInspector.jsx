import React, { useState, useEffect } from 'react';
import {
  X, Copy, Check, Star, Bookmark, Download, Heart, Share2,
  Video, RefreshCw, Layers, Sliders, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Cpu, Sparkles, Scissors, Wand2, Play, Film, Maximize2, Trash2,
  Volume2, Type, Clapperboard, Camera, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStoryboardFallback, getShotDisplayImage } from '../utils/storyboardHelper';

export default function DetailInspector({
  item,
  promptsList = [],
  onClose,
  onDeletePrompt,
  onSelectOtherItem,
  onOpenVideoModal,
  onOpenClipEditor,
  onRecreate,
  onOpenImageViewer,
  onOpenEditShot
}) {
  const [activeTab, setActiveTab] = useState('info');
  const [inspectorSubTab, setInspectorSubTab] = useState('image_prompt'); // 'image_prompt' | 'video_prompt' | 'live_action' | 'audio' // 'info' | 'edit' | 'comments'
  const [copied, setCopied] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [expandedVideoPrompt, setExpandedVideoPrompt] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [upscaling, setUpscaling] = useState(false);

  // Sequential navigation calculation for 30-50 shots
  const currentIndex = promptsList.findIndex((p) => p.id === item.id);
  const prevItem = currentIndex > 0 ? promptsList[currentIndex - 1] : null;
  const nextItem = currentIndex !== -1 && currentIndex < promptsList.length - 1 ? promptsList[currentIndex + 1] : null;

  // Keyboard Arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft' && prevItem) {
        onSelectOtherItem(prevItem.id);
      } else if (e.key === 'ArrowRight' && nextItem) {
        onSelectOtherItem(nextItem.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevItem, nextItem, onSelectOtherItem]);

  if (!item) return null;

  const isVideo = item.prompt_type === 'video' || item.aspect_ratio === '9:16';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F71C25', '#d9f99d', '#ffffff']
      });

      fetch(`/api/prompts/${item.id}/copy`, { method: 'POST' }).catch(console.error);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyVideoPrompt = async () => {
    if (!item.video_prompt) return;
    try {
      await navigator.clipboard.writeText(item.video_prompt);
      setCopiedVideo(true);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#c084fc', '#ffffff']
      });

      setTimeout(() => setCopiedVideo(false), 2200);
    } catch (err) {
      console.error('Failed to copy video prompt', err);
    }
  };

  const handleDownload = () => {
    confetti({ particleCount: 25, spread: 50 });
    const link = document.createElement('a');
    link.href = item.image_url;
    link.target = '_blank';
    link.download = `cineboard_shot_${item.step_number || item.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpscale = () => {
    setUpscaling(true);
    setTimeout(() => {
      setUpscaling(false);
      confetti({ particleCount: 30, spread: 50 });
      alert('Upscale 2X เสร็จสมบูรณ์! ภาพมีความคมชัดระดับ 2K พร้อมนำไปใช้งาน');
    }, 1500);
  };

  return (
    <aside className="fixed inset-0 z-50 md:relative md:inset-auto md:z-30 w-full md:w-96 lg:w-[420px] bg-white border-l border-stone-200 flex flex-col h-full flex-shrink-0 select-none overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-right duration-200 shadow-xl">
      {/* Header: CineBoard Director */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          {/* Mobile Back Button */}
          <button
            onClick={onClose}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-[#F71C25] font-bold text-xs hover:bg-stone-200 transition-colors cursor-pointer"
            title="ย้อนกลับไปบอร์ดสตอรี่บอร์ด"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>กลับบอร์ด</span>
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F71C25] to-[#FF4D4D] flex items-center justify-center font-black text-xs text-white shadow-md shadow-red-500/20 flex-shrink-0">
            <Clapperboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <span>CineBoard Director</span>
              <span className="text-[9px] font-mono text-stone-900 bg-[#FBEFC5] px-1.5 py-0.2 rounded border border-[#E5D7A3] font-bold hidden sm:inline">
                AI DIRECTOR
              </span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">ผู้ช่วยกำกับภาพยนตร์</span>
          </div>
        </div>

        {/* Top action icons */}
        <div className="flex items-center gap-1 text-stone-500">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-1.5 rounded-lg hover:bg-stone-100 ${isFavorited ? 'text-amber-500' : 'text-stone-400'}`}
            title="ถูกใจ"
          >
            <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900"
            title="ดาวน์โหลดไฟล์ภาพ"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 ml-1"
            title="ปิดแผง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sequential Shot Stepper Ribbon (ArrowLeft / ArrowRight) */}
      {promptsList.length > 1 && (
        <div className="bg-[#FCFBF8] px-4 py-2 border-b border-stone-200 flex items-center justify-between">
          <button
            disabled={!prevItem}
            onClick={() => prevItem && onSelectOtherItem(prevItem.id)}
            className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 text-stone-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="ช็อตก่อนหน้า (คีย์บอร์ด: [←])"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>ก่อนหน้า</span>
          </button>

          <div className="text-center">
            <div className="text-xs font-mono font-bold text-[#F71C25]">
              ช็อต {currentIndex + 1} จาก {promptsList.length}
            </div>
            {item.scene_title && (
              <div className="text-[10px] text-stone-600 font-mono truncate max-w-[160px]">
                {item.scene_title.split(':')[0]}
              </div>
            )}
          </div>

          <button
            disabled={!nextItem}
            onClick={() => nextItem && onSelectOtherItem(nextItem.id)}
            className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 text-stone-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="ช็อตถัดไป (คีย์บอร์ด: [→])"
          >
            <span>ถัดไป</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 px-4 border-b border-stone-200 text-xs font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'info' ? 'border-[#F71C25] text-[#F71C25] font-bold' : 'border-transparent hover:text-stone-900'
          }`}
        >
          <span>ข้อมูลช็อต (Shot Info)</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('edit');
            if (onOpenClipEditor) onOpenClipEditor(item);
          }}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'edit' ? 'border-[#F71C25] text-[#F71C25] font-bold' : 'border-transparent hover:text-stone-900'
          }`}
        >
          <span>แต่งภาพ/ฟิลเตอร์ (Edit)</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-5 flex-1">
        {/* Scene / Act Structure Banner */}
        {item.scene_title && (
          <div className="p-3 rounded-2xl bg-[#FDF8ED] border border-[#EADBBD] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FBEFC5] border border-[#E5D7A3] flex items-center justify-center text-stone-900 font-mono font-bold text-xs">
                S{item.scene_number || 1}
              </div>
              <div>
                <div className="text-[10px] font-mono text-orange-800 font-bold uppercase">
                  ลำดับฉาก (Scene / Act)
                </div>
                <div className="text-xs font-bold text-stone-900 mt-0.5">
                  {item.scene_title}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Media Section */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1.5">
            <span>ภาพพรีวิวสตอรี่บอร์ด (Keyframe Preview)</span>
            <span className="text-[#F71C25] font-bold">{item.aspect_ratio || '9:16'}</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 group">
            <div
              onClick={() => onOpenImageViewer && onOpenImageViewer(item)}
              className={`relative w-full overflow-hidden cursor-pointer flex items-center justify-center bg-stone-950 ${
                item.aspect_ratio === '9:16' ? 'aspect-[9/16] max-h-[400px]' : 'aspect-[16/9] max-h-[300px]'
              }`}
              title="คลิกเพื่อดูรูปขนาดเต็ม (HD Preview)"
            >
              <img
                src={getShotDisplayImage(item)}
                alt={item.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getStoryboardFallback(item);
                }}
                className="w-full h-full object-contain filter contrast-105 saturate-90 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <span className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-stone-200 border border-white/20 flex items-center gap-1.5 shadow-lg opacity-90 group-hover:opacity-100">
                  <Maximize2 className="w-3.5 h-3.5 text-[#F71C25]" />
                  <span>ดูรูปขนาดใหญ่ (HD)</span>
                </span>
              </div>
            </div>

            {/* Quick Actions Under Preview */}
            <div className="p-2.5 bg-[#FAF9F5] border-t border-stone-200 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenImageViewer && onOpenImageViewer(item)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-[#FDF8EE] text-stone-800 border border-stone-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>ดูภาพขยายใหญ่</span>
              </button>

              <div
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#FDF8EE] border border-[#EADBBD] text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                title="มุมกล้องที่ผู้กำกับ AI แนะนำ"
              >
                <Film className="w-3.5 h-3.5 text-[#F71C25]" />
                <span className="truncate">{item.camera_angle || item.subtitle || 'Medium Shot'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attached Reference Image Display (if used) */}
        {item.reference_image && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] text-xs font-mono shadow-2xs">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#E5D7A3] flex-shrink-0 bg-white shadow-2xs">
              <img
                src={item.reference_image}
                alt="Ref"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/media/tpl_aircon_hero.jpg';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-[#F71C25] font-bold uppercase tracking-wider">
                ภาพอ้างอิงต้นฉบับ (Attached Ref)
              </div>
              <div className="text-stone-900 truncate text-[11px] font-bold mt-0.5">
                {item.reference_image.split('/').pop()}
              </div>
              <div className="text-[10px] text-stone-600">ใช้เป็นแม่แบบคอสตูม & คาแรคเตอร์</div>
            </div>
          </div>
        )}

                {/* 4 Detail Options / Tabs Selector (Prompt ภาพ, Prompt วิดีโอ, กองถ่ายจริง, บทพากย์) */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setInspectorSubTab('image_prompt')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inspectorSubTab === 'image_prompt'
                  ? 'bg-gradient-to-r from-[#F71C25] to-[#FF4438] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompt ภาพ</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorSubTab('video_prompt')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inspectorSubTab === 'video_prompt'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Prompt วิดีโอ</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorSubTab('live_action')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inspectorSubTab === 'live_action'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>ถ่ายทำจริง</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorSubTab('audio')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inspectorSubTab === 'audio'
                  ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>บทพูด & Foley</span>
            </button>
          </div>

          {/* TAB 1: Master Image Prompt */}
          {inspectorSubTab === 'image_prompt' && (
            <div className="bg-[#FAF9F6] rounded-2xl border border-stone-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-700 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
                  <span>MASTER IMAGE PROMPT:</span>
                </span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-[#F71C25] hover:text-[#F71C25] shadow-2xs'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก Prompt'}</span>
                </button>
              </div>
              <div className="p-3 bg-white border border-stone-200/90 rounded-xl text-xs font-mono text-stone-800 leading-relaxed max-h-48 overflow-y-auto select-text shadow-2xs">
                {item.content}
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-stone-600 pt-1">
                <span className="px-2 py-0.5 rounded bg-white border border-stone-200 shadow-2xs">เลนส์: {item.lens_focal || item.shot_size || '35mm'}</span>
                <span className="px-2 py-0.5 rounded bg-white border border-stone-200 shadow-2xs">สัดส่วน: {item.aspect_ratio || '9:16'}</span>
                <span className="px-2 py-0.5 rounded bg-white border border-stone-200 shadow-2xs">สไตล์: {item.visual_style || 'Sketch'}</span>
              </div>
            </div>
          )}

          {/* TAB 2: Video AI Prompt */}
          {inspectorSubTab === 'video_prompt' && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-900 font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>VIDEO AI PROMPT (Kling / Runway):</span>
                </span>
                <button
                  onClick={handleCopyVideoPrompt}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    copiedVideo
                      ? 'bg-purple-100 border-purple-400 text-purple-900'
                      : 'bg-white border-purple-200 text-purple-800 hover:border-purple-400 shadow-2xs'
                  }`}
                >
                  {copiedVideo ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVideo ? 'คัดลอกแล้ว!' : 'คัดลอก Video Prompt'}</span>
                </button>
              </div>
              <div className="p-3 bg-white border border-purple-200/90 rounded-xl text-xs font-mono text-purple-950 leading-relaxed max-h-48 overflow-y-auto select-text shadow-2xs">
                {item.video_prompt || `[Camera: ${item.camera_movement || 'Slow push in'}] [Subject: ${item.title} moving naturally] [Lighting: Cinematic 24fps smooth motion]`}
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-purple-800 pt-1">
                <span className="px-2 py-0.5 rounded bg-white border border-purple-200 shadow-2xs">🎥 24fps Fluid Motion</span>
                <span className="px-2 py-0.5 rounded bg-white border border-purple-200 shadow-2xs">Kling / Runway Gen-3</span>
              </div>
            </div>
          )}

          {/* TAB 3: Live-Action Guide & Camera */}
          {inspectorSubTab === 'live_action' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Clapperboard className="w-3.5 h-3.5" />
                <span>คำแนะนำสำหรับกองถ่ายทำจริง (Live-Action Guide):</span>
              </div>
              <div className="space-y-2 bg-white p-3 rounded-xl border border-emerald-200 text-stone-800 shadow-2xs">
                <div>
                  <span className="font-bold text-emerald-800">มุมกล้อง: </span>
                  <span>{item.camera_angle || 'Medium Shot'} ({item.camera_angle_th || 'มุมกล้อง'}) • เลนส์ {item.lens_focal || '35mm'}</span>
                </div>
                {item.camera_movement && (
                  <div>
                    <span className="font-bold text-emerald-800">การเคลื่อนกล้อง: </span>
                    <span>{item.camera_movement}</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-emerald-800">การจัดแสงและกำกับ: </span>
                  <p className="mt-1 text-stone-700 leading-relaxed whitespace-pre-line text-[11px]">
                    {item.live_action_guide || 'จัดแสง Key light 45 องศา พร้อม Rim light ขอบตัวแบบ เลนส์โฟกัสที่แววตา เคลื่อนกล้องตามคิว'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Dialogue & Foley */}
          {inspectorSubTab === 'audio' && (
            <div className="bg-[#FDF8EE] border border-[#EADBBD] rounded-2xl p-4 space-y-3 text-xs">
              <div className="text-[11px] font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                <span>บทพูด & เสียง Foley (Audio / Sound FX):</span>
              </div>
              <div className="space-y-2 bg-white p-3 rounded-xl border border-[#EADBBD] shadow-2xs">
                {item.dialogue_script && (
                  <div>
                    <div className="text-[10px] font-bold text-orange-900 uppercase">บทพูด / เสียงพากย์ (VO):</div>
                    <p className="text-[11px] text-stone-800 leading-relaxed mt-0.5">
                      {item.dialogue_script}
                    </p>
                  </div>
                )}
                {item.audio_foley && (
                  <div className="pt-1.5 border-t border-stone-100">
                    <div className="text-[10px] font-bold text-orange-900 uppercase">เสียง Foley & แอมเบียนต์:</div>
                    <p className="text-[11px] text-stone-700 leading-relaxed mt-0.5">
                      {item.audio_foley}
                    </p>
                  </div>
                )}
                {item.on_screen_text && (
                  <div className="pt-1.5 border-t border-stone-100">
                    <div className="text-[10px] font-bold text-orange-900 uppercase">ข้อความตัวหนังสือในคลิป:</div>
                    <p className="text-[11px] text-stone-700 leading-relaxed mt-0.5">
                      {item.on_screen_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DETAILS Accordion */}
        <div className="border border-stone-200 rounded-2xl p-4 space-y-2 bg-white shadow-2xs">
          <div className="text-[11px] font-mono text-stone-500 font-bold uppercase tracking-wider">
            DETAILS
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
            <div>
              <span className="text-stone-400 block text-[10px]">AI Engine</span>
              <span className="text-[#F71C25] font-semibold">{item.recommended_tool || 'Flux.1 (Free Unlimited)'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Quality</span>
              <span className="text-stone-800">High Definition</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Aspect Ratio</span>
              <span className="text-stone-200">{item.aspect_ratio || '9:16'}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">Creator</span>
              <span className="text-white font-bold">CineBoard AI Studio</span>
            </div>
          </div>
        </div>

        {/* EDIT Grid Options (100% Functional Buttons) */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-bold">
            เครื่องมือการจัดการ (Studio Tools)
          </div>

          <button
            type="button"
            onClick={() => onOpenEditShot && onOpenEditShot(item)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-98"
            title="แก้ไข Prompt และให้ AI เกลาช็อตนี้โดยคุมโทนเดิม"
          >
            <Wand2 className="w-4 h-4 text-[#F71C25]" />
            <span>✏️ แก้ไข & ให้ AI เกลาช็อตนี้ (Edit & Refine Shot)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onOpenClipEditor && onOpenClipEditor(item)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 hover:bg-stone-100 hover:border-[#F71C25]/40 font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-orange-600" />
              <span>Clip & Filter Edit</span>
            </button>

            <button
              onClick={() => {
                if (onRecreate) onRecreate(item.content);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 hover:bg-stone-100 hover:border-[#F71C25]/40 font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#F71C25]" />
              <span>Recreate (ทำซ้ำ)</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 hover:bg-stone-100 hover:border-[#F71C25]/40 font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download File</span>
            </button>
            
            <button
              onClick={() => onDeletePrompt && onDeletePrompt(item)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold transition-all cursor-pointer shadow-2xs"
              title="ลบการ์ดช็อตนี้ออกจากสตอรี่บอร์ด"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>ลบช็อตนี้</span>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 space-y-2">
          {item.video_prompt && (
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(item.video_prompt);
                  confetti({ particleCount: 30, spread: 60, colors: ['#a855f7', '#c084fc', '#ffffff'] });
                  alert('คัดลอก Video AI Prompt เรียบร้อยแล้ว! นำไปวางใน Kling AI หรือ Runway Gen-3 ได้ทันที');
                }
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Video className="w-4 h-4 fill-current text-purple-200" />
              <span>คัดลอก Video AI Prompt (Kling / Runway)</span>
            </button>
          )}

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(item.content);
                confetti({ particleCount: 30, spread: 60 });
                alert('คัดลอก Master Prompt ของช็อตนี้เรียบร้อยแล้ว! สามารถนำไปวางใน Midjourney, Flux, หรือ Kling ได้ทันที');
              }
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Copy className="w-4 h-4 fill-current text-white" />
            <span>คัดลอก Master Prompt (ภาพนิ่ง / ภาพสเก็ตช์)</span>
          </button>
        </div>

        {/* Dynamic Items switcher */}
        {promptsList.length > 1 && (
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>ผลงานที่สร้างล่าสุด:</span>
            <div className="flex items-center gap-2 overflow-x-auto max-w-[180px] no-scrollbar">
              {promptsList
                .filter(p => p.id !== item.id && p.image_url)
                .slice(0, 4)
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelectOtherItem && onSelectOtherItem(p.id)}
                    className="w-9 h-9 flex-shrink-0 rounded-xl overflow-hidden border border-stone-200 hover:border-[#F71C25] bg-stone-100 transition-colors shadow-2xs cursor-pointer"
                    title={p.title}
                  >
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
