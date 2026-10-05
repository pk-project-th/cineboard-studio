import React, { useState, useMemo, useEffect } from 'react';
import {
  X, FileText, Sparkles, Check, Play, Film, Copy, ArrowRight,
  Layers, Clapperboard, Camera, Zap, CheckCircle2, Sliders, Trash2, Plus, Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseMultiSceneScript } from '../utils/scriptParser';
import { resolveSketchTheme } from '../utils/storyboardHelper';

export const SAMPLE_ASMR_SCRIPT = `🎬 Content 1: Pure ASMR “The Sound of Japanese Craftsmanship”
Visual Style Reference (ใส่ต่อท้ายทุก Prompt): macro photography, hyper-realistic, soft natural daylight, premium automotive commercial style, sharp details.

Scene 1: เปิดพอร์ตชาร์จ (Charging Port)
Prompt: Macro close-up shot. A finger gently opening the sleek charging port door of a modern premium electric vehicle. Soft natural daylight reflecting on the glossy paint. High-end automotive photography, hyper-realistic.

Scene 2: ปลดล็อกฝากระโปรง (The Hood)
Prompt: Medium close-up shot from a low angle. A hand gently lifting the front hood of a sleek modern SUV. Focus on the solid mechanical joints and metallic texture. Cinematic lighting, photorealistic.

Scene 3: เสียงปิดประตู (The Solid Thud)
Prompt: Medium shot from the outside. A hand pushing a heavy, glossy SUV car door fully closed. The car has a deep, rich paint finish reflecting the modern surroundings. Premium automotive commercial style.

Scene 4: สัมผัสพวงมาลัย (Japanese Craftsmanship)
Prompt: Extreme close-up shot. A hand gently tracing the perfect stitching on a soft premium black leather steering wheel inside a luxury car. Warm natural sunlight filtering through the window, highlighting the rich texture. Japanese craftsmanship concept.

Scene 5: แป้นควบคุม (Center Commander)
Prompt: Macro shot. A finger rotating a premium metallic control dial on a luxury car's center console. Elegant interior, soft ambient lighting highlighting the brushed metal texture, highly detailed and precise.

Scene 6: ปุ่มปรับแอร์ (Human-Centric Design)
Prompt: Close-up shot. A finger turning a high-quality climate control knob on a modern car dashboard. Minimalist and elegant interior design, soft lighting, hyper-realistic.

Scene 7: หลังคาแก้ว (Panoramic Sunroof)
Prompt: Medium shot looking up from the back seat. A panoramic glass sunroof sliding open, revealing a clear blue sky. Bright natural light flooding into a premium car cabin with leather seats.

Scene 8: เปิดระบบ EV (Boot-up Screen)
Prompt: Macro shot. A glowing, futuristic digital dashboard instrument cluster in a modern electric vehicle waking up. Dark elegant cabin, high contrast, cinematic lighting, modern technology concept.`;

export const SAMPLE_CAFE_SCRIPT = `🎬 Special Roast: The Barista Journey
Visual Style: Warm editorial lighting, 35mm film grain, cinematic depth of field, cozy aesthetic.

Scene 1: Morning Light
Prompt: Wide establishing shot of an artisan coffee shop storefront with soft morning sunlight casting long shadows. Wood and brass accents.

Scene 2: Precision Weighing
Prompt: Extreme close-up shot of whole roasted specialty coffee beans pouring onto a digital scale plate, single origin Ethiopia Yirgacheffe.

Scene 3: The Grind
Prompt: Macro shot of grounds falling from conical burr grinder into a portafilter basket, rich aromatic textures.

Scene 4: Espresso Extraction
Prompt: Close-up eye level shot of rich golden crema espresso extracting smoothly into a clear glass demitasse cup.

Scene 5: Milk Steaming Velvet
Prompt: Medium shot of barista gently spinning silky microfoam milk in a stainless pitcher with steam wand.

Scene 6: Latte Art Flourish
Prompt: Over-the-shoulder top-down view pouring an intricate tulip latte art pattern into a ceramic cup.`;

const CAMERA_ANGLES = [
  { value: 'Macro Shot', label: 'Macro Shot (มาโครเจาะลึก)' },
  { value: 'Extreme Close-Up', label: 'Extreme Close-Up (โคลสอัพเจาะลึกพิเศษ)' },
  { value: 'Close-Up', label: 'Close-Up (โคลสอัพใกล้)' },
  { value: 'Medium Close-Up', label: 'Medium Close-Up (ปานกลางค่อนข้างใกล้)' },
  { value: 'Medium Shot', label: 'Medium Shot (ภาพมุมปานกลาง)' },
  { value: 'Over-the-Shoulder', label: 'Over-the-Shoulder (ข้ามหัวไหล่)' },
  { value: 'Wide Shot', label: 'Wide Shot (ภาพมุมกว้าง)' }
];

export default function ScriptImportModal({
  isOpen,
  onClose,
  onStoryboardCommitted,
  initialScript = ''
}) {
  const [rawScript, setRawScript] = useState(SAMPLE_ASMR_SCRIPT);
  const [activeTab, setActiveTab] = useState('raw'); // 'raw' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable fields for review tab
  const [projectTitle, setProjectTitle] = useState('');
  const [visualStyle, setVisualStyle] = useState('');
  const [editableShots, setEditableShots] = useState([]);

  // Parse whenever rawScript changes
  const parsed = useMemo(() => {
    return parseMultiSceneScript(rawScript);
  }, [rawScript]);

  // Sync parsed result into editable state
  useEffect(() => {
    if (parsed && parsed.shots) {
      setProjectTitle(parsed.project_title || 'โปรเจกต์สตอรี่บอร์ดงานภาพยนตร์');
      setVisualStyle(parsed.visual_style || 'ภาพยนตร์พรีเมียม (Macro Cinematic Commercial)');
      setEditableShots(parsed.shots.map((s, idx) => ({ ...s, id: idx + 1 })));
    }
  }, [parsed]);

  // When initialScript is passed from outside
  useEffect(() => {
    if (initialScript && initialScript.trim()) {
      setRawScript(initialScript);
      setActiveTab('edit'); // open directly in edit tab for quick review!
    }
  }, [initialScript, isOpen]);

  if (!isOpen) return null;

  // Append visual style to all shot prompts
  const handleAppendStyleToAll = () => {
    if (!visualStyle.trim()) return;
    const cleanStyle = visualStyle.trim().replace(/^[,\s]+/, '');
    const updated = editableShots.map(s => {
      let p = s.prompt.trim();
      if (!p.toLowerCase().includes(cleanStyle.toLowerCase())) {
        p = `${p}, ${cleanStyle}`;
      }
      return { ...s, prompt: p };
    });
    setEditableShots(updated);
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ['#F71C25', '#bef264', '#facc15']
    });
  };

  // Modify individual shot field
  const handleUpdateShot = (index, field, value) => {
    setEditableShots(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Delete shot
  const handleDeleteShot = (index) => {
    setEditableShots(prev => prev.filter((_, i) => i !== index));
  };

  // Add new shot
  const handleAddShot = () => {
    const nextNum = editableShots.length + 1;
    const newShot = {
      id: nextNum,
      shot_number: nextNum,
      scene_number: nextNum,
      title: `ฉากที่ ${nextNum}: ช็อตใหม่`,
      prompt: visualStyle ? `Cinematic shot, ${visualStyle}` : 'Cinematic shot',
      camera_angle: 'Medium Shot',
      camera_angle_th: 'ภาพมุมปานกลาง',
      camera_movement: 'Slow push-in',
      lens_focal: '50mm f/1.8',
      audio_foley: 'เสียงบรรยากาศ ASMR คมชัดสมจริง',
      duration_seconds: 4.0,
      action_description: 'ช็อตใหม่'
    };
    setEditableShots(prev => [...prev, newShot]);
  };

  // Commit and create storyboard
  const handleCommit = async () => {
    const shotsToSave = activeTab === 'edit' ? editableShots : (parsed?.shots || []);
    if (!shotsToSave || shotsToSave.length === 0) {
      alert('ไม่พบฉากที่สามารถนำเข้าได้ กรุณาตรวจสอบรูปแบบ เช่น Scene 1: ... หรือ ฉากที่ 1: ...');
      return;
    }

    // Re-resolve sketch themes for each shot based on latest prompts
    const finalizedShots = shotsToSave.map((s, idx) => {
      const theme = resolveSketchTheme(s);
      return {
        ...s,
        shot_number: idx + 1,
        scene_number: s.scene_number || (idx + 1),
        sketch_theme: theme
      };
    });

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: finalizedShots,
          project_title: projectTitle || parsed?.project_title || 'โปรเจกต์สตอรี่บอร์ดงานภาพยนตร์',
          visual_style: visualStyle || parsed?.visual_style || 'ภาพยนตร์พรีเมียม (Macro Cinematic Commercial)',
          target_duration: finalizedShots.reduce((acc, cur) => acc + (cur.duration_seconds || 4), 0)
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        confetti({
          particleCount: 65,
          spread: 80,
          origin: { y: 0.75 },
          colors: ['#F71C25', '#bef264', '#facc15']
        });

        if (onStoryboardCommitted) {
          onStoryboardCommitted({
            series_id: data.series_id,
            project_title: projectTitle || parsed?.project_title,
            data: data.data
          });
        }
        onClose();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการนำเข้าสตอรี่บอร์ด');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shotCount = activeTab === 'edit' ? editableShots.length : (parsed?.shots?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/65 backdrop-blur-md select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl text-stone-900 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25] font-black shadow-2xs">
              <FileText className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F71C25] px-2 py-0.5 rounded-md bg-red-50 border border-red-200">
                  Script &amp; Prompt Director
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                  100% Offline • ไม่ต้องใช้ Groq
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-950 mt-0.5">
                นำเข้าบทและแก้ไข Prompt ทุกช็อตก่อนแตกบอร์ด
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

        {/* Navigation Tabs Switcher */}
        <div className="px-5 py-2.5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-white text-stone-900 border border-stone-300 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>📋 1. วางสคริปต์ข้อความ (Raw Text)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-gradient-to-r from-[#F71C25] to-[#FF4438] text-white shadow-sm shadow-red-500/20'
                  : 'text-stone-700 hover:bg-stone-200/60 bg-red-50 border border-red-200/60'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ 2. ตรวจสอบ &amp; แก้ไข Prompt ทุกช็อต ({shotCount} ช็อต)</span>
            </button>
          </div>

          {activeTab === 'edit' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleAppendStyleToAll}
                className="px-2.5 py-1.5 rounded-xl bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                title="เติม Visual Style Reference ต่อท้ายทุก Prompt อัตโนมัติ"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
                <span className="hidden sm:inline">✨ เติม Visual Style ต่อท้ายทุก Prompt</span>
                <span className="sm:hidden">+ Visual Style</span>
              </button>

              <button
                type="button"
                onClick={handleAddShot}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                title="เพิ่มช็อตใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มช็อต</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          {activeTab === 'raw' ? (
            /* TAB 1: RAW TEXT INPUT */
            <div className="space-y-4">
              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-500 font-mono">
                  เลือกบทตัวอย่าง:
                </span>
                <button
                  type="button"
                  onClick={() => setRawScript(SAMPLE_ASMR_SCRIPT)}
                  className="px-3 py-1.5 rounded-xl bg-[#FDF8EE] hover:bg-[#FBEFC5] border border-[#EADBBD] text-xs font-bold text-stone-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
                  <span>🎬 ASMR งานประกอบญี่ปุ่น (8 ฉาก)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRawScript(SAMPLE_CAFE_SCRIPT)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Film className="w-3.5 h-3.5 text-stone-600" />
                  <span>☕ ไวรัลคาเฟ่กาแฟ Specialty (6 ฉาก)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRawScript('')}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-600 border border-stone-200 text-xs font-medium text-stone-500 transition-all cursor-pointer ml-auto"
                >
                  ล้างข้อความ
                </button>
              </div>

              {/* Text Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <span>วางบทหรือ Prompt ที่มีหลายฉากที่นี่:</span>
                    <span className="text-[11px] font-normal text-stone-500">
                      (รองรับ Scene 1..N, ฉากที่ 1..N, Shot 1..N)
                    </span>
                  </label>
                  {parsed && parsed.shots && parsed.shots.length > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      ✓ ตรวจพบ {parsed.shots.length} ฉากสำเร็จ
                    </span>
                  )}
                </div>

                <textarea
                  rows={9}
                  value={rawScript}
                  onChange={(e) => setRawScript(e.target.value)}
                  placeholder="วาง Prompt ที่นี่ เช่น...&#10;🎬 Content 1: Pure ASMR “The Sound of Japanese Craftsmanship”&#10;Scene 1: Smart Access&#10;Prompt: Close-up shot...&#10;Scene 2: Unpeeling Screen&#10;Prompt: Macro shot..."
                  className="w-full bg-[#FAF9F5] border border-stone-300 focus:border-[#F71C25] rounded-2xl p-4 text-xs font-mono text-stone-900 focus:outline-none transition-colors shadow-inner resize-y leading-relaxed"
                />
              </div>

              {/* Call-to-action button to jump to prompt editor */}
              {parsed && parsed.shots && parsed.shots.length > 0 && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        ระบบตรวจจับ {parsed.shots.length} ช็อตเรียบร้อยแล้ว: "{parsed.project_title}"
                      </p>
                      <p className="text-[11px] text-stone-600">
                        คุณสามารถกดปุ่มเพื่อเข้าไปตรวจสอบและแก้ไข Prompt ของแต่ละฉากก่อนแตกบอร์ดได้
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer flex-shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span>แก้ไข Prompt ทุกช็อต →</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: REVIEW & EDIT ALL PROMPTS BEFORE SPLITTING */
            <div className="space-y-4">
              {/* Project Meta Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200">
                <div>
                  <label className="text-[11px] font-mono font-bold text-stone-600 block mb-1">
                    ชื่อโปรเจกต์สตอรี่บอร์ด:
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 focus:border-[#F71C25] text-xs font-bold text-stone-900 outline-none"
                    placeholder="ชื่อเรื่อง..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono font-bold text-stone-600 block mb-1">
                    Visual Style Reference (สไตล์ภาพรวม):
                  </label>
                  <input
                    type="text"
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 focus:border-[#F71C25] text-xs font-mono text-stone-900 outline-none"
                    placeholder="macro photography, hyper-realistic, soft natural daylight..."
                  />
                </div>
              </div>

              {/* Shot List Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>รายการ Prompt ของทั้ง {editableShots.length} ช็อต (แก้ไขได้อิสระ):</span>
                  </h3>
                  <span className="text-[11px] font-mono text-stone-500">
                    รูปภาพสเก็ตช์จะปรับตามคำสำคัญใน Prompt อัตโนมัติ
                  </span>
                </div>

                <div className="space-y-3">
                  {editableShots.map((shot, idx) => (
                    <div
                      key={shot.id || idx}
                      className="bg-white border border-stone-200/90 hover:border-[#F71C25]/50 rounded-2xl p-3.5 shadow-2xs transition-all space-y-2.5"
                    >
                      {/* Shot Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FBEFC5] border border-[#E5D7A3] text-[11px] font-mono font-extrabold text-stone-900 flex-shrink-0">
                            ช็อตที่ {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={shot.title || ''}
                            onChange={(e) => handleUpdateShot(idx, 'title', e.target.value)}
                            className="text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 focus:bg-white px-2.5 py-1 rounded-lg border border-stone-200 focus:border-[#F71C25] outline-none flex-1 min-w-0"
                            placeholder={`ฉากที่ ${idx + 1}: ชื่อฉาก`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteShot(idx)}
                          className="p-1.5 rounded-lg bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer flex-shrink-0"
                          title="ลบช็อตนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Prompt Textarea */}
                      <div>
                        <label className="text-[11px] font-mono font-bold text-stone-700 block mb-1">
                          Prompt สำหรับฉากนี้ (สำหรับสร้างภาพ / วิดีโอ):
                        </label>
                        <textarea
                          rows={3}
                          value={shot.prompt || ''}
                          onChange={(e) => handleUpdateShot(idx, 'prompt', e.target.value)}
                          placeholder="กรอกคำสั่ง Prompt ของฉากนี้..."
                          className="w-full bg-[#FAF9F5] focus:bg-white border border-stone-300 focus:border-[#F71C25] rounded-xl p-2.5 text-xs font-mono text-stone-900 focus:outline-none transition-colors leading-relaxed resize-y"
                        />
                      </div>

                      {/* Camera Angle & Sound Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-mono text-stone-500 block mb-0.5">
                            มุมกล้อง (Camera Angle):
                          </label>
                          <select
                            value={shot.camera_angle || 'Medium Shot'}
                            onChange={(e) => handleUpdateShot(idx, 'camera_angle', e.target.value)}
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
                            เสียง Foley ASMR / บรรยากาศ:
                          </label>
                          <input
                            type="text"
                            value={shot.audio_foley || ''}
                            onChange={(e) => handleUpdateShot(idx, 'audio_foley', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs outline-none font-sans"
                            placeholder="เสียงสัมผัสวัสดุ..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Shot Button at bottom */}
                <button
                  type="button"
                  onClick={handleAddShot}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#F71C25] hover:bg-red-50/50 text-stone-600 hover:text-[#F71C25] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ เพิ่มช็อตใหม่ต่อท้าย (Add Shot)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-stone-200 bg-[#FAF9F5] flex items-center justify-between">
          <div className="text-xs font-mono text-stone-500">
            <span>พร้อมสร้าง <strong className="text-stone-900 font-bold">{shotCount} ช็อต</strong> เป็นโปรเจกต์ใหม่</span>
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
              onClick={handleCommit}
              disabled={isSubmitting || shotCount === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {isSubmitting
                  ? 'กำลังสร้างสตอรี่บอร์ด...'
                  : `สร้างโปรเจกต์ทั้ง ${shotCount} ช็อตทันที`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
