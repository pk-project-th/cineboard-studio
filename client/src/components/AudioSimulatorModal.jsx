import React from 'react';
import AudioSimulator from './AudioSimulator';
import { X } from 'lucide-react';

export default function AudioSimulatorModal({ isOpen, onClose, item = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-stone-900 relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <AudioSimulator initialText={item?.dialogue_script || ''} item={item} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
