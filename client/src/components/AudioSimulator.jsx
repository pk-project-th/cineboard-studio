import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square, Radio, Sparkles, Wand2, Loader2 } from 'lucide-react';

export default function AudioSimulator({ initialText = '', item = null, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingEleven, setIsLoadingEleven] = useState(false);
  const [audioSource, setAudioSource] = useState(null); // 'elevenlabs' | 'browser'
  const [activeVoice, setActiveVoice] = useState('sak'); // 'sak' | 'nu' | 'joy'
  const [customText, setCustomText] = useState((initialText || item?.dialogue_script || '').replace(/ครับ\/ค่ะ/g, 'ครับ').replace(/ค่ะ\/ครับ/g, 'ครับ'));
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const elevenAudioRef = useRef(null);

  useEffect(() => {
    if (initialText || item?.dialogue_script) {
      setCustomText((initialText || item.dialogue_script).replace(/ครับ\/ค่ะ/g, 'ครับ').replace(/ค่ะ\/ครับ/g, 'ครับ'));
    }
  }, [initialText, item]);

  const lines = {
    sak: {
      speaker: 'ศักดิ์ (ตัวเอก)',
      text: 'ปลาช่อนตัวนี้... ข้าจะจับให้ได้! ไป! เจ้าหนูสายฟ้า!',
      sub: 'เสียงพากย์แห้ง ติดไมค์แคบ ไม่มีรีเวิร์บ สไตล์พระเอกหนังไทย 2525'
    },
    nu: {
      speaker: 'หนู (ชุดกันฝนเหลือง)',
      text: 'ผมว่าผมไม่ได้ทำแบบนั้นนะพี่... บอลยังลอยอยู่ในบ่อเลยครับ',
      sub: 'เสียงเหน่อเรียบนิ่ง ไร้อารมณ์ (Deadpan) สไตล์ตัวตบมุก'
    },
    joy: {
      speaker: 'จอย (เสื้อครอปเหลือง)',
      text: 'จับได้แล้วจะเอาไปทำอะไรครับ... ปลาซื้อมาจากตลาด สี่สิบบาท',
      sub: 'เสียงเบื่อโลก พูดลอดไรฟัน ไม่มองหน้า'
    }
  };

  const currentScript = customText || lines[activeVoice].text;

  const startVintageNoise = () => {
    try {
      if (audioCtxRef.current) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // 1. White noise buffer for film grain hiss & crackle
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const crackle = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 3 : 0;
        data[i] = (white * 0.12) + crackle;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // 2. Optical track Bandpass filter (300Hz - 3500Hz) to simulate degraded 1980s optical film audio
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 1.2;

      // Master gain
      const gain = ctx.createGain();
      gain.gain.value = 0.20;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noiseNodeRef.current = noise;
      gainNodeRef.current = gain;
    } catch (e) {
      console.error('Web Audio not supported', e);
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (elevenAudioRef.current) {
      elevenAudioRef.current.pause();
      elevenAudioRef.current.currentTime = 0;
      elevenAudioRef.current = null;
    }
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingEleven(false);
  };

  // Play using ElevenLabs API Key via backend
  
  const [isLoadingNativeThai, setIsLoadingNativeThai] = useState(false);

  const playNativeThai = async () => {
    stopAudio();
    setIsLoadingNativeThai(true);
    setAudioSource('native');

    try {
      const textToSpeak = currentScript;
      const res = await fetch('/api/tts/native-thai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak })
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      elevenAudioRef.current = audio;

      setIsLoadingNativeThai(false);
      setIsPlaying(true);
      startVintageNoise();

      audio.onended = () => {
        setTimeout(() => stopAudio(), 600);
      };
      audio.onerror = () => stopAudio();

      await audio.play();
    } catch (err) {
      console.warn('Native Thai fallback to browser:', err);
      setIsLoadingNativeThai(false);
      playBrowserSpeech();
    }
  };

  const playElevenLabsAI = async () => {
    stopAudio();
    setIsLoadingEleven(true);
    setAudioSource('elevenlabs');

    try {
      const textToSpeak = currentScript;
      const res = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      elevenAudioRef.current = audio;

      setIsLoadingEleven(false);
      setIsPlaying(true);
      startVintageNoise();

      audio.onended = () => {
        setTimeout(() => {
          stopAudio();
        }, 800);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error', e);
        stopAudio();
      };

      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs play failed, falling back to browser voice:', err);
      setIsLoadingEleven(false);
      alert('ElevenLabs AI Notice: ' + err.message + '\nกำลังสลับเป็นเสียงสังเคราะห์เบราว์เซอร์อัตโนมัติ');
      playBrowserSpeech();
    }
  };

  const playBrowserSpeech = () => {
    stopAudio();
    setIsPlaying(true);
    setAudioSource('browser');
    startVintageNoise();

    if ('speechSynthesis' in window) {
      const textToSpeak = currentScript;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(v => v.lang.includes('th') || v.name.toLowerCase().includes('thai') || v.name.toLowerCase().includes('niwat'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
        utterance.lang = thaiVoice.lang;
      } else {
        utterance.lang = 'th-TH';
      }
      utterance.rate = activeVoice === 'sak' ? 0.95 : activeVoice === 'nu' ? 0.85 : 0.9;
      utterance.pitch = activeVoice === 'sak' ? 1.05 : activeVoice === 'nu' ? 0.9 : 1.15;

      utterance.onend = () => {
        setTimeout(() => {
          stopAudio();
        }, 1000);
      };
      utterance.onerror = () => {
        stopAudio();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        stopAudio();
      }, 4000);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 relative overflow-hidden border border-stone-200 shadow-sm text-stone-900">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-[#F71C25] text-xs font-bold tracking-wider uppercase mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Interactive Audio Engine • ElevenLabs Connected</span>
          </div>
          <h3 className="text-xl font-black text-stone-950 flex items-center gap-2 tracking-tight">
            จำลองระบบเสียง 1980s Optical Soundtrack & AI Voice
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            เสียงพากย์แห้งโมโน (Studio Post-Dubbed) ด้วย ElevenLabs AI Key เชื่อมต่อระบบกรองเสียง Bandpass 300–3500Hz และ Optical Hiss
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={stopAudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>หยุดเล่นเสียง</span>
            </button>
          ) : (
            <>
              <button
                onClick={playElevenLabsAI}
                disabled={isLoadingEleven}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-sm shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="พากย์เสียงจริงผ่าน ElevenLabs Multilingual v2"
              >
                {isLoadingEleven ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>ElevenLabs กำลังพากย์...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>พากย์สด ElevenLabs AI</span>
                  </>
                )}
              </button>

              <button
                onClick={playBrowserSpeech}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold bg-[#FAF9F5] hover:bg-[#FBEFC5] text-stone-800 border border-stone-200 text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="ทดสอบเสียงสังเคราะห์เครื่องจำลองเบราว์เซอร์"
              >
                <Play className="w-3.5 h-3.5" />
                <span>จำลองเสียงในเครื่อง</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Character Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {Object.entries(lines).map(([key, item]) => {
          const isSelected = activeVoice === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveVoice(key);
                if (isPlaying) stopAudio();
              }}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[#FBEFC5] border-[#E5D7A3] text-stone-950 shadow-xs ring-1 ring-[#F71C25]/20'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-[#FAF9F5] hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div className="text-xs font-bold text-stone-900">{item.speaker}</div>
              <div className="text-sm font-semibold truncate mt-1 text-stone-800">"{item.text.slice(0, 24)}..."</div>
              <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">{item.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Live speech preview, editable prompt, & audio spec tags */}
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-800 font-mono mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <span>🎙️ บทพากย์ที่กำลังจะอ่าน (พิมพ์แก้ไขได้อิสระ):</span>
            </span>
            {customText && (
              <button
                onClick={() => setCustomText('')}
                className="text-[#F71C25] hover:underline text-[10px] font-bold cursor-pointer"
              >
                คืนค่าบทเริ่มต้นของ {lines[activeVoice].speaker}
              </button>
            )}
          </div>
          <textarea
            value={currentScript}
            onChange={(e) => setCustomText(e.target.value)}
            rows={2}
            className="w-full bg-white border border-stone-200 focus:border-[#F71C25] rounded-xl p-3.5 text-stone-900 text-sm focus:outline-none transition-colors shadow-2xs leading-relaxed"
            placeholder="พิมพ์บทพากย์ที่ต้องการให้ ElevenLabs หรือเครื่องอ่าน..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-stone-200 text-[11px] font-mono">
          <div className="text-stone-600">
            {audioSource === 'elevenlabs' && isPlaying && (
              <span className="text-[#F71C25] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F71C25] animate-ping" />
                กำลังเล่นเสียงพากย์ ElevenLabs Multilingual (Adam)...
              </span>
            )}
            {audioSource === 'browser' && isPlaying && (
              <span className="text-amber-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                กำลังเล่นเสียงสังเคราะห์เบราว์เซอร์...
              </span>
            )}
            {!isPlaying && (
              <span className="text-stone-600">
                สถานะ: พร้อมพากย์ (ElevenLabs Key Active)
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold shadow-2xs">Mono Only</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold shadow-2xs">Bandpass 300-3500Hz</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold shadow-2xs">Dry (No Reverb)</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold shadow-2xs">1980s Optical Hiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
