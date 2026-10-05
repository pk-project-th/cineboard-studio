import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Trash2, Edit3, Save, Layers, Film, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const CAMERA_ANGLES = [
  { value: 'Macro Shot', label: 'Macro Shot (มาโครเจาะลึก)' },
  { value: 'Extreme Close-Up', label: 'Extreme Close-Up (โคลสอัพเจาะลึกพิเศษ)' },
  { value: 'Close-Up', label: 'Close-Up (โคลสอัพใกล้)' },
  { value: 'Medium Close-Up', label: 'Medium Close-Up (ปานกลางค่อนข้างใกล้)' },
  { value: 'Medium Shot', label: 'Medium Shot (ภาพมุมปานกลาง)' },
  { value: 'Over-the-Shoulder', label: 'Over-the-Shoulder (ข้ามหัวไหล่)' },
  { value: 'Wide Shot', label: 'Wide Shot (ภาพมุมกว้าง)' }
];

export default function BatchEditPromptsModal({
  isOpen,
  onClose,
  prompts = [],
  projectTitle = '',
  onBatchUpdated
}) {
  const [shots, setShots] = useState([]);
  const [suffixStyle, setSuffixStyle] = useState('macro photography, hyper-realistic, soft natural daylight, premium automotive commercial style, sharp details.');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prompts && prompts.length > 0) {
      setShots(prompts.map(p => ({ ...p })));
    }
  }, [prompts, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (idx, field, val) => {
    setShots(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleAppendSuffix = () => {
    if (!suffixStyle.trim()) return;
    const clean = suffixStyle.trim().replace(/^[,\s]+/, '');
    const updated = shots.map(s => {
      let p = (s.content || s.prompt || '').trim();
      if (!p.toLowerCase().includes(clean.toLowerCase())) {
        p = `${p}, ${clean}`;
      }
      return { ...s, content: p, prompt: p };
    });
    setShots(updated);
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ['#F71C25', '#bef264', '#ffffff']
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/prompts-batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shots })
      });
      const data = await res.json();
      if (data.success && data.data) {
        confetti({
          particleCount: 50,
          spread: 70,
          colors: ['#F71C25', '#bef264', '#38bdf8']
        });
        if (onBatchUpdated) {
          onBatchUpdated(data.data);
        }
        onClose();
      } else {
        alert(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-md select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl text-stone-900 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25] font-black shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F71C25] px-2 py-0.5 rounded-md bg-red-50 border border-red-200">
                Batch Prompt Editor
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-950 mt-0.5">
                แก้ไข Prompt ทุกช็อตในโปรเจกต์: "{projectTitle || 'โปรเจกต์ปัจจุบัน'}" ({shots.length} ช็อต)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="px-5 py-2.5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="text-xs font-mono font-bold text-stone-600 flex-shrink-0">
              ต่อท้ายทุกช็อต:
            </span>
            <input
              type="text"
              value={suffixStyle}
              onChange={(e) => setSuffixStyle(e.target.value)}
              className="text-xs font-mono px-3 py-1 rounded-lg bg-white border border-stone-300 focus:border-[#F71C25] outline-none flex-1 min-w-0"
              placeholder="สไตล์ต่อท้าย..."
            />
            <button
              type="button"
              onClick={handleAppendSuffix}
              className="px-3 py-1 rounded-lg bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>เติมต่อท้าย</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-stone-500">
            ระบบจะอัปเดตรูปสเก็ตช์ตาม Prompt ใหม่อัตโนมัติ
          </span>
        </div>

        {/* Shot List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-white">
          {shots.map((shot, idx) => (
            <div
              key={shot.id || idx}
              className="bg-white border border-stone-200 hover:border-[#F71C25]/50 rounded-2xl p-3.5 shadow-2xs space-y-2 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#FBEFC5] border border-[#E5D7A3] text-[11px] font-mono font-extrabold text-stone-900 flex-shrink-0">
                  ช็อตที่ {shot.step_number || idx + 1}
                </span>
                <input
                  type="text"
                  value={shot.title || ''}
                  onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                  className="text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 focus:bg-white px-2.5 py-1 rounded-lg border border-stone-200 focus:border-[#F71C25] outline-none flex-1 min-w-0"
                  placeholder="ชื่อช็อต..."
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-stone-700 block mb-1">
                  Prompt สำหรับช็อตนี้:
                </label>
                <textarea
                  rows={2}
                  value={shot.content || shot.prompt || ''}
                  onChange={(e) => handleUpdate(idx, 'content', e.target.value)}
                  className="w-full bg-[#FAF9F5] focus:bg-white border border-stone-300 focus:border-[#F71C25] rounded-xl p-2.5 text-xs font-mono text-stone-900 focus:outline-none transition-colors resize-y leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-stone-500 block mb-0.5">
                    มุมกล้อง:
                  </label>
                  <select
                    value={shot.camera_angle || 'Medium Shot'}
                    onChange={(e) => handleUpdate(idx, 'camera_angle', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-bold outline-none cursor-pointer"
                  >
                    {CAMERA_ANGLES.map(ca => (
                      <option key={ca.value} value={ca.value}>
                        {ca.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-500 block mb-0.5">
                    เสียง Foley ASMR:
                  </label>
                  <input
                    type="text"
                    value={shot.audio_foley || ''}
                    onChange={(e) => handleUpdate(idx, 'audio_foley', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs outline-none"
                    placeholder="เสียง Foley..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-stone-200 bg-[#FAF9F5] flex items-center justify-between">
          <div className="text-xs font-mono text-stone-500">
            <span>ทั้งหมด <strong className="text-stone-900 font-bold">{shots.length} ช็อต</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || shots.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขทุกช็อต'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
