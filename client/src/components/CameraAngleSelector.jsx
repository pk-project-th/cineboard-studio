import React from 'react';
import {
  Maximize2, Eye, Video, Film, Sparkles, Compass,
  MoveDown, MoveUp, Sliders, ChevronRight, Check
} from 'lucide-react';

export const CAMERA_ANGLES = [
  {
    id: 'Extreme Wide Shot',
    nameTh: 'มุมกว้างพิเศษ (Extreme Wide Shot - EWS)',
    shortCode: 'EWS',
    lens: '18-24mm',
    bestFor: 'เปิดฉาก แนะนำสถานที่ บรรยากาศภาพรวม และขนาดของสเกล',
    description: 'เน้นฉากสภาพแวดล้อม ตัวละครจะตัวเล็กมาก เหมาะสำหรับสร้างความรู้สึกยิ่งใหญ่ หรือความเวิ้งว้าง',
    color: 'from-blue-600 to-indigo-700',
    icon: Maximize2
  },
  {
    id: 'Wide Shot',
    nameTh: 'มุมกว้างมาตรฐาน (Wide / Full Shot - WS)',
    shortCode: 'WS',
    lens: '28-35mm',
    bestFor: 'เห็นตัวละครเต็มตัวตั้งแต่หัวจรดเท้า และปฏิสัมพันธ์กับสิ่งรอบข้าง',
    description: 'ช็อตสร้างความสัมพันธ์ระหว่างตัวละครและฉาก เห็นการแต่งกาย คอสตูม และท่าทางแอ็กชันชัดเจน',
    color: 'from-cyan-600 to-blue-700',
    icon: Film
  },
  {
    id: 'Medium Shot',
    nameTh: 'ช็อตระดับเอว (Medium Shot - MS)',
    shortCode: 'MS',
    lens: '50mm',
    bestFor: 'เล่าเรื่อง บทสนทนา แอ็กชันทั่วไป และการใช้มือหยิบจับสิ่งของ',
    description: 'มุมมาตรฐานของภาพยนตร์ ให้ความรู้สึกเหมือนกำลังยืนคุยกับตัวละครในระยะสบายตา',
    color: 'from-emerald-600 to-teal-700',
    icon: Video
  },
  {
    id: 'Close-Up',
    nameTh: 'ช็อตเจาะลึก (Close-Up - CU)',
    shortCode: 'CU',
    lens: '85mm',
    bestFor: 'เน้นอารมณ์ สีหน้า แววตา และรีแอ็กชัน หรือแนะนำตัวละครเด่น',
    description: 'ตัดส่วนฉากหลังให้ละลาย (Bokeh) โฟกัสเฉพาะความรู้สึก ตัวละครตกใจ ดีใจ หรือมุกหน้าตาย',
    color: 'from-amber-600 to-orange-700',
    icon: Eye
  },
  {
    id: 'Extreme Close-Up',
    nameTh: 'เจาะระยะประชิด (Extreme Close-Up - ECU)',
    shortCode: 'ECU',
    lens: '100mm Macro',
    bestFor: 'ดวงตา เม็ดเหงื่อ หยดน้ำบนสินค้า หรือรายละเอียดชิ้นส่วนสำคัญ',
    description: 'สร้างความตื่นเต้น กดดัน หรือเน้นคุณภาพพื้นผิว ความเย็นฉ่ำของสินค้าโฆษณา',
    color: 'from-rose-600 to-red-700',
    icon: Sparkles
  },
  {
    id: 'Low Angle',
    nameTh: 'มุมเสยขึ้น (Low Angle / Hero Shot)',
    shortCode: 'LOW',
    lens: '28-50mm',
    bestFor: 'สร้างความรู้สึกยิ่งใหญ่ น่าเกรงขาม ฮีโร่ หรือคอมเมดี้โอเวอร์',
    description: 'ตั้งกล้องต่ำแหงนมองขึ้น ตัวละครจะดูสูงสง่า ทรงพลัง มีอำนาจ หรือท่าโพสเท่ๆ แบบตลก',
    color: 'from-purple-600 to-violet-700',
    icon: MoveUp
  },
  {
    id: 'High Angle',
    nameTh: 'มุมก้มลง (High Angle / Bird\'s Eye)',
    shortCode: 'HIGH',
    lens: '24-35mm',
    bestFor: 'แสดงความกดดัน อ่อนแอ สิ้นหวัง หรือมองสถานการณ์จากมุมสูง',
    description: 'ตั้งกล้องสูงก้มลงมองตัวละคร ทำให้ตัวละครดูตัวเล็กลง ตกเป็นฝ่ายเสียเปรียบ หรือเห็นแปลนพื้น',
    color: 'from-fuchsia-600 to-pink-700',
    icon: MoveDown
  },
  {
    id: 'Over-the-Shoulder',
    nameTh: 'ช็อตข้ามไหล่ (Over-the-Shoulder - OTS)',
    shortCode: 'OTS',
    lens: '50-85mm',
    bestFor: 'บทสนทนาโต้ตอบระหว่าง 2 คน การต่อรอง หรือการเผชิญหน้า',
    description: 'มองผ่านหัวไหล่ของคนหนึ่งไปยังอีกคน ช่วยให้ผู้ชมรู้สึกร่วมอยู่ในวงสนทนาอย่างแนบเนียน',
    color: 'from-lime-600 to-emerald-700',
    icon: Compass
  },
  {
    id: 'Dutch Angle',
    nameTh: 'มุมกล้องเอียง (Dutch / Canted Angle)',
    shortCode: 'DUTCH',
    lens: '35mm',
    bestFor: 'ความสับสน วุ่นวาย เหตุการณ์ผิดปกติ มุกตลกล้มคว่ำ หรือโลกกลับตาลปัตร',
    description: 'เอียงระนาบกล้อง 15-30 องศา สื่อถึงความไม่มั่นคง จิตใจปั่นป่วน หรือสถานการณ์ฉุกเฉิน',
    color: 'from-yellow-600 to-amber-700',
    icon: Sliders
  },
  {
    id: 'Product Hero Shot',
    nameTh: 'ช็อตไฮไลท์สินค้า (Commercial Hero Shot)',
    shortCode: 'PRODUCT',
    lens: '60mm Macro / 85mm',
    bestFor: 'โชว์สินค้าสปอนเซอร์ โลโก้ หยดน้ำ ความน่าทาน หรือแพ็กเกจจิ้ง',
    description: 'จัดแสงแบบสตูดิโอโฆษณา สินค้าโดดเด่นกลางเฟรม ละลายฉากหลัง คมชัดระดับโปรดักชัน',
    color: 'from-amber-500 to-yellow-600',
    icon: Sparkles
  }
];

export default function CameraAngleSelector({ selectedAngle, onSelectAngle, compact = false }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-stone-400">
        <span className="font-bold text-[#F71C25] flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" />
          <span>เลือกมุมกล้องผู้กำกับ (Director Camera Angle):</span>
        </span>
        <span className="text-[10px] text-stone-500">10 ไวยากรณ์ภาพยนตร์</span>
      </div>

      {compact ? (
        /* Compact Pill Bar */
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {CAMERA_ANGLES.map((angle) => {
            const isSelected = selectedAngle === angle.id;
            return (
              <button
                key={angle.id}
                type="button"
                onClick={() => onSelectAngle(angle)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#F71C25] text-white border-[#F71C25] shadow-md shadow-red-500/20 font-bold'
                    : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50 shadow-2xs'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{angle.shortCode}</span>
                <span>{angle.id}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Detailed Grid Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {CAMERA_ANGLES.map((angle) => {
            const isSelected = selectedAngle === angle.id;
            const Icon = angle.icon;

            return (
              <div
                key={angle.id}
                onClick={() => onSelectAngle(angle)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-lime-950/40 border-[#F71C25] ring-1 ring-lime-400/40 shadow-lg shadow-red-500/20'
                    : 'bg-[#151518] border-stone-800/90 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${angle.color} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{angle.id}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                            {angle.lens}
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#F71C25] font-semibold">{angle.nameTh.split('(')[0]}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#F71C25] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-600 mt-2 leading-relaxed">
                    {angle.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500 font-mono flex items-center gap-1">
                  <span className="text-stone-800 font-bold">เหมาะสำหรับ:</span>
                  <span className="truncate">{angle.bestFor}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
