import { generateMasterProductionPrompt } from '../utils/masterPromptHelper';
import MasterPromptModal from './MasterPromptModal';
import BatchEditPromptsModal from './BatchEditPromptsModal';
import React from 'react';
import {
  ChevronDown, Share2, Sparkles, Image as ImageIcon, Video, Volume2, FileText,
  Sliders, Grid, Folder, CheckSquare, Upload, Flame, Zap, Trash2, Edit3
} from 'lucide-react';

export default function BoardHeader({
  activeTab,
  setActiveTab,
  filterType,
  setFilterType,
  zoomLevel,
  setZoomLevel,
  onOpenViralGuide,
  onOpenGroqModal,
  onClearBoard,
  seriesList = [],
  selectedSeriesId = 'all',
  onSelectSeries,
  onDeleteSeries,
  onStartNewProject,
  promptsCount = 0,
  prompts = [],
  onBatchUpdated
}) {
  const currentSeries = seriesList.find(s => s.id === selectedSeriesId);
  const [showMasterModal, setShowMasterModal] = React.useState(false);
  const [masterText, setMasterText] = React.useState("");
  const [showBatchModal, setShowBatchModal] = React.useState(false);

  return (
    <div className="bg-white border-b border-stone-200/90 select-none shadow-2xs">
      {/* Top Banner & Project Selector Row */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 border-b border-stone-100">
        {/* Interactive Storyboard Project Selector */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-mono font-bold text-[#F71C25] uppercase hidden sm:inline flex-shrink-0">โปรเจกต์:</span>
          
          <select
            value={selectedSeriesId || 'all'}
            onChange={(e) => onSelectSeries && onSelectSeries(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 font-bold text-xs outline-none focus:border-[#F71C25] cursor-pointer flex-1 min-w-0 sm:flex-initial sm:max-w-[280px] truncate transition-colors shadow-2xs"
          >
            {seriesList && seriesList.map(s => (
              <option key={s.id} value={s.id}>
                📁 {s.title} ({s.shot_count ?? 0} ช็อต)
              </option>
            ))}
            <option value="all">🎬 รวมทุกโปรเจกต์ ({promptsCount} ช็อต)</option>
          </select>

          {/* Prominent Start New Project Button */}
          <button
            onClick={onStartNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold text-xs shadow-sm shadow-red-500/20 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            title="เริ่มเขียนสตอรี่บอร์ดโปรเจกต์ใหม่แยกเป็นอิสระ ไม่ปนกับเรื่องเดิม"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">+ เริ่มโปรเจกต์ใหม่</span>
          </button>

          
          {/* Master Production Prompt Button */}
          <button
            onClick={async () => {
              try {
                const sId = selectedSeriesId === 'all' ? '' : selectedSeriesId;
                const res = await fetch(`/api/prompts${sId ? '?series_id=' + sId : ''}`);
                const data = await res.json();
                const shots = data.data || [];
                const txt = generateMasterProductionPrompt(
                  currentSeries ? currentSeries.title : 'รวมทุกโปรเจกต์สตอรี่บอร์ด',
                  currentSeries ? currentSeries.description : '',
                  shots
                );
                setMasterText(txt);
                setShowMasterModal(true);
              } catch (err) {
                console.error(err);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer flex-shrink-0"
            title="ดูและคัดลอก Master Prompt ครอบคลุมทั้งโปรเจกต์"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F71C25]" />
            <span className="hidden sm:inline">📋 Master Prompt ทั้งเรื่อง</span>
            <span className="sm:hidden">Master Prompt</span>
          </button>

          {/* Batch Edit All Prompts in Project Button */}
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer flex-shrink-0"
            title="เปิดหน้าต่างแก้ไขและปรับแต่ง Prompt ของทุกช็อตในโปรเจกต์พร้อมกัน"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#F71C25]" />
            <span className="hidden sm:inline">✏️ แก้ไข Prompt ทุกช็อต</span>
            <span className="sm:hidden">แก้ไขทุกช็อต</span>
          </button>
  
          {/* Quick Delete Series Button if a specific series is selected */}
          {selectedSeriesId && selectedSeriesId !== 'all' && (
            <button
              onClick={() => onDeleteSeries && onDeleteSeries(selectedSeriesId)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-900 text-xs font-bold transition-all shadow-2xs cursor-pointer flex-shrink-0"
              title="ลบโปรเจกต์ที่เลือกนี้พร้อมช็อตทั้งหมด"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ลบ</span>
            </button>
          )}

          {currentSeries && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FDF8ED] border border-[#EADBBD] text-stone-800 hidden xl:inline-block truncate max-w-[200px]">
              {currentSeries.description || `${currentSeries.shot_count || 0} ช็อต`}
            </span>
          )}
        </div>

        {/* Engine status indicator (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-stone-800">AI Director:</span>
          <span className="text-[#F71C25] font-mono text-[11px] font-bold">
            Groq LPU (Script) • Gemini 3.8 Vision
          </span>
        </div>

        {/* Action Buttons: Groq AI & Share */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onOpenGroqModal}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:border-orange-400 text-orange-800 hover:text-orange-950 text-xs font-bold transition-all shadow-xs"
            title="ผู้ช่วยเขียนบทและ Prompt อัตโนมัติด้วย Groq Cloud AI"
          >
            <Zap className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span className="hidden sm:inline">Groq AI คิดบท</span>
          </button>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('คัดลอกลิงก์โปรเจกต์ CineBoard AI Studio เรียบร้อยแล้ว!');
              }
            }}
            className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition-colors"
            title="แชร์ลิงก์โปรเจกต์"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">แชร์</span>
          </button>

          {onClearBoard && (
            <button
              onClick={onClearBoard}
              className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-400 text-xs font-bold text-rose-700 transition-all cursor-pointer shadow-2xs"
              title="ล้างการ์ดบนบอร์ดทั้งหมดเพื่อเริ่มสตอรี่บอร์ดใหม่"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ล้างบอร์ด</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar with View Tabs, Type Filter Pills, and Zoom Controls */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto no-scrollbar bg-[#FCFBF8]">
        {/* Left: View Tabs + สูตร Viral */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'board'
                ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            บอร์ดภาพ
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'projects' || activeTab === 'inspirations'
                ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="ดูประวัติสตอรี่บอร์ดทั้งหมดที่เคยสร้างเป็นกลุ่มโปรเจกต์"
          >
            <Folder className="w-3.5 h-3.5 text-amber-600" />
            <span>ประวัติ ({seriesList.length})</span>
          </button>
          <button
            onClick={onOpenViralGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all ml-0.5"
          >
            <Flame className="w-3.5 h-3.5 text-orange-600" />
            <span>สูตรผู้กำกับ</span>
          </button>
        </div>

        {/* Center: Type Filter Pill */}
        <div className="flex items-center bg-stone-100/90 border border-stone-200 rounded-xl p-0.5 text-stone-600 font-mono text-[11px] flex-shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'hover:text-stone-900'}`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-2 py-1 rounded-lg transition-all ${filterType === 'image' ? 'bg-white text-[#F71C25] font-bold shadow-xs' : 'hover:text-stone-900'}`}
            title="เฉพาะภาพ"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-2 py-1 rounded-lg transition-all ${filterType === 'video' ? 'bg-white text-[#F71C25] font-bold shadow-xs' : 'hover:text-stone-900'}`}
            title="เฉพาะวิดีโอ"
          >
            <Video className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-2 py-1 rounded-lg transition-all ${filterType === 'audio' ? 'bg-white text-[#F71C25] font-bold shadow-xs' : 'hover:text-stone-900'}`}
            title="เสียงพากย์และ Foley"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFilterType('global')}
            className={`px-2 py-1 rounded-lg transition-all ${filterType === 'global' ? 'bg-white text-[#F71C25] font-bold shadow-xs' : 'hover:text-stone-900'}`}
            title="สไตล์รวม"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Zoom slider & Utilities (Desktop only) */}
        <div className="hidden sm:flex items-center gap-3 text-stone-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-stone-500">ย่อ/ขยาย</span>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
              className="w-16 sm:w-24 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#F71C25]"
            />
          </div>

          <div className="h-4 w-[1px] bg-stone-200" />

          <button className="p-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" title="Grid View">
            <Grid className="w-4 h-4" />
          </button>
          <button className="p-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" title="Filters">
            <Sliders className="w-4 h-4" />
          </button>
          <button className="p-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" title="Folder">
            <Folder className="w-4 h-4" />
          </button>
          <button className="p-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" title="Selection">
            <CheckSquare className="w-4 h-4" />
          </button>
          <button className="p-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer" title="Export">
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <MasterPromptModal
          isOpen={showMasterModal}
          onClose={() => setShowMasterModal(false)}
          masterPromptText={masterText}
          projectTitle={currentSeries?.title}
        />
        <BatchEditPromptsModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          prompts={prompts}
          projectTitle={currentSeries?.title}
          onBatchUpdated={onBatchUpdated}
        />
      </div>
    </div>
  );
}
