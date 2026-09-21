import React, { useState, useEffect } from 'react';
import {
  Film, Folder, Sparkles, Copy, Trash2, Video, Camera, Layers,
  Clock, Zap, Calendar, ChevronDown, ChevronUp, Play, CheckCircle2,
  AlertCircle, ArrowRight, Plus, Eye, Share2, Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STORYBOARD_SHOWCASES } from './InspirationsView';
import { getShotDisplayImage } from '../utils/storyboardHelper';

export default function ProjectHistoryView({
  seriesList = [],
  selectedSeriesId = 'all',
  onSelectSeries,
  onDeleteSeries,
  onSelectItem,
  onStoryboardCommitted,
  onOpenDirectorWizard,
  onSwitchToBoard
}) {
  const [activeTab, setActiveTab] = useState('my-projects'); // 'my-projects' | 'showcases'
  const [expandedSeriesId, setExpandedSeriesId] = useState(null);
  const [seriesShotsMap, setSeriesShotsMap] = useState({});
  const [loadingShotsFor, setLoadingShotsFor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Showcases sub-state (for the templates tab)
  const [activeShowcaseId, setActiveShowcaseId] = useState(STORYBOARD_SHOWCASES[0]?.id || 'sc-car-commercial');
  const [isCommitting, setIsCommitting] = useState(false);

  const activeShowcase = STORYBOARD_SHOWCASES.find(sc => sc.id === activeShowcaseId) || STORYBOARD_SHOWCASES[0];

  // Fetch shots when user expands a project
  const toggleExpandSeries = async (seriesId) => {
    if (expandedSeriesId === seriesId) {
      setExpandedSeriesId(null);
      return;
    }

    setExpandedSeriesId(seriesId);

    // If already fetched, don't fetch again
    if (seriesShotsMap[seriesId]) return;

    setLoadingShotsFor(seriesId);
    try {
      const res = await fetch(`/api/prompts?series_id=${seriesId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSeriesShotsMap(prev => ({ ...prev, [seriesId]: data.data }));
      }
    } catch (err) {
      console.error('Failed to load shots for series', seriesId, err);
    } finally {
      setLoadingShotsFor(null);
    }
  };

  const handleOpenProjectInBoard = (seriesId) => {
    if (onSelectSeries) {
      onSelectSeries(seriesId);
    }
    if (onSwitchToBoard) {
      onSwitchToBoard();
    }
  };

  // Copy plan for a custom series
  const handleCopySeriesPlan = (series, shots = []) => {
    if (!shots || shots.length === 0) {
      alert('โปรเจกต์นี้ยังไม่มีการ์ดช็อต');
      return;
    }
    const text = shots.map((s, idx) => 
      `SHOT ${s.step_number || idx + 1}: ${s.title}` +
      `\n• เวลา: ⏱️ ${s.duration_seconds || 2.5}s (${s.timecode || '00:00'})` +
      `\n• มุมกล้อง: ${s.camera_angle || s.subtitle || 'N/A'}` +
      `\n• Video Prompt: ${s.video_prompt || s.content || 'N/A'}` +
      (s.dialogue_script ? `\n• บทพูด: ${s.dialogue_script}` : '') +
      (s.on_screen_text ? `\n• ข้อความ: ${s.on_screen_text}` : '') +
      (s.live_action_guide ? `\n• คู่มือกองถ่ายจริง: ${s.live_action_guide}` : '')
    ).join('\n---\n\n');

    navigator.clipboard.writeText(`โปรเจกต์: ${series.title}\nจำนวนช็อต: ${shots.length}\n\n${text}`);
    confetti({ particleCount: 30, spread: 50 });
    alert(`คัดลอกแผนสตอรี่บอร์ด "${series.title}" (${shots.length} ช็อต) เรียบร้อยแล้ว!`);
  };

  // Filtered series
  const filteredSeries = seriesList.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (s.title && s.title.toLowerCase().includes(q)) ||
           (s.description && s.description.toLowerCase().includes(q));
  });

  return (
    <div className="p-3 sm:p-6 pb-28 md:pb-6 select-none space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3]">
              <Folder className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
              คลังประวัติสตอรี่บอร์ด (Projects Hub)
            </h1>
          </div>
          <p className="text-xs text-stone-500 pl-9">
            รวมสตอรี่บอร์ดทั้งหมดที่คุณเคยสร้าง จัดกลุ่มเป็นโปรเจกต์ ดูช็อตย่อยด้านใน และสลับเข้าทำงานได้ทันที
          </p>
        </div>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onOpenDirectorWizard}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ สร้างสตอรี่บอร์ดใหม่</span>
          </button>
        </div>
      </div>

      {/* Main View Tabs: My Projects vs Showcase Templates */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my-projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'my-projects'
                ? 'bg-gradient-to-r from-[#F71C25] to-[#FF4438] text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>โปรเจกต์ของฉัน ({seriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('showcases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'showcases'
                ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] font-bold shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>แม่แบบตัวอย่าง (Showcases) ({STORYBOARD_SHOWCASES.length})</span>
          </button>
        </div>

        {activeTab === 'my-projects' && seriesList.length > 0 && (
          <div className="w-60">
            <input
              type="text"
              placeholder="ค้นหาชื่อโปรเจกต์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-[#F71C25] transition-colors shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* TAB 1: MY PROJECTS HISTORY */}
      {activeTab === 'my-projects' && (
        <div className="space-y-4">
          {filteredSeries.length === 0 ? (
            <div className="py-16 px-4 bg-white border border-stone-200 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-[#F71C25] shadow-inner">
                <Film className="w-8 h-8 opacity-70" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  {searchQuery ? 'ไม่พบโปรเจกต์ที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติสตอรี่บอร์ด'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {searchQuery
                    ? 'ลองเปลี่ยนคำค้นหา หรือรีเซ็ตการค้นหา'
                    : 'เริ่มต้นสร้างสตอรี่บอร์ดแรกของคุณด้วย AI หรือเลือกดูแม่แบบสำเร็จรูปในแท็บ "แม่แบบตัวอย่าง" ได้ทันที'}
                </p>
              </div>
              <div>
                <button
                  onClick={onOpenDirectorWizard}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] text-white font-black text-xs inline-flex items-center gap-2 shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>สร้างสตอรี่บอร์ดใหม่ตอนนี้</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSeries.map((s) => {
                const isCurrentActive = selectedSeriesId === s.id;
                const isExpanded = expandedSeriesId === s.id;
                const shots = seriesShotsMap[s.id] || [];
                const isLoadingShots = loadingShotsFor === s.id;

                const pacingLabel = s.pacing === 'fast'
                  ? '⚡ คัตเร็ว สลับมุมบ่อย'
                  : s.pacing === 'cinematic'
                  ? '🎬 คัตยาว ซีเนมาติก'
                  : '⚖️ จังหวะปกติ';

                return (
                  <div
                    key={s.id}
                    className={`bg-white border transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-md ${
                      isCurrentActive
                        ? 'border-[#F71C25] ring-2 ring-[#F71C25]/20 shadow-md'
                        : 'border-stone-200/90 hover:border-stone-300'
                    }`}
                  >
                    {/* Project Main Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Project Info */}
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F71C25] text-white font-black text-[10px] uppercase font-mono shadow-xs">
                              ✓ กำลังเปิดใช้งานบนบอร์ด
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 font-mono text-[11px] font-bold">
                            🎬 {s.shot_count ?? 0} ช็อต
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-[#FDF8EE] border border-[#EADBBD] text-stone-900 font-mono text-[11px] font-bold">
                            ⏱️ รวม {s.total_duration ? Math.round(s.total_duration * 10) / 10 : (s.target_duration || 30)}s
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-600 font-mono text-[11px]">
                            {pacingLabel}
                          </span>

                          {s.created_at && (
                            <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.created_at).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-[#F71C25] flex-shrink-0" />
                          <span>{s.title}</span>
                        </h3>

                        {s.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {s.description}
                          </p>
                        )}
                      </div>

                      {/* Project Actions */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                        {/* Toggle Expand / View Sub-Shots */}
                        <button
                          onClick={() => toggleExpandSeries(s.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                            isExpanded
                              ? 'bg-stone-100 border-stone-300 text-stone-900'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                          }`}
                          title="ดูช็อตย่อยทั้งหมดภายในโปรเจกต์นี้"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#F71C25]" />
                          <span>{isExpanded ? 'ซ่อนช็อตย่อย' : `ดูช็อตย่อย (${s.shot_count ?? 0})`}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open in Board */}
                        <button
                          onClick={() => handleOpenProjectInBoard(s.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-red-500/20 transition-all cursor-pointer"
                          title="เปิดโปรเจกต์นี้ขึ้นบอร์ดทำงานหลัก"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>เปิดทำงานในบอร์ด</span>
                        </button>

                        {/* Delete Storyboard Project */}
                        <button
                          onClick={() => onDeleteSeries && onDeleteSeries(s)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          title="ลบโปรเจกต์สตอรี่บอร์ดนี้พร้อมช็อตทั้งหมด"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED SUB-PROJECT SHOTS VIEW */}
                    {isExpanded && (
                      <div className="border-t border-stone-200 bg-[#FCFBF8] p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs text-stone-600 pb-1">
                          <span className="font-bold flex items-center gap-2 text-stone-900">
                            <Camera className="w-4 h-4 text-[#F71C25]" />
                            <span>ลำดับช็อตในโปรเจกต์ ({shots.length} ช็อต) — คลิกที่การ์ดเพื่อตรวจรายละเอียด Director Inspector</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopySeriesPlan(s, shots)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="คัดลอกแผนทั้งเรื่อง"
                            >
                              <Copy className="w-3 h-3 text-[#F71C25]" />
                              <span>คัดลอกทั้งเรื่อง</span>
                            </button>
                          </div>
                        </div>

                        {isLoadingShots ? (
                          <div className="py-12 text-center text-xs font-mono text-stone-500 flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-[#F71C25]/30 border-t-[#F71C25] rounded-full animate-spin" />
                            <span>กำลังโหลดช็อตย่อยในโปรเจกต์...</span>
                          </div>
                        ) : shots.length === 0 ? (
                          <div className="py-8 text-center text-xs font-mono text-stone-500 bg-white rounded-xl border border-stone-200">
                            ยังไม่มีการ์ดช็อตในโปรเจกต์นี้
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {shots.map((shot, idx) => {
                              const displayImg = getShotDisplayImage(shot);
                              return (
                                <div
                                  key={shot.id || idx}
                                  onClick={() => {
                                    if (onSelectItem) onSelectItem(shot);
                                  }}
                                  className="bg-white border border-stone-200 hover:border-[#F71C25] rounded-xl overflow-hidden cursor-pointer transition-all group flex flex-col justify-between shadow-2xs hover:shadow-md"
                                >
                                  {/* Shot Thumbnail */}
                                  <div className="relative aspect-[9/16] bg-[#FAF8F5] overflow-hidden border-b border-stone-100">
                                    <img
                                      src={displayImg}
                                      alt={shot.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Top Shot # Badge */}
                                    <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none">
                                      <span className="px-1.5 py-0.2 rounded bg-white/95 backdrop-blur-md text-[9px] font-mono font-black text-[#F71C25] border border-[#F71C25]/30 shadow-2xs">
                                        #{shot.step_number || idx + 1}
                                      </span>
                                      {shot.duration_seconds && (
                                        <span className="px-1.5 py-0.2 rounded bg-[#FDF8EE]/95 backdrop-blur-md text-[9px] font-mono text-stone-900 font-bold border border-[#EADBBD] shadow-2xs">
                                          ⏱️ {shot.duration_seconds}s
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Shot Footer Info */}
                                  <div className="p-2 space-y-1 bg-[#FAF9F6]">
                                    <div className="text-[11px] font-bold text-stone-900 truncate" title={shot.title}>
                                      {shot.title}
                                    </div>
                                    <div className="text-[10px] font-mono text-stone-500 truncate">
                                      {shot.camera_angle || shot.subtitle || 'General Angle'}
                                    </div>
                                    {shot.timecode && (
                                      <div className="text-[9px] font-mono text-[#F71C25] font-bold truncate">
                                        {shot.timecode}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SHOWCASE TEMPLATES (เดิมจาก InspirationsView) */}
      {activeTab === 'showcases' && (
        <div className="space-y-6">
          {/* Showcase Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STORYBOARD_SHOWCASES.map(sc => (
              <button
                key={sc.id}
                onClick={() => setActiveShowcaseId(sc.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                  activeShowcaseId === sc.id
                    ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] font-bold shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>{sc.title}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activeShowcaseId === sc.id ? 'bg-[#FAF0D4] text-stone-900 font-black' : 'bg-stone-100 text-stone-600'}`}>
                  {sc.shots.length} ช็อต
                </span>
              </button>
            ))}
          </div>

          {/* Active Showcase Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FDF8EE] border border-[#EADBBD] text-stone-900 font-mono font-bold">
                  {activeShowcase.category}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 font-mono">
                  ความยาวเป้าหมาย: {activeShowcase.target_duration}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 font-mono">
                  อัตราส่วน {activeShowcase.aspect_ratio}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {activeShowcase.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {activeShowcase.description}
              </p>
            </div>

            {/* Master Actions */}
            <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
              <button
                onClick={() => {
                  const fullPlan = activeShowcase.shots.map(s => 
                    `SHOT ${s.shot_number}: ${s.title}\n• มุมกล้อง: ${s.camera_angle_th} (${s.lens_focal})\n• การเคลื่อนกล้อง: ${s.camera_movement}\n• Video Prompt: ${s.video_prompt}\n• On-Screen Text: ${s.on_screen_text}\n• Live-Action Guide: ${s.live_action_guide}\n`
                  ).join('\n---\n\n');
                  navigator.clipboard.writeText(`สตอรี่บอร์ด: ${activeShowcase.title}\nสไตล์: ${activeShowcase.visual_style}\n\n${fullPlan}`);
                  alert('คัดลอกแผนสตอรี่บอร์ดทั้งชุดเรียบร้อยแล้ว!');
                  confetti({ particleCount: 35, spread: 60 });
                }}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200 flex items-center gap-2 transition-all cursor-pointer"
                title="คัดลอกรายละเอียดทุกช็อตพร้อมมุมกล้องและ Video Prompts"
              >
                <Copy className="w-3.5 h-3.5 text-[#F71C25]" />
                <span>คัดลอกแผนทั้งเรื่อง</span>
              </button>

              <button
                onClick={async () => {
                  setIsCommitting(true);
                  try {
                    const res = await fetch('/api/storyboard/commit-shots', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        shots: activeShowcase.shots,
                        project_title: activeShowcase.title,
                        visual_style: activeShowcase.visual_style
                      })
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
                      alert(`นำเข้าสตอรี่บอร์ด "${activeShowcase.title}" (${data.data.length} ช็อต) ขึ้นบอร์ดเรียบร้อยแล้ว!`);
                      if (onStoryboardCommitted) {
                        onStoryboardCommitted(data.data);
                      }
                    } else {
                      alert(data.error || 'ไม่สามารถนำเข้าสตอรี่บอร์ดได้');
                    }
                  } catch (e) {
                    console.error(e);
                    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
                  } finally {
                    setIsCommitting(false);
                  }
                }}
                disabled={isCommitting}
                className="px-5 py-2.5 rounded-xl bg-[#F71C25] hover:bg-[#d0151d] text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isCommitting ? (
                  <span>กำลังนำเข้าสู่บอร์ด...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>📥 นำเข้าสตอรี่บอร์ดชุดนี้ขึ้นบอร์ด</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sequential Storyboard Shots Rail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span className="font-bold flex items-center gap-1.5 text-stone-200">
                <Camera className="w-4 h-4 text-[#F71C25]" />
                <span>ลำดับช็อตสตอรี่บอร์ด ({activeShowcase.shots.length} ช็อตต่อเนื่อง)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {activeShowcase.shots.map((shot) => (
                <div
                  key={shot.shot_number}
                  onClick={() => onSelectItem && onSelectItem({
                    id: `showcase-${activeShowcase.id}-${shot.shot_number}`,
                    step_number: shot.shot_number,
                    title: shot.title,
                    subtitle: shot.camera_angle_th,
                    content: shot.prompt,
                    video_prompt: shot.video_prompt,
                    audio_foley: shot.audio_foley,
                    on_screen_text: shot.on_screen_text,
                    camera_angle: shot.camera_angle,
                    camera_movement: shot.camera_movement,
                    live_action_guide: shot.live_action_guide,
                    image_url: shot.image_url,
                    aspect_ratio: activeShowcase.aspect_ratio,
                    visual_style: shot.visual_style || activeShowcase.visual_style,
                    dialogue_script: shot.dialogue
                  })}
                  className="bg-[#141416] border border-stone-800/90 hover:border-[#F71C25] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-red-500/20"
                >
                  <div className="relative aspect-[9/16] bg-black overflow-hidden border-b border-stone-800">
                    <img
                      src={shot.image_url}
                      alt={shot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-black text-[#F71C25] border border-[#F71C25]/30">
                        SHOT {shot.shot_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono text-stone-300 border border-white/10">
                        {shot.lens_focal}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-amber-300 font-bold border border-amber-500/30 pointer-events-none">
                      ⏱️ {shot.duration_sec}s
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="text-xs font-bold text-stone-200 line-clamp-1">
                      {shot.title}
                    </div>
                    <div className="text-[11px] text-[#F71C25]/90 font-mono line-clamp-1">
                      {shot.camera_angle_th}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
