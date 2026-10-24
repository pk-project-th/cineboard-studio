import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

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
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setServerStatus(data.data);
          }
        })
        .catch(console.error);

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
        setStatus({ type: 'success', msg: 'บันทึกการตั้งค่าเรียบร้อยแล้วครับ!' });
        setTimeout(() => onClose(), 900);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#131720] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0F1219]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ตั้งค่าระบบ AI Engine</h3>
              <p className="text-[11px] text-slate-400">ระบบหลัก FLUX.1-schnell ทำงานฟรีอัตโนมัติ (ไม่ต้องใส่คีย์ก็ใช้งานได้ทันที)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 leading-relaxed">
              <span className="font-bold text-emerald-300">สถานะปัจจุบัน: พร้อมวาดภาพจริงด้วย FLUX.1-schnell (ฟรี 100%)</span>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                ระบบเชื่อมต่อเอ็นจิ้นวาดภาพ FLUX.1 ความเร็วสูงและแปลภาษาไทย→อังกฤษอัตโนมัติโดยไม่ต้องตั้งค่าคีย์ใดๆ
              </p>
            </div>
          </div>

          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{status.msg}</span>
            </div>
          )}

          {/* Gemini Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>Google Gemini API Key (ตัวเลือกเสริม)</span>
                {serverStatus.has_gemini_key && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    เชื่อมต่อแล้ว
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>รับคีย์ Gemini</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (ปล่อยว่างเพื่อใช้โหมดฟรีอัตโนมัติ)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>OpenAI API Key (ตัวเลือกเสริม)</span>
                {serverStatus.has_openai_key && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    เชื่อมต่อแล้ว
                  </span>
                )}
              </label>
            </div>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-... (ปล่อยว่างได้)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
