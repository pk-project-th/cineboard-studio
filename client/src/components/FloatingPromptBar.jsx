import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles, Image as ImageIcon, Plus, ChevronDown, Check,
  Sliders, Maximize2, Layers, Cpu, Flame, Play, AlertCircle,
  Zap, ShieldCheck, Paperclip, X, Upload, Loader2, Eye,
  FileText, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseMultiSceneScript } from '../utils/scriptParser';

const MODELS = [
  { id: 'gemini-image', name: 'Gemini 3.1 Flash-Lite Image', provider: 'Google AI', badge: 'Active' },
  { id: 'groq', name: 'Groq LPU (Ultra-Fast)', provider: 'Groq Cloud', badge: 'Active' },
  { id: 'gemini', name: 'Gemini 3.8 Flash', provider: 'Google AI', badge: 'Active' },
  { id: 'studio', name: 'Studio High-Res Engine', provider: 'PK Engine', badge: 'Active' }
];

export default function FloatingPromptBar({
  onGenerateNewPrompt,
  onStoryboardCommitted,
  selectedItem,
  onQuickSelectPrompt,
  onOpenGroqModal,
  onOpenScriptImporter,
  customPromptSeed,
  selectedSeriesId = 'all',
  seriesList = [],
  onStartNewProject,
  onAppendShotToCurrent
}) {
  const [promptText, setPromptText] = useState(
    'ขอสตอรี่บอร์ดในการไปเที่ยววัด จะทำคอนเท้นอย่างไรให้น่าสนใจ'
  );
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [shotCount, setShotCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const detectedScript = useMemo(() => {
    return parseMultiSceneScript(promptText);
  }, [promptText]);

  const activeSeries = seriesList.find(s => s.id === selectedSeriesId);

  // Attached reference image state (supports high-res files up to 60MB)
  const [attachedImage, setAttachedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const fileInputRef = useRef(null);

  const currentModel = MODELS[selectedModelIdx];

  const cycleModel = () => {
    setSelectedModelIdx((prev) => (prev + 1) % MODELS.length);
  };

  useEffect(() => {
    if (customPromptSeed) {
      setPromptText(customPromptSeed);
      setStatusMsg('⚡ ดึง Prompt จาก AI เรียบร้อยแล้ว! พร้อมกด Generate');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  }, [customPromptSeed]);

  // Handle high-resolution image upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    if (file.size > 80 * 1024 * 1024) {
      alert(`ไฟล์มีขนาดใหญ่เกินไป (${sizeMb} MB) กรุณาเลือกไฟล์ไม่เกิน 80 MB`);
      return;
    }

    setIsUploading(true);
    setStatusMsg(`กำลังอัปโหลดภาพความละเอียดสูง (${sizeMb} MB)...`);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name
          })
        });

        const data = await res.json();
        if (data.success && data.data) {
          setAttachedImage({
            url: data.data.url,
            filename: file.name,
            sizeMb: data.data.size_mb,
            base64: base64Data
          });
          setStatusMsg(`แนบภาพสำเร็จ: ${file.name} (${data.data.size_mb} MB)`);
          setTimeout(() => setStatusMsg(''), 4000);
        } else {
          alert(data.error || 'อัปโหลดภาพไม่สำเร็จ');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการอัปโหลดภาพ');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Multimodal Gemini 3.8 Vision Analysis
  const handleAnalyzeWithGeminiVision = async () => {
    if (!attachedImage) return;

    setIsAnalyzingVision(true);
    setStatusMsg('🔍 กำลังให้ Gemini 3.8 Flash วิเคราะห์ภาพและคอสตูม...');

    try {
      const res = await fetch('/api/ai/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: attachedImage.url,
          base64_data: attachedImage.base64
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const visionData = data.data;
        if (visionData.first_frame_prompt) {
          setPromptText(visionData.first_frame_prompt);
        }
        setStatusMsg(`✨ Gemini 3.8 วิเคราะห์สำเร็จ: "${visionData.title || 'ตอนใหม่'}"`);
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#F71C25', '#bef264', '#ffffff']
        });
      } else {
        alert(data.error || 'Gemini Vision ไม่สามารถวิเคราะห์ได้');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini Vision');
    } finally {
      setIsAnalyzingVision(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Instant Storyboard Generator (Direct multi-shot generation into a NEW project)
  const handleGenerateStoryboard = async () => {
    if (!promptText.trim()) {
      alert('กรุณากรอกคอนเซปต์หรือพล็อตเรื่องก่อนกดสร้างสตอรี่บอร์ด');
      return;
    }

    setIsGenerating(true);

    // Case A: User pasted a structured script with 2+ scenes
    if (detectedScript && detectedScript.shots && detectedScript.shots.length >= 2) {
      setStatusMsg(`🎬 ตรวจพบสคริปต์ ${detectedScript.shots.length} ฉาก กำลังแปลงเป็นสตอรี่บอร์ดทันที...`);
      try {
        const commitRes = await fetch('/api/storyboard/commit-shots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shots: detectedScript.shots,
            project_title: detectedScript.project_title,
            visual_style: detectedScript.visual_style,
            target_duration: detectedScript.total_duration
          })
        });

        const commitData = await commitRes.json();
        if (commitData.success && commitData.data) {
          confetti({
            particleCount: 65,
            spread: 85,
            origin: { y: 0.8 },
            colors: ['#F71C25', '#bef264', '#ffffff']
          });

          setStatusMsg(`🎉 สร้างโปรเจกต์ใหม่ "${detectedScript.project_title}" (${commitData.data.length} ช็อต) สำเร็จแล้ว!`);
          if (onStoryboardCommitted) {
            onStoryboardCommitted({
              series_id: commitData.series_id,
              project_title: detectedScript.project_title,
              data: commitData.data
            });
          }
        } else {
          alert(commitData.error || 'นำเข้าสตอรี่บอร์ดไม่สำเร็จ');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการสร้างสตอรี่บอร์ด: ' + err.message);
      } finally {
        setIsGenerating(false);
        setTimeout(() => setStatusMsg(''), 4000);
      }
      return;
    }

    // Case B: Freeform concept -> generate via ai-plan using chosen shot count
    setStatusMsg(`🎬 ผู้กำกับ AI กำลังวางสตอรี่บอร์ด ${shotCount} ช็อต คัดเลือกมุมกล้อง และสร้างชุดช็อต...`);

    try {
      // 1. Plan shots via ai-plan
      const planRes = await fetch('/api/storyboard/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_concept: promptText,
          num_shots: shotCount,
          style: 'sketch',
          visual_style: 'sketch'
        })
      });

      const planData = await planRes.json();
      if (!planData.success || !planData.data?.shots) {
        throw new Error(planData.error || 'ไม่สามารถวางโครงเรื่องสตอรี่บอร์ดได้');
      }

      setStatusMsg(`✨ วางโครงเรื่อง "${planData.data.project_title}" (${planData.data.shots.length} ช็อต) สำเร็จ! กำลังบันทึกเป็นโปรเจกต์ใหม่...`);

      // 2. Commit shots to board (Creates a distinct series!)
      const commitRes = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: planData.data.shots,
          project_title: planData.data.project_title,
          visual_style: 'sketch'
        })
      });

      const commitData = await commitRes.json();
      if (commitData.success && commitData.data) {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.8 },
          colors: ['#F71C25', '#bef264', '#ffffff']
        });

        setStatusMsg(`🎉 สร้างโปรเจกต์ใหม่ "${planData.data.project_title}" (${commitData.data.length} ช็อต) สำเร็จแล้ว!`);
        if (onStoryboardCommitted) {
          onStoryboardCommitted({
            series_id: commitData.series_id,
            project_title: planData.data.project_title,
            data: commitData.data
          });
        }
      } else {
        alert(commitData.error || 'นำเข้าสตอรี่บอร์ดไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้างสตอรี่บอร์ด: ' + err.message);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Append a single shot into the current active project
  const handleAppendShot = async () => {
    if (!promptText.trim()) {
      alert('กรุณากรอกไอเดียช็อตที่ต้องการเพิ่ม');
      return;
    }

    if (!selectedSeriesId || selectedSeriesId === 'all') {
      alert('กรุณาเลือกโปรเจกต์จากเมนูด้านบนก่อน หรือกด "สร้างเป็นโปรเจกต์ใหม่"');
      return;
    }

    setIsGenerating(true);
    setStatusMsg(`➕ กำลังเจนช็อตเพิ่มลงในโปรเจกต์ "${activeSeries?.title || 'ปัจจุบัน'}"...`);

    try {
      const res = await fetch('/api/storyboard/append-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series_id: selectedSeriesId,
          shot: {
            title: promptText.slice(0, 40),
            prompt: promptText,
            action_description: promptText,
            camera_angle: 'Medium Shot',
            visual_style: 'sketch',
            duration_seconds: 2.5
          }
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        confetti({
          particleCount: 35,
          spread: 60,
          colors: ['#38bdf8', '#818cf8', '#ffffff']
        });
        setStatusMsg(`✅ เพิ่มช็อตใหม่ลงในโปรเจกต์เรียบร้อย!`);
        if (onAppendShotToCurrent) {
          onAppendShotToCurrent(data.data);
        } else if (onGenerateNewPrompt) {
          onGenerateNewPrompt(data.data);
        }
      } else {
        alert(data.error || 'เพิ่มช็อตไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเพิ่มช็อต: ' + err.message);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(''), 3500);
    }
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      alert('กรุณากรอก Prompt ก่อนกดสร้างภาพ');
      return;
    }

    // Smart Intent Detection: If prompt is asking for a storyboard, route to storyboard generator!
    const isStoryboardIntent = /สตอรี่บอร์ด|storyboard|คอนเทนต์|ขายรถ|โฆษณา|ตอน|ช็อต/i.test(promptText);
    if (isStoryboardIntent) {
      return handleGenerateStoryboard();
    }

    setIsGenerating(true);
    setStatusMsg(`กำลังประมวลผลผ่าน ${currentModel.name}...`);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          aspect_ratio: aspectRatio,
          model: currentModel.name,
          title: `ภาพ AI สร้างใหม่ (${aspectRatio})`,
          step_number: aspectRatio === '9:16' ? 3 : 2,
          reference_image: attachedImage?.url || null,
          series_id: selectedSeriesId !== 'all' ? selectedSeriesId : null
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.85 },
          colors: ['#F71C25', '#bef264', '#ffffff']
        });

        setStatusMsg(`สร้างภาพสำเร็จด้วย ${currentModel.name}!`);
        if (onGenerateNewPrompt) {
          onGenerateNewPrompt(data.data);
        }
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการสร้าง');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อระบบสร้างภาพได้');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(''), 3500);
    }
  };

  return (
    <div className="relative w-full z-30 pointer-events-auto select-none transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-stone-300/30 ring-1 ring-stone-900/5">

        {/* Hidden File Input for High-Res Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Top: Active Project Bar & Instant Start New Project Button */}
        <div className="flex items-center justify-between gap-2 px-1 pb-2 mb-2 border-b border-stone-100 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#F71C25] animate-pulse flex-shrink-0" />
            <span className="text-stone-500 font-mono text-[11px] flex-shrink-0">โปรเจกต์ที่เลือก:</span>
            <span className="font-bold text-stone-900 truncate max-w-[200px] sm:max-w-xs" title={activeSeries ? activeSeries.title : 'รวมทุกโปรเจกต์'}>
              {activeSeries ? `📁 ${activeSeries.title} (${activeSeries.shot_count ?? 0} ช็อต)` : `🎬 รวมทุกโปรเจกต์ (${seriesList.reduce((acc, cur) => acc + (cur.shot_count || 0), 0)} ช็อต)`}
            </span>
          </div>

          <button
            onClick={onStartNewProject}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs shadow-sm shadow-red-500/20 active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title="กดเพื่อเริ่มโปรเจกต์ใหม่ทันที แยกบอร์ดออกเป็นอิสระ"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>+ เริ่มโปรเจกต์ใหม่</span>
          </button>
        </div>

        {/* Actions Bar (Groq AI, Attach Image, Quick Presets) */}
        <div className="flex items-center gap-2 mb-2.5 overflow-x-auto no-scrollbar pb-1">
          {/* Groq AI Button */}
          <button
            onClick={onOpenGroqModal}
            className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 hover:text-orange-950 hover:border-orange-300 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-2xs transition-all text-xs cursor-pointer flex-shrink-0"
            title="เปิด Groq AI ช่วยคิดบท & Prompt ไวรัลทันที (1-2 วิ)"
          >
            <Zap className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>⚡ Groq AI คิดบทไวรัล</span>
          </button>

          {/* Attach High-Res Image Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-[#F71C25]/40 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs flex-shrink-0"
            title="แนบรูปภาพอ้างอิงจากเครื่องของคุณ (รองรับภาพความละเอียดสูงถึง 80MB)"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 text-[#F71C25] animate-spin" />
            ) : (
              <Paperclip className="w-3.5 h-3.5 text-[#F71C25]" />
            )}
            <span>{isUploading ? 'กำลังอัปโหลด...' : 'แนบภาพอ้างอิง'}</span>
          </button>

          <div className="h-5 w-[1px] bg-stone-200 mx-1 flex-shrink-0" />

          {/* Quick viral scene presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-mono">
            <button
              onClick={() => setPromptText('ขอสตอรี่บอร์ดในการไปเที่ยววัด จะทำคอนเท้นอย่างไรให้น่าสนใจ')}
              className="px-2.5 py-1 rounded-lg bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 hover:bg-[#F5E6B8] whitespace-nowrap cursor-pointer font-bold shadow-2xs"
            >
              🙏 เที่ยววัด & วัฒนธรรม
            </button>
            <button
              onClick={() => setPromptText('ขอสตอรี่บอร์ดในการทำคอนเท้นขายรถมือสอง สภาพนางฟ้า ไม่ชนหนัก ไมล์แท้ การันตีคืนเงิน')}
              className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 hover:border-[#F71C25]/40 hover:text-stone-950 whitespace-nowrap cursor-pointer"
            >
              🚗 ขายรถมือสองสภาพนางฟ้า
            </button>
            <button
              onClick={() => setPromptText('สตอรี่บอร์ดโฆษณาเซรั่มหน้าใส สู้แดดเมืองไทย ป้องกันฝ้ากระ ผิวฉ่ำโกลว์ใน 7 วัน')}
              className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 hover:border-[#F71C25]/40 hover:text-stone-950 whitespace-nowrap cursor-pointer"
            >
              ✨ เซรั่มหน้าใสผิวฉ่ำโกลว์
            </button>
            <button
              onClick={() => setPromptText('สตอรี่บอร์ดรีวิวร้านอาหารลับ คาเฟ่สุดชิค กาแฟโบราณรสเข้ม บรรยากาศสุดชิลล์')}
              className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 hover:border-[#F71C25]/40 hover:text-stone-950 whitespace-nowrap cursor-pointer"
            >
              ☕ รีวิวคาเฟ่ลับ
            </button>
          </div>
        </div>

        {/* Attached High-Res Image Preview Card (if attached) */}
        {attachedImage && (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 mb-2.5 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-stone-300 flex-shrink-0 bg-stone-100">
                <img
                  src={attachedImage.url}
                  alt={attachedImage.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 truncate max-w-[200px] sm:max-w-xs">
                    {attachedImage.filename}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 font-bold">
                    {attachedImage.sizeMb} MB
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono">
                  <span className="text-stone-500">แนบเป็น Reference</span>
                  <span className="text-stone-300">•</span>
                  {/* Gemini Vision Analysis trigger */}
                  <button
                    onClick={handleAnalyzeWithGeminiVision}
                    disabled={isAnalyzingVision}
                    className="text-orange-700 hover:text-orange-900 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="ใช้ Gemini Vision วิเคราะห์ภาพนี้เพื่อสร้าง Prompt"
                  >
                    {isAnalyzingVision ? (
                      <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-orange-600" />
                    )}
                    <span>{isAnalyzingVision ? 'กำลังวิเคราะห์...' : '⚡ ให้ Gemini ถอด Prompt'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer flex-shrink-0"
              title="ลบภาพแนบนี้"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Auto-detected Script Banner */}
        {detectedScript && detectedScript.shots && detectedScript.shots.length >= 2 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 mb-2.5 text-xs text-emerald-950 font-bold shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">
                ตรวจพบสคริปต์ {detectedScript.shots.length} ฉาก: <span className="font-extrabold text-stone-900">"{detectedScript.project_title}"</span>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                พร้อมสร้าง {detectedScript.shots.length} ช็อต
              </span>
            </div>
          </div>
        )}

        {/* Middle: Textarea Prompt input */}
        <div className="relative mb-2.5">
          <textarea
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="พิมพ์พล็อตเรื่อง หรือวางสคริปต์หลายฉาก (Scene 1..N) ที่นี่..."
            className="w-full px-3.5 py-2 rounded-xl bg-stone-50/80 hover:bg-white focus:bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F71C25] resize-none font-sans leading-relaxed shadow-2xs transition-all"
          />
        </div>

        {/* Status indicator */}
        {statusMsg && (
          <div className="mb-2 text-[11px] font-mono text-[#F71C25] flex items-center gap-1.5 animate-pulse font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Bottom Row: Settings Pills & Big Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-stone-600 font-mono text-[11px]">
            {/* Quick Script Importer Button */}
            {onOpenScriptImporter && (
              <button
                type="button"
                onClick={onOpenScriptImporter}
                className="px-2.5 py-1.5 rounded-xl bg-[#FDF8EE] hover:bg-[#FBEFC5] border border-[#EADBBD] text-[#F71C25] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="เปิดเครื่องมือนำเข้าสคริปต์หลายฉาก (Scene 1..N)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📋 วางสคริปต์หลายฉาก</span>
              </button>
            )}

            {/* Shot Count Selector (for freeform generation) */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-mono">จำนวนช็อต:</span>
              <select
                value={shotCount}
                onChange={(e) => setShotCount(parseInt(e.target.value, 10))}
                className="bg-transparent text-stone-900 font-bold text-[11px] font-mono outline-none cursor-pointer"
                title="เลือกจำนวนช็อตที่จะสร้าง"
              >
                <option value={4}>4 ช็อต</option>
                <option value={5}>5 ช็อต (ASMR)</option>
                <option value={6}>6 ช็อต</option>
                <option value={8}>8 ช็อต</option>
                <option value={10}>10 ช็อต</option>
                <option value={12}>12 ช็อต</option>
              </select>
            </div>

            {/* Interactive Model Selector */}
            <button
              onClick={cycleModel}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-semibold transition-all cursor-pointer shadow-2xs"
              title="คลิกเพื่อสลับ Model / API"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentModel.name}</span>
              <span className="text-[10px] text-stone-900 bg-[#FBEFC5] px-1 py-0.5 rounded border border-[#E5D7A3] font-bold ml-0.5">
                {currentModel.badge}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Aspect Ratio Selector */}
            <button
              onClick={() => setAspectRatio(aspectRatio === '9:16' ? '16:9' : '9:16')}
              className="px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center gap-1 text-stone-800 font-bold cursor-pointer shadow-2xs"
              title="สลับสัดส่วนภาพ"
            >
              <Maximize2 className="w-3 h-3 text-[#F71C25]" />
              <span>{aspectRatio}</span>
            </button>

            {/* Connected API Status Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-50 border border-stone-200 text-[10px] text-stone-600">
              <ShieldCheck className="w-3 h-3 text-[#F71C25]" />
              <span>AI Engine:</span>
              <span className="text-stone-900 font-bold">Groq LPU</span>
              <span>•</span>
              <span className="text-[#F71C25] font-bold">Gemini Vision</span>
            </div>
          </div>

          {/* Action Buttons: Dual Action (New Storyboard Project vs Append to Current Project) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateStoryboard}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              title="สร้างสตอรี่บอร์ดเรื่องใหม่แยกเป็นโปรเจกต์ใหม่ ไม่รวมกับของเดิม"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังวางโครงเรื่อง...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>✨ สร้างเป็นโปรเจกต์ใหม่</span>
                </>
              )}
            </button>

            {selectedSeriesId && selectedSeriesId !== 'all' ? (
              <button
                onClick={handleAppendShot}
                disabled={isGenerating}
                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#F71C25]/40 hover:border-[#F71C25] text-[#F71C25] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title={`เพิ่มช็อตนี้ลงในโปรเจกต์ "${activeSeries?.title || 'ปัจจุบัน'}"`}
              >
                <Plus className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>➕ เจนช็อตเพิ่มในโปรเจกต์นี้</span>
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="สร้างเฉพาะภาพเดี่ยว 1 ช็อต"
              >
                <span>เจนภาพเดี่ยว</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
