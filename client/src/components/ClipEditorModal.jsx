import React, { useState } from 'react';
import { X, Sliders, Download, Check, Sparkles, RefreshCw, Scissors } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClipEditorModal({ isOpen, onClose, item }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(110);
  const [saturation, setSaturation] = useState(85);
  const [sepia, setSepia] = useState(20);
  const [hueRotate, setHueRotate] = useState(15); // slight yellow-green tint

  if (!isOpen || !item) return null;

  const handleReset = () => {
    setBrightness(100);
    setContrast(110);
    setSaturation(85);
    setSepia(20);
    setHueRotate(15);
  };

  const handleDownload = () => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.image_url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 1200;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `cineboard_${item.id || 'shot'}_graded.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        confetti({ particleCount: 35, spread: 55 });
      };
    } catch (e) {
      console.error('Failed to export graded image', e);
      const a = document.createElement('a');
      a.href = item.image_url;
      a.download = `cineboard_${item.id || 'shot'}_raw.jpg`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
      <div className="bg-[#141417] border border-stone-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl p-6 text-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F71C25]/20 text-[#F71C25] flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Color & Tone Grading (ปรับโทนภาพสตอรี่บอร์ด)</h3>
              <p className="text-xs text-stone-400">ปรับแต่ง Contrast, Exposure, Warmth เพื่อคุมโทนภาพในแต่ละช็อต</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Preview Container */}
          <div className="md:col-span-6 bg-black rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-stone-800 h-80">
            <img
              src={item.image_url}
              alt="preview"
              className="max-h-full max-w-full object-contain rounded-lg transition-all"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`
              }}
            />
          </div>

          {/* Controls Sliders */}
          <div className="md:col-span-6 space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>ความสว่าง (Brightness)</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                className="w-full accent-[#F71C25]"
              />
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>คอนทราสต์ (Contrast)</span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(e.target.value)}
                className="w-full accent-[#F71C25]"
              />
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>ความอิ่มสี (Saturation -15 สไตล์ 2530)</span>
                <span>{saturation}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                value={saturation}
                onChange={(e) => setSaturation(e.target.value)}
                className="w-full accent-[#F71C25]"
              />
            </div>

            <div>
              <div className="flex justify-between text-stone-400 mb-1">
                <span>ฟิล์มเหลืองซีด (Sepia Tint)</span>
                <span>{sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={sepia}
                onChange={(e) => setSepia(e.target.value)}
                className="w-full accent-[#F71C25]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center gap-1 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-[#F71C25] hover:bg-lime-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-500/20"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดภาพนี้</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
