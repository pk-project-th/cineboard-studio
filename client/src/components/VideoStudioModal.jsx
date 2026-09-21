import React, { useState, useEffect, useRef } from 'react';
import {
  X, Play, Pause, Volume2, VolumeX, RotateCcw, Download,
  Film, Sparkles, Sliders, Check, Loader2, Video
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VideoStudioModal({ isOpen, onClose, item }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('');

  const duration = 15; // 15 seconds standard viral short video
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const imgRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Dialogue lines extracted from item or generated specifically for this scene
  const dialogueLines = React.useMemo(() => {
    if (item?.dialogue_script) {
      const split = item.dialogue_script.split('\n').map(s => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    const title = item?.title || 'ภาพยนตร์สั้น';
    return [
      `1. "${title}... ข้าฝึกฝนมาแรมปี!"`,
      `2. "หยุดก่อน! อย่าเพิ่งเปิดอัลติ ข้าวยังไม่ได้หุง"`,
      `3. "งั้นข้าขอเก็บพลังไว้ก่อน... ไปดับเตาเดี๋ยวนี้!"`,
      `4. (เสียงลมพัดใบไม้ปลิว... สายตาจริงจังแบบเดดแพน)`
    ];
  }, [item]);

  // Determine current subtitle beat
  useEffect(() => {
    const beatIndex = Math.min(
      Math.floor((currentTime / duration) * dialogueLines.length),
      dialogueLines.length - 1
    );
    setActiveSubtitle(dialogueLines[beatIndex] || '');
  }, [currentTime, dialogueLines]);

  // Load image onto memory
  useEffect(() => {
    if (!isOpen || !item) return;

    setImageLoaded(false);
    setCurrentTime(0);
    setIsPlaying(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = item.image_url || '/media/tpl_aircon_hero.jpg';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Safe fallback
      const fallback = new Image();
      fallback.src = '/media/tpl_aircon_hero.jpg';
      fallback.onload = () => {
        imgRef.current = fallback;
        setImageLoaded(true);
      };
    };
  }, [isOpen, item]);

  // Canvas Motion Render Loop (1980s Retro Film Cinema Engine)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startTime = performance.now();

    const render = (now) => {
      if (!canvas || !ctx) return;

      if (isPlaying) {
        const elapsed = (now - startTime) / 1000;
        setCurrentTime((prev) => {
          const next = prev + 0.033;
          if (next >= duration) return 0;
          return next;
        });
      }

      const t = currentTime;
      const progress = (t % duration) / duration;

      // Clear Canvas
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (imgRef.current && imageLoaded) {
        const img = imgRef.current;

        // 1. Ken Burns Pan & Slow Zoom
        const zoom = 1.05 + Math.sin(progress * Math.PI) * 0.12;
        const panX = Math.sin(progress * 2) * 14;
        const panY = Math.cos(progress * 1.5) * 10;

        // 2. 16mm Projector Gate Jitter (Authentic celluloid vibration)
        const jitterX = (Math.random() - 0.5) * 2.5;
        const jitterY = (Math.random() - 0.5) * 3.0;

        ctx.save();
        ctx.translate(canvas.width / 2 + panX + jitterX, canvas.height / 2 + panY + jitterY);
        ctx.scale(zoom, zoom);

        // Aspect fit / cover
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let dw, dh;
        if (imgRatio > canvasRatio) {
          dh = canvas.height;
          dw = canvas.height * imgRatio;
        } else {
          dw = canvas.width;
          dh = canvas.width / imgRatio;
        }

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();

        // 3. 1980s Film Optical Tint & Vignette
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.35,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.75
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(10,5,0,0.65)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 4. Procedural Film Grain & Dust Scratches
        ctx.fillStyle = 'rgba(255, 235, 190, 0.04)';
        for (let i = 0; i < 180; i++) {
          const gx = Math.random() * canvas.width;
          const gy = Math.random() * canvas.height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }

        // Random film vertical scratch line
        if (Math.random() > 0.6) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          const scratchX = Math.random() * canvas.width;
          ctx.beginPath();
          ctx.moveTo(scratchX, 0);
          ctx.lineTo(scratchX + (Math.random() - 0.5) * 4, canvas.height);
          ctx.stroke();
        }

        // 5. Retro 1980s Yellow Thai Subtitles on Video
        if (activeSubtitle) {
          ctx.save();
          // Clean up formatting and handle escaped newlines
          const cleanSubtitle = activeSubtitle.replace(/\\n/g, '\n').replace(/^[0-9]+\.\s*/, '').replace(/^"|"$/g, '').trim();
          const lines = cleanSubtitle.split('\n');
          const lineHeight = 30;
          const startY = canvas.height - 40 - (lines.length * lineHeight);
          
          // Use solid system fallback fonts for Thai
          ctx.font = 'bold 22px "Kanit", "Prompt", "Tahoma", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Get max text width
          let maxTextWidth = 0;
          lines.forEach(line => {
            const w = ctx.measureText(line).width;
            if (w > maxTextWidth) maxTextWidth = w;
          });

          // Black box background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          if (ctx.roundRect) {
            ctx.roundRect(
              canvas.width / 2 - maxTextWidth / 2 - 16, 
              startY - 15, 
              maxTextWidth + 32, 
              (lines.length * lineHeight) + 10, 
              8
            );
          } else {
            // Fallback if roundRect is not supported
            ctx.fillRect(
              canvas.width / 2 - maxTextWidth / 2 - 16, 
              startY - 15, 
              maxTextWidth + 32, 
              (lines.length * lineHeight) + 10
            );
          }
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Authentic 80s Video Yellow Text
          ctx.fillStyle = '#ffea38';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
          });
          
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, imageLoaded, currentTime, activeSubtitle, duration]);

  if (!isOpen || !item) return null;

  // Real Video Export via MediaRecorder
  const handleExportVideo = async () => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    setExportProgress(10);

    try {
      const canvas = canvasRef.current;
      const stream = canvas.captureStream(30); // 30 FPS stream
      recordedChunksRef.current = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 3500000 // 3.5 Mbps high quality
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pkshortclips_video_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setIsExporting(false);
        setExportProgress(100);

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 }
        });
      };

      recorder.start();

      // Record 6 seconds of smooth motion clip
      const totalSec = 6;
      let recordedSec = 0;
      const interval = setInterval(() => {
        recordedSec += 0.5;
        setExportProgress(Math.round((recordedSec / totalSec) * 100));
        if (recordedSec >= totalSec) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 500);

    } catch (err) {
      console.error('Export failed', err);
      alert('เบราว์เซอร์ไม่รองรับการบันทึกวิดีโออัตโนมัติ');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-xl select-none animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[96vh] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black ring-1 ring-white/10">

        {/* Left: Real Motion Video Canvas */}
        <div className="md:w-1/2 bg-black flex items-center justify-center p-4 relative overflow-hidden border-b md:border-b-0 md:border-r border-stone-800">
          <div className="relative w-64 sm:w-72 h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-950 flex items-center justify-center">
            {/* Real 9:16 Canvas */}
            <canvas
              ref={canvasRef}
              width={540}
              height={960}
              className="w-full h-full object-contain"
            />

            {/* 9:16 Badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#F71C25] border border-[#F71C25]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PK Motion Video • 9:16</span>
            </div>

            {/* Retro 16mm Film Grain Indicator */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-amber-300 border border-amber-500/20">
              16mm Jitter + Grain
            </div>

            {/* Exporting Overlay */}
            {isExporting && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30">
                <Loader2 className="w-8 h-8 text-[#F71C25] animate-spin mb-3" />
                <div className="text-white font-bold text-sm">กำลังเรนเดอร์ไฟล์วิดีโอ (.WebM)...</div>
                <div className="text-xs text-stone-400 font-mono mt-1">{exportProgress}%</div>
                <div className="w-48 h-2 bg-stone-800 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-[#F71C25] transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Studio Timeline & Action Controls */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[90vh]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F71C25] uppercase tracking-wider">
                  PKShortClips Real Video Studio
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-xs mt-0.5">
                  {item.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direction & Camera Specs */}
            <div className="mt-4 p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-300 space-y-2">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                <span>คำสั่งกำกับกล้อง & ฟิล์ม:</span>
              </div>
              <div className="text-stone-400 leading-relaxed max-h-28 overflow-y-auto pr-1 select-text">
                {item.content}
              </div>
            </div>

            {/* Subtitle Lines Display */}
            <div className="mt-3 p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs font-mono space-y-2">
              <div className="text-[11px] font-bold text-[#F71C25] flex items-center justify-between">
                <span>บทพูดซับไตเติล (Subtitles):</span>
                <span className="text-[10px] text-stone-500 font-normal">เคลื่อนไหวตามไทม์ไลน์</span>
              </div>
              <div className="space-y-1 text-stone-300 text-[11px]">
                {dialogueLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded transition-colors ${
                      line === activeSubtitle
                        ? 'bg-lime-950/80 text-[#F71C25] font-bold border border-lime-800/40'
                        : 'text-stone-500'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Scrubber & Real Export */}
          <div className="space-y-3 pt-4 border-t border-stone-800">
            
            {/* Disclaimer for actual AI Video generation */}
            <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-[11px] text-blue-200/90 leading-relaxed font-sans flex gap-2.5">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-300">หมายเหตุ:</span> นี่คือระบบจำลอง <strong className="text-white">Motion Storyboard (Ken Burns)</strong> สำหรับพรีวิวซีน หากต้องการสร้างวิดีโอที่ตัวละครเคลื่อนไหวสมจริง (True AI Video) กรุณาดาวน์โหลดภาพนี้ไปเจนเนอเรตต่อใน <strong>Runway Gen-3</strong>, <strong>Luma</strong> หรือ <strong>Kling AI</strong>
              </div>
            </div>
            {/* Progress Display */}
            <div className="flex items-center justify-between text-xs font-mono text-stone-400">
              <span className="text-[#F71C25] font-bold">{currentTime.toFixed(1)}s</span>
              <span>{duration.toFixed(1)}s</span>
            </div>

            {/* Scrubber bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setCurrentTime(pos * duration);
              }}
              className="relative w-full h-2.5 rounded-full bg-stone-800 overflow-hidden cursor-pointer group"
            >
              <div
                className="h-full bg-[#F71C25] transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Play/Pause and REAL EXPORT buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current text-amber-400" /> : <Play className="w-4 h-4 fill-current text-[#F71C25]" />}
                <span>{isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}</span>
              </button>

              {/* REAL VIDEO EXPORT BUTTON */}
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F71C25] hover:bg-[#d0151d] text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเรนเดอร์คลิป...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    <span>ส่งออกเป็นไฟล์วิดีโอจริง (.WebM)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
