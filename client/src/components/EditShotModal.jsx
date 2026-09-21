import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Check, RefreshCw, Wand2, Film, Video, Camera,
  Volume2, Clapperboard, Type, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EditShotModal({ isOpen, onClose, shot, onSaved }) {
  const [formData, setFormData] = useState({});
  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refineSuccess, setRefineSuccess] = useState(false);

  useEffect(() => {
    if (shot) {
      setFormData({
        title: shot.title || '',
        content: shot.content || '',
        dialogue_script: (shot.dialogue_script || '')
          .replace(/ครับ\s*\/\s*ค่ะ/g, 'ครับ')
          .replace(/ค่ะ\s*\/\s*ครับ/g, 'ครับ'),
        camera_angle: shot.camera_angle || 'Medium Shot',
        camera_movement: shot.camera_movement || '',
        lens_focal: shot.lens_focal || shot.shot_size || '35mm',
        action_description: shot.action_description || '',
        video_prompt: shot.video_prompt || '',
        audio_foley: shot.audio_foley || '',
        on_screen_text: shot.on_screen_text || '',
        live_action_guide: shot.live_action_guide || ''
      });
      setInstruction('');
      setRefineSuccess(false);
    }
  }, [shot, isOpen]);

  if (!isOpen || !shot) return null;

  // AI Context-Aware Refinement
  const handleAiRefine = async () => {
    if (!instruction.trim()) {
      alert('กรุณาระบุสิ่งที่ต้องการให้ AI ปรับแก้ เช่น "ไม่เอารถ ขอเป็นเจดีย์วัด" หรือ "ตัวละครหันหน้ามาทางกล้อง"');
      return;
    }

    setIsRefining(true);
    setRefineSuccess(false);
    try {
      const res = await fetch(`/api/prompts/${shot.id}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          title: data.data.title || prev.title,
          content: data.data.content || prev.content,
          dialogue_script: data.data.dialogue_script || prev.dialogue_script,
          camera_angle: data.data.camera_angle || prev.camera_angle,
          camera_movement: data.data.camera_movement || prev.camera_movement,
          action_description: data.data.action_description || prev.action_description,
          video_prompt: data.data.video_prompt || prev.video_prompt,
          live_action_guide: data.data.live_action_guide || prev.live_action_guide
        }));
        setRefineSuccess(true);
        try { confetti({ particleCount: 35, spread: 60 }); } catch (e) {}
      } else {
        alert(data.error || 'ไม่สามารถเกลาช็อตนี้ได้');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Refiner');
    } finally {
      setIsRefining(false);
    }
  };

  // Save changes to database and sync with Master Prompt
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/prompts/${shot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        try { confetti({ particleCount: 45, spread: 70 }); } catch (e) {}
        if (onSaved) onSaved(data.data);
        onClose();
      } else {
        alert(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลช็อต');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF9F5] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25]">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 font-mono text-[10px] font-bold">
                  SHOT #{shot.step_number || 1}
                </span>
                <h3 className="text-base font-black text-stone-900">
                  แก้ไข & เกลา Prompt ช็อตนี้ (Shot Editor & Refiner)
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                ปรับแก้ Prompt เพื่อให้ตรงใจ โดยยังคงรักษาความต่อเนื่องของเนื้อเรื่อง ตัวละคร และ Master Prompt 100%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
          
          {/* AI Context-Aware Refinement Banner */}
          <div className="p-4 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F71C25]" />
                <span>ให้ AI ช่วยปรับแก้ช็อตนี้ตามบริบทของเรื่อง (AI Context-Aware Refiner):</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FBEFC5] text-stone-800 border border-[#E5D7A3]">
                Groq LPU / Gemini 3.8
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              หากภาพที่เจนออกมามีสิ่งผิดพลาด (เช่น มีรถโผล่มา, หน้าตาไม่เข้ากับวัด, มุมกล้องไม่ถูกใจ) 
              ให้พิมพ์บอก AI ได้เลย ระบบจะนำเนื้อเรื่องทั้งโปรเจกต์มาคำนวณใหม่โดยไม่หลุดธีมเดิม
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiRefine(); }}
                placeholder="เช่น 'ภาพสร้างไม่ได้ มีรถโผล่มา ขอเอาออกให้หมด อยากได้เจดีย์ทองและตัวละครกราบพระ'..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 outline-none focus:border-[#F71C25] shadow-2xs placeholder:text-stone-400"
              />

              <button
                type="button"
                onClick={handleAiRefine}
                disabled={isRefining}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isRefining ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังคำนวณ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>เกลาช็อตนี้</span>
                  </>
                )}
              </button>
            </div>

            {refineSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>AI ปรับแก้ Prompt และบทพูดเรียบร้อยแล้ว ตรวจทานด้านล่างแล้วกดบันทึกได้เลยครับ</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Title & Camera Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-stone-700 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#F71C25]" />
                  <span>หัวข้อช็อต (Shot Headline):</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-[#F71C25] shadow-2xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-stone-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#F71C25]" />
                  <span>มุมกล้อง & เลนส์ (Camera Angle):</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.camera_angle || ''}
                    onChange={(e) => setFormData({ ...formData, camera_angle: e.target.value })}
                    placeholder="เช่น Wide Shot, Close-Up"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-[#F71C25] shadow-2xs font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.lens_focal || ''}
                    onChange={(e) => setFormData({ ...formData, lens_focal: e.target.value })}
                    placeholder="35mm"
                    className="w-20 px-2.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 text-center outline-none focus:border-[#F71C25] shadow-2xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Master Image Keyframe Prompt */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200">
              <label className="block text-xs font-mono font-bold text-stone-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#F71C25]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Master Image Prompt (Midjourney / Flux / Gemini):</span>
                </span>
                <span className="text-[10px] text-stone-500 font-normal">ภาษาอังกฤษสำหรับสร้างภาพนิ่ง</span>
              </label>
              <textarea
                rows={3}
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-900 outline-none focus:border-[#F71C25] shadow-2xs leading-relaxed resize-none"
              />
            </div>

            {/* Video AI Prompt */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
              <label className="block text-xs font-mono font-bold text-purple-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  <span>Video AI Prompt (Kling 1.5 / Runway Gen-3):</span>
                </span>
                <span className="text-[10px] text-purple-700 font-normal">คำสั่งการเคลื่อนไหวของกล้องและตัวละคร</span>
              </label>
              <textarea
                rows={2}
                value={formData.video_prompt || ''}
                onChange={(e) => setFormData({ ...formData, video_prompt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-mono text-purple-950 outline-none focus:border-purple-500 shadow-2xs leading-relaxed resize-none"
              />
            </div>

            {/* Dialogue VO (strictly "ครับ") */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD]">
              <label className="block text-xs font-mono font-bold text-stone-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-orange-800">
                  <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>บทพูด / เสียงพากย์ (Dialogue VO):</span>
                </span>
                <span className="text-[10px] text-stone-600 font-normal">ลงท้ายด้วย "ครับ" เสมอ</span>
              </label>
              <textarea
                rows={2}
                value={formData.dialogue_script || ''}
                onChange={(e) => setFormData({ ...formData, dialogue_script: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-orange-500 shadow-2xs leading-relaxed resize-none"
              />
            </div>

            {/* Live-Action Shooting Guide */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
              <label className="block text-xs font-mono font-bold text-emerald-900 flex items-center gap-1.5">
                <Clapperboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>คำแนะนำสำหรับกองถ่ายจริง (Live-Action Guide — การจัดไฟ/การกำกับ):</span>
              </label>
              <textarea
                rows={2}
                value={formData.live_action_guide || ''}
                onChange={(e) => setFormData({ ...formData, live_action_guide: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-950 outline-none focus:border-emerald-500 shadow-2xs leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF9F5] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>เมื่อกดบันทึก ข้อมูลช็อตนี้จะอัปเดตและเชื่อมโยงเข้า Master Prompt ทันที</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-stone-200/80 text-stone-700 text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>💾 บันทึกการแก้ไข (Sync to Master Prompt)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
