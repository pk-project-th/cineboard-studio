import React, { useState } from 'react';
import {
  X, Download, Copy, Check, Film, Maximize2, Sparkles, ChevronRight,
  Video, Clapperboard, Volume2, Camera, Sliders, Type, Layers, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStoryboardFallback, getShotDisplayImage, getStoryboardSketch } from '../utils/storyboardHelper';

export default function ImageViewerModal({ isOpen, onClose, item, onOpenVideoStudio }) {
  const [activeDetailTab, setActiveDetailTab] = useState('image_prompt'); // 'image_prompt' | 'video_prompt' | 'live_action' | 'audio'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !item) return null;

  const fallbackSrc = getStoryboardFallback(item);
  const imgSrc = imageError ? fallbackSrc : getShotDisplayImage(item);

  const handleCopyPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.content || item.prompt || '');
      setCopiedPrompt(true);
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleCopyVideoPrompt = () => {
    const vPrompt = item.video_prompt || `[Camera: ${item.camera_movement || 'Slow push in'}] [Subject: ${item.title} moving naturally] [Lighting: Cinematic 24fps smooth motion]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vPrompt);
      setCopiedVideo(true);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 }, colors: ['#a855f7', '#c084fc', '#ffffff'] });
      setTimeout(() => setCopiedVideo(false), 2000);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imgSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cineboard_shot_${item.step_number || '1'}_${item.title ? item.title.replace(/\s+/g, '_') : 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      window.open(imgSrc, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/95 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#131316] border-0 sm:border border-stone-800 rounded-none sm:rounded-3xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black ring-0 sm:ring-1 sm:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          title="ปิด (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Full High-Res Image Viewport (Finished Image) */}
        <div className="md:w-3/5 bg-black flex items-center justify-center p-4 relative overflow-hidden border-b md:border-b-0 md:border-r border-stone-800/80 min-h-[360px] md:min-h-[560px]">
          <div className="relative max-h-[82vh] w-auto flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-stone-800/80 bg-stone-950">
            <img
              src={imgSrc}
              alt={item.title}
              onError={() => setImageError(true)}
              className="max-h-[80vh] w-auto max-w-full object-contain filter contrast-105 saturate-90"
            />

            {/* Retro 16mm grain texture overlay */}
            <div className="absolute inset-0 bg-amber-900/5 mix-blend-color pointer-events-none" />

            {/* Aspect Ratio & Step Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-[#F71C25] border border-[#F71C25]/30">
                {item.aspect_ratio || '9:16'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono text-stone-300 border border-white/10">
                {item.visual_style || 'CineBoard Director'}
              </span>
              {item.duration_seconds && (
                <span className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{Number(item.duration_seconds).toFixed(1)}s {item.timecode ? '(' + item.timecode.split('(')[0].trim() + ')' : ''}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Picture Details & Multi-Option Selectors */}
        <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] space-y-4">
          <div className="space-y-4">
            {/* Header Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-[#F71C25] uppercase tracking-wider">
                  CineBoard HD Director Preview
                </span>
                {item.scene_title && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                    {item.scene_title.split(':')[0]}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white leading-snug">
                {item.title}
              </h2>
              <p className="text-xs text-stone-400 font-mono mt-1">
                {item.camera_angle} ({item.camera_angle_th || 'มุมกล้องภาพยนตร์'}) • เลนส์: {item.lens_focal || '35mm'}
              </p>
            </div>

            {/* 4 Detail Options / Tabs Selector (Prompt ภาพ, Prompt วิดีโอ, กองถ่ายจริง, บทพากย์) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-900/90 rounded-2xl border border-stone-800 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setActiveDetailTab('image_prompt')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'image_prompt'
                    ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompt รูปภาพ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('video_prompt')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'video_prompt'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Prompt วิดีโอ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('live_action')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'live_action'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span>คู่มือกองถ่ายจริง</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab('audio')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === 'audio'
                    ? 'bg-[#FBEFC5] text-stone-900 font-bold border border-[#E5D7A3] shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>บทพูด & Foley</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Prompt รูปภาพ */}
            {activeDetailTab === 'image_prompt' && (
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/90 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    MASTER IMAGE PROMPT (สำหรับ Midjourney / SDXL / Gemini):
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 hover:border-[#F71C25] hover:text-[#F71C25] transition-all cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-[#F71C25]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-stone-300 leading-relaxed max-h-48 overflow-y-auto select-text pr-1 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                  {item.content || item.prompt}
                </p>
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-stone-400 pt-1">
                  <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">เลนส์: {item.lens_focal || '35mm'}</span>
                  <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">สัดส่วน: {item.aspect_ratio || '9:16'}</span>
                  <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">สไตล์: {item.visual_style || 'Sketch'}</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. Prompt วิดีโอ */}
            {activeDetailTab === 'video_prompt' && (
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    VIDEO AI PROMPT (สำหรับ Kling AI / Runway Gen-3 / Luma):
                  </span>
                  <button
                    onClick={handleCopyVideoPrompt}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-600 text-purple-200 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedVideo ? <Check className="w-3 h-3 text-purple-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedVideo ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-purple-100 leading-relaxed max-h-48 overflow-y-auto select-text pr-1 bg-stone-950/80 p-2.5 rounded-xl border border-purple-800/40">
                  {item.video_prompt || `[Camera: ${item.camera_movement || 'Slow cinematic push in'}] [Subject: ${item.title} moving naturally with subtle expressions] [Lighting: Cinematic realistic natural light, ultra smooth 24fps motion fluidity, 4k master].`}
                </p>
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-purple-300/80 pt-1">
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-700/50">🎥 24fps Fluid Motion</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-700/50">Kling / Runway Ready</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-700/50">{item.camera_movement ? 'Motion Directed' : 'Auto Pan'}</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. คู่มือกองถ่ายจริง & มุมกล้อง */}
            {activeDetailTab === 'live_action' && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5 text-xs">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>คู่มือกองถ่ายทำจริง (Live-Action Guide):</span>
                </div>
                <div className="space-y-2 bg-stone-950/80 p-3 rounded-xl border border-emerald-800/40 text-stone-200">
                  <div>
                    <span className="font-bold text-emerald-300">มุมกล้อง & เลนส์: </span>
                    <span>{item.camera_angle} ({item.camera_angle_th}) • เลนส์ {item.lens_focal || '35mm'}</span>
                  </div>
                  {item.camera_movement && (
                    <div>
                      <span className="font-bold text-emerald-300">การเคลื่อนกล้อง: </span>
                      <span>{item.camera_movement}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-emerald-300">การจัดแสงและกำกับ: </span>
                    <p className="mt-1 text-stone-300 leading-relaxed whitespace-pre-line text-[11px]">
                      {item.live_action_guide || 'จัดแสง Key light 45 องศา พร้อม Rim light ขอบตัวแบบ เลนส์โฟกัสที่แววตา เคลื่อนกล้องอย่างนุ่มนวล'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. บทพูด & เสียง Foley */}
            {activeDetailTab === 'audio' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2.5 text-xs">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>บทสนทนา & เสียงประกอบ (Audio & Foley):</span>
                </div>
                <div className="space-y-2 bg-stone-950/80 p-3 rounded-xl border border-amber-800/40">
                  {item.dialogue_script && (
                    <div>
                      <div className="text-[10px] font-bold text-amber-300 uppercase">บทพูด / เสียงพากย์ (VO):</div>
                      <p className="text-[11px] text-stone-200 leading-relaxed mt-0.5">
                        {item.dialogue_script}
                      </p>
                    </div>
                  )}
                  {item.audio_foley && (
                    <div className="pt-1.5 border-t border-stone-800">
                      <div className="text-[10px] font-bold text-amber-300 uppercase">เสียง Foley & แอมเบียนต์:</div>
                      <p className="text-[11px] text-stone-300 leading-relaxed mt-0.5">
                        {item.audio_foley}
                      </p>
                    </div>
                  )}
                  {item.on_screen_text && (
                    <div className="pt-1.5 border-t border-stone-800">
                      <div className="text-[10px] font-bold text-amber-300 uppercase">ข้อความตัวหนังสือในคลิป:</div>
                      <p className="text-[11px] text-stone-300 leading-relaxed mt-0.5">
                        {item.on_screen_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-3 border-t border-stone-800/80">
            {/* Convert to Video Motion */}
            <button
              onClick={() => {
                onClose();
                if (onOpenVideoStudio) onOpenVideoStudio(item);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>นำภาพนี้ไปสร้างเป็นคลิปวิดีโอ (Motion Video Studio)</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Download HD Image */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#F71C25]" />
                <span>ดาวน์โหลดรูปภาพ (.JPG)</span>
              </button>

              <button
                onClick={handleCopyPrompt}
                className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
                title="คัดลอก Master Prompt"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
