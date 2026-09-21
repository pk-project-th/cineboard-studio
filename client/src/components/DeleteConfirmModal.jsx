import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  promptItem,
  isDeleting,
  title,
  message
}) {
  if (!isOpen) return null;

  const displayTitle = title || (promptItem ? 'ยืนยันการลบการ์ดช็อต' : 'ยืนยันการลบ');
  const displayMessage = message || (promptItem ? (
    <>คุณแน่ใจหรือไม่ว่าต้องการลบการ์ด <span className="font-bold text-stone-200">"{promptItem.title}"</span> ออกจากบอร์ด? การกระทำนี้ไม่สามารถย้อนกลับได้</>
  ) : 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div 
        className="w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border border-rose-200 shadow-[0_0_15px_rgba(247,28,37,0.12)]">
              <AlertTriangle className="w-8 h-8 text-[#F71C25]" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-stone-900">{displayTitle}</h3>
              <div className="text-sm text-stone-500 leading-relaxed">
                {displayMessage}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-stone-200/70 hover:bg-stone-200 text-stone-700 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm && onConfirm(promptItem?.id)}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#F71C25] hover:bg-[#d0151d] text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>กำลังลบ...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบถาวร</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
