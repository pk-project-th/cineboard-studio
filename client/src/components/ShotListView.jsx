import React, { useState } from 'react';
import {
  Film, Copy, Check, Sparkles, Plus, Trash2, Edit3, Image as ImageIcon,
  Clock, ArrowRight, Loader2, Volume2, Video, MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getShotDisplayImage } from '../utils/storyboardHelper';

export default function ShotListView({
  prompts = [],
  seriesTitle = 'โปรเจกต์สตอรี่บอร์ด',
  onEditPrompt,
  onDeletePrompt,
  onAppendShot,
  onGoToBoard,
  onGenerateImageForShot
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [generatingShotId, setGeneratingShotId] = useState(null);

  const handleCopyPrompt = (p) => {
    navigator.clipboard.writeText(p.content || p.prompt || p.title);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyVideoPrompt = (p) => {
    const vp = p.video_prompt || `Cinematic camera motion capturing ${p.title}`;
    navigator.clipboard.writeText(vp);
    setCopiedId(`v-${p.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateImage = async (p) => {
    if (!onGenerateImageForShot) return;
    setGeneratingShotId(p.id);
    try {
      await onGenerateImageForShot(p);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#F71C25', '#FF4D4D', '#FBEFC5']
      });
    } catch (e) {
      alert('สร้างภาพไม่สำเร็จ: ' + e.message);
    } finally {
      setGeneratingShotId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F71C25] uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>ขั้นตอนที่ 2 • ตรวจสอบและแก้ไขบทรายการช็อต</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {seriesTitle}
          </h1>
          <p className="text-xs text-stone-600 font-mono">
            ทั้งหมด {prompts.length} ช็อต • สามารถตรวจสอบ แก้ไขบทพูด หรือสั่งเจนภาพ AI รายช็อตได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onAppendShot}
            className="px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-[#FBEFC5]/50 border border-stone-200 hover:border-[#F71C25]/40 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F71C25]" />
            <span>เพิ่มช็อตใหม่</span>
          </button>

          <button
            onClick={onGoToBoard}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <span>ดูบอร์ดภาพสตอรี่บอร์ด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shot List Sequential Table / Cards */}
      <div className="space-y-4">
        {prompts.map((p, idx) => {
          const displayImg = getShotDisplayImage(p);
          const isGeneratingThis = generatingShotId === p.id;
          const isRealAiImg = displayImg && !displayImg.startsWith('data:image/svg');

          return (
            <div
              key={p.id || idx}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#F71C25]/40 transition-all p-4 sm:p-6 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Thumbnail Preview & Shot Badge */}
                <div className="flex items-start gap-4">
                  <div className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden bg-stone-900 border border-stone-200 flex-shrink-0 group">
                    <img
                      src={displayImg}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    {isGeneratingThis && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 text-white text-[11px] font-mono">
                        <Loader2 className="w-5 h-5 animate-spin text-[#F71C25]" />
                        <span>กำลังเจนภาพ...</span>
                      </div>
                    )}
                    {/* Badge Overlay */}
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-white">
                      ช็อต #{p.step_number || idx + 1}
                    </div>
                  </div>

                  {/* Shot Meta Details */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#FDF8EE] border border-[#EADBBD] text-[#F71C25] font-mono text-xs font-bold">
                        {p.camera_angle || 'Medium Shot'}
                      </span>
                      <span className="text-stone-400 text-xs font-mono">
                        {p.shot_size || '35mm'}
                      </span>
                      {p.duration_seconds && (
                        <span className="text-stone-500 text-xs font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{p.duration_seconds}s</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      {p.title}
                    </h3>

                    {p.action_description && (
                      <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                        {p.action_description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0 self-end md:self-start">
                  <button
                    onClick={() => handleGenerateImage(p)}
                    disabled={isGeneratingThis}
                    className="px-3 py-1.5 rounded-xl bg-[#FBEFC5] hover:bg-[#F5E6B8] border border-[#EADBBD] text-stone-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="สร้างภาพ AI คุณภาพสูงสำหรับช็อตนี้"
                  >
                    {isGeneratingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F71C25]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
                    )}
                    <span>{isRealAiImg ? 'สร้างภาพใหม่' : '⚡ เจนภาพ AI'}</span>
                  </button>

                  <button
                    onClick={() => onEditPrompt && onEditPrompt(p)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                    title="แก้ไขเนื้อหาช็อตนี้"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletePrompt && onDeletePrompt(p.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 transition-colors cursor-pointer"
                    title="ลบช็อตนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dialogue & Audio Foley Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
                {/* Dialogue */}
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="font-mono text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F71C25]" />
                    <span>บทพูด / เสียงพากย์ (Dialogue):</span>
                  </span>
                  <p className="text-stone-800 leading-relaxed">
                    {p.dialogue_script || '— ไม่มีบทพูด (เน้นภาพและเสียงบรรยากาศ) —'}
                  </p>
                </div>

                {/* Audio Foley */}
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="font-mono text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>เสียงเอฟเฟกต์ & ดนตรี (Audio Foley):</span>
                  </span>
                  <p className="text-stone-800 leading-relaxed">
                    {p.audio_foley || 'เสียงแอมเบียนต์บรรยากาศคมชัด'}
                  </p>
                </div>
              </div>

              {/* Prompts Quick Copy Ribbon */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs font-mono">
                <div className="truncate text-stone-500 pr-2">
                  <span className="font-bold text-stone-700">Image Prompt:</span> {p.content || p.prompt}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopyPrompt(p)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="คัดลอก Master Image Prompt สำหรับ Midjourney / Flux"
                  >
                    {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>คัดลอก Image Prompt</span>
                  </button>

                  <button
                    onClick={() => handleCopyVideoPrompt(p)}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 hover:border-purple-400 text-purple-900 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="คัดลอก Video Prompt สำหรับ Kling AI / Runway / Luma / Flow"
                  >
                    {copiedId === `v-${p.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Video className="w-3.5 h-3.5 text-purple-700" />}
                    <span>Video Prompt</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
