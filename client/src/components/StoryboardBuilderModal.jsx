import { generateMasterProductionPrompt } from '../utils/masterPromptHelper';
import MasterPromptModal from './MasterPromptModal';
import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Film, Video, Check, Layers, ChevronRight, ChevronLeft,
  User, Mountain, Package, Eye, ArrowRight, RefreshCw,
  Plus, Trash2, Sliders, Play, Camera, Copy, Volume2, Type, Clapperboard, Clock, Timer, Zap
} from 'lucide-react';
import CameraAngleSelector, { CAMERA_ANGLES } from './CameraAngleSelector';
import confetti from 'canvas-confetti';

export default function StoryboardBuilderModal({
  isOpen,
  onClose,
  onStoryboardCommitted,
  onOpenAssetManager,
  initialConcept
}) {
  const [step, setStep] = useState(1); // 1: Concept & Assets, 2: Storyboard Plan & Camera Angles
  const [concept, setConcept] = useState(initialConcept || 'ขอสตอรี่บอร์ดในการไปเที่ยววัด จะทำคอนเท้นอย่างไรให้น่าสนใจ');
  const [style, setStyle] = useState('sketch');
  const [numShots, setNumShots] = useState(12);
  const [targetDuration, setTargetDuration] = useState(30);
  const [pacing, setPacing] = useState('fast'); // 'fast' | 'normal' | 'cinematic'
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  // Helper: Calculate ideal shot count from duration and pacing
  const calculateShotsFromDuration = (dur, pace) => {
    const d = Math.max(5, parseFloat(dur) || 30);
    if (pace === 'fast') return Math.max(4, Math.min(50, Math.round(d / 2.5)));
    if (pace === 'normal') return Math.max(3, Math.min(50, Math.round(d / 4.0)));
    if (pace === 'cinematic') return Math.max(2, Math.min(50, Math.round(d / 6.0)));
    return 12;
  };

  const handleDurationSelect = (dur) => {
    setTargetDuration(dur);
    setIsCustomDuration(false);
    setNumShots(calculateShotsFromDuration(dur, pacing));
  };

  const handleCustomDurationChange = (val) => {
    const d = Math.max(5, Math.min(300, parseInt(val, 10) || 5));
    setTargetDuration(d);
    setNumShots(calculateShotsFromDuration(d, pacing));
  };

  const handlePacingSelect = (newPace) => {
    setPacing(newPace);
    setNumShots(calculateShotsFromDuration(targetDuration, newPace));
  };

  // Helper: Update duration for a specific shot and recalculate all timecodes
  const updateShotDuration = (shotIndex, newDuration) => {
    if (!plannedData || !plannedData.shots) return;
    const dur = Math.max(0.5, Math.min(60, Math.round(newDuration * 2) / 2));
    const updated = { ...plannedData };
    updated.shots[shotIndex].duration_seconds = dur;

    let curTime = 0;
    const formatSec = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secPart = seconds % 60;
      const sStr = secPart < 10 ? '0' + secPart.toFixed(1) : secPart.toFixed(1);
      return `${mins}:${sStr}`;
    };

    updated.shots.forEach((s) => {
      const startSec = curTime;
      const endSec = Math.round((startSec + (s.duration_seconds || 2.5)) * 10) / 10;
      curTime = endSec;
      s.timecode = `${formatSec(startSec)} - ${formatSec(endSec)}`;
    });
    updated.total_duration = Math.round(curTime * 10) / 10;
    setPlannedData(updated);
  };

  // Selected Assets
  const [assets, setAssets] = useState([]);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Storyboard Generation State
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedData, setPlannedData] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [showMasterPromptModal, setShowMasterPromptModal] = useState(false);
  const [masterPromptText, setMasterPromptText] = useState("");

  // Active shot editor in Step 2
  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [sceneFilter, setSceneFilter] = useState('all');

  // Fetch available assets
  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.success && data.data) {
        setAssets(data.data);
        // Pre-select defaults if available
        const firstChar = data.data.find(a => a.type === 'character');
        const firstScene = data.data.find(a => a.type === 'scene');
        const firstProd = data.data.find(a => a.type === 'product');
        if (firstChar && !selectedCharId) setSelectedCharId(firstChar.id);
        if (firstScene && !selectedSceneId) setSelectedSceneId(firstScene.id);
        if (firstProd && !selectedProductId) setSelectedProductId(firstProd.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setStep(1);
    }
  }, [isOpen]);

  // Step 1 -> Call AI Director to plan Storyboard
  const handleGeneratePlan = async () => {
    if (!concept.trim()) {
      alert('กรุณาระบุพล็อตเรื่องหรือคอนเซปต์');
      return;
    }

    setIsPlanning(true);
    try {
      const res = await fetch('/api/storyboard/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_concept: concept,
          character_id: selectedCharId,
          scene_id: selectedSceneId,
          product_id: selectedProductId,
          num_shots: numShots,
          target_duration: targetDuration,
          pacing: pacing,
          style: style,
          visual_style: style
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPlannedData(data.data);
        setStep(2);
        setActiveShotIndex(0);
        confetti({ particleCount: 30, spread: 60 });
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการวางโครงเรื่อง');
      }
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถเชื่อมต่อ AI Storyboard Director ได้');
    } finally {
      setIsPlanning(false);
    }
  };

  // Change camera angle for active shot
  const handleAngleChange = (angleObj) => {
    if (!plannedData || !plannedData.shots) return;
    const updated = { ...plannedData };
    updated.shots[activeShotIndex].camera_angle = angleObj.id;
    updated.shots[activeShotIndex].camera_angle_th = angleObj.nameTh;
    updated.shots[activeShotIndex].lens_focal = angleObj.lens;
    setPlannedData(updated);
  };

  // Commit all shots to the main Board
  const handleCommitToBoard = async () => {
    if (!plannedData || !plannedData.shots) return;

    setIsCommitting(true);
    try {
      const res = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: plannedData.shots,
          project_title: plannedData.project_title || concept,
          character_id: selectedCharId,
          scene_id: selectedSceneId,
          product_id: selectedProductId,
          visual_style: style,
          target_duration: plannedData.target_duration || targetDuration,
          pacing: plannedData.pacing || pacing
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
        if (onStoryboardCommitted) {
          onStoryboardCommitted({
            series_id: data.series_id,
            project_title: plannedData.project_title || concept,
            data: data.data
          });
        }
        onClose();
      } else {
        alert(data.error || 'นำเข้าสู่บอร์ดไม่สำเร็จ');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการนำเข้าสตอรี่บอร์ด');
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen) return null;

  const characters = assets.filter(a => a.type === 'character');
  const scenes = assets.filter(a => a.type === 'scene');
  const products = assets.filter(a => a.type === 'product');

  const activeShot = plannedData?.shots?.[activeShotIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/50 backdrop-blur-md select-none">
      <div className="w-full h-full sm:h-auto max-w-5xl bg-white border-0 sm:border border-stone-200 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-stone-200 bg-[#FAF9F5] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>สร้างสตอรี่บอร์ดใหม่ (Storyboard Director Wizard)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FBEFC5] text-[#F71C25] border border-[#EADBBD] font-bold">
                  Step {step} จาก 2
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                {step === 1 ? 'กำหนดคอนเซปต์ แนบตัวละคร ฉาก และสินค้า' : 'ตรวจทานมุมกล้อง บทพูด และสคริปต์ของแต่ละช็อต'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            /* STEP 1: Concept, Asset Selection & Preferences */
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Concept Input */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-[#F71C25] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. พล็อตเรื่อง หรือ คอนเซปต์โฆษณา (Story Concept) *</span>
                </label>
                <textarea
                  rows={3}
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="เช่น โฆษณาเต็นท์รถมือสองสภาพนางฟ้า ตรวจเช็ก 200 จุด ผ่อนเริ่มต้น 5,000 บาท ออกรถได้ทุกอาชีพ..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 text-sm focus:border-[#F71C25] outline-none resize-none leading-relaxed shadow-xs"
                />

                {/* Quick Concept Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-mono text-stone-500">ไอเดียยอดนิยม:</span>
                  {[
                    { label: '🙏 เที่ยววัด & ไหว้พระสงบใจ', text: 'ขอสตอรี่บอร์ดในการไปเที่ยววัด จะทำคอนเท้นอย่างไรให้น่าสนใจ สัมผัสความสงบ สถาปัตยกรรม และวิถีไทย' },
                    { label: '🚗 รถมือสองสภาพนางฟ้า', text: 'โฆษณาเต็นท์รถมือสองสภาพนางฟ้า ชูจุดเด่นตรวจสภาพ 200 จุด ผ่อนสบายพร้อมขับ' },
                    { label: '✨ เซรั่มหน้าใสผิวฉ่ำโกลว์', text: 'โฆษณาเซรั่มบำรุงผิวหน้าเข้มข้น ลดรอยสิว เผยผิวฉ่ำวาวอิ่มน้ำ Glass Skin ใน 7 วัน' },
                    { label: '☕ รีวิวคาเฟ่ลับสไตล์มินิมอล', text: 'รีวิวคาเฟ่ลับ Specialty Coffee บรรยากาศมินิมอล กลิ่นกาแฟหอมฟุ้งและครัวซองต์กรอบนอกนุ่มใน' },
                    { label: '📱 คลิปไวรัล TikTok ขายสินค้า', text: 'คลิปไวรัล TikTok 15 วิ สเปรย์โฟมทำความสะอาดอเนกประสงค์ เช็ดคราบฝังลึกหายวับ ชี้ตะกร้าด่วน' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setConcept(item.text)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#FBEFC5]/50 border border-stone-200 hover:border-[#F71C25]/40 text-[11px] text-stone-700 hover:text-[#F71C25] transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Attachments Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-stone-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F71C25]" />
                    <span>2. แนบองค์ประกอบในเรื่อง (Attached Assets):</span>
                  </label>
                  <button
                    type="button"
                    onClick={onOpenAssetManager}
                    className="text-xs font-bold text-[#F71C25] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>จัดการ/เพิ่ม Asset ใหม่</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Select Character */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                    <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5 font-bold">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>ตัวละคร (Character)</span>
                    </div>
                    <select
                      value={selectedCharId}
                      onChange={(e) => setSelectedCharId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#F71C25] shadow-xs"
                    >
                      <option value="">-- ไม่ระบุ (AI สุ่มตามพล็อต) --</option>
                      {characters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {selectedCharId && (
                      <p className="text-[10px] text-stone-500 truncate">
                        {characters.find(c => c.id === selectedCharId)?.description}
                      </p>
                    )}
                  </div>

                  {/* Select Scene */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                    <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5 font-bold">
                      <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ฉาก / สถานที่ (Scene)</span>
                    </div>
                    <select
                      value={selectedSceneId}
                      onChange={(e) => setSelectedSceneId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#F71C25] shadow-xs"
                    >
                      <option value="">-- ไม่ระบุ (AI สุ่มตามพล็อต) --</option>
                      {scenes.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {selectedSceneId && (
                      <p className="text-[10px] text-stone-500 truncate">
                        {scenes.find(s => s.id === selectedSceneId)?.description}
                      </p>
                    )}
                  </div>

                  {/* Select Product */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                    <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5 font-bold">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span>สินค้า / พร็อพ (Product)</span>
                    </div>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#F71C25] shadow-xs"
                    >
                      <option value="">-- ไม่มีสินค้า (งานภาพยนตร์ทั่วไป) --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {selectedProductId && (
                      <p className="text-[10px] text-stone-500 truncate">
                        {products.find(p => p.id === selectedProductId)?.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Duration & Pacing Settings */}
              <div className="space-y-4 pt-3 border-t border-stone-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-stone-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#F71C25]" />
                    <span>3. กำหนดความยาวคลิป & จังหวะสลับมุมกล้อง (Target Duration & Dynamic Pacing) *</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#F71C25] font-bold bg-[#FBEFC5] px-2.5 py-0.5 rounded-lg border border-[#E5D7A3]">
                    ⏱️ เป้าหมาย: {targetDuration} วินาที (~{numShots} ช็อต)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Duration Selector */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-3">
                    <div className="text-xs font-mono font-bold text-stone-700 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-[#F71C25]" />
                      <span>ความยาวคลิปที่ต้องการ:</span>
                    </div>

                    {/* Preset Duration Chips */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { sec: 15, label: '15 วิ', sub: 'TikTok/Reels' },
                        { sec: 30, label: '30 วิ ⭐', sub: 'โฆษณาไวรัล' },
                        { sec: 45, label: '45 วิ', sub: 'รีวิวเจาะลึก' },
                        { sec: 60, label: '60 วิ', sub: '1 นาทีเต็ม' },
                        { sec: 90, label: '90 วิ', sub: '1.5 นาทีสตอรี่' }
                      ].map(item => (
                        <button
                          key={item.sec}
                          type="button"
                          onClick={() => handleDurationSelect(item.sec)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            targetDuration === item.sec && !isCustomDuration
                              ? 'bg-[#F71C25] text-white border-[#F71C25] font-black shadow-md shadow-red-500/20'
                              : 'bg-stone-950 border-stone-800 text-stone-700 hover:border-stone-700'
                          }`}
                        >
                          <div className="text-xs font-bold font-mono">{item.label}</div>
                          <div className={`text-[10px] truncate ${targetDuration === item.sec && !isCustomDuration ? 'text-white/90 font-semibold' : 'text-stone-500'}`}>{item.sub}</div>
                        </button>
                      ))}

                      {/* Custom Duration Button */}
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(true)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isCustomDuration
                            ? 'bg-[#F71C25] text-white border-[#F71C25] font-black shadow-md shadow-red-500/20'
                            : 'bg-stone-950 border-stone-800 text-stone-700 hover:border-stone-700'
                        }`}
                      >
                        <div className="text-xs font-bold font-mono">กำหนดเอง</div>
                        <div className={`text-[10px] truncate ${isCustomDuration ? 'text-white/90 font-semibold' : 'text-stone-500'}`}>ระบุวินาที</div>
                      </button>
                    </div>

                    {/* Custom Duration Input Field */}
                    {isCustomDuration && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-mono text-stone-500">ระบุวินาที:</span>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={targetDuration}
                          onChange={(e) => handleCustomDurationChange(e.target.value)}
                          className="w-24 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-center text-sm font-mono font-bold text-[#F71C25] outline-none focus:border-[#F71C25]"
                        />
                        <span className="text-xs font-mono text-stone-500">วินาที (5 - 300 วิ)</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Camera Switching Pacing */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-3">
                    <div className="text-xs font-mono font-bold text-stone-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#F71C25]" />
                      <span>จังหวะการสลับมุมกล้อง (Camera Pacing):</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          id: 'fast',
                          title: '⚡ สลับมุมกล้องบ่อย คัตเร็ว (แนะนำ ⭐)',
                          desc: 'สลับมุมกล้องทุก 1.5 - 3 วินาที ผู้ชมไม่เบื่อ ดูเพลิน สไตล์คลิปไวรัลมืออาชีพ',
                          badge: 'Fast Cut'
                        },
                        {
                          id: 'normal',
                          title: '🎬 จังหวะมาตรฐานโฆษณา',
                          desc: 'สลับมุมกล้องทุก 3 - 5 วินาที จังหวะเล่าเรื่องกระชับพอดี เหมาะกับสปอตทั่วไป',
                          badge: 'Normal'
                        },
                        {
                          id: 'cinematic',
                          title: '☕ จังหวะเนิบซึ้ง ซีเนมาติก',
                          desc: 'สลับมุมกล้องทุก 5 - 8 วินาที ดื่มด่ำบรรยากาศ เหมาะกับหนังสั้น/สารคดี',
                          badge: 'Cinematic'
                        }
                      ].map(pItem => (
                        <button
                          key={pItem.id}
                          type="button"
                          onClick={() => handlePacingSelect(pItem.id)}
                          className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                            pacing === pItem.id
                              ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/30 shadow-md'
                              : 'bg-stone-950 border-stone-800/80 hover:border-stone-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                            pacing === pItem.id ? 'border-[#F71C25] bg-[#F71C25]' : 'border-stone-300 bg-white'
                          }`}>
                            {pacing === pItem.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${pacing === pItem.id ? 'text-[#F71C25]' : 'text-stone-900'}`}>
                                {pItem.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                                {pItem.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                              {pItem.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live AI Timing Calculation Note */}
                <div className="p-3.5 rounded-2xl bg-[#FBEFC5]/50 border border-[#E5D7A3] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#F71C25] font-bold">💡 AI คำนวณให้:</span>
                    <span className="text-stone-800">
                      คลิปความยาว <strong className="text-stone-950 font-bold">{targetDuration} วินาที</strong> AI จะวางมุมกล้องสลับ <strong className="text-[#F71C25] font-bold">{numShots} ช็อต</strong> (เฉลี่ย {(targetDuration / numShots).toFixed(1)} วิ/ช็อต) เพื่อความหลากหลาย ไม่น่าเบื่อ
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#F71C25] font-bold">
                    ✓ สลับมุมกล้องไม่ซ้ำช็อต
                  </div>
                </div>
              </div>

              {/* Style & Shots Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800/80">
                <div>
                  <label className="block text-xs font-mono text-stone-500 mb-1.5">
                    สไตล์ภาพพรีวิวสตอรี่บอร์ด (Visual Style)
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 outline-none focus:border-[#F71C25] shadow-xs"
                  >
                    <option value="sketch">✏️ ภาพสเก็ตช์สตอรี่บอร์ดดินสอ/ชาร์โคล (Pencil Sketch Storyboard - แนะนำสำหรับผู้กำกับ)</option>
                    <option value="1980s Retro Thai Comedy Commercial">🎞️ ภาพถ่ายฟิล์ม 16mm สไตล์หนังไทยยุค 80s/90s (Retro Film)</option>
                    <option value="Modern Cinematic Commercial 4K">✨ ภาพถ่ายโฆษณาสตูดิโอโมเดิร์น 4K (Ultra HD Commercial)</option>
                    <option value="Vintage 90s Television Sitcom">📺 ซิทคอมโทรทัศน์ยุค 90s (Warm 90s Sitcom)</option>
                    <option value="Dramatic Action Cinema 35mm">🎬 ภาพยนตร์แอ็กชันดรามา 35mm (Dramatic 35mm Cinema)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-stone-700 font-bold flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-[#F71C25]" />
                      <span>จำนวนช็อต (รองรับสูงสุด 50 ช็อต):</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#F71C25] font-bold">
                      {numShots} ช็อต {numShots >= 30 ? '🎬 มหากาพย์ 5 ซีน' : numShots >= 15 ? '🎥 หนังสั้น 3 ซีน' : '⚡ สปอตสั้น'}
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {[4, 8, 15, 30, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumShots(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          numShots === num
                            ? 'bg-[#F71C25] text-white border-[#F71C25] shadow-md shadow-red-500/20'
                            : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-white hover:border-stone-700'
                        }`}
                      >
                        {num} ช็อต
                      </button>
                    ))}
                  </div>

                  {/* Range Slider + Exact Number Input */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 shadow-xs">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={numShots}
                      onChange={(e) => setNumShots(parseInt(e.target.value, 10))}
                      className="flex-1 accent-[#F71C25] cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={numShots}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                          setNumShots(val);
                        }}
                        className="w-12 px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200 text-center text-xs font-mono font-bold text-[#F71C25] outline-none"
                      />
                      <span className="text-[10px] font-mono text-stone-500">ช็อต</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trigger Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isPlanning}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isPlanning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>ผู้กำกับ AI (Groq LPU) กำลังวางสตอรี่บอร์ดและคำนวณมุมกล้อง...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-current" />
                      <span>ให้ AI วางโครงเรื่อง & แนะนำมุมกล้องทั้งเรื่อง (Next Step)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Shot-by-Shot Director Review */
            <div className="space-y-6">
              
              {/* Project Title & Logline */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#F71C25]" />
                    <span>{plannedData.project_title}</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {plannedData.logline}
                  </p>
                </div>
                
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const txt = generateMasterProductionPrompt(
                    plannedData.project_title,
                    plannedData.logline,
                    plannedData.shots,
                    { visualStyle: style, pacing }
                  );
                  setMasterPromptText(txt);
                  setShowMasterPromptModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="คัดลอกและดู Master Prompt ฉบับสมบูรณ์ทั้งเรื่อง"
              >
                <Copy className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>📋 คัดลอก Master Prompt ทั้งเรื่อง</span>
              </button>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-stone-500 hover:text-stone-900 underline ml-2"
              >
                ← กลับไปแก้ไขคอนเซปต์
              </button>
            </div>

              </div>

              {/* Interactive Director Multi-Segment Timeline Ribbon */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F71C25]" />
                    <span className="font-bold text-stone-900">ไทม์ไลน์ภาพยนตร์ทั้งเรื่อง (Video Timeline):</span>
                    <span className="text-[#F71C25] font-black text-sm">
                      {plannedData.total_duration || targetDuration} วินาที
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      ({plannedData.shots.length} ช็อต | เฉลี่ย {((plannedData.total_duration || targetDuration) / plannedData.shots.length).toFixed(1)} วิ/ช็อต)
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-900 font-bold bg-[#FBEFC5] px-2.5 py-0.5 rounded-lg border border-[#E5D7A3] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{pacing === 'fast' ? 'สลับมุมกล้องบ่อย (Fast Cut)' : pacing === 'normal' ? 'จังหวะมาตรฐาน' : 'จังหวะเนิบซึ้ง'}</span>
                  </div>
                </div>

                {/* Timeline Multi-Segment Bar */}
                <div className="w-full h-9 bg-white rounded-xl p-1 flex gap-1 border border-stone-200 overflow-x-auto no-scrollbar relative">
                  {plannedData.shots.map((shot, idx) => {
                    const isCurrent = activeShotIndex === idx;
                    const dur = shot.duration_seconds || 2.5;
                    const totalSec = plannedData.total_duration || targetDuration || 30;
                    const pct = Math.max(3.5, (dur / totalSec) * 100);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveShotIndex(idx)}
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-lg transition-all flex items-center justify-center text-[10px] font-mono font-bold truncate cursor-pointer flex-shrink-0 ${
                          isCurrent
                            ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20 scale-y-105 z-10'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                        }`}
                        title={`ช็อตที่ ${idx + 1}: ${dur}s (${shot.timecode || ''}) - ${shot.camera_angle}`}
                      >
                        <span className="truncate px-1">
                          #{idx + 1} ({dur}s)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scene Filter Tabs & Sequential Stepper */}
              <div className="space-y-3 bg-[#FAF9F5] p-3 rounded-2xl border border-stone-200">
                {/* Scene Filter Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-stone-500 font-bold mr-1">แยกตามซีน:</span>
                    <button
                      type="button"
                      onClick={() => setSceneFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        sceneFilter === 'all'
                          ? 'bg-[#F71C25] text-white shadow-sm'
                          : 'bg-white text-stone-700 hover:text-stone-900 border border-stone-200 shadow-2xs'
                      }`}
                    >
                      ทั้งหมด ({plannedData.shots.length})
                    </button>
                    {Array.from(new Set(plannedData.shots.map(s => s.scene_number || 1))).sort((a, b) => a - b).map(sNum => {
                      const count = plannedData.shots.filter(s => (s.scene_number || 1) === sNum).length;
                      return (
                        <button
                          key={sNum}
                          type="button"
                          onClick={() => setSceneFilter(sNum)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            sceneFilter === sNum
                              ? 'bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 shadow-sm'
                              : 'bg-stone-950 text-stone-500 hover:text-white border border-stone-800'
                          }`}
                        >
                          ซีน {sNum} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Prev / Next Step Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeShotIndex <= 0}
                      onClick={() => setActiveShotIndex(prev => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 disabled:opacity-30 text-stone-800 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>ก่อนหน้า</span>
                    </button>
                    <span className="text-xs font-mono font-bold text-[#F71C25]">
                      {activeShotIndex + 1} / {plannedData.shots.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeShotIndex >= plannedData.shots.length - 1}
                      onClick={() => setActiveShotIndex(prev => Math.min(plannedData.shots.length - 1, prev + 1))}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 disabled:opacity-30 text-stone-800 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>ถัดไป</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Numbered Shot Jump Strip (1 to N) */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {plannedData.shots.map((shot, idx) => {
                    const isCurrent = activeShotIndex === idx;
                    const inScene = sceneFilter === 'all' || (shot.scene_number || 1) === sceneFilter;
                    if (!inScene) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveShotIndex(idx)}
                        className={`w-7 h-7 flex-shrink-0 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#F71C25] text-white scale-110 shadow-md shadow-red-500/20'
                            : 'bg-white text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 shadow-2xs'
                        }`}
                        title={`ช็อตที่ ${idx + 1} - ${shot.camera_angle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shot Navigator Ribbon */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {plannedData.shots.map((shot, idx) => {
                  const isActive = activeShotIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveShotIndex(idx)}
                      className={`flex-1 min-w-[130px] p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FDF8EE] border-[#F71C25] ring-2 ring-[#F71C25]/30 shadow-md'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span className={isActive ? 'text-[#F71C25]' : 'text-stone-500'}>
                          SHOT {shot.shot_number || idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] text-[9px] font-bold">
                            ⏱️ {Number(shot.duration_seconds || 2.5).toFixed(1)}s
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200 text-[9px]">
                            {shot.lens_focal || '35mm'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate mt-1">
                        {shot.title || `ช็อตที่ ${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-[#F71C25] font-semibold truncate mt-0.5">
                        {shot.camera_angle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Shot Editor */}
              {activeShot && (
                <div className="p-5 rounded-3xl bg-white border border-stone-200 space-y-5 shadow-xs">
                  
                  {/* Shot Meta Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#F71C25] uppercase">
                        ปรับแต่งช็อตที่ {activeShot.shot_number} — {activeShot.title}
                      </span>
                      <p className="text-xs text-stone-700 mt-0.5 font-semibold">
                        มุมกล้องแนะนำ: <span className="text-[#F71C25] font-bold">{activeShot.camera_angle}</span> ({activeShot.camera_angle_th})
                      </p>
                    </div>

                    <div className="text-xs font-mono px-3 py-1 rounded-xl bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900">
                      ระยะเลนส์: <span className="text-amber-400 font-bold">{activeShot.lens_focal || '35mm'}</span>
                    </div>
                  </div>

                  {/* Shot Duration & Timecode Controller */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-stone-900">
                          ความยาวของช็อตนี้ (Shot Duration):
                        </span>
                        <p className="text-[11px] font-mono text-stone-500">
                          ไทม์โค้ดในคลิป: <strong className="text-[#F71C25] font-bold">{activeShot.timecode || '00:00 - 00:02.5'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-stone-200">
                      <button
                        type="button"
                        onClick={() => updateShotDuration(activeShotIndex, (activeShot.duration_seconds || 2.5) - 0.5)}
                        className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-bold flex items-center justify-center cursor-pointer text-base"
                        title="ลดเวลา -0.5 วิ"
                      >
                        -
                      </button>
                      <div className="flex items-center gap-1 px-3 font-mono font-bold text-sm text-[#F71C25]">
                        <span>{Number(activeShot.duration_seconds || 2.5).toFixed(1)}</span>
                        <span className="text-xs text-stone-500">วิ</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateShotDuration(activeShotIndex, (activeShot.duration_seconds || 2.5) + 0.5)}
                        className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-bold flex items-center justify-center cursor-pointer text-base"
                        title="เพิ่มเวลา +0.5 วิ"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Camera Angle Selector Grid (Compact) */}
                  <CameraAngleSelector
                    selectedAngle={activeShot.camera_angle}
                    onSelectAngle={handleAngleChange}
                    compact={true}
                  />

                  {/* Camera Movement Input */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAF9F5] border border-stone-200">
                    <label className="block text-xs font-mono text-stone-700 font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#F71C25]" />
                      <span>การเคลื่อนไหวของกล้อง (Camera Movement):</span>
                    </label>
                    <input
                      type="text"
                      value={activeShot.camera_movement || ''}
                      onChange={(e) => {
                        const updated = { ...plannedData };
                        updated.shots[activeShotIndex].camera_movement = e.target.value;
                        setPlannedData(updated);
                      }}
                      placeholder="เช่น แพนกล้องช้าๆ จากซ้ายไปขวา (Slow Pan Left-to-Right), ดอลลี่อินเข้าหาใบหน้า"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-[#F71C25] shadow-2xs"
                    />
                  </div>

                  {/* Action & Dialogue Editor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-stone-500 font-bold">
                        เหตุการณ์ในฉาก (Action Description)
                      </label>
                      <textarea
                        rows={3}
                        value={activeShot.action_description || ''}
                        onChange={(e) => {
                          const updated = { ...plannedData };
                          updated.shots[activeShotIndex].action_description = e.target.value;
                          setPlannedData(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-[#F71C25] resize-none leading-relaxed shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-stone-500 font-bold">
                        บทพูด / เสียงพากย์ (Dialogue / VO)
                      </label>
                      <textarea
                        rows={3}
                        value={activeShot.dialogue || ''}
                        onChange={(e) => {
                          const updated = { ...plannedData };
                          updated.shots[activeShotIndex].dialogue = e.target.value;
                          setPlannedData(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-[#F71C25] resize-none leading-relaxed shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Audio Foley & On-Screen Text Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-3 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD]">
                      <label className="block text-xs font-mono text-stone-800 font-bold flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>เสียงประกอบ & Foley (Audio & Sound FX)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={activeShot.audio_foley || ''}
                        onChange={(e) => {
                          const updated = { ...plannedData };
                          updated.shots[activeShotIndex].audio_foley = e.target.value;
                          setPlannedData(updated);
                        }}
                        placeholder="เช่น เสียงแอมเบียนต์ตลาดสด, เสียงสากตำส้มตำโป๊กๆ, เพลงประกอบคึกคัก"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-amber-500 resize-none shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5 p-3 rounded-2xl bg-sky-50/50 border border-sky-200/80">
                      <label className="block text-xs font-mono text-sky-900 font-bold flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-sky-600" />
                        <span>ข้อความตัวหนังสือในคลิป (On-Screen Text)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={activeShot.on_screen_text || ''}
                        onChange={(e) => {
                          const updated = { ...plannedData };
                          updated.shots[activeShotIndex].on_screen_text = e.target.value;
                          setPlannedData(updated);
                        }}
                        placeholder="เช่น 'ส้มตำป้านี เผ็ดสะดุ้งลิ้น' หรือ ระบุว่า 'ไม่มี เพื่อความสมจริง'"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-sky-500 resize-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Video AI Prompt (Kling / Runway Gen-3) */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-purple-600" />
                        <span>Prompt สำหรับนำไปสร้างวิดีโอ (Video AI Prompt — Kling / Runway Gen-3):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeShot.video_prompt) {
                            navigator.clipboard.writeText(activeShot.video_prompt);
                            alert('คัดลอก Video Prompt ไปยังคลิปบอร์ดแล้ว!');
                          }
                        }}
                        className="text-[11px] text-purple-800 hover:text-purple-950 flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 border border-purple-300 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Video Prompt</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={activeShot.video_prompt || ''}
                      onChange={(e) => {
                        const updated = { ...plannedData };
                        updated.shots[activeShotIndex].video_prompt = e.target.value;
                        setPlannedData(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono text-purple-950 outline-none focus:border-purple-500 resize-none shadow-2xs"
                    />
                  </div>

                  {/* Live Action Guide (ถ้าไม่เจนภาพ จะถ่ายจริงอย่างไร) */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                    <label className="block text-xs font-mono text-emerald-900 font-bold flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>คำแนะนำสำหรับกองถ่ายทำจริง (Live-Action Guide — การจัดแสง, พร็อพ, เลนส์, การกำกับนักแสดง):</span>
                    </label>
                    <textarea
                      rows={2}
                      value={activeShot.live_action_guide || ''}
                      onChange={(e) => {
                        const updated = { ...plannedData };
                        updated.shots[activeShotIndex].live_action_guide = e.target.value;
                        setPlannedData(updated);
                      }}
                      placeholder="คำแนะนำการจัดแสงธรรมชาติ/สปอตไลท์ พร็อพ เลนส์กล้อง และการกำกับนักแสดง"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-emerald-950 outline-none focus:border-emerald-500 resize-none leading-relaxed shadow-2xs"
                    />
                  </div>

                  {/* Prompt for Image Generation (Keyframe / Sketch) */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-800">
                      <span className="font-bold text-[#F71C25]">Master Prompt สำหรับนำไปสร้างภาพนิ่ง/สเก็ตช์ (Image Keyframe Prompt):</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeShot.prompt) {
                            navigator.clipboard.writeText(activeShot.prompt);
                            alert('คัดลอก Master Prompt ไปยังคลิปบอร์ดแล้ว!');
                          }
                        }}
                        className="text-[11px] text-stone-800 hover:text-stone-950 flex items-center gap-1 px-2.5 py-1 rounded bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] font-bold cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={activeShot.prompt || ''}
                      onChange={(e) => {
                        const updated = { ...plannedData };
                        updated.shots[activeShotIndex].prompt = e.target.value;
                        setPlannedData(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-900 outline-none focus:border-[#F71C25] resize-none shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Commit Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <div className="text-xs text-stone-500 font-mono">
                  * เมื่อกดบันทึก ระบบจะนำทั้ง {plannedData.shots.length} ช็อตไปสร้างการ์ดสตอรี่บอร์ดบนบอร์ดหลักให้ทันที
                </div>

                <button
                  type="button"
                  onClick={handleCommitToBoard}
                  disabled={isCommitting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังนำเข้าสตอรี่บอร์ด...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>บันทึกสตอรี่บอร์ดลงบอร์ดหลัก (Commit)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      
        {/* Master Production Prompt Modal */}
        <MasterPromptModal
          isOpen={showMasterPromptModal}
          onClose={() => setShowMasterPromptModal(false)}
          masterPromptText={masterPromptText}
          projectTitle={plannedData?.project_title}
        />
      </div>
    </div>
  );
}
