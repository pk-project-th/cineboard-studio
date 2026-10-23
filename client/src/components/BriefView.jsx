import React, { useState } from 'react';
import { Sparkles, Film, Clock, Ratio, Layers, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_PRESETS = [
  {
    label: '🚗 ส่งมอบรถสปอร์ตหรู (Mazda CX-6e)',
    concept: `บรรยากาศส่งมอบรถยนต์สปอร์ตระดับพรีเมียม Mazda CX-6e ในโชว์รูมสไตล์โมเดิร์น
- เซลล์แต่งกายเนี้ยบเดินนำลูกค้ามาที่ตัวรถ อธิบายฟังก์ชั่นห้องโดยสาร หน้าจอ และค็อกพิท
- ลูกค้าสัมผัสพวงมาลัยหนังแท้ กดปุ่มควบคุม รอยยิ้มพึงพอใจ
- เซลล์ส่งมอบกล่องกุญแจสมาร์ทคีย์สุดหรู ลูกค้ารับกุญแจพร้อมดอกไม้
- ช็อตรถขับออกจากโชว์รูมอย่างสง่างามสู่แสงแดดยามเย็น`
  },
  {
    label: '🎬 ASMR งานประกอบญี่ปุ่น (Japanese Craftsmanship)',
    concept: `🎬 Content: Pure ASMR "The Sound of Japanese Craftsmanship"
Visual Style: Macro photography, extremely detailed, soft natural daylight, premium commercial style.

Scene 1: Smart Access
Prompt: Extreme close-up shot of a hand holding a sleek luxury car key approaching the door handle. Soft daylight, hyper-realistic, shallow depth of field.

Scene 2: Center Screen Film
Prompt: Macro shot. A hand slowly peeling off the clear protective film from the glossy digital display inside a luxury vehicle. Crisp reflection.

Scene 3: Tactile Controls
Prompt: Extreme close-up. A finger rotating a knurled metallic climate control dial on the dashboard with solid mechanical click feel.

Scene 4: Leather & Stitching
Prompt: Macro shot. A hand gently tracing the hand-crafted stitching on a soft leather steering wheel with warm natural sunlight.

Scene 5: The Solid Thud
Prompt: Medium shot from exterior. A hand pushing the heavy glossy car door shut with a deep solid sound. Cinematic reflections.`
  },
  {
    label: '✨ รีวิวเซรั่มผิวฉ่ำโกลว์ (Beauty Skincare)',
    concept: `โฆษณาเซรั่มบำรุงผิวหน้าสูตรไฮยาลูรอนเข้มข้น ฟื้นฟูผิวหมองคล้ำ ฉ่ำวาว Glass Skin ใน 7 วัน
- เปิดด้วยช็อตหยดเซรั่มใสลงบนผิวสัมผัสเนียนนุ่ม สโลว์โมชั่น 120fps
- ตัวแบบหญิงสาวผิวสวยยิ้มอย่างมั่นใจกลางแสงแดดธรรมชาติ
- กราฟิกโมเลกุลซึมลึกสู่ผิวหน้า และเปรียบเทียบผลลัพธ์ผิวกระจ่างใสสุขภาพดี
- ปิดท้ายด้วยขวดเซรั่มวางเคียงคู่ดอกไม้สีขาวสะอาดตาพร้อมข้อความสั่งซื้อ`
  },
  {
    label: '📱 คลิปไวรัลสั้น TikTok (15 วิ ขายของ)',
    concept: `คลิปไวรัล TikTok 15 วินาที สเปรย์โฟมทำความสะอาดอเนกประสงค์
- วินาทีที่ 0-3 (Hook): ภาพกระทะไหม้ดำปี๋ โดนฉีดโฟมขาวฟู่ฟูเต็มหน้าจอ
- วินาทีที่ 4-8 (Demo): ใช้ผ้าเช็ดเบาๆ คราบดำหลุดออกหมดในปาดเดียว โชว์พื้นผิวมันเงาเหมือนใหม่
- วินาทีที่ 9-12 (Multi-Use): เช็ดขอบเตาแก๊ส คราบน้ำมันบนไมโครเวฟ สะอาดกริ๊บ
- วินาทีที่ 13-15 (CTA): ชี้ตะกร้าเหลืองมุมซ้ายล่าง จัดโปร 1 แถม 1 สั่งด่วนก่อนหมด`
  }
];

const STYLES = [
  { id: 'Cinematic Film', label: '🎬 Cinematic Film (ภาพยนตร์ 35mm)' },
  { id: 'Photorealistic Commercial', label: '📸 Real Commercial (โฆษณาสมจริง)' },
  { id: 'Pencil Sketch Storyboard', label: '✏️ Pencil Sketch (ภาพสเก็ตช์สตอรี่บอร์ด)' },
  { id: 'Anime Studio', label: '🎨 Anime / Animation (อนิเมะสตูดิโอ)' }
];

export default function BriefView({ onStoryboardCreated, onGoToBoard }) {
  const [concept, setConcept] = useState('');
  const [visualStyle, setVisualStyle] = useState('Cinematic Film');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [shotCount, setShotCount] = useState(6);
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleGenerate = async () => {
    if (!concept.trim()) {
      alert('กรุณากรอกพล็อตเรื่อง หรือ วางสคริปต์ฉากก่อนครับ');
      return;
    }

    setIsGenerating(true);
    setStatusMsg('🎬 AI ผู้กำกับกำลังวิเคราะห์และจัดวางช็อตสตอรี่บอร์ด...');

    try {
      const res = await fetch('/api/storyboard/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_concept: concept,
          num_shots: shotCount,
          target_duration: duration,
          visual_style: visualStyle,
          aspect_ratio: aspectRatio
        })
      });

      const data = await res.json();
      if (!data.success || !data.data || !data.data.shots) {
        throw new Error(data.error || 'ไม่สามารถสร้างสตอรี่บอร์ดได้');
      }

      const planData = data.data;
      setStatusMsg(`กำลังบันทึก ${planData.shots.length} ช็อตลงในระบบ...`);

      // Commit into database
      const commitRes = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: planData.shots,
          project_title: planData.project_title,
          visual_style: visualStyle,
          target_duration: duration,
          aspect_ratio: aspectRatio
        })
      });

      const commitData = await commitRes.json();
      if (commitData.success && commitData.data) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#F71C25', '#FF4D4D', '#FBEFC5']
        });

        if (onStoryboardCreated) {
          onStoryboardCreated({
            series_id: commitData.series_id,
            project_title: planData.project_title,
            data: commitData.data
          });
        }
      } else {
        throw new Error(commitData.error || 'บันทึกช็อตไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsGenerating(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F71C25] uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>ขั้นตอนที่ 1 • กำหนดเรื่องราว & สคริปต์</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          สร้างสตอรี่บอร์ดใหม่ด้วย AI Director
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
          พิมพ์ไอเดีย บรีฟโฆษณา หรือวางสคริปต์ฉาก (Scene 1..N) ระบบจะจัดวางมุมกล้อง การเคลื่อนไหว บทพูด เสียง Foley และคำสั่งสร้างภาพให้ครบทุกช็อต
        </p>

        {/* Quick Presets */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] font-mono font-bold text-stone-500">เลือกตัวอย่างไอเดียยอดนิยม:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setConcept(preset.concept)}
                className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-[#FBEFC5]/50 border border-stone-200 hover:border-[#F71C25]/40 text-xs font-bold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer active:scale-[0.98]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
        {/* Concept / Script Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-900 flex items-center justify-between">
            <span>บรีฟเรื่องราว หรือ วางสคริปต์ฉาก:</span>
            <span className="text-[11px] font-mono text-stone-400">รองรับภาษาไทย และอังกฤษ</span>
          </label>
          <textarea
            rows={7}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="พิมพ์เรื่องราว เช่น 'บรรยากาศส่งมอบ Mazda CX-6e เซลล์อธิบายฟังก์ชั่นและส่งมอบกุญแจ...' หรือวางสคริปต์ Scene 1: ... Scene 2: ..."
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-[#F71C25] text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none leading-relaxed font-sans shadow-2xs"
          />
        </div>

        {/* Options Grid: Aspect Ratio, Style, Shot Count, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Ratio className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>สัดส่วนภาพ:</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  aspectRatio === '16:9' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                16:9 แนวนอน
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  aspectRatio === '9:16' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                9:16 มือถือ
              </button>
            </div>
          </div>

          {/* Visual Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>สไตล์ภาพ:</span>
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white focus:outline-none focus:border-[#F71C25] cursor-pointer"
            >
              {STYLES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shot Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>จำนวนช็อต:</span>
              </span>
              <span className="font-mono text-[#F71C25]">{shotCount} ช็อต</span>
            </label>
            <input
              type="range"
              min={3}
              max={24}
              step={1}
              value={shotCount}
              onChange={(e) => setShotCount(parseInt(e.target.value, 10))}
              className="w-full accent-[#F71C25] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>3 ช็อต</span>
              <span>12</span>
              <span>24 ช็อต</span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>ความยาวคลิป:</span>
              </span>
              <span className="font-mono text-[#F71C25]">{duration} วิ</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl">
              {[15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDuration(sec)}
                  className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    duration === sec ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Msg */}
        {statusMsg && (
          <div className="p-3 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] text-xs font-mono font-bold text-[#F71C25] flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
          <p className="text-xs text-stone-500">
            ระบบจะสร้างโครงสร้างสตอรี่บอร์ด รายการช็อต มุมกล้อง และ prompt ให้ครบทุกฉาก
          </p>
          <button
            type="button"
            disabled={isGenerating || !concept.trim()}
            onClick={handleGenerate}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังวางสตอรี่บอร์ด AI...</span>
              </>
            ) : (
              <>
                <span>🎬 วางโครงสร้างสตอรี่บอร์ด AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
