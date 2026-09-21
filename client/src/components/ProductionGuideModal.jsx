import React, { useState } from 'react';
import {
  X, Flame, CheckCircle2, AlertTriangle, Film, Sparkles,
  Sliders, Music, Scissors, Smile, BookOpen, Copy, Check,
  Camera, Video, Eye, Sun, Volume2, Clapperboard, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductionGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('formula');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const sampleVideoPrompt = "Cinematic slow dolly push-in toward a luxury glass cosmetic dropper dispensing a glistening golden serum droplet, suspended in mid-air with soft studio morning rim light, clean blurred background, photorealistic 8k, smooth 24fps motion, no text, no subtitles, no watermark.";

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleVideoPrompt);
    setCopiedPrompt(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-md select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-stone-900 flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] flex items-center justify-center text-[#F71C25] font-black shadow-2xs">
                <Clapperboard className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-[#F71C25] uppercase tracking-wider flex items-center gap-2">
                  <span>CineBoard AI Director Masterclass</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#FBEFC5] border border-[#E5D7A3] text-[10px] text-stone-900 font-bold">
                    Pro Guide
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-950 tracking-tight">
                  คู่มือผู้กำกับสตอรี่บอร์ด & การผลิตวิดีโอ (Director's Guide)
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            <button
              onClick={() => setActiveTab('formula')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'formula'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-[#FAF9F5] border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-[#FBEFC5]/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>1. โครงสร้างสตอรี่บอร์ด 5-Shot</span>
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'camera'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-[#FAF9F5] border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-[#FBEFC5]/50'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>2. ไวยากรณ์มุมกล้อง & เลนส์</span>
            </button>

            <button
              onClick={() => setActiveTab('video_ai')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'video_ai'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-[#FAF9F5] border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-[#FBEFC5]/50'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>3. สูตร Prompt วิดีโอ Kling/Runway</span>
            </button>

            <button
              onClick={() => setActiveTab('live_action')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'live_action'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-[#FAF9F5] border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-[#FBEFC5]/50'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>4. คู่มือกองถ่ายภาพจริง (Live-Action)</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6 space-y-6 text-xs sm:text-sm text-stone-800 leading-relaxed">
            {activeTab === 'formula' && (
              <div className="space-y-4">
                <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-stone-200">
                  <h3 className="text-base font-bold text-stone-950 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#F71C25]" />
                    <span>🎬 สูตรโครงสร้างสตอรี่บอร์ด 5 ช็อต (The 5-Shot Commercial Arc)</span>
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    ไม่ว่าจะเป็นโฆษณารถยนต์ สกินแคร์ หรือคลิปไวรัล TikTok การวางโครงเรื่องแบบ 5 ช็อตช่วยคุมจังหวะการเล่าเรื่อง (Pacing) ให้กระชับ ตรึงคนดูได้ตั้งแต่ 3 วินาทีแรก และปิดการขายได้อย่างเป็นธรรมชาติ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-sans">
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1.5 hover:border-[#F71C25]/40 transition-colors">
                    <div className="text-[10px] font-mono font-bold text-[#F71C25] uppercase">SHOT 1 (3-4s)</div>
                    <div className="font-bold text-stone-900 text-sm">Establishing / Hook</div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      เปิดสภาพแวดล้อม โลเคชั่น หรือสร้างจุดกระตุกสายตา (Scroll-Stopper) ไม่ให้คนเลื่อนผ่าน
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1.5 hover:border-[#F71C25]/40 transition-colors">
                    <div className="text-[10px] font-mono font-bold text-[#F71C25] uppercase">SHOT 2 (4-5s)</div>
                    <div className="font-bold text-stone-900 text-sm">Introduction</div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      แนะนำตัวละคร สินค้า หรือบริบทหลักเข้าสู่เรื่องราว แสดงความเคลื่อนไหวที่เป็นธรรมชาติ
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1.5 hover:border-[#F71C25]/40 transition-colors">
                    <div className="text-[10px] font-mono font-bold text-[#F71C25] uppercase">SHOT 3 (5-6s)</div>
                    <div className="font-bold text-stone-900 text-sm">Problem & Tension</div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      ซูมประชิดปัญหา ความขัดแย้ง ผิวขาดน้ำ รอยเปื้อน หรือความต้องการของลูกค้าที่รอการแก้ไข
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1.5 hover:border-[#F71C25]/40 transition-colors">
                    <div className="text-[10px] font-mono font-bold text-[#F71C25] uppercase">SHOT 4 (5-6s)</div>
                    <div className="font-bold text-stone-900 text-sm">Climax & Solution</div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      จุดพีคของเรื่อง อนุภาคสารสกัด การทดสอบการขับขี่ รอยยิ้มความฟิน หรือการคลี่คลายปัญหา
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1.5 hover:border-[#F71C25]/40 transition-colors">
                    <div className="text-[10px] font-mono font-bold text-[#F71C25] uppercase">SHOT 5 (5-7s)</div>
                    <div className="font-bold text-stone-900 text-sm">Hero Call-To-Action</div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      ช็อตฮีโร่โชว์ขวดสินค้า ลานรถหรู พร้อมข้อเสนอ ราคา โปรโมชัน และช่องทางการติดต่อ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2.5">
                    <div className="font-bold text-[#F71C25] text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>ขนาดภาพ (Shot Sizes & Lens Framing)</span>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-700">
                      <li>
                        <strong className="text-stone-900">Wide Shot (WS / 24mm):</strong> แสดงขนาดพื้นที่ บรรยากาศ และบริบททั้งหมด เหมาะสำหรับช็อตเปิดตัวและปิดท้าย
                      </li>
                      <li>
                        <strong className="text-stone-900">Medium Shot (MS / 35mm-50mm):</strong> ครึ่งตัวระดับเอว ให้ความรู้สึกเป็นธรรมชาติเหมือนสายตามนุษย์ เหมาะกับบทสนทนา
                      </li>
                      <li>
                        <strong className="text-stone-900">Close-Up (CU / 85mm):</strong> เจาะจงใบหน้าหรือวัตถุ ดึงอารมณ์ความรู้สึก และละลายฉากหลังอย่างสวยงาม
                      </li>
                      <li>
                        <strong className="text-stone-900">Extreme Close-Up (ECU / 100mm Macro):</strong> ซูมถึงขีดสุด เช่น รูขุมขน หยดน้ำ คอนแทกต์ หรือสวิตช์ปุ่ม
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2.5">
                    <div className="font-bold text-[#F71C25] text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>มุมกล้องและการสื่อความหมาย (Camera Angles)</span>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-700">
                      <li>
                        <strong className="text-stone-900">Low-Angle (มุมเงย):</strong> ตั้งกล้องต่ำกว่าระดับสายตา ทำให้ตัวละครหรือรถยนต์ดูทรงพลัง น่าเกรงขาม และมีอำนาจ
                      </li>
                      <li>
                        <strong className="text-stone-900">High-Angle (มุมก้ม):</strong> ตั้งกล้องสูงกว่าระดับสายตา ให้ความรู้สึกโดดเดี่ยว ตัวเล็ก หรือเปราะบาง
                      </li>
                      <li>
                        <strong className="text-stone-900">Dutch Angle (มุมเอียง):</strong> เอียงแกนกล้องเพื่อสื่อถึงความผิดปกติ ความตื่นตระหนก หรือความตึงเครียด
                      </li>
                      <li>
                        <strong className="text-stone-900">Over-The-Shoulder (OTS):</strong> มองผ่านไหล่ของอีกคนหนึ่ง ช่วยสร้างมิติความลึกในบทสนทนา
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video_ai' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
                  <h4 className="text-sm font-bold text-stone-950 flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>สูตรการเขียน Prompt สำหรับ AI Video Generator (Kling / Runway Gen-3 / Sora)</span>
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    เพื่อให้ AI Video Generator สร้างภาพเคลื่อนไหวที่นุ่มนวลและไม่เพี้ยน ควรกำหนด 5 องค์ประกอบนี้ใน Prompt เสมอ:
                  </p>
                  <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-800 space-y-1.5 shadow-2xs">
                    <div>1. <strong>Subject & Action:</strong> การกระทำที่ชัดเจน (เช่น serum dropping, car gliding)</div>
                    <div>2. <strong>Camera Movement:</strong> ทิศทางกล้อง (เช่น slow dolly push-in, subtle panning)</div>
                    <div>3. <strong>Lighting & Mood:</strong> แสง (เช่น soft morning studio lighting, volumetric rim light)</div>
                    <div>4. <strong>Technical Quality:</strong> ความคมชัด (เช่น photorealistic 8k, smooth 24fps motion)</div>
                    <div>5. <strong>Clean Filter:</strong> คำสั่งล้าง (เช่น <code className="bg-stone-200 px-1 py-0.5 rounded">no text, no subtitles, no watermark</code>)</div>
                  </div>
                </div>

                <div className="bg-[#FDF8EE] border border-[#EADBBD] rounded-2xl p-4.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-stone-900">ตัวอย่าง Master Prompt ที่ใช้งานได้จริง:</span>
                    <button
                      onClick={handleCopySample}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#F71C25]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'คัดลอกแล้ว' : 'คัดลอกตัวอย่าง'}</span>
                    </button>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-[#E5D7A3] font-mono text-xs text-stone-800 select-text leading-relaxed shadow-2xs">
                    "{sampleVideoPrompt}"
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'live_action' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                    <div className="font-bold text-amber-700 text-xs flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>การจัดไฟ (3-Point Lighting)</span>
                    </div>
                    <ul className="text-[11px] text-stone-600 space-y-1">
                      <li>• <strong>Key Light:</strong> ไฟหลัก 45 องศา ส่องวัตถุ</li>
                      <li>• <strong>Fill Light:</strong> ไฟเสริมลบเงาเข้มให้ดูนุ่มนวล</li>
                      <li>• <strong>Rim/Back Light:</strong> ไฟตัดขอบแยกตัวแบบออกจากฉากหลัง</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                    <div className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>การเลือกเลนส์ถ่ายทำจริง</span>
                    </div>
                    <ul className="text-[11px] text-stone-600 space-y-1">
                      <li>• <strong>24mm:</strong> วิวกว้างและบรรยากาศห้อง</li>
                      <li>• <strong>50mm:</strong> ช็อตบทสนทนาธรรมชาติ</li>
                      <li>• <strong>85mm:</strong> ถ่ายคนหน้าเนียน ละลายหลังสวย</li>
                      <li>• <strong>100mm Macro:</strong> สินค้าและหยดของเหลว</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                    <div className="font-bold text-cyan-800 text-xs flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-cyan-600" />
                      <span>บันทึกเสียงหน้ากอง (Foley)</span>
                    </div>
                    <ul className="text-[11px] text-stone-600 space-y-1">
                      <li>• บันทึกเสียง Room Tone เปล่า 30 วิ</li>
                      <li>• ไมค์ Shotgun จ่อห่างจากวัตถุ 20 ซม.</li>
                      <li>• เสียงประตูปิด เสียงสตาร์ตเครื่อง เสียงหยดน้ำ</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between">
          <div className="text-[11px] font-mono text-stone-500">
            CineBoard Director's Handbook • บูรณาการ AI Video & Live-Action Cinema
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
          >
            เข้าใจหลักการกำกับแล้ว ปิดคู่มือ
          </button>
        </div>
      </div>
    </div>
  );
}
