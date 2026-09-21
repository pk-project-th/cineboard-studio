import React, { useState } from 'react';
import { Copy, Check, Sliders, MessageSquare, Sparkles, Cpu, Layers, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PromptCard({ prompt, onCopySuccess }) {
  const [copied, setCopied] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);

  // Initialize variables from schema
  const [variables, setVariables] = useState(() => {
    const init = {};
    if (Array.isArray(prompt.variables_schema)) {
      prompt.variables_schema.forEach(v => {
        init[v.key] = v.default || '';
      });
    }
    return init;
  });

  // Calculate live prompt content by replacing variables
  const getProcessedContent = () => {
    let text = prompt.content;
    Object.entries(variables).forEach(([key, val]) => {
      // Replace [key] or key occurrences
      const regexBracket = new RegExp(`\\[${key}\\]`, 'g');
      text = text.replace(regexBracket, val);
    });
    return text;
  };

  const processedContent = getProcessedContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedContent);
      setCopied(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#d97706', '#f59e0b', '#fbbf24', '#ffffff']
      });

      // API update counter
      fetch(`/api/prompts/${prompt.id}/copy`, { method: 'POST' })
        .then(r => r.json())
        .then(res => {
          if (res.success && onCopySuccess) {
            onCopySuccess(prompt.id, res.data.copy_count);
          }
        })
        .catch(err => console.error('Failed to log copy', err));

      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getToolBadgeColor = (tool) => {
    if (!tool) return 'bg-stone-800 text-stone-300';
    if (tool.includes('Midjourney') || tool.includes('Flux')) return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50';
    if (tool.includes('Kling') || tool.includes('Runway')) return 'bg-amber-950/80 text-amber-300 border-amber-700/50';
    if (tool.includes('ElevenLabs')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
    return 'bg-stone-800/80 text-stone-300 border-stone-700';
  };

  return (
    <div className="vintage-panel rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 flex flex-col justify-between group">
      {/* Header */}
      <div className="p-5 border-b border-stone-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-amber-500 font-semibold">
            {prompt.step_title ? prompt.step_title.split('—')[0].trim() : `STEP ${prompt.step_number}`}
          </span>

          <div className="flex items-center gap-2">
            {prompt.aspect_ratio && prompt.aspect_ratio !== 'N/A' && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-900/90 text-stone-400 border border-stone-800 flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                {prompt.aspect_ratio}
              </span>
            )}
            <span className="text-[11px] font-mono text-stone-500">
              คัดลอกแล้ว {prompt.copy_count || 0} ครั้ง
            </span>
          </div>
        </div>

        <h4 className="text-lg font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
          {prompt.title}
        </h4>
        {prompt.subtitle && (
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            {prompt.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getToolBadgeColor(prompt.recommended_tool)}`}>
            <Cpu className="w-3 h-3" />
            {prompt.recommended_tool || 'AI Model'}
          </span>

          {prompt.variables_schema && prompt.variables_schema.length > 0 && (
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                showCustomizer
                  ? 'bg-amber-600 text-stone-950 font-bold border-amber-500'
                  : 'bg-stone-900 border-amber-800/40 text-amber-400 hover:border-amber-600'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>ปรับแต่งตัวแปร ({prompt.variables_schema.length})</span>
            </button>
          )}

          {prompt.dialogue_script && (
            <button
              onClick={() => setShowDialogue(!showDialogue)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                showDialogue
                  ? 'bg-stone-700 text-stone-100 border-stone-500'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>บทพูดสคริปต์</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Image Thumbnail Preview */}
      {prompt.image_url && (
        <div className="relative h-44 w-full overflow-hidden bg-stone-950 border-b border-stone-800/80">
          <img
            src={prompt.image_url}
            alt={prompt.title}
            className="w-full h-full object-cover object-center filter saturate-75 contrast-125 opacity-75 hover:opacity-100 hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-amber-400/90 border border-amber-500/20">
            Reference Visual
          </div>
        </div>
      )}

      {/* Variable Customizer Accordion */}
      {showCustomizer && prompt.variables_schema && prompt.variables_schema.length > 0 && (
        <div className="p-4 bg-stone-950/90 border-b border-amber-900/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              ปรับแต่งค่าตัวแปรใน Prompt:
            </span>
            <span className="text-[11px] text-stone-500 font-normal">ระบบจะแทนที่ข้อความให้อัตโนมัติ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prompt.variables_schema.map(v => (
              <div key={v.key} className="space-y-1">
                <label className="text-[11px] text-stone-400 font-medium">
                  {v.label || v.key}
                </label>
                <input
                  type="text"
                  value={variables[v.key] || ''}
                  onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-lg text-amber-200 focus:outline-none focus:border-amber-500 font-mono"
                  placeholder={v.default}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue Script Accordion */}
      {showDialogue && prompt.dialogue_script && (
        <div className="p-4 bg-amber-950/20 border-b border-amber-900/40 text-xs text-amber-100 font-mono whitespace-pre-line leading-relaxed">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
            🎬 Script & Dialogue Beats:
          </div>
          {prompt.dialogue_script}
        </div>
      )}

      {/* Prompt Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="relative mb-4">
          <div className="font-mono text-xs text-stone-300 bg-stone-950/80 p-4 rounded-xl border border-stone-800/80 max-h-56 overflow-y-auto leading-relaxed selection:bg-amber-500/30">
            {processedContent}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            copied
              ? 'bg-emerald-600 text-white font-semibold shadow-emerald-900/30'
              : 'bg-stone-900 hover:bg-amber-600 text-stone-200 hover:text-stone-950 border border-stone-700 hover:border-amber-500 font-semibold group/btn'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>คัดลอก Prompt แล้ว! นำไปวางใน AI ได้เลย</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span>คลิกเพื่อคัดลอก Prompt (One-Click Copy)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
