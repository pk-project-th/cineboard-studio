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
  Volume2,
  Award
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
  mode = 'bulk_editor',
  projectMode = 'video',
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
  const activeProjectMode = preCommitDraft?.mode || prompts[0]?.mode || projectMode || 'video';
  const isPhoto = activeProjectMode === 'photo';

  const [draftTitle, setDraftTitle] = useState('');
  const [editableShots, setEditableShots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const source = isDraftMode && preCommitDraft?.shots ? preCommitDraft.shots : prompts;
    if (isDraftMode) {
      setDraftTitle(preCommitDraft.project_title || 'สตอรี่บอร์ดใหม่');
    }
    setEditableShots(
      source.map((s, idx) => ({
        ...s,
        id: s.id || `draft-${idx + 1}`,
        step_number: idx + 1,
        mode: s.mode || activeProjectMode,
        shot_role: s.shot_role || s.scene_title || `${isPhoto ? 'ภาพที่' : 'ฉากที่'} ${idx + 1}`,
        title: s.title || `${isPhoto ? 'ภาพที่' : 'ฉากที่'} ${idx + 1}`,
        camera_angle: s.camera_angle || 'Medium Shot',
        camera_movement: s.camera_movement || 'ถือกล้องนิ่ง',
        duration_seconds: isPhoto ? 0 : (s.duration_seconds || 2.5),
        master_photographer: s.master_photographer || '',
        depth_technique: s.depth_technique || '',
        story_meaning: s.story_meaning || '',
        pose_guide: s.pose_guide || '',
        lighting_tip: s.lighting_tip || '',
        transition_tip: s.transition_tip || '',
        action_description: s.action_description || s.title || '',
        on_screen_text: s.on_screen_text || '',
        live_action_guide: s.live_action_guide || '',
        dialogue_script: s.dialogue || s.dialogue_script || '',
        content: s.prompt || s.content || '',
        aspect_ratio: s.aspect_ratio || (isPhoto ? '4:5' : '9:16')
      }))
    );
  }, [isDraftMode, preCommitDraft, prompts, activeProjectMode, isPhoto]);

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
        mode: activeProjectMode,
        step_number: prev.length + 1,
        shot_role: isPhoto ? '✨ มุมเสริมไลฟ์สไตล์' : '✨ ฉากเสริม',
        title: `${isPhoto ? 'ภาพที่' : 'ฉากที่'} ${prev.length + 1}`,
        camera_angle: 'Medium Shot',
        camera_movement: 'ถือกล้องนิ่งระดับสายตา',
        duration_seconds: isPhoto ? 0 : 2.5,
        master_photographer: isPhoto ? 'Henri Cartier-Bresson — จังหวะธรรมชาติมีชีวิต' : '',
        depth_technique: isPhoto ? 'จัดองค์ประกอบ 3 ระยะ ฉากหน้า-ตัวแบบ-ฉากหลัง' : '',
        story_meaning: isPhoto ? 'เพิ่มมิติและความครบถ้วนให้อัลบั้มภาพ' : '',
        pose_guide: isPhoto ? 'โพสท่าสบายๆ ไม่เกร็งกล้อง' : '',
        action_description: 'ระบุรายละเอียดการถ่าย...',
        on_screen_text: '',
        live_action_guide: '📐 เว้นพื้นที่ด้านบน 25% สำหรับวางข้อความ',
        dialogue_script: '',
        content: 'Medium shot, natural golden daylight, editorial lifestyle photography, 8k',
        aspect_ratio: isPhoto ? '4:5' : '9:16'
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
            mode: activeProjectMode,
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
            mode: activeProjectMode,
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

  // PRINTABLE PRODUCTION TABLE VIEW
  if (mode === 'shotlist' && !isDraftMode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1440px] mx-auto">
        <div className="editorial-card p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3 no-print">
          <div>
            <h2 className="text-base font-extrabold">
              {isPhoto
                ? 'ตารางสรุปเซ็ตภาพนิ่งระดับช่างภาพโลก (Photo Shooting Sheet)'
                : 'ตารางสรุปแผนถ่ายทำวิดีโอไวรัล (Video Shooting Sheet)'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              สรุปครบทุกช็อตในหน้าเดียว พร้อมสั่งพิมพ์หรือบันทึกเป็นไฟล์ PDF ได้ทันที
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToBoard}
            className="btn-tactile px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าบอร์ด</span>
          </button>
        </div>

        <div className="editorial-card overflow-x-auto rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b text-[11px] font-bold uppercase"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                <th className="py-3 px-4 w-24">{isPhoto ? 'ภาพที่' : 'ฉาก / เวลา'}</th>
                <th className="py-3 px-4 w-44">ภาพไกด์ / AI</th>
                <th className="py-3 px-4 w-56">{isPhoto ? 'ช่างภาพเรฟ & มุมกล้อง' : 'มุมกล้อง & วิธีถือ'}</th>
                <th className="py-3 px-4">{isPhoto ? 'วิธีสร้างมิติ & แสง' : 'ถ่ายอะไรบ้าง (Action)'}</th>
                <th className="py-3 px-4 w-64">{isPhoto ? 'ความหมาย & ท่าโพส' : 'ข้อความบนจอ & เสียงพากย์'}</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
              {editableShots.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-black/[0.02]">
                  <td className="py-3 px-4 align-top">
                    <div className="font-mono font-black text-amber-600 text-sm">
                      #{String(idx + 1).padStart(2, '0')}
                    </div>
                    {!isPhoto && (
                      <div className="text-[11px] font-mono text-emerald-600 font-bold mt-0.5">
                        {s.duration_seconds || 2.5} วิ
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top">
                    {s.image_url && (
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="w-36 aspect-video object-cover rounded-lg border"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 align-top space-y-1">
                    <div className="font-bold">{s.title}</div>
                    {isPhoto && s.master_photographer && (
                      <div className="text-[11px] text-amber-700 font-semibold">
                        🏆 {s.master_photographer}
                      </div>
                    )}
                    <div className="text-[11px] text-sky-700 font-semibold">{s.camera_angle}</div>
                  </td>
                  <td className="py-3 px-4 align-top leading-relaxed">
                    <p>{isPhoto ? (s.depth_technique || s.action_description) : s.action_description}</p>
                    {s.lighting_tip && (
                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        {s.lighting_tip}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top space-y-1">
                    {isPhoto ? (
                      <>
                        <p className="font-semibold">{s.story_meaning}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          🧍 {s.pose_guide}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-amber-700">“{s.on_screen_text || '-'}”</div>
                        <div className="text-emerald-700 leading-relaxed">{s.dialogue_script || '-'}</div>
                      </>
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

  // BULK EDITOR MODE
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">
      <div className="sticky top-16 z-30 editorial-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white text-[11px] font-extrabold">
              {isDraftMode ? 'ตรวจและแก้แผนก่อนสร้างลงบอร์ด' : 'แก้ไขแผนทั้งหมดในหน้าเดียว'}
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
              ({editableShots.length} {isPhoto ? 'ภาพ' : 'ฉาก'})
            </span>
          </div>
          {isDraftMode && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                ชื่อโปรเจกต์:
              </span>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="px-3 py-1 rounded-lg border text-xs font-bold focus:outline-none focus:border-amber-600 w-60 sm:w-80"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDraftMode && (
            <button
              type="button"
              onClick={onCancelDraft}
              className="btn-tactile px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              ยกเลิก
            </button>
          )}

          <button
            type="button"
            onClick={handleAddShotRow}
            className="btn-tactile px-3.5 py-2 rounded-xl border text-xs font-bold text-emerald-700 flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่ม{isPhoto ? 'ภาพ' : 'ฉาก'}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveOnly}
            className="btn-tactile px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">บันทึกแล้ว</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-600" />
                <span>{isDraftMode ? 'บันทึกแผนลงบอร์ด' : 'บันทึกทั้งหมด'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAndRender}
            className="btn-tactile px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isDraftMode
                ? `ยืนยันสร้าง + วาดภาพ AI (${editableShots.length})`
                : 'บันทึก + วาดภาพ AI ใหม่'}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {editableShots.map((shot, idx) => {
          const isRenderingThis = !!renderingIds[shot.id];
          return (
            <div
              key={shot.id || idx}
              className="editorial-card rounded-2xl p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            >
              {/* Left */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-mono font-bold text-xs">
                    {isPhoto ? `ภาพที่ ${idx + 1}` : `ฉากที่ ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveShotRow(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>
                      มุมกล้อง
                    </label>
                    <select
                      value={shot.camera_angle || 'Medium Shot'}
                      onChange={(e) => handleFieldChange(idx, 'camera_angle', e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                    >
                      {CAMERA_ANGLES.map((ang) => (
                        <option key={ang} value={ang}>
                          {ang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!isPhoto && (
                    <div>
                      <label className="font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>
                        ความยาว (วินาที)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="15"
                        value={shot.duration_seconds || 2.5}
                        onChange={(e) =>
                          handleFieldChange(idx, 'duration_seconds', parseFloat(e.target.value) || 2.5)
                        }
                        className="w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:border-amber-600"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Middle */}
              <div className="lg:col-span-5 space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">ชื่อ{isPhoto ? 'ภาพ' : 'ฉาก'}</label>
                  <input
                    type="text"
                    value={shot.title}
                    onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border font-bold focus:outline-none focus:border-amber-600"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                  />
                </div>

                {isPhoto ? (
                  <>
                    <div>
                      <label className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>ช่างภาพเรฟเฟอเร้นระดับโลก</span>
                      </label>
                      <input
                        type="text"
                        value={shot.master_photographer || ''}
                        onChange={(e) => handleFieldChange(idx, 'master_photographer', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-sky-700 flex items-center gap-1 mb-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>วิธีสร้างมิติ (Composition & Depth)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={shot.depth_technique || ''}
                        onChange={(e) => handleFieldChange(idx, 'depth_technique', e.target.value)}
                        className="w-full p-2.5 rounded-xl border focus:outline-none focus:border-amber-600"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="font-bold text-sky-700 flex items-center gap-1 mb-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>ถ่ายอะไรบ้าง</span>
                      </label>
                      <textarea
                        rows={2}
                        value={shot.action_description}
                        onChange={(e) => handleFieldChange(idx, 'action_description', e.target.value)}
                        className="w-full p-2.5 rounded-xl border focus:outline-none focus:border-amber-600"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-700 flex items-center gap-1 mb-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>เสียงพากย์</span>
                      </label>
                      <textarea
                        rows={2}
                        value={shot.dialogue_script}
                        onChange={(e) => handleFieldChange(idx, 'dialogue_script', e.target.value)}
                        className="w-full p-2.5 rounded-xl border focus:outline-none focus:border-amber-600"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                    <Type className="w-3.5 h-3.5" />
                    <span>ข้อความพาดหัว / แคปชั่นบนภาพ</span>
                  </label>
                  <input
                    type="text"
                    value={shot.on_screen_text || ''}
                    onChange={(e) => handleFieldChange(idx, 'on_screen_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-600"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              {/* Right: AI Image Prompt */}
              <div className="lg:col-span-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-bold text-amber-600 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>AI IMAGE PROMPT (EN)</span>
                  </label>
                  {!isDraftMode && !shot.isNew && (
                    <button
                      type="button"
                      disabled={isRenderingThis}
                      onClick={() => onRenderSingleShot(shot.id, shot.content)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRenderingThis ? 'animate-spin' : ''}`} />
                      <span>วาดใหม่</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={shot.content}
                  onChange={(e) => handleFieldChange(idx, 'content', e.target.value)}
                  className="w-full p-3 rounded-xl border font-mono text-[11px] leading-relaxed focus:outline-none focus:border-amber-600"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
