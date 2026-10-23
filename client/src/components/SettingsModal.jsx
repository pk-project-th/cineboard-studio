import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [pollinationsKey, setPollinationsKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setServerStatus(data.data);
          }
        })
        .catch(console.error);

      // Load local stored keys if user saved them
      setPollinationsKey(localStorage.getItem('cine_pollinations_key') || '');
      setGeminiKey(localStorage.getItem('cine_gemini_key') || '');
      setOpenaiKey(localStorage.getItem('cine_openai_key') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      localStorage.setItem('cine_pollinations_key', pollinationsKey.trim());
      localStorage.setItem('cine_gemini_key', geminiKey.trim());
      localStorage.setItem('cine_openai_key', openaiKey.trim());

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollinations_key: pollinationsKey.trim(),
          gemini_key: geminiKey.trim(),
          openai_key: openaiKey.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setServerStatus(data.data);
        setStatus({ type: 'success', msg: 'บันทึกการตั้งค่าเรียบร้อยแล้ว!' });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatus({ type: 'error', msg: data.error || 'เกิดข้อผิดพลาดในการบันทึก' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FBEFC5] text-stone-900 border border-[#EADBBD]">
              <Key className="w-4 h-4 text-[#F71C25]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">การตั้งค่า AI & API Keys</h3>
              <p className="text-[11px] text-stone-500 font-mono">กำหนดคีย์บริการ AI หรือใช้โหมดฟรีอัตโนมัติ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{status.msg}</span>
            </div>
          )}

          {/* Pollinations Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>Pollinations AI Key (สร้างภาพ Flux ความเร็วสูง)</span>
                {serverStatus.has_pollinations_key && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold">
                    เชื่อมต่อแล้ว
                  </span>
                )}
              </label>
              <a
                href="https://enter.pollinations.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#F71C25] hover:underline flex items-center gap-1 font-mono"
              >
                <span>รับคีย์ฟรี (enter.pollinations.ai)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={pollinationsKey}
              onChange={(e) => setPollinationsKey(e.target.value)}
              placeholder="sk_... หรือปล่อยว่างเพื่อใช้ระบบฟรีอัตโนมัติ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#F71C25] font-mono shadow-2xs"
            />
            <p className="text-[11px] text-stone-500 leading-relaxed">
              * หากไม่ใส่คีย์ ระบบจะใช้โหมดฟรีอัตโนมัติ (1 ภาพต่อ 45 วินาที)
            </p>
          </div>

          {/* Gemini Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>Google Gemini API Key (ตัวเลือกเสริม)</span>
                {serverStatus.has_gemini_key && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold">
                    เชื่อมต่อแล้ว
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#F71C25] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (ไม่จำเป็น ต้องมีเครดิตสำหรับ Imagen)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#F71C25] font-mono shadow-2xs"
            />
          </div>

          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>OpenAI API Key (ตัวเลือกเสริม)</span>
                {serverStatus.has_openai_key && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold">
                    เชื่อมต่อแล้ว
                  </span>
                )}
              </label>
            </div>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-... (ไม่จำเป็น)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#F71C25] font-mono shadow-2xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] shadow-sm shadow-red-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>บันทึกการตั้งค่า</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
