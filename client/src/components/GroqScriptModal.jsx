import React, { useState } from 'react';
import {
  X, Sparkles, Wand2, Zap, Send, Copy, Check, Play, Film,
  Volume2, HelpCircle, Loader2, ArrowRight, MessageSquare, Lightbulb, Clapperboard
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GroqScriptModal({
  isOpen,
  onClose,
  onApplyPrompt,
  onApplyDialogue,
  onOpenStoryboardBuilder
}) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const quickTopics = [
    'โฆษณารถเก๋งมือสองสภาพนางฟ้า ผ่อน 5,000/ด.',
    'รีวิวเซรั่มบำรุงผิวหน้าใสฉ่ำวาว 7 วัน',
    'คลิปโปรโมทคาเฟ่เปิดใหม่ Specialty Coffee',
    'ไวรัล TikTok ขายสเปรย์โฟมทำความสะอาด',
    'หนังสั้นสืบสวนระทึกขวัญกลางสายฝน'
  ];

  const handleGenerate = async (selectedTopic) => {
    const topicToUse = selectedTopic || topic || 'โฆษณารถเก๋งมือสองสภาพนางฟ้า ผ่อน 5,000/ด.';
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/groq/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToUse })
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (data && data.data && data.data.dialogue_script) { data.data.dialogue_script = data.data.dialogue_script.replace(/ครับ\/ค่ะ/g, "ครับ").replace(/ค่ะ\/ครับ/g, "ครับ"); } setResult(data);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Groq Cloud');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อ Groq API ได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (result?.data?.first_frame_prompt) {
      navigator.clipboard.writeText(result.data.first_frame_prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleCopyScript = () => {
    if (result?.data?.dialogue_script) {
      navigator.clipboard.writeText(result.data.dialogue_script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const handleSendToPromptBar = () => {
    if (result?.data?.first_frame_prompt && onApplyPrompt) {
      onApplyPrompt(result.data.first_frame_prompt);
      onClose();
    }
  };

  const handleSendToAudioStudio = () => {
    if (result?.data?.dialogue_script && onApplyDialogue) {
      onApplyDialogue(result.data.dialogue_script);
      onClose();
    }
  };

  const handleConvertToStoryboard = () => {
    if (onOpenStoryboardBuilder && result?.data) {
      const conceptText = result.data.title + ': ' + (result.data.joke_concept || topic);
      onOpenStoryboardBuilder(conceptText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-stone-900 relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl hidden rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25] font-black">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Groq Cloud LPU Engine</span>
                <span className="px-1.5 py-0.5 rounded bg-[#FBEFC5] border border-[#E5D7A3] text-[10px] text-stone-900 font-bold">
                  Ultra-Fast AI
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                ผู้ช่วยคิดบท & คอนเซปต์สตอรี่บอร์ด (CineBoard AI)
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

        {/* Input & Quick Chips */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-stone-400 mb-1.5">
              พิมพ์หัวข้อสินค้า บริการ หรือพล็อตเรื่องที่ต้องการทำสตอรี่บอร์ด:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="เช่น ขายรถมือสองสภาพนางฟ้า, เซรั่มหน้าใสฉ่ำโกลว์, รีวิวคาเฟ่ลับ..."
                className="flex-1 bg-white border border-stone-200 focus:border-[#F71C25] rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none transition-colors shadow-2xs"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-sm flex items-center gap-2 shadow-md shadow-red-500/20 transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>กำลังคิดบท (1-2 วิ)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>ให้ Groq AI คิดบท</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Idea Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-stone-500 text-[11px] font-mono flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> ลองกดหัวข้อยอดนิยม:
            </span>
            {quickTopics.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(item);
                  handleGenerate(item);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#FBEFC5]/50 border border-stone-200 hover:border-[#F71C25]/40 text-stone-700 hover:text-[#F71C25] transition-colors text-[11px] cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Results Display */}
        {result && result.data && (
          <div className="mt-6 space-y-4 pt-4 border-t border-stone-200 animate-in fade-in duration-300">
            {/* Episode Title & Joke Concept */}
            <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="text-[11px] font-mono text-[#F71C25] font-bold uppercase mb-1">
                  คอนเซปต์เรื่องที่ AI วางให้:
                </div>
                <h3 className="text-lg font-black text-stone-950">
                  {result.data.title}
                </h3>
                <p className="text-xs text-stone-700 mt-1 flex items-center gap-1.5">
                  <span className="text-[#F71C25] font-bold">แก่นเรื่อง / Hook:</span>
                  <span>{result.data.joke_concept}</span>
                </p>
              </div>

              {onOpenStoryboardBuilder && (
                <button
                  onClick={handleConvertToStoryboard}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Clapperboard className="w-4 h-4 fill-current" />
                  <span>🎬 วางสตอรี่บอร์ดทั้งเรื่อง</span>
                </button>
              )}
            </div>

            {/* 1. First Frame English Prompt for Image Gen */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#F71C25]">
                  <Film className="w-4 h-4" />
                  <span>1. Prompt สร้างภาพ First Frame (AI Image Engine • 9:16):</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPrompt}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer active:scale-95"
                    title="คัดลอก Prompt"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#F71C25]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                  <button
                    onClick={handleSendToPromptBar}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งเข้า Prompt Bar สร้างภาพทันที</span>
                  </button>
                </div>
              </div>
              <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-3.5 text-xs font-mono text-stone-900 leading-relaxed select-text shadow-2xs">
                {result.data.first_frame_prompt}
              </div>
            </div>

            {/* 2. Thai Dialogue Script for Dubbing */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-900">
                  <Volume2 className="w-4 h-4 text-[#F71C25]" />
                  <span>2. บทพากย์ภาษาไทย (สำหรับผู้พากย์ / ซาวด์สคริปต์):</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer active:scale-95"
                    title="คัดลอกบทพากย์"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-[#F71C25]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                  <button
                    onClick={handleSendToAudioStudio}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#F71C25]" />
                    <span>ส่งเข้า Audio Studio พากย์เสียง</span>
                  </button>
                </div>
              </div>
              <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-3.5 text-xs text-stone-900 whitespace-pre-line leading-relaxed select-text font-sans shadow-2xs">
                {result.data.dialogue_script}
              </div>
            </div>

            {/* 3. Director Style & Audio Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FDF8EE] border border-[#EADBBD] rounded-2xl p-4 shadow-2xs">
                <div className="font-bold text-stone-950 mb-1.5 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-[#F71C25]" />
                  <span>การคุมสไตล์ตัวละคร & พร็อพ (Visual Direction):</span>
                </div>
                <p className="text-stone-700 text-[11px] leading-relaxed">
                  {typeof result.data.character_suggest === 'string'
                    ? result.data.character_suggest
                    : JSON.stringify(result.data.character_suggest)}
                </p>
              </div>

              <div className="bg-[#FDF8EE] border border-[#EADBBD] rounded-2xl p-4 shadow-2xs">
                <div className="font-bold text-stone-950 mb-1.5 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#F71C25]" />
                  <span>แนวทางเสียงพากย์ & Foley (Audio Direction):</span>
                </div>
                <p className="text-stone-700 text-[11px] leading-relaxed">
                  {result.data.audio_note}
                </p>
              </div>
            </div>

            {/* Footer metadata */}
            <div className="text-[10px] font-mono text-stone-600 flex items-center justify-between pt-3 border-t border-stone-200">
              <span>ประมวลผลผ่าน: {result.meta?.provider || 'Groq Cloud LPU'} ({result.meta?.model})</span>
              <span>ความเร็ว: {result.meta?.latency_ms || 350} ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
