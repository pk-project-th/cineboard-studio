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
          if (data.success && data.data) setServerStatus(data.data);
        })
        .catch(() => {});

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
        setTimeout(() => onClose(), 800);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
          color: 'var(--text-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold">ตั้งค่าระบบ AI Engine</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                ระบบหลักทำงานฟรีอัตโนมัติ (ไม่ต้องใส่ API Key ก็ใช้งานได้ทันที)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                สถานะปัจจุบัน: พร้อมใช้งานโหมดฟรี 100%
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                วางแผนสตอรี่บอร์ดภาพนิ่งระดับโลก วิดีโอไวรัล และวาดภาพ AI ฟรีโดยไม่ต้องตั้งค่าคีย์ใดๆ
              </p>
            </div>
          </div>

          {status && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
              }`}
            >
              {status.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{status.msg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center gap-2">
                <span>Google Gemini API Key (ตัวเลือกเสริม)</span>
                {serverStatus.has_gemini_key && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-mono">
                    เชื่อมต่อแล้ว
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>รับคีย์ Gemini</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (ปล่อยว่างเพื่อใช้โหมดฟรี)"
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-amber-600"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)'
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold flex items-center gap-2">
              <span>OpenAI API Key (ตัวเลือกเสริม)</span>
              {serverStatus.has_openai_key && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-mono">
                  เชื่อมต่อแล้ว
                </span>
              )}
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-... (ปล่อยว่างได้)"
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-amber-600"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)'
              }}
            />
          </div>

          <div
            className="pt-3 flex items-center justify-end gap-2 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-tactile px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
