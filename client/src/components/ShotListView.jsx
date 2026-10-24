import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Film,
  Camera,
  Clock,
  ArrowLeft,
  Copy
} from 'lucide-react';

const CAMERA_ANGLES = [
  'Wide Establishing Shot',
  'Medium Shot',
  'Medium Close-up',
  'Close-up Shot',
  'Extreme Close-up / Macro',
  'Low Angle Hero Shot',
  'Over-the-Shoulder Shot',
  'High Angle / Bird Eye'
];

export default function ShotListView({
  mode = 'bulk_editor', // 'bulk_editor' | 'shotlist'
  prompts = [],
  preCommitDraft = null, // When non-null, user is reviewing/editing planned shots BEFORE committing to board
  onCancelDraft,
  onCommitDraftAndRender,
  onSaveBulkEdits,
  onSaveBulkAndRenderAll,
  onRenderSingleShot,
  renderingIds = {},
  onBackToBoard
}) {
  const isDraftMode = !!preCommitDraft;
  const [draftTitle, setDraftTitle] = useState('');
  const [editableShots, setEditableShots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isDraftMode && preCommitDraft?.shots) {
      setDraftTitle(preCommitDraft.project_title || 'สตอรี่บอร์ดใหม่');
      setEditableShots(
        preCommitDraft.shots.map((s, idx) => ({
          id: s.id || `draft-${idx + 1}`,
          step_number: idx + 1,
          title: s.title || `ช็อตที่ ${idx + 1}`,
          camera_angle: s.camera_angle || 'Medium Shot',
          duration_seconds: s.duration_seconds || 3,
          action_description: s.action_description || s.title || '',
          dialogue_script: s.dialogue || s.dialogue_script || '',
          content: s.prompt || s.content || '',
          video_prompt: s.video_prompt || '',
          aspect_ratio: s.aspect_ratio || preCommitDraft.aspect_ratio || '16:9',
          image_url: s.image_url || ''
        }))
      );
    } else {
      setEditableShots(
        prompts.map((p, idx) => ({
          ...p,
          step_number: idx + 1,
          title: p.title || `ช็อตที่ ${idx + 1}`,
          camera_angle: p.camera_angle || 'Medium Shot',
          duration_seconds: p.duration_seconds || 3,
          action_description: p.action_description || '',
          dialogue_script: p.dialogue_script || '',
          content: p.content || '',
          video_prompt: p.video_prompt || ''
        }))
      );
    }
  }, [isDraftMode, preCommitDraft, prompts]);

  const handleFieldChange = (index, field, value) => {
    setEditableShots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddShotRow = () => {
    setEditableShots((prev) => [
      ...prev,
      {
        id: `new-shot-${Date.now()}`,
         isNew: true,
        step_number: prev.length + 1,
        title: `ฉากที่ ${prev.length + 1}`,
        camera_angle: 'Medium Shot',
        duration_seconds: 3,
        action_description: 'ระบุรายละเอียดแอคชั่นในฉากนี้...',
        dialogue_script: '',
        content: 'Medium shot, cinematic lighting, photorealistic, 8k resolution, sharp focus',
        video_prompt: 'Smooth cinematic camera motion',
        aspect_ratio: preCommitDraft?.aspect_ratio || prompts[0]?.aspect_ratio || '16:9'
      }
    ]);
  };

  const handleRemoveShotRow = (index) => {
    setEditableShots((prev) =>
      prev.filter((_, i) => i !== index).map((s, idx) => ({ ...s, step_number: idx + 1 }))
    );
  };

  const handleSaveOnly = async () => {
    setSaving(true);
    try {
      if (isDraftMode) {
        await onCommitDraftAndRender(
          {
            ...preCommitDraft,
            project_title: draftTitle,
            shots: editableShots
          },
          false // commit without auto-rendering all if user only clicked save
        );
      } else {
        await onSaveBulkEdits(editableShots);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndRender = async () => {
    setSaving(true);
    try {
      if (isDraftMode) {
        await onCommitDraftAndRender(
          {
            ...preCommitDraft,
            project_title: draftTitle,
            shots: editableShots
          },
          true // commit AND auto-render FLUX.1 images for all shots!
        );
      } else {
        await onSaveBulkAndRenderAll(editableShots);
      }
    } finally {
      setSaving(false);
    }
  };

  // TABLE VIEW ('shotlist')
  if (mode === 'shotlist' && !isDraftMode) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between bg-[#11151E] p-4 rounded-2xl border border-slate-800 no-print">
          <div>
            <h2 className="text-base font-extrabold text-white">ตารางกำกับการถ่ายทำ (Production Shot List)</h2>
            <p className="text-xs text-slate-400">สรุปรายการช็อต มุมกล้อง แอคชั่น และ Prompt สำหรับทีมโปรดักชันหรือพิมพ์ PDF</p>
          </div>
          <button
            onClick={onBackToBoard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าบอร์ดภาพ</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#11151E]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0D1017] text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4 w-16">ช็อต</th>
                <th className="py-3 px-4 w-44">ภาพตัวอย่าง</th>
                <th className="py-3 px-4 w-48">ชื่อฉาก / มุมกล้อง</th>
                <th className="py-3 px-4">แอคชั่น & บทพูด (TH)</th>
                <th className="py-3 px-4">AI Image Prompt (EN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {editableShots.map((s, idx) => {
                const isSvg = !s.image_url || s.image_url.startsWith('data:image/svg+xml');
                return (
                  <tr key={s.id || idx} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-black text-amber-400 align-top">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 align-top">
                      {!isSvg ? (
                        <img
                          src={s.image_url}
                          alt={s.title}
                          className="w-36 aspect-video object-cover rounded-lg border border-slate-700"
                        />
                      ) : (
                        <div className="w-36 aspect-video rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                          ยังไม่ได้วาดภาพ
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top space-y-1">
                      <div className="font-bold text-white">{s.title}</div>
                      <div className="text-[11px] text-amber-300 font-mono">{s.camera_angle}</div>
                      <div className="text-[11px] text-slate-400">{s.duration_seconds || 3} วินาที</div>
                    </td>
                    <td className="py-3 px-4 align-top space-y-1 text-slate-200">
                      <p>{s.action_description}</p>
                      {s.dialogue_script && (
                        <p className="text-[11px] text-emerald-300 italic">"{s.dialogue_script}"</p>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top font-mono text-[11px] text-slate-300">
                      {s.content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // BULK PROMPT & SCRIPT EDITOR MODE
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Sticky Editor Top Action Bar */}
      <div className="sticky top-16 z-30 bg-[#131824]/95 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[11px] font-black uppercase">
              {isDraftMode ? 'ตรวจและแก้ไข Prompt ก่อนวาดภาพ' : 'แก้ไขบทและ Prompt ทั้งหมด'}
            </span>
            <span className="text-xs font-mono text-slate-400">({editableShots.length} ช็อต)</span>
          </div>
          {isDraftMode ? (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">ชื่อโปรเจกต์:</span>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#0B0D11] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500 w-64 sm:w-80"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-300">
              ปรับแก้ชื่อฉาก แอคชั่นภาษาไทย และคำสั่ง AI Prompt ภาษาอังกฤษของทุกช็อตได้ในหน้าเดียว
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDraftMode && (
            <button
              type="button"
              onClick={onCancelDraft}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              ยกเลิก
            </button>
          )}

          <button
            type="button"
            onClick={handleAddShotRow}
            className="px-3.5 py-2 rounded-xl bg-[#1A2130] hover:bg-[#232C40] border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มช็อตใหม่</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveOnly}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">บันทึกแล้ว!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{isDraftMode ? 'บันทึกช็อตลงบอร์ด' : 'บันทึกการแก้ไขทั้งหมด'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAndRender}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isDraftMode
                ? `ยืนยันแตกช็อต + วาดภาพ AI ทั้ง ${editableShots.length} ช็อตทันที`
                : 'บันทึก + สั่งวาดภาพ AI ใหม่ทุกช็อต'}
            </span>
          </button>
        </div>
      </div>

      {/* List of Editable Shots */}
      <div className="space-y-4">
        {editableShots.map((shot, idx) => {
          const isSvg = !shot.image_url || shot.image_url.startsWith('data:image/svg+xml');
          const isRenderingThis = !!renderingIds[shot.id];

          return (
            <div
              key={shot.id || idx}
              className="studio-card rounded-2xl p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            >
              {/* Left Column (3 cols): Shot Number, Preview Thumbnail & Camera Settings */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs">
                    SHOT {String(idx + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveShotRow(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="ลบช็อตนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Mini Preview if committed */}
                {!isDraftMode && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[#090B0E] border border-slate-800">
                    {!isSvg ? (
                      <img src={shot.image_url} alt={shot.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
                        ยังไม่มีภาพจริง
                      </div>
                    )}
                    {isRenderingThis && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[11px] font-bold text-amber-300 gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังวาดภาพ...</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      มุมกล้อง (Camera Angle)
                    </label>
                    <select
                      value={shot.camera_angle || 'Medium Shot'}
                      onChange={(e) => handleFieldChange(idx, 'camera_angle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {CAMERA_ANGLES.map((ang) => (
                        <option key={ang} value={ang} className="bg-[#131720]">
                          {ang}
                        </option>
                      ))}
                      {!CAMERA_ANGLES.includes(shot.camera_angle) && shot.camera_angle && (
                        <option value={shot.camera_angle} className="bg-[#131720]">
                          {shot.camera_angle}
                        </option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      ความยาวช็อต (วินาที)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="15"
                      value={shot.duration_seconds || 3}
                      onChange={(e) => handleFieldChange(idx, 'duration_seconds', parseFloat(e.target.value) || 3)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Middle Column (4 cols): Thai Title, Action Description & Dialogue */}
              <div className="lg:col-span-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    ชื่อฉาก / ชื่อช็อต (ภาษาไทย)
                  </label>
                  <input
                    type="text"
                    value={shot.title}
                    onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500 text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    แอคชั่น / สิ่งที่เกิดขึ้นในฉาก (ภาษาไทย)
                  </label>
                  <textarea
                    rows={3}
                    value={shot.action_description}
                    onChange={(e) => handleFieldChange(idx, 'action_description', e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500 text-xs text-slate-200 leading-relaxed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    บทพูด / เสียงประกอบ ASMR (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={shot.dialogue_script}
                    onChange={(e) => handleFieldChange(idx, 'dialogue_script', e.target.value)}
                    placeholder="เช่น เสียงปิดประตูรถแน่นทุ้ม, เสียงพูด..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column (5 cols): English Image Prompt (for FLUX.1 / Midjourney) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>PROMPT ภาษาอังกฤษสำหรับวาดภาพ AI (FLUX.1)</span>
                  </label>

                  {!isDraftMode && !shot.isNew && (
                    <button
                      type="button"
                      disabled={isRenderingThis}
                      onClick={() => onRenderSingleShot(shot.id, shot.content)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRenderingThis ? 'animate-spin' : ''}`} />
                      <span>วาดช็อตนี้ใหม่</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={5}
                  value={shot.content}
                  onChange={(e) => handleFieldChange(idx, 'content', e.target.value)}
                  placeholder="Macro close-up shot, hyper-realistic, soft natural daylight..."
                  className="w-full p-3 rounded-xl bg-[#07090D] border border-slate-800 focus:border-amber-500 text-xs font-mono text-amber-100/90 leading-relaxed focus:outline-none"
                />

                <p className="text-[11px] text-slate-400">
                  💡 สามารถแก้ไขคำสั่ง Prompt ภาษาอังกฤษด้านบนให้ตรงใจที่สุด แล้วกดปุ่มสีส้มด้านบนเพื่อสั่งวาดภาพจริงพร้อมกันทุกช็อตได้เลยครับ
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
