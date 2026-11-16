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
  ArrowLeft,
  Type,
  Volume2
} from 'lucide-react';

const CAMERA_ANGLES = [
  'Wide Establishing Shot',
  'Medium Shot',
  'Medium Close-up',
  'Close-up Shot',
  'Extreme Close-up / Macro',
  'Low Angle Hero Shot',
  'Over-the-Shoulder Shot',
  'POV Reveal Shot',
  'High Angle / Bird Eye'
];

export default function ShotListView({
  mode = 'bulk_editor', // 'bulk_editor' | 'shotlist'
  prompts = [],
  preCommitDraft = null,
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
          shot_role: s.shot_role || s.scene_title || `ฉากที่ ${idx + 1}`,
          title: s.title || `ฉากที่ ${idx + 1}`,
          camera_angle: s.camera_angle || 'Medium Shot',
          camera_movement: s.camera_movement || 'ถือกล้องนิ่ง / แพนช้าๆ',
          duration_seconds: s.duration_seconds || 3,
          action_description: s.action_description || s.title || '',
          on_screen_text: s.on_screen_text || '',
          live_action_guide:
            s.live_action_guide || '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความพาดหัว',
          dialogue_script: s.dialogue || s.dialogue_script || '',
          content: s.prompt || s.content || '',
          video_prompt: s.video_prompt || '',
          aspect_ratio: s.aspect_ratio || preCommitDraft.aspect_ratio || '9:16',
          image_url: s.image_url || ''
        }))
      );
    } else {
      setEditableShots(
        prompts.map((p, idx) => ({
          ...p,
          step_number: idx + 1,
          shot_role: p.shot_role || p.scene_title || `ฉากที่ ${idx + 1}`,
          title: p.title || `ฉากที่ ${idx + 1}`,
          camera_angle: p.camera_angle || 'Medium Shot',
          camera_movement: p.camera_movement || 'ถือกล้องนิ่ง / แพนช้าๆ',
          duration_seconds: p.duration_seconds || 3,
          action_description: p.action_description || '',
          on_screen_text: p.on_screen_text || '',
          live_action_guide:
            p.live_action_guide || '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความพาดหัว',
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
        shot_role: '✨ ฉากเสริม',
        title: `ฉากที่ ${prev.length + 1}`,
        camera_angle: 'Medium Shot',
        camera_movement: 'ถือกล้องนิ่งระดับสายตา',
        duration_seconds: 3,
        action_description: 'ระบุว่าฉากนี้ต้องถ่ายอะไร...',
        on_screen_text: `ข้อความพาดหัวฉากที่ ${prev.length + 1}`,
        live_action_guide: '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความ',
        dialogue_script: '',
        content: 'Medium shot, natural daylight, travel lifestyle photography, 8k',
        video_prompt: 'Smooth cinematic camera motion',
        aspect_ratio: preCommitDraft?.aspect_ratio || prompts[0]?.aspect_ratio || '9:16'
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
          false
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
          true
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
            <h2 className="text-base font-extrabold text-white">
              ตารางสรุปแผนการถ่ายทำ (Production Shooting Sheet)
            </h2>
            <p className="text-xs text-slate-400">
              สรุปครบทุกฉาก: เวลา มุมกล้อง ถ่ายอะไร ข้อความบนจอ และบทพากย์ (สั่งพิมพ์ PDF ได้ทันที)
            </p>
          </div>
          <button
            onClick={onBackToBoard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าบอร์ดสตอรี่บอร์ด</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#11151E]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0D1017] text-[11px] font-bold text-slate-300 uppercase">
                <th className="py-3 px-4 w-20">ฉาก / เวลา</th>
                <th className="py-3 px-4 w-44">ภาพไกด์ / AI</th>
                <th className="py-3 px-4 w-52">มุมกล้อง & วิธีถือถ่าย</th>
                <th className="py-3 px-4">ถ่ายอะไรบ้าง (Action)</th>
                <th className="py-3 px-4 w-60">ข้อความบนจอ & จุดเว้นเฟรม</th>
                <th className="py-3 px-4 w-64">เสียงพากย์ (Voiceover)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {editableShots.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 align-top">
                    <div className="font-mono font-black text-amber-400 text-sm">
                      #{String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-300 font-bold mt-0.5">
                      {s.duration_seconds || 3} วินาที
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="w-36 aspect-video object-cover rounded-lg border border-slate-700"
                      />
                    ) : null}
                  </td>
                  <td className="py-3 px-4 align-top space-y-1">
                    <div className="font-bold text-white">{s.title}</div>
                    <div className="text-[11px] text-sky-300 font-semibold">{s.camera_angle}</div>
                    <div className="text-[11px] text-slate-400">{s.camera_movement}</div>
                  </td>
                  <td className="py-3 px-4 align-top text-slate-200 leading-relaxed">
                    {s.action_description}
                  </td>
                  <td className="py-3 px-4 align-top space-y-1">
                    <div className="font-bold text-amber-300">“{s.on_screen_text || '-'}”</div>
                    <div className="text-[11px] text-slate-400">{s.live_action_guide}</div>
                  </td>
                  <td className="py-3 px-4 align-top space-y-1">
                    <div className="text-emerald-200 leading-relaxed">{s.dialogue_script || '-'}</div>
                    {s.audio_foley && (
                      <div className="text-[10px] text-slate-400">🎵 {s.audio_foley}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // BULK PROMPT & SCRIPT EDITOR MODE
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="sticky top-16 z-30 bg-[#131824]/95 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[11px] font-black uppercase">
              {isDraftMode ? 'ตรวจและแก้แผนทุกฉากก่อนสร้างจริง' : 'แก้ไขแผนการถ่ายทำทั้งหมด'}
            </span>
            <span className="text-xs font-mono text-slate-400">({editableShots.length} ฉาก)</span>
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
              ปรับแก้เวลา มุมกล้อง แอคชั่น ข้อความพาดหัว และบทพากย์ของทุกฉากได้ในหน้าเดียว
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
            <span>เพิ่มฉากใหม่</span>
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
                <span>{isDraftMode ? 'บันทึกแผนลงบอร์ด (ยังไม่วาด AI)' : 'บันทึกการแก้ไขทั้งหมด'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAndRender}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isDraftMode
                ? `ยืนยันสร้าง ${editableShots.length} ฉาก + วาดภาพ AI`
                : 'บันทึก + วาดภาพ AI ใหม่ทุกฉาก'}
            </span>
          </button>
        </div>
      </div>

      {/* List of Editable Shots */}
      <div className="space-y-4">
        {editableShots.map((shot, idx) => {
          const isRenderingThis = !!renderingIds[shot.id];

          return (
            <div
              key={shot.id || idx}
              className="studio-card rounded-2xl p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            >
              {/* Left Column (3 cols): Scene #, Camera Angle & Duration */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs">
                    ฉากที่ {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveShotRow(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="ลบฉากนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

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
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      ความยาวฉาก (วินาที)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="15"
                      value={shot.duration_seconds || 3}
                      onChange={(e) =>
                        handleFieldChange(idx, 'duration_seconds', parseFloat(e.target.value) || 3)
                      }
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Middle Column (5 cols): Title, What to Shoot, On-Screen Text, Voiceover */}
              <div className="lg:col-span-5 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    ชื่อฉาก
                  </label>
                  <input
                    type="text"
                    value={shot.title}
                    onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500 text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-sky-400 flex items-center gap-1 mb-1">
                    <Camera className="w-3 h-3" />
                    <span>ถ่ายอะไรบ้าง (Action)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={shot.action_description}
                    onChange={(e) => handleFieldChange(idx, 'action_description', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-sky-400 text-xs text-slate-200 leading-relaxed focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1">
                      <Type className="w-3 h-3" />
                      <span>ข้อความพาดหัวบนจอ</span>
                    </label>
                    <input
                      type="text"
                      value={shot.on_screen_text || ''}
                      onChange={(e) => handleFieldChange(idx, 'on_screen_text', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-400 text-xs text-amber-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      การเว้นที่ว่างในเฟรม
                    </label>
                    <input
                      type="text"
                      value={shot.live_action_guide || ''}
                      onChange={(e) => handleFieldChange(idx, 'live_action_guide', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-400 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                    <Volume2 className="w-3 h-3" />
                    <span>เสียงพากย์ (Voiceover)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={shot.dialogue_script}
                    onChange={(e) => handleFieldChange(idx, 'dialogue_script', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-emerald-400 text-xs text-emerald-100 leading-relaxed focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column (4 cols): English Image Prompt */}
              <div className="lg:col-span-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>AI IMAGE PROMPT (EN)</span>
                  </label>

                  {!isDraftMode && !shot.isNew && (
                    <button
                      type="button"
                      disabled={isRenderingThis}
                      onClick={() => onRenderSingleShot(shot.id, shot.content)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRenderingThis ? 'animate-spin' : ''}`} />
                      <span>วาดฉากนี้ใหม่</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={5}
                  value={shot.content}
                  onChange={(e) => handleFieldChange(idx, 'content', e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#07090D] border border-slate-800 focus:border-amber-500 text-xs font-mono text-amber-100/90 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
