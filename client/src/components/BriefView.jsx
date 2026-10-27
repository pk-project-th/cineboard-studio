import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Wand2,
  Edit3,
  Film,
  Camera,
  Ratio,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ClipboardPaste,
  Trash2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Sliders
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    id: 'fishing_trip',
    badge: '🎣 ทริปตกปลา & ทำอาหารริมน้ำ (6 ฉาก)',
    aspect: '16:9',
    text: `คลิปเชิญชวนตกปลาวันหยุดพักผ่อนริมน้ำ
1. ชวนกันไปซื้ออุปกรณ์ตกปลาในร้านโปรด
2. เลือกสินค้า คันเบ็ดและเหยื่อปลอมตัวเด็ด
3. ออกไปตกปลา ล่องเรือกลางสายหมอกยามเช้า
4. ได้ปลาตัวโต คันเบ็ดโค้งงอดึงสู้ปลาอย่างตื่นเต้น
5. นำมาทำอาหาร ย่างเตาถ่านควันหอมฉุยริมแคมป์
6. กินอย่างเอร็ดอร่อย ล้อมวงสังสรรค์ฉลองความสำเร็จ`
  },
  {
    id: 'mazda_cx6e',
    badge: '🚗 ส่งมอบรถ Mazda CX-6e',
    aspect: '16:9',
    text: `ส่งมอบรถยนต์ไฟฟ้าพรีเมียม Mazda CX-6e ในโชว์รูมหรู
1. เปิดตัวรถ Mazda CX-6e คลุมผ้าซาตินสีดำในโชว์รูมกระจก แสงไฟสะท้อนหรูหรา
2. พนักงานขายค่อยๆ ดึงผ้าคลุมออก เผยให้เห็นไฟหน้า LED ดีไซน์โฉบเฉี่ยวและกระจังหน้าเรืองแสง
3. พนักงานขายถือกล่องกุญแจหนังส่งมอบให้ลูกค้าด้วยรอยยิ้มอบอุ่น
4. ลูกค้าหญิงยิ้มดีใจ รับกุญแจสมาร์ทคีย์และถ่ายรูปร่วมกับครอบครัวหน้ารถติดโบว์แดง
5. มุมใกล้ภายในห้องโดยสาร มือสัมผัสพวงมาลัยหนังแท้และหน้าจอดิจิทัลสว่างขึ้น
6. รถยนต์ไฟฟ้า Mazda CX-6e เคลื่อนตัวออกจากโชว์รูมสู่ถนนยามเย็น แสงอาทิตย์สีทองสะท้อนตัวถังเงางาม`
  },
  {
    id: 'pure_asmr_8',
    badge: '🎧 Pure ASMR 8 ฉาก',
    aspect: '16:9',
    text: `🎬 Content 1: Pure ASMR “The Sound of Japanese Craftsmanship”
Visual Style Reference: macro photography, hyper-realistic, soft natural daylight, premium automotive commercial style, sharp details.

Scene 1: เปิดพอร์ตชาร์จ (Charging Port)
Prompt: Macro close-up shot. A finger gently opening the sleek charging port door of a modern premium electric vehicle. Soft natural daylight reflecting on the glossy paint. High-end automotive photography, hyper-realistic.

Scene 2: ปลดล็อกฝากระโปรง (The Hood)
Prompt: Medium close-up shot from a low angle. A hand gently lifting the front hood of a sleek modern SUV. Focus on the solid mechanical joints and metallic texture. Cinematic lighting, photorealistic.

Scene 3: เสียงปิดประตู (The Solid Thud)
Prompt: Medium shot from the outside. A hand pushing a heavy, glossy SUV car door fully closed. The car has a deep, rich paint finish reflecting the modern surroundings. Premium automotive commercial style.

Scene 4: สัมผัสพวงมาลัย (Japanese Craftsmanship)
Prompt: Extreme close-up shot. A hand gently tracing the perfect stitching on a soft premium black leather steering wheel inside a luxury car. Warm natural sunlight filtering through the window, highlighting the rich texture. Japanese craftsmanship concept.

Scene 5: แป้นควบคุม (Center Commander)
Prompt: Macro shot. A finger rotating a premium metallic control dial on a luxury car's center console. Elegant interior, soft ambient lighting highlighting the brushed metal texture, highly detailed and precise.

Scene 6: ปุ่มปรับแอร์ (Human-Centric Design)
Prompt: Close-up shot. A finger turning a high-quality climate control knob on a modern car dashboard. Minimalist and elegant interior design, soft lighting, hyper-realistic.

Scene 7: หลังคาแก้ว (Panoramic Sunroof)
Prompt: Medium shot looking up from the back seat. A panoramic glass sunroof sliding open, revealing a clear blue sky. Bright natural light flooding into a premium car cabin with leather seats.

Scene 8: เปิดระบบ EV (Boot-up Screen)
Prompt: Macro shot. A glowing, futuristic digital dashboard instrument cluster in a modern electric vehicle waking up. Dark elegant cabin, high contrast, cinematic lighting, modern technology concept.`
  },
  {
    id: 'tiktok_viral_3',
    badge: '🔥 ไวรัล 3 ช็อต Hook-Story-CTA',
    aspect: '9:16',
    text: `คลิปสั้นไวรัล รีวิวคาเฟ่ลับสไตล์เกียวโต
1. เปิดด้วยช็อตผลักประตูไม้โบราณเจอน้ำตกและสวนญี่ปุ่นร่มรื่นกลางกรุง
2. ช็อตตักเค้กมัทฉะลาวาเยิ้มๆ ป้อนใส่กล้อง Extreme Close-Up น่ากินสุดๆ
3. ยกแก้วกาแฟชนกล้อง ยิ้มชวนปักหมุดตามมาลองกันวันหยุดนี้`
  },
  {
    id: 'glass_skin',
    badge: '✨ โฆษณาเซรั่ม Glass Skin (5 ฉาก)',
    aspect: '9:16',
    text: `โฆษณาเซรั่มบำรุงผิวหน้า Glass Skin พรีเมียม
1. ขวดเซรั่มแก้วใสวางบนผิวน้ำกระทบแสงแดดเช้า มีหยดน้ำระยิบระยับ
2. ดรอปเปอร์หยดเนื้อเซรั่มใสเข้มข้นลงบนหลังมือ มาโครเห็นความชุ่มชื้นชัดเจน
3. นางแบบสาวผิวใสเกลี่ยเนื้อเซรั่มลงบนแก้มอย่างนุ่มนวล แสงธรรมชาติอบอุ่น
4. ซูมผิวหน้าที่ดูฉ่ำวาว อิ่มน้ำ สุขภาพดีไร้ที่ติ
5. ช็อตจบสินค้าคู่กับดอกไม้สีขาว พร้อมรอยยิ้มมั่นใจของนางแบบ`
  }
];

const QUICK_STYLE_CHIPS = [
  { id: 'auto', label: '✨ อัตโนมัติตามเนื้อเรื่อง' },
  { id: 'โฆษณาพรีเมียมหรูหรา แสงสตูดิโอคมชัด 8K', label: '💎 โฆษณาพรีเมียม' },
  { id: 'ภาพถ่ายมาโครคมชัดสูง แสงธรรมชาติละเอียดสมจริง', label: '🔍 มาโคร ASMR' },
  { id: 'ภาพยนตร์ 35mm แสง Cinema นุ่มลึกมีมิติ', label: '🎬 ภาพยนตร์ 35mm' },
  { id: 'แสงแดดอุ่นยามเย็น Golden Hour โทนอบอุ่น', label: '☀️ แสงอุ่นธรรมชาติ' }
];

const CAMERA_BREAKDOWN_MODES = [
  {
    id: 'auto_story',
    label: '🎬 แบ่งอัตโนมัติตามเนื้อเรื่อง + ครบทุกมุมกล้อง (กว้าง → กลาง → ใกล้ → จบ)'
  },
  {
    id: 'macro_detail',
    label: '🔍 เน้นเจาะดีเทลสินค้า & มุมใกล้พิเศษ (Macro & Close-Up Focus)'
  },
  {
    id: 'cinematic_story',
    label: '🌟 เน้นเล่าเรื่องอารมณ์ตัวละคร & บรรยากาศภาพยนตร์'
  },
  {
    id: 'dynamic_angles',
    label: '⚡ มุมกล้องหลากหลาย ตัดสลับไวสำหรับคลิปสั้น (POV / มุมเสย / โคลสอัพ)'
  }
];

// Interactive Co-Director Question Options
const CO_DIRECTOR_QUESTIONS = {
  moods: [
    { id: 'cozy_nature', label: '🏕️ แคมป์ปิ้งอบอุ่น ชิลล์ธรรมชาติ' },
    { id: 'energetic_adventure', label: '⚡ แอคชั่น ผจญภัย สนุกมันส์' },
    { id: 'cinematic_luxury', label: '💎 โฆษณาพรีเมียม สวยหรูคมชัด' },
    { id: 'friendship_vlog', label: '🎒 Vlog เพื่อนฝูง มิตรภาพสดใส' },
    { id: 'asmr_peace', label: '🎧 ASMR สมาธิ เสียงและภาพสงบ' }
  ],
  locations: [
    { id: 'misty_dam', label: '🌅 เขื่อนหมอกเช้า & ลำธารธรรมชาติ' },
    { id: 'sea_boat', label: '⛵ ออกเรือกลางทะเล แดดบ่ายประกายคลื่น' },
    { id: 'city_fishery', label: '🎣 บ่อตกปลาธรรมชาติ ชิลล์สบาย' },
    { id: 'river_sunset', label: '🏕️ แคมป์ไฟริมน้ำ พระอาทิตย์ตกดิน' },
    { id: 'modern_showroom', label: '🏬 โชว์รูม / ร้านอุปกรณ์โมเดิร์น' }
  ],
  endings: [
    { id: 'grill_eat', label: '🍳 ย่างเตาถ่านสดๆ กินอร่อยริมน้ำ' },
    { id: 'trophy_photo', label: '🏆 ดึงปลาตัวยักษ์ ถ่ายรูปเฮฮาฉลอง' },
    { id: 'catch_release', label: '🌊 สัมผัสปลาอย่างอ่อนโยนแล้วปล่อยคืนน้ำ' },
    { id: 'campfire_cheers', label: '🍻 นั่งล้อมวงคุยกันชนแก้วรอบกองไฟ' }
  ]
};

// Robust beat extraction from text
function extractScriptBeats(text) {
  if (!text || !text.trim()) return [];

  // 1. Scene / Shot headers
  const sceneRegex = /(?:^|\n)\s*(?:Scene|SCENE|ฉากที่|ช็อตที่|Shot|SHOT)\s*(\d+)[\s\:\.\-–]*(.*?)(?=(?:\n\s*(?:Scene|SCENE|ฉากที่|ช็อตที่|Shot|SHOT)\s*\d+)|$)/gis;
  let matches = [...text.matchAll(sceneRegex)];
  if (matches.length >= 2) {
    return matches.map((m) => {
      const firstLine = m[2].trim().split('\n')[0].replace(/^[:\-\s]+/, '');
      return firstLine || `ฉากที่ ${m[1]}`;
    });
  }

  // 2. Multiline numbered list: 1. A \n 2. B
  const multiLineNumRegex = /(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=(?:\n\s*\d+[\.\)])|$)/gs;
  matches = [...text.matchAll(multiLineNumRegex)];
  if (matches.length >= 2) {
    return matches.map((m) => {
      const firstLine = m[2].trim().split('\n')[0].replace(/^[:\-\s]+/, '');
      return firstLine || `ข้อ ${m[1]}`;
    });
  }

  // 3. Inline numbered list on a single line: 1. A 2. B 3. C
  const inlineNumRegex = /(?:^|\s)(\d+)[\.\)]\s*([^\d\n\r]+?)(?=(?:\s+\d+[\.\)])|$)/g;
  matches = [...text.matchAll(inlineNumRegex)];
  if (matches.length >= 2) {
    return matches.map((m) => m[2].trim());
  }

  // 4. Arrow sequence: A -> B -> C
  if (text.includes('->') || text.includes('➔') || text.includes('=>')) {
    const parts = text.split(/\s*(?:->|➔|=>)\s*/).filter((p) => p.trim().length > 1);
    if (parts.length >= 2) return parts.map((p) => p.trim());
  }

  return [];
}

// Detect if user prompt explicitly requests a shot count (e.g. "ขอ 3 ฉาก", "10 ช็อต", "4 scenes")
function detectShotCountFromText(text) {
  if (!text) return null;
  const match = text.match(/(?:ขอ|เอา|อยากได้|สร้าง|ทำ|จำนวน)?\s*(\d+)\s*(?:ฉาก|ช็อต|ซีน|ช้อต|ตอน|shots?|scenes?|cuts?)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 2 && num <= 16) return num;
  }
  return null;
}

// Helper to pick evenly distributed beats from any size pool
function pickBeats(pool, count) {
  if (count <= 1) return [pool[0]];
  if (count >= pool.length) return pool.slice(0, count);
  const result = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (pool.length - 1)) / (count - 1));
    result.push(pool[idx]);
  }
  return result;
}

export default function BriefView({
  onPlanAndAutoRender,
  onPlanForReview,
  isPlanning = false
}) {
  const [storyConcept, setStoryConcept] = useState(PRESET_TEMPLATES[0].text);
  const [visualStyle, setVisualStyle] = useState('auto');
  const [cameraBreakdown, setCameraBreakdown] = useState('auto_story');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [errorMsg, setErrorMsg] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Scene count control: 'auto' or a number (2..16)
  const [selectedShotCount, setSelectedShotCount] = useState('auto');

  // Co-Director Assistant State
  const [coDirectorOpen, setCoDirectorOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(CO_DIRECTOR_QUESTIONS.moods[0].id);
  const [selectedLocation, setSelectedLocation] = useState(CO_DIRECTOR_QUESTIONS.locations[0].id);
  const [selectedEnding, setSelectedEnding] = useState(CO_DIRECTOR_QUESTIONS.endings[0].id);

  // Auto-detect beats from script text
  const detectedBeats = useMemo(() => {
    return extractScriptBeats(storyConcept);
  }, [storyConcept]);

  // Analyze the prompt text for explicit counts or style hints
  const textMentionedCount = useMemo(() => {
    return detectShotCountFromText(storyConcept);
  }, [storyConcept]);

  // Calculate the intelligent default count when in 'auto' mode
  const autoInferredCount = useMemo(() => {
    if (detectedBeats.length >= 2) {
      return detectedBeats.length;
    }
    if (textMentionedCount) {
      return textMentionedCount;
    }
    const t = storyConcept.toLowerCase();
    if (/(?:คลิปสั้น|tiktok|reels|shorts|สั้นๆ|ไวรัล)/.test(t)) {
      return 4;
    }
    if (/(?:asmr|macro|เจาะลึก|สารคดี|series|ซีรีส์)/.test(t)) {
      return 8;
    }
    return 6; // Standard cinematic commercial arc
  }, [storyConcept, detectedBeats, textMentionedCount]);

  // The actual effective scene count that will be used
  const effectiveScenesCount = useMemo(() => {
    if (!storyConcept.trim()) return 0;
    if (selectedShotCount === 'auto') {
      return autoInferredCount;
    }
    return Math.max(2, Math.min(16, Number(selectedShotCount) || 6));
  }, [storyConcept, selectedShotCount, autoInferredCount]);

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        setStoryConcept(clipText.trim());
        setErrorMsg('');
        setSelectedShotCount('auto');
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 1800);
      }
    } catch (err) {
      setErrorMsg('กรุณากด Ctrl+V ในช่องข้อความเพื่อวางบทได้เลยครับ');
    }
  };

  const handleApplyPreset = (preset) => {
    setStoryConcept(preset.text);
    setAspectRatio(preset.aspect);
    setVisualStyle('auto');
    setSelectedShotCount('auto');
    setErrorMsg('');
  };

  // Adjust count via stepper buttons [-] [+]
  const handleStepCount = (delta) => {
    const current = effectiveScenesCount;
    const nextVal = Math.max(2, Math.min(16, current + delta));
    setSelectedShotCount(nextVal);
  };

  // Co-Director synthesizer: Build a rich N-beat script from user's topic + chosen options & shot count
  const handleSynthesizeCoDirectorPlan = () => {
    const raw = storyConcept.replace(/^[🎬🎥✨🚗🎧📱#\s*\d.)\-]+/, '').split('\n')[0].trim();
    const topic = raw && raw.length > 2 && raw.length < 80 ? raw : 'คลิปเชิญชวนไปเที่ยวและตกปลาวันหยุด';

    const moodObj = CO_DIRECTOR_QUESTIONS.moods.find((m) => m.id === selectedMood) || CO_DIRECTOR_QUESTIONS.moods[0];
    const locObj = CO_DIRECTOR_QUESTIONS.locations.find((l) => l.id === selectedLocation) || CO_DIRECTOR_QUESTIONS.locations[0];
    const endObj = CO_DIRECTOR_QUESTIONS.endings.find((e) => e.id === selectedEnding) || CO_DIRECTOR_QUESTIONS.endings[0];

    const targetN = effectiveScenesCount;
    const isFish = /ตกปลา|ปลา|angling|fish/i.test(topic);

    let scriptBeats = [];
    if (isFish) {
      const fishPool = [
        'ชวนเพื่อนแวะร้านจำหน่ายอุปกรณ์ตกปลาขนาดใหญ่ เตรียมความพร้อมและวางแผนเดินทาง',
        'หยิบคันเบ็ดคาร์บอนไฟเบอร์น้ำหนักเบาและรอกตกปลาโลหะขึ้นมาทดสอบความยืดหยุ่นในร้าน',
        'ออกเดินทางถึงริมน้ำ แสงเช้าสาดส่องผิวน้ำนิ่ง มีหมอกบางๆ ลอยละล่อง',
        'ล่องเรือหางยาวออกสู่ผืนน้ำกว้างใหญ่ สัมผัสสายลมและธรรมชาติบริสุทธิ์',
        'หวดคันเบ็ดทอดสายลงสู่ผืนน้ำนิ่งอย่างมีสมาธิ รอคอยจังหวะอย่างใจเย็น',
        'สายเบ็ดกระตุกแรง คันเบ็ดโค้งงออย่างรุนแรง ปลาตัวโตดิ้นกระโดดสาดละอองน้ำระยิบระยับ',
        'ออกแรงหมุนรอกงัดสู้ปลาอย่างตื่นเต้น และยกปลาตัวโตขึ้นมาบนเรือด้วยรอยยิ้มภาคภูมิใจ',
        'นำปลาสดจากน้ำมาก่อเตาถ่านแคมป์ปิ้งริมน้ำ ควันหอมฉุยลอยกรุ่น',
        'ย่างปลาสดจนสุกเกรียมเหลืองทอง โรยเกลือสมุนไพร กลิ่นหอมน่ารับประทาน',
        `${endObj.label.replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\s]+/, '')} ท่ามกลางบรรยากาศแสนอบอุ่น`
      ];
      scriptBeats = pickBeats(fishPool, targetN);
    } else {
      const generalPool = [
        'เปิดฉากแนะนำสถานที่และบรรยากาศโดยรอบ แสงธรรมชาติสวยงาม',
        'ตัวละครหลักเริ่มลงมือเตรียมพร้อมและเลือกอุปกรณ์ชิ้นสำคัญ',
        'ออกเดินทางสู่สถานที่สำคัญ สัมผัสบรรยากาศแห่งความตื่นเต้น',
        'เริ่มต้นลงมือทำขั้นตอนสำคัญด้วยความตั้งใจและมุ่งมั่น',
        'เจาะลึกรายละเอียดความใส่ใจและการพัฒนาอย่างต่อเนื่อง',
        'ช่วงเวลาไคลแม็กซ์ที่น่าตื่นเต้นที่สุด ประสบความสำเร็จตามเป้าหมาย',
        'ช็อตบันทึกรอยยิ้ม ความสุข และความภาคภูมิใจในผลงาน',
        'แบ่งปันช่วงเวลาดีๆ ร่วมกับเพื่อนและผู้คนรอบข้าง',
        'มุมมองศิลปะและรายละเอียดอันประณีตสร้างความประทับใจ',
        `${endObj.label.replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\s]+/, '')} ปิดท้ายเรื่องราวอย่างน่าประทับใจ`
      ];
      scriptBeats = pickBeats(generalPool, targetN);
    }

    const scriptText = `${topic} (${moodObj.label} ณ ${locObj.label})\n` +
      scriptBeats.map((b, i) => `${i + 1}. ${b}`).join('\n');

    setStoryConcept(scriptText);
    setErrorMsg('');
    setCoDirectorOpen(false);
  };

  const handleSubmit = async (reviewFirst = false) => {
    if (!storyConcept.trim()) {
      setErrorMsg('กรุณาวาง Prompt หรือพิมพ์เนื้อเรื่องที่ต้องการก่อนครับ');
      return;
    }
    setErrorMsg('');
    const payload = {
      story_concept: storyConcept.trim(),
      num_shots: effectiveScenesCount,
      target_duration: effectiveScenesCount * 3,
      pacing: 'normal',
      visual_style: visualStyle.trim() || 'auto',
      camera_breakdown: cameraBreakdown,
      aspect_ratio: aspectRatio
    };

    if (reviewFirst) {
      await onPlanForReview(payload);
    } else {
      await onPlanAndAutoRender(payload);
    }
  };

  return (
    <aside className="w-full lg:w-[375px] xl:w-[410px] shrink-0 bg-[#10131B] border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14 overflow-y-auto no-print">
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>ผู้กำกับสตอรี่บอร์ด AI</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              พิมพ์สั้นหรือยาว ระบบจะวิเคราะห์ฉากและจัดมุมกล้องให้อัตโนมัติ
            </p>
          </div>
          {storyConcept.trim() && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{effectiveScenesCount} ช็อต</span>
            </span>
          )}
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">
            ตัวอย่างบทสตอรี่บอร์ดพร้อมใช้ (คลิกเพื่อลอง):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#171C28] hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-500/40 text-[11px] font-semibold text-slate-200 hover:text-amber-300 transition-all cursor-pointer"
              >
                {preset.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt / Story Textarea + 1-Click Paste Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-200">
              เนื้อเรื่อง / Prompt ที่ต้องการสร้าง
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>{pasteSuccess ? 'วางเรียบร้อย!' : 'กดวาง Prompt'}</span>
              </button>

              {storyConcept && (
                <button
                  type="button"
                  onClick={() => setStoryConcept('')}
                  title="ล้างข้อความ"
                  className="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={storyConcept}
            onChange={(e) => setStoryConcept(e.target.value)}
            rows={6}
            placeholder="พิมพ์หรือวางเนื้อเรื่องที่นี่ได้เลยครับ รองรับทั้งข้อความสั้นๆ เช่น 'คลิปชวนตกปลา 3 ฉาก', 'รีวิวเซรั่ม 10 ช็อต', หรือบท Scene 1..N..."
            className="w-full p-3.5 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500/70 focus:outline-none text-xs text-slate-100 placeholder:text-slate-600 leading-relaxed resize-y font-sans"
          />

          {/* Visual Storyboard Beat Flow Ribbon */}
          {detectedBeats.length >= 2 ? (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ตรวจพบโครงเรื่อง {detectedBeats.length} ฉากจากบทของคุณ:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">ระบบจะสร้างมุมกล้องให้ครบทุกช็อต</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {detectedBeats.map((beat, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-200 font-medium max-w-[170px] truncate" title={beat}>
                      {idx + 1}. {beat}
                    </span>
                    {idx < detectedBeats.length - 1 && (
                      <span className="text-slate-500 text-[10px]">➔</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : textMentionedCount ? (
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>AI ตรวจพบคำขอ: สร้าง {textMentionedCount} ฉากตามข้อความของคุณ</span>
              </span>
            </div>
          ) : storyConcept.trim() ? (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>AI วิเคราะห์ความเหมาะสม ({effectiveScenesCount} ฉาก) หรือเลือกปรับจำนวนฉากด้านล่างได้อิสระ</span>
              </span>
            </div>
          ) : null}
        </div>

        {/* Dynamic Scene Count Selector (แก้ปัญหาการล็อค 6 ฉาก ให้เลือก 2, 3, 4, 5, 8, 10 ได้อิสระ) */}
        <div className="p-3 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>จำนวนช็อต / ฉากที่ต้องการสร้าง</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
              {selectedShotCount === 'auto' ? (
                <span className="text-emerald-400 font-semibold text-[10px]">✨ วิเคราะห์อัตโนมัติ</span>
              ) : (
                <span className="text-amber-400 font-semibold text-[10px]">กำหนดเอง</span>
              )}
            </div>
          </div>

          {/* Stepper + Quick Pills */}
          <div className="flex items-center gap-2">
            {/* Stepper [-] count [+] */}
            <div className="flex items-center rounded-lg bg-[#0B0D11] border border-slate-700 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handleStepCount(-1)}
                disabled={effectiveScenesCount <= 2}
                title="ลดจำนวนฉาก"
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="px-3 min-w-[58px] text-center font-extrabold text-xs text-amber-300">
                {effectiveScenesCount} ฉาก
              </div>
              <button
                type="button"
                onClick={() => handleStepCount(1)}
                disabled={effectiveScenesCount >= 16}
                title="เพิ่มจำนวนฉาก"
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Scene Count Pills */}
            <div className="flex flex-wrap items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => setSelectedShotCount('auto')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedShotCount === 'auto'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-[#171C28] text-slate-300 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                ✨ ออโต้ ({autoInferredCount})
              </button>
              {[2, 3, 4, 5, 6, 8, 10].map((num) => {
                const active = selectedShotCount === num || (selectedShotCount === 'auto' && effectiveScenesCount === num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedShotCount(num)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedShotCount === num
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : active
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#171C28] text-slate-300 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            {detectedBeats.length >= 2
              ? `ตรวจพบ ${detectedBeats.length} ฉากจากบทของคุณ หรือคลิกเลือกตัวเลขด้านบนเพื่อสร้างฉากตามต้องการ`
              : textMentionedCount
              ? `AI ตรวจพบความต้องการสร้าง ${textMentionedCount} ฉากจากข้อความที่พิมพ์`
              : `สามารถเลือกได้ตั้งแต่ 2 ฉาก (แบบกระชับ) จนถึง 10-12 ฉาก (แบบเต็มเรื่องราว)`}
          </p>
        </div>

        {/* Co-Director Assistant (ถามเพิ่มเติม / ขยายไอเดีย) */}
        <div className="rounded-xl bg-[#141824] border border-amber-500/30 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setCoDirectorOpen(!coDirectorOpen)}
            className="w-full p-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>ผู้ช่วยผู้กำกับ AI (ถามเพิ่มเติม / ช่วยเขียนบท)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-slate-950 font-black">ฉลาดขึ้น</span>
                </span>
                <p className="text-[10px] text-slate-400">
                  เลือกแนวทาง 3 ข้อง่ายๆ เพื่อให้ AI ช่วยเขียนบท {effectiveScenesCount} ฉากที่ตรงใจคุณที่สุด
                </p>
              </div>
            </div>
            {coDirectorOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {coDirectorOpen && (
            <div className="p-3.5 border-t border-slate-800/80 space-y-3 bg-[#0E1119]">
              {/* Question 1: Mood */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <span>1. โทนอารมณ์ / สไตล์ของคลิป (Mood & Vibe)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CO_DIRECTOR_QUESTIONS.moods.map((m) => {
                    const active = selectedMood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMood(m.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : 'bg-[#171C28] text-slate-300 border-slate-700/70 hover:border-slate-500'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Location */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <span>2. โลเคชั่นหลัก (Location & Setting)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CO_DIRECTOR_QUESTIONS.locations.map((loc) => {
                    const active = selectedLocation === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setSelectedLocation(loc.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : 'bg-[#171C28] text-slate-300 border-slate-700/70 hover:border-slate-500'
                        }`}
                      >
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3: Climax & Ending */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <span>3. ไฮไลท์การเล่าเรื่อง & ช็อตจบ (Climax & Ending)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CO_DIRECTOR_QUESTIONS.endings.map((end) => {
                    const active = selectedEnding === end.id;
                    return (
                      <button
                        key={end.id}
                        type="button"
                        onClick={() => setSelectedEnding(end.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : 'bg-[#171C28] text-slate-300 border-slate-700/70 hover:border-slate-500'
                        }`}
                      >
                        {end.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button inside Assistant */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSynthesizeCoDirectorPlan}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ นำคำตอบไปสังเคราะห์เป็นบท {effectiveScenesCount} ฉากให้อัตโนมัติ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Camera & Story Breakdown Mode */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>การแบ่งช็อตตามเนื้อเรื่องและมุมกล้อง</span>
          </label>
          <select
            value={cameraBreakdown}
            onChange={(e) => setCameraBreakdown(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#0B0D11] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CAMERA_BREAKDOWN_MODES.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#10131B] text-slate-100">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Visual Style & Lighting: Auto + Freeform Custom Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>สไตล์ภาพและแสง (เลือกอัตโนมัติ หรือพิมพ์กำหนดเองได้อิสระ)</span>
          </label>

          {/* Quick Chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_STYLE_CHIPS.map((chip) => {
              const active = visualStyle === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setVisualStyle(chip.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-[#0B0D11] text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Custom Freeform Style Input */}
          <input
            type="text"
            value={visualStyle === 'auto' ? '' : visualStyle}
            onChange={(e) => setVisualStyle(e.target.value || 'auto')}
            placeholder="✨ โหมดอัตโนมัติตามเนื้อเรื่อง (หรือพิมพ์สไตล์/แสงที่ต้องการเพิ่มที่นี่...)"
            className="w-full px-3 py-2 rounded-xl bg-[#0B0D11] border border-slate-800 focus:border-amber-500 text-xs text-slate-100 placeholder:text-emerald-400/80 focus:outline-none"
          />
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Ratio className="w-3.5 h-3.5 text-amber-400" />
            <span>สัดส่วนภาพ</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0D11] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === '16:9'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 แนวนอน (YouTube / หนัง)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16 แนวตั้ง (TikTok / Reels)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dual Action Buttons */}
        <div className="pt-1 space-y-2.5">
          {/* Primary: Create + Auto-Render AI Images */}
          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(false)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isPlanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังแยกฉากตามเนื้อเรื่องและเตรียมวาดภาพ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>สร้างสตอรี่บอร์ด + วาดภาพ AI ทันที ({effectiveScenesCount} ช็อต)</span>
              </>
            )}
          </button>

          {/* Secondary: Break into shots & review/edit prompts BEFORE rendering */}
          <button
            type="button"
            disabled={isPlanning}
            onClick={() => handleSubmit(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#171C28] hover:bg-[#1F2637] border border-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>แตกช็อตเพื่อตรวจ / แก้ไข Prompt ทั้งหมดก่อนวาดภาพ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
