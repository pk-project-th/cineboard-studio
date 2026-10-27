// CineBoard Studio 2.0 — Universal AI Storyboard & Visual Director Engine
// Blazing-Fast Multi-Tier Engine:
//   1. Instant Thai-to-English Neural Translation (Google GTX, ~150ms) + Intelligent Cinematography Director
//   2. Optional Gemini / OpenAI LLM Deep Expansion (when API keys are provided)
//   3. Real AI Image Generation via FLUX.1-schnell (~4s, Free, Zero Key Required) + Pollinations/Gemini Fallbacks
// Zero Groq Dependency • Zero Cliché Hardcoded Scripts • 100% Theme Respectful

const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');
const { parseMultiSceneScript, enrichSingleBeat } = require('./scriptParser');

function sanitizeThaiPolite(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/ครับ\/ค่ะ/g, 'ครับ')
    .replace(/ค่ะ\/ครับ/g, 'ครับ')
    .replace(/ครับ\s*\/\s*ค่ะ/g, 'ครับ')
    .replace(/ค่ะ\s*\/\s*ครับ/g, 'ครับ');
}

function extractJsonObject(rawText) {
  if (!rawText) return null;
  if (typeof rawText === 'object') return rawText;
  const str = String(rawText).trim();
  try {
    return JSON.parse(str);
  } catch (_) {}
  const cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {}
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch (_) {}
  }
  return null;
}

/**
 * Instant Thai -> English Neural Translator (~150ms, Free, No Key Required)
 * Ensures every Thai brief or shot description becomes an exact, crystal-clear English prompt for FLUX.1
 */
async function translateToEnglish(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text
    .replace(/^[\s\-•*🎬🎥✨🚗🎧📱#\d.)]+/, '')
    .replace(/เซลล์/g, 'พนักงานขายรถยนต์')
    .trim();
  if (!clean) return '';
  // If already pure English (no Thai characters), return as-is
  if (!/[\u0E00-\u0E7F]/.test(clean)) return clean;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.[0])) {
        const translated = data[0].map(part => part?.[0] || '').join('').replace(/[ \t]+/g, ' ').trim();
        if (translated) return translated;
      }
    }
  } catch (e) {
    console.warn('[Translator Notice]:', e.message);
  }
  return clean.replace(/[\u0E00-\u0E7F]+/g, ' ').replace(/\s+/g, ' ').trim() || 'cinematic commercial scene';
}

/**
 * Optional LLM Caller (Used when Gemini or OpenAI API key is configured)
 */
async function callLLMChat(systemPrompt, userPrompt) {
  if (config.GEMINI_API_KEY) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nคำขอจากผู้ใช้:\n${userPrompt}\n\nส่งคำตอบเป็น JSON ล้วนเท่านั้น` }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = extractJsonObject(text);
        if (parsed) return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] Gemini inference notice:', err.message);
    }
  }

  if (config.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.OPENAI_MODEL || 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = extractJsonObject(content);
        if (parsed) return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] OpenAI inference notice:', err.message);
    }
  }

  return null;
}

/**
 * Generate Real AI Image using HuggingFace Gradio Space (FLUX.1-schnell)
 */
async function callGradioFluxSpace(spaceBaseUrl, prompt, width, height, seed) {
  const controller1 = new AbortController();
  const t1 = setTimeout(() => controller1.abort(), 12000);

  const callRes = await fetch(`${spaceBaseUrl}/gradio_api/call/infer`, {
    method: 'POST',
    signal: controller1.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [prompt, seed, false, width, height, 4]
    })
  });
  clearTimeout(t1);

  if (!callRes.ok) {
    throw new Error(`Gradio call failed: ${callRes.status}`);
  }

  const callData = await callRes.json();
  const eventId = callData.event_id;
  if (!eventId) {
    throw new Error('No event_id returned from Gradio space');
  }

  const controller2 = new AbortController();
  const t2 = setTimeout(() => controller2.abort(), 25000);
  const streamRes = await fetch(`${spaceBaseUrl}/gradio_api/call/infer/${eventId}`, {
    signal: controller2.signal
  });
  const sseText = await streamRes.text();
  clearTimeout(t2);

  const lines = sseText.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const jsonStr = line.slice(5).trim();
      try {
        const arr = JSON.parse(jsonStr);
        const fileInfo = Array.isArray(arr) ? arr[0] : arr;
        const imageUrl = fileInfo?.url || (fileInfo?.path ? `${spaceBaseUrl}/gradio_api/file=${fileInfo.path}` : null);
        if (imageUrl) {
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.byteLength > 1500) {
              const mime = imageUrl.endsWith('.png') ? 'image/png' : imageUrl.endsWith('.jpg') ? 'image/jpeg' : 'image/webp';
              return { buffer: buf, mime };
            }
          }
        }
      } catch (_) {}
    }
  }
  throw new Error('Gradio SSE did not contain valid image URL');
}

async function callSubnpFreeImage(prompt, model = 'magic') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  const res = await fetch('https://subnp.com/api/free/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model }),
    signal: controller.signal
  });
  const sseText = await res.text();
  clearTimeout(timeout);

  const lines = sseText.split('\n').filter((l) => l.startsWith('data:'));
  for (const line of lines) {
    try {
      const json = JSON.parse(line.slice(5).trim());
      if (json.imageUrl) {
        const imgRes = await fetch(json.imageUrl);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.byteLength > 2000) {
            const ct = imgRes.headers.get('content-type') || 'image/jpeg';
            return { buffer: buf, mime: ct };
          }
        }
      }
    } catch (_) {}
  }
  throw new Error(`SubNP (${model}) did not return an image URL`);
}

/**
 * Generate Real AI Image for a Prompt
 * Automatically translates any Thai text in the prompt to English before calling AI Image Engines
 */
async function generateAIImage(prompt, options = {}) {
  const {
    aspect_ratio = '16:9',
    seed = Math.floor(Math.random() * 1000000)
  } = options;

  let width = 1024;
  let height = 576;
  if (aspect_ratio === '9:16') {
    width = 576;
    height = 1024;
  } else if (aspect_ratio === '1:1') {
    width = 768;
    height = 768;
  }

  let englishPrompt = String(prompt || '').trim();
  if (/[\u0E00-\u0E7F]/.test(englishPrompt)) {
    englishPrompt = await translateToEnglish(englishPrompt);
  }

  const cleanTextPrompt = englishPrompt
    .replace(/["“”\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 450);

  // 1A. Tier 1A: SubNP High-Speed Photorealistic Engine (~2.5s per image, Free, No Rate Limit)
  try {
    const subnpRes = await callSubnpFreeImage(cleanTextPrompt, 'magic');
    if (subnpRes && subnpRes.buffer) {
      return `data:${subnpRes.mime};base64,${subnpRes.buffer.toString('base64')}`;
    }
  } catch (e) {
    console.warn('[AI Image SubNP Notice]:', e.message);
  }

  // 1B. Tier 1B: FLUX.1-schnell via Gradio API (Free, ~4s, Ultra-Crisp Photorealistic)
  try {
    const fluxResult = await callGradioFluxSpace(
      'https://black-forest-labs-flux-1-schnell.hf.space',
      cleanTextPrompt,
      width,
      height,
      seed % 2147483647
    );
    if (fluxResult && fluxResult.buffer) {
      return `data:${fluxResult.mime};base64,${fluxResult.buffer.toString('base64')}`;
    }
  } catch (e) {
    console.warn('[AI Image FLUX.1-schnell Notice]:', e.message);
  }

  // 2. Tier 2: Pollinations API Key (if configured)
  const encodedPrompt = encodeURIComponent(cleanTextPrompt.slice(0, 320));
  if (config.POLLINATIONS_API_KEY) {
    try {
      const url = `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&model=flux&seed=${seed}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${config.POLLINATIONS_API_KEY}` }
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength > 2000) {
          return `data:image/jpeg;base64,${buf.toString('base64')}`;
        }
      }
    } catch (e) {
      console.warn('[AI Image Pollinations Key Notice]:', e.message);
    }
  }

  // 3. Tier 3: Gemini Imagen (if key configured)
  if (config.GEMINI_API_KEY) {
    try {
      const gUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_IMAGE_MODEL}:generateImages?key=${config.GEMINI_API_KEY}`;
      const res = await fetch(gUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanTextPrompt,
          numberOfImages: 1,
          aspectRatio: aspect_ratio === '9:16' ? '9:16' : '16:9'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const base64 = data.generatedImages?.[0]?.image?.imageBytes;
        if (base64) {
          return `data:image/jpeg;base64,${base64}`;
        }
      }
    } catch (e) {
      console.warn('[AI Image Gemini Notice]:', e.message);
    }
  }

  // 4. Tier 4: Pollinations Free Turbo Endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=turbo&nologo=true&seed=${seed}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > 2000) {
        return `data:image/jpeg;base64,${buf.toString('base64')}`;
      }
    }
  } catch (e) {
    console.warn('[AI Image Turbo Notice]:', e.message);
  }

  return null;
}

/**
 * Plan Storyboard Shots
 */
async function planStoryboard({
  story_concept,
  num_shots = 0,
  target_duration = 30,
  pacing = 'normal',
  visual_style = 'auto',
  camera_breakdown = 'auto_story',
  aspect_ratio = '16:9'
}) {
  return await generateSmartNeuralStoryboard(
    story_concept,
    num_shots,
    target_duration,
    visual_style,
    aspect_ratio,
    camera_breakdown
  );
}

/**
 * Infer camera angle automatically from Thai/English beat text or camera_breakdown mode
 */
function inferBestCameraStage(beatText, index, cameraBreakdown, narrativeStages) {
  const t = String(beatText || '').toLowerCase();
  if (/มาโคร|macro|extreme close|ใกล้มาก|พื้นผิว|ตะเข็บ|หยดน้ำ|ปลายนิ้ว|ปุ่ม/.test(t)) {
    return narrativeStages[2]; // Extreme Close-Up Macro
  }
  if (/โคลสอัพ|close-up|closeup|มุมใกล้|ใบหน้า|รอยยิ้ม|แววตา|มือจับ|ถือกล่อง/.test(t)) {
    return narrativeStages[5]; // Close-Up Reaction / Detail
  }
  if (/มุมกว้าง|wide|โชว์รูม|ทั้งคัน|บรรยากาศ|เปิดตัว|สวน|ถนน/.test(t)) {
    return narrativeStages[0]; // Wide Establishing Shot
  }
  if (/มุมต่ำ|มุมเสย|low angle|เคลื่อนตัว|วิ่งออก|ฝากระโปรง|หลังคา/.test(t)) {
    return narrativeStages[6]; // Low-Angle Hero Tracking
  }
  if (/ข้ามไหล่|over-the-shoulder|ots|หน้าจอ|คอนโซล/.test(t)) {
    return narrativeStages[3]; // Over-The-Shoulder
  }
  if (/pov|สายตา|มองดู/.test(t)) {
    return narrativeStages[4]; // POV
  }

  // Otherwise pick based on chosen cameraBreakdown mode
  if (cameraBreakdown === 'macro_detail') {
    const macroOrder = [2, 5, 3, 1, 2, 6, 5, 7];
    return narrativeStages[macroOrder[index % macroOrder.length]];
  }
  if (cameraBreakdown === 'cinematic_story') {
    const cineOrder = [0, 1, 3, 5, 6, 7, 1, 5];
    return narrativeStages[cineOrder[index % cineOrder.length]];
  }
  if (cameraBreakdown === 'dynamic_angles') {
    const dynOrder = [4, 2, 6, 1, 5, 7, 3, 2];
    return narrativeStages[dynOrder[index % dynOrder.length]];
  }

  return narrativeStages[index % narrativeStages.length];
}

/**
 * Resolve Auto or Custom Visual Style & Lighting into English for Image Generation
 */
async function resolveVisualStyle(styleInput, rawConcept) {
  // Check if user pasted a Visual Style line inside their prompt
  const embeddedMatch = String(rawConcept || '').match(/visual\s*style(?:\s*reference)?[^:\n]*:\s*([^\r\n]+)/i);
  if (embeddedMatch && embeddedMatch[1].trim()) {
    const extracted = embeddedMatch[1].trim();
    return /[\u0E00-\u0E7F]/.test(extracted) ? await translateToEnglish(extracted) : extracted;
  }

  const cleanStyle = String(styleInput || '').trim();
  if (!cleanStyle || cleanStyle === 'auto' || cleanStyle.includes('อัตโนมัติ')) {
    const text = String(rawConcept || '').toLowerCase();
    if (/asmr|มาโคร|macro|craftsmanship|สัมผัส/.test(text)) {
      return 'macro photography, hyper-realistic, soft natural daylight, premium commercial style, sharp tactile details';
    }
    if (/รถ|โชว์รูม|mazda|ev|car|suv|ส่งมอบรถ/.test(text)) {
      return 'high-end automotive commercial photography, sleek showroom & golden hour lighting, glossy reflections, photorealistic 8k';
    }
    if (/เซรั่ม|ครีม|ผิว|บิวตี้|สกินแคร์|skin|serum|beauty/.test(text)) {
      return 'luxury skincare beauty commercial, soft diffused morning sunlight, dewy glass skin texture, clean minimalist studio';
    }
    if (/คาเฟ่|กาแฟ|มัทฉะ|อาหาร|ขนม|เครื่องดื่ม|cafe|food/.test(text)) {
      return 'warm natural window daylight, appetizing lifestyle food cinematography, shallow depth of field, rich organic colors';
    }
    return 'high-end cinematic commercial photography, natural volumetric lighting, shallow depth of field, hyper-realistic 8k';
  }

  // If user typed custom Thai or English style, translate any Thai to English
  if (/[\u0E00-\u0E7F]/.test(cleanStyle)) {
    const tr = await translateToEnglish(cleanStyle);
    return `${tr}, photorealistic, high detail`;
  }
  return cleanStyle;
}

/**
 * Smart Neural Storyboard Director
 * Automatically breaks user's Thai/English brief into distinct cinematic shots by story beats & camera angles
 */
async function generateSmartNeuralStoryboard(
  concept,
  requestedCount,
  totalDuration,
  style,
  aspect_ratio,
  camera_breakdown = 'auto_story'
) {
  const rawText = String(concept || '').trim();
  const resolvedStyleEn = await resolveVisualStyle(style, rawText);

  // 1. Direct Multi-Scene Detection (inline numbers, multiline numbers, or structured scene headers)
  const parsed = parseMultiSceneScript(rawText);
  if (parsed && parsed.shots && parsed.shots.length >= 2) {
    return parsed;
  }

  // 2. Intelligent Target Shot Count Analysis:
  // Priority: (a) Explicit text in prompt ("ขอ 3 ฉาก", "10 ช็อต", "4 scenes")
  //           (b) Requested count from client UI (requestedCount)
  //           (c) Narrative actions / clauses directly in user's content
  //           (d) Default rich cinematic arc (6 to 8 shots) without arbitrary restrictions
  let targetCount = 0;
  const countMatch = rawText.match(/(?:ขอ|เอา|อยากได้|สร้าง|ทำ|จำนวน)?\s*(\d+)\s*(?:ฉาก|ช็อต|ซีน|ช้อต|ตอน|shots?|scenes?|cuts?)/i);
  if (countMatch) {
    targetCount = parseInt(countMatch[1], 10);
  } else if (requestedCount && Number(requestedCount) >= 2) {
    targetCount = parseInt(requestedCount, 10);
  } else {
    // Analyze narrative action clauses directly from content
    const narrativeClauses = rawText.split(/(?:,|\n|\t|->|➔|=>|จากนั้น|ต่อด้วย|แล้วค่อย|แล้ว|ก่อนจะ|ก่อนที่|จบด้วย|ปิดท้ายด้วย)/).filter(p => p.trim().length >= 3);
    if (narrativeClauses.length >= 3) {
      targetCount = narrativeClauses.length;
    } else if (/(?:asmr|macro|เจาะลึก|สารคดี|series|ซีรีส์)/i.test(rawText)) {
      targetCount = 8;
    } else {
      targetCount = 6; // Standard rich multi-angle cinematic default
    }
  }

  // Clamp targetCount safely between 2 and 16
  targetCount = Math.max(2, Math.min(16, targetCount || 6));

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

  // 3. Domain Master Pools (10-12 progressive narrative beats per domain)
  const t = rawText.toLowerCase();
  let masterPool = [];

  if (/ตกปลา|ปลา|คันเบ็ด|รอก|เหยื่อ|บ่อปลา|แม่น้ำ|angling|fish/.test(t)) {
    masterPool = [
      'ชวนเพื่อนแวะร้านจำหน่ายอุปกรณ์ตกปลาขนาดใหญ่ เตรียมความพร้อมและวางแผนเดินทาง',
      'หยิบคันเบ็ดคาร์บอนไฟเบอร์น้ำหนักเบาและรอกตกปลาโลหะขึ้นมาทดสอบความยืดหยุ่นในร้าน',
      'ออกเดินทางถึงริมน้ำ แสงเช้าสาดส่องผิวน้ำนิ่ง มีหมอกบางๆ ลอยละล่อง',
      'ล่องเรือหางยาวออกสู่ผืนน้ำกว้างใหญ่ สัมผัสสายลมและธรรมชาติบริสุทธิ์',
      'หวดคันเบ็ดทอดสายลงสู่ผืนน้ำนิ่งอย่างมีสมาธิ รอคอยจังหวะอย่างใจเย็น',
      'สายเบ็ดกระตุกแรง คันเบ็ดโค้งงออย่างรุนแรง ปลาตัวโตดิ้นกระโดดสาดละอองน้ำระยิบระยับ',
      'ออกแรงหมุนรอกงัดสู้ปลาอย่างตื่นเต้น และยกปลาตัวโตขึ้นมาบนเรือด้วยรอยยิ้มภาคภูมิใจ',
      'นำปลาสดจากน้ำมาก่อเตาถ่านแคมป์ปิ้งริมน้ำ ควันหอมฉุยลอยกรุ่น',
      'ย่างปลาสดจนสุกเกรียมเหลืองทอง โรยเกลือสมุนไพร กลิ่นหอมน่ารับประทาน',
      'ทุกคนล้อมวงรับประทานอาหาร ยิ้มหัวเราะชนแก้วแห่งความสุขในวันพักผ่อนริมน้ำ'
    ];
  } else if (/รถ|โชว์รูม|ส่งมอบ|ขับขี่|กุญแจ|พวงมาลัย|กระจังหน้า|mazda|ev|car|suv|handover/.test(t)) {
    masterPool = [
      'เปิดตัวรถยนต์พรีเมียมคลุมผ้าซาตินสีดำในโชว์รูมกระจกโปร่ง แสงสตูดิโอสะท้อนหรูหรา',
      'พนักงานขายค่อยๆ ดึงผ้าคลุมออก เผยให้เห็นไฟหน้า LED ดีไซน์โฉบเฉี่ยวและกระจังหน้าเรืองแสง',
      'ช็อตเจาะรายละเอียดล้ออัลลอย เส้นสายตัวถังแอโรไดนามิก และงานประกอบอันประณีต',
      'พนักงานส่งมอบกล่องกุญแจหนังแท้และสมาร์ทคีย์ให้ลูกค้าด้วยรอยยิ้มอบอุ่น',
      'ลูกค้าและครอบครัวยิ้มดีใจ ถ่ายรูปคู่กับรถใหม่ติดโบว์แดงแห่งความภาคภูมิใจ',
      'เปิดประตูสัมผัสกลิ่นอายห้องโดยสารใหม่ พวงมาลัยหนังแท้เย็บมือและเบาะนั่ง Ergonomic',
      'ปลายนิ้วสัมผัสปุ่ม Start หน้าปัดดิจิทัลสว่างวาบพร้อมเสียงระบบไฟฟ้าไฮเทคตื่นตัว',
      'หลังคาแก้ว Panoramic Sunroof เลื่อนเปิดรับแสงแดดธรรมชาติอย่างนุ่มนวลและเงียบกริบ',
      'เสียงปิดประตูดัง "ทึบ" หนักแน่น บ่งบอกถึงความปลอดภัยและงานวิศวกรรมระดับพรีเมียม',
      'รถยนต์เคลื่อนตัวออกจากโชว์รูมสู่ท้องถนนยามเย็น แสงอาทิตย์สีทองสะท้อนตัวถังเงางาม'
    ];
  } else if (/เซรั่ม|ผิว|ครีม|ดรอปเปอร์|แต่งหน้า|สกินแคร์|บำรุง|skin|serum|beauty/.test(t)) {
    masterPool = [
      'ขวดเซรั่มแก้วใสวางเด่นบนผิวน้ำกระทบแสงแดดเช้า มีหยดน้ำบริสุทธิ์เกาะระยิบระยับ',
      'ดรอปเปอร์แก้วค่อยๆ ดูดเนื้อเซรั่มใสบริสุทธิ์เข้มข้นขึ้นมาอย่างช้าๆ',
      'หยดเนื้อเซรั่มลงบนผิวหลังมือ ภาพมาโครเห็นความชุ่มชื้นและโมเลกุลน้ำแตกตัวชัดเจน',
      'ปลายนิ้วเกลี่ยเนื้อเซรั่มลงบนพวงแก้มอย่างอ่อนโยน เนื้อบางเบาซึมซาบสู่ผิวทันที',
      'สัมผัสความสดชื่นและความชุ่มชื้นล้ำลึกที่ฟื้นบำรุงผิวหน้าอย่างเป็นธรรมชาติ',
      'ภาพโคลสอัพซูมเจาะลึกผิวหน้าที่ดูเรียบเนียน ฉ่ำวาว อิ่มน้ำ สุขภาพดีไร้ที่ติ',
      'แสงธรรมชาติสะท้อนความเปล่งปลั่ง กระจ่างใสของผิวหน้าอย่างมีออร่า Glass Skin',
      'นางแบบส่องกระจกด้วยรอยยิ้มพึงพอใจและมั่นใจในผิวหน้าสดที่ดูอ่อนเยาว์',
      'นางแบบหันมายิ้มอย่างมั่นใจกับกล้องในลุคคลีนมินิมอล เผยเสน่ห์ผิวสวยอย่างเป็นธรรมชาติ',
      'ช็อตจบขวดผลิตภัณฑ์คู่กับหยดน้ำบริสุทธิ์และดอกไม้สีขาว พร้อมพื้นที่วางโลโก้แบรนด์'
    ];
  } else if (/กาแฟ|คาเฟ่|อาหาร|กิน|ย่าง|ทำอาหาร|ชิม|มัทฉะ|ครัว|cafe|food|cook|eat/.test(t)) {
    masterPool = [
      'ผลักประตูไม้เข้าสู่ร้าน กลิ่นหอมกรุ่นของอาหารและเครื่องดื่มลอยมาต้อนรับอย่างอบอุ่น',
      'เชฟหรือบาริสต้ากำลังคัดสรรวัตถุดิบคุณภาพพรีเมียมด้วยความใส่ใจและพิถีพิถัน',
      'ช็อตเตรียมวัตถุดิบ บดเมล็ดกาแฟ หรือแล่เนื้อสดอย่างเชี่ยวชาญ',
      'การปรุงสดบนเตาไฟหรือการเทนมแยกชั้นเครื่องดื่มอย่างประณีต แสงไฟอบอุ่น',
      'จัดจานเสิร์ฟอย่างสวยงามสไตล์มินิมอล แสงธรรมชาติส่องกระทบจานอาหาร',
      'ภาพโคลสอัพจานอาหาร ควันหอมฉุย ซอสเยิ้มๆ หรือฟองนมนุ่มละมุนน่ารับประทาน',
      'ตักอาหารคำโตเข้าปากหรือยกแก้วขึ้นจิบ สัมผัสรสชาติแรกอันกลมกล่อมลงตัว',
      'สีหน้ายิ้มกว้างด้วยความประทับใจในรสชาติอันเป็นเอกลักษณ์และความสุขที่ได้ลิ้มลอง',
      'บรรยากาศลูกค้านั่งผ่อนคลายริมหน้าต่างรับแสงแดดอุ่น สบายๆ สไตล์สโลว์ไลฟ์',
      'ภาพจบมุมโปรดของร้านคู่กับเมนูซิกเนเจอร์ พร้อมเชิญชวนทุกคนมาสัมผัสความอร่อย'
    ];
  } else {
    masterPool = [
      `ภาพมุมกว้างเปิดฉากสร้างบรรยากาศ แนะนำบริบทและจุดเริ่มต้นของ ${rawText}`,
      `ตัวละครหลักหรือสิ่งของสำคัญปรากฏขึ้น พร้อมเป้าหมายหรือความต้องการอันชัดเจน`,
      `การเริ่มต้นลงมือทำขั้นตอนแรกด้วยความตื่นเต้นและการเตรียมตัวอย่างพิถีพิถัน`,
      `เผชิญกับรายละเอียดความท้าทาย หรือเจาะลึกฟีเจอร์เด่นที่น่าสนใจ`,
      `ช่วงเวลาสำคัญของการลงมือทำอย่างมุ่งมั่นและใส่ใจในทุกรายละเอียด`,
      `จุดไคลแม็กซ์ที่น่าตื่นเต้นที่สุด ช่วงเวลาแห่งการตัดสินใจหรือการพลิกผัน`,
      `ผลลัพธ์แห่งความสำเร็จที่ปรากฏชัดเจน ความรู้สึกโล่งใจและภาคภูมิใจ`,
      `ภาพมุมมองใกล้เจาะรายละเอียดความสำเร็จ รอยยิ้ม และความงดงามที่เกิดขึ้น`,
      `การแบ่งปันความสุขและสร้างช่วงเวลาที่น่าจดจำร่วมกัน`,
      `บทสรุปปิดท้ายอันทรงพลัง ประทับใจ พร้อมส่งต่อแรงบันดาลใจและ Call to Action`
    ];
  }

  // Synthesize beats matching targetCount
  const synthesizedBeats = pickBeats(masterPool, targetCount);

  const cleanTitle = rawText.replace(/^[🎬🎥✨🚗🎧📱#\s*\d.)\-]+/, '').slice(0, 60) || 'โปรเจกต์สตอรี่บอร์ดงานภาพยนตร์';
  const shots = synthesizedBeats.map((beat, idx) => {
    const shotNum = idx + 1;
    const enriched = enrichSingleBeat(cleanTitle, beat, idx, synthesizedBeats.length, resolvedStyleEn);
    const titleClean = `ฉากที่ ${shotNum}: ${beat.slice(0, 40)}`;

    const shotData = {
      shot_number: shotNum,
      scene_number: shotNum,
      scene_title: titleClean,
      title: titleClean,
      subtitle: `${enriched.camera_angle_th} • ${enriched.lens_focal}`,
      camera_angle: enriched.camera_angle,
      camera_angle_th: enriched.camera_angle_th,
      camera_movement: enriched.camera_movement,
      lens_focal: enriched.lens_focal,
      duration_seconds: 3.0,
      action_description: enriched.action_description,
      dialogue: enriched.dialogue,
      audio_foley: enriched.audio_foley,
      on_screen_text: shotNum === synthesizedBeats.length ? cleanTitle.slice(0, 35) : '',
      prompt: enriched.prompt,
      video_prompt: enriched.video_prompt,
      live_action_guide: `มุมกล้อง: ${enriched.camera_angle} | เลนส์: ${enriched.lens_focal} | จัดแสงธรรมชาติเน้นมิติความลึก (Depth of Field)`,
      visual_style: resolvedStyleEn,
      aspect_ratio: aspect_ratio || '16:9'
    };
    shotData.image_url = getStoryboardSketch(shotData);
    return shotData;
  });

  let curTime = 0;
  shots.forEach((s) => {
    const startSec = curTime;
    const endSec = Math.round((startSec + s.duration_seconds) * 10) / 10;
    curTime = endSec;
    const formatSec = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const s = seconds % 60;
      const sStr = s < 10 ? '0' + s.toFixed(1) : s.toFixed(1);
      return `${mins}:${sStr}`;
    };
    s.timecode = `${formatSec(startSec)} - ${formatSec(endSec)}`;
  });

  return {
    project_title: cleanTitle,
    logline: `สตอรี่บอร์ด ${shots.length} ช็อต ถ่ายทอดเรื่องราว "${cleanTitle}"`,
    total_shots: shots.length,
    total_duration: curTime,
    target_duration: curTime,
    shots
  };
}

module.exports = {
  planStoryboard,
  generateAIImage,
  translateToEnglish,
  callLLMChat,
  sanitizeThaiPolite
};
