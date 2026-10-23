import React, { useState } from 'react';
import {
  Sparkles, Grid, Trash2, Edit3, FileText, ZoomIn, ZoomOut,
  Layers, Folder, CheckSquare
} from 'lucide-react';
import { generateMasterProductionPrompt } from '../utils/masterPromptHelper';
import MasterPromptModal from './MasterPromptModal';
import BatchEditPromptsModal from './BatchEditPromptsModal';

export default function BoardHeader({
  zoomLevel = 2,
  setZoomLevel,
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
  const currentSeries = seriesList.find((s) => s.id === selectedSeriesId);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterText, setMasterText] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);

  const handleOpenMasterPrompt = async () => {
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
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถดึงข้อมูล Prompts ได้');
    }
  };

  return (
    <div className="bg-white border-b border-stone-200/90 select-none shadow-2xs">
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2.5">
        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <span className="text-xs font-mono font-bold text-[#F71C25] uppercase hidden sm:inline flex-shrink-0">
            โปรเจกต์:
          </span>

          <select
            value={selectedSeriesId || 'all'}
            onChange={(e) => onSelectSeries && onSelectSeries(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 font-bold text-xs outline-none focus:border-[#F71C25] cursor-pointer flex-1 min-w-0 sm:flex-initial sm:max-w-xs truncate transition-colors shadow-2xs"
          >
            {seriesList &&
              seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  📁 {s.title} ({s.shot_count ?? 0} ช็อต)
                </option>
              ))}
            <option value="all">🎬 รวมทุกโปรเจกต์ ({promptsCount} ช็อต)</option>
          </select>

          {/* Delete Project Button (if a specific project is selected) */}
          {selectedSeriesId && selectedSeriesId !== 'all' && (
            <button
              onClick={() => onDeleteSeries && onDeleteSeries(selectedSeriesId)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 transition-colors cursor-pointer"
              title="ลบโปรเจกต์นี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Master Prompt Button (Copy All Prompts) */}
          <button
            onClick={handleOpenMasterPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDF8EE] hover:bg-[#FBEFC5] border border-[#EADBBD] text-stone-900 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            title="รวม Master Prompts และ Video Prompts ทุกช็อตเพื่อนำไปใช้ใน Kling/Runway/Flow"
          >
            <FileText className="w-3.5 h-3.5 text-[#F71C25]" />
            <span className="hidden sm:inline">รวม Prompts ทั้งหมด</span>
            <span className="sm:hidden">รวม Prompts</span>
          </button>

          {/* Batch Edit Button */}
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            title="แก้ไขช็อตทั้งหมดพร้อมกัน หรือจัดเรียงลำดับ"
          >
            <CheckSquare className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden md:inline">แก้ไขเป็นชุด</span>
          </button>
        </div>

        {/* Right: Zoom Controls & Clear Board */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Zoom Level Pills */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-mono">
            <button
              onClick={() => setZoomLevel && setZoomLevel(1)}
              className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                zoomLevel === 1 ? 'bg-white font-bold text-stone-950 shadow-xs' : 'text-stone-500'
              }`}
              title="Contact Sheet (ย่อเล็ก)"
            >
              S
            </button>
            <button
              onClick={() => setZoomLevel && setZoomLevel(2)}
              className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                zoomLevel === 2 ? 'bg-white font-bold text-stone-950 shadow-xs' : 'text-stone-500'
              }`}
              title="Standard View (ปกติ)"
            >
              M
            </button>
            <button
              onClick={() => setZoomLevel && setZoomLevel(3)}
              className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                zoomLevel === 3 ? 'bg-white font-bold text-stone-950 shadow-xs' : 'text-stone-500'
              }`}
              title="Large HD (ใหญ่)"
            >
              L
            </button>
          </div>

          {/* Clear Board */}
          <button
            onClick={onClearBoard}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 text-xs transition-colors cursor-pointer flex items-center gap-1 font-mono"
            title="ล้างการ์ดบนบอร์ดทั้งหมดเพื่อเริ่มใหม่"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ล้างบอร์ด</span>
          </button>
        </div>
      </div>

      {/* Master Prompt Modal */}
      {showMasterModal && (
        <MasterPromptModal
          isOpen={showMasterModal}
          onClose={() => setShowMasterModal(false)}
          promptText={masterText}
          projectTitle={currentSeries ? currentSeries.title : 'รวมทุกโปรเจกต์สตอรี่บอร์ด'}
        />
      )}

      {/* Batch Edit Modal */}
      {showBatchModal && (
        <BatchEditPromptsModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          prompts={prompts}
          onUpdated={onBatchUpdated}
        />
      )}
    </div>
  );
}
