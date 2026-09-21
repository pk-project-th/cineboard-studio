import React, { useState } from 'react';
import { Copy, Check, X, FileText, Download, Sparkles, Film, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MasterPromptModal({ isOpen, onClose, masterPromptText = '', projectTitle = '' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!masterPromptText) return;
    navigator.clipboard.writeText(masterPromptText);
    setCopied(true);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `${(projectTitle || 'CineBoard-Project').replace(/[^a-zA-Z0-9ก-๙_-]/g, '_')}_Master_Prompt.txt`;
    const blob = new Blob([masterPromptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF9F5] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25] flex-shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 font-mono text-[10px] font-bold">
                  MASTER SPECIFICATION
                </span>
                <h3 className="text-base font-black text-stone-900">
                  Master Production Prompt (ฉบับสมบูรณ์ทั้งเรื่อง)
                </h3>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                รวมคำสั่ง Prompt ทุกช็อต, มุมกล้อง, เลนส์, บทพูด, Foley, และคำแนะนำกองถ่ายจริงไว้ในที่เดียว
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
              title="คัดลอก Master Prompt ทั้งหมดลงคลิปบอร์ด"
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกเรียบร้อยแล้ว!' : '📋 คัดลอก Master Prompt ทั้งหมด'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
              title="ดาวน์โหลดเป็นไฟล์ .txt"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด .txt</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prompt Content Display */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#FAF9F5]">
          <div className="relative">
            <pre className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 text-stone-900 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text shadow-xs overflow-x-auto">
              {masterPromptText || 'กำลังโหลด Master Prompt...'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>พร้อมส่งต่อให้ AI Video Generator (Kling, Runway, Hailuo) หรือใช้เป็นใบเบิกงานกองถ่ายจริง</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer sm:hidden"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.txt</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'Copy All'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
