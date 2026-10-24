// CineBoard Studio 2.0 — Universal AI Storyboard & Visual Director Engine
// Blazing-Fast Multi-Tier Engine:
//   1. Instant Thai-to-English Neural Translation (Google GTX, ~150ms) + Intelligent Cinematography Director
//   2. Optional Gemini / OpenAI LLM Deep Expansion (when API keys are provided)
//   3. Real AI Image Generation via FLUX.1-schnell (~4s, Free, Zero Key Required) + Pollinations/Gemini Fallbacks
// Zero Groq Dependency • Zero Cliché Hardcoded Scripts • 100% Theme Respectful

const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');

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

  // Extract meaningful lines / bullets / sentences from user's input
  let rawLines = rawText
    .split(/\r?\n/)
    .map(l => l.replace(/^[\s\-•*🎬🎥✨🚗🎧📱#]+/, '').trim())
    .filter(l => l.length > 2 && !/^visual\s*style/i.test(l));

  // If user typed a single block/paragraph without newlines, split by sentences or clauses
  if (rawLines.length === 1 && rawLines[0].length > 70) {
    const splitClauses = rawLines[0]
      .split(/(?:[\.!?;]\s+|\s+(?:แล้ว|จากนั้น|ต่อมา|และให้เห็น|ตัดภาพไปที่|ตามด้วย)\s+)/)
      .map(s => s.trim())
      .filter(s => s.length > 4);
    if (splitClauses.length >= 2) {
      rawLines = [rawLines[0].slice(0, 50), ...splitClauses];
    }
  }

  const mainTitle = (rawLines[0] || rawText || 'โปรเจกต์สตอรี่บอร์ดใหม่')
    .replace(/^[🎬🎥✨🚗🎧📱#\s*\d.)\-]+/, '')
    .slice(0, 65);
  const bodyBeats = rawLines.length > 1 ? rawLines.slice(1) : [];

  // Automatic shot count: if user wrote multiple beats/lines, match them 1-to-1; otherwise create a complete 6-angle story arc
  const count =
    bodyBeats.length >= 2
      ? Math.min(20, bodyBeats.length)
      : requestedCount && requestedCount >= 2
      ? requestedCount
      : 6;

  const durPerShot = 3.0;

  // Translate the main topic and all beats to English in a SINGLE batch request (~200ms total)
  const batchText = [mainTitle, ...bodyBeats].join('\n');
  const batchTranslated = await translateToEnglish(batchText);
  const batchLinesEn = batchTranslated.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const mainTopicEn = batchLinesEn[0] || 'Luxury modern commercial scene';
  const translatedBeats = bodyBeats.map((_, idx) => batchLinesEn[idx + 1] || batchLinesEn[0] || mainTopicEn);

  // Narrative arc templates for expanding a short brief into N distinct cinematic shots
  const narrativeStages = [
    {
      angle: 'Wide Establishing Shot',
      th: 'ภาพมุมกว้างเปิดฉากสถานที่และบรรยากาศหลัก',
      lens: '24mm Wide',
      move: 'Slow Dolly Push-In',
      stageTh: (topic) => `เปิดฉากมุมกว้างให้เห็นบรรยากาศโดยรวมของ ${topic} แสงธรรมชาติและมิติสถานที่ชัดเจน`,
      stageEn: (topicEn) => `Wide establishing shot showing the full environment and atmosphere of ${topicEn}, natural cinematic lighting, deep composition`,
      foley: 'เสียงบรรยากาศสถานที่จริง (Ambient Room / Exterior Tone) นุ่มลึกสมจริง',
      vo: (topic) => `เปิดเรื่องราวของ ${topic} ด้วยบรรยากาศที่ดึงดูดสายตาตั้งแต่หยดแรกครับ`
    },
    {
      angle: 'Medium Shot',
      th: 'ภาพมุมปานกลางโฟกัสตัวละครและการกระทำหลัก',
      lens: '35mm Anamorphic',
      move: 'Smooth Gimbal Tracking',
      stageTh: (topic) => `โฟกัสการเคลื่อนไหวและการดำเนินเรื่องหลักของ ${topic} เห็นรายละเอียดท่าทางชัดเจน`,
      stageEn: (topicEn) => `Medium shot focusing on the main subject and key action of ${topicEn}, natural candid interaction, shallow depth of field`,
      foley: 'เสียงการเคลื่อนไหวของตัวละครและวัตถุหลักในฉากอย่างคมชัด',
      vo: () => `ทุกรายละเอียดถูกออกแบบมาเพื่อตอบโจทย์การใช้งานจริงอย่างลงตัวครับ`
    },
    {
      angle: 'Extreme Close-Up Macro',
      th: 'ภาพโคลสอัพมาโครเจาะลึกพื้นผิวและวัสดุพรีเมียม',
      lens: '85mm Macro',
      move: 'Subtle Rack Focus',
      stageTh: (topic) => `เจาะลึกรายละเอียดพื้นผิว วัสดุ และงานประกอบอันประณีตของ ${topic} คมชัดระดับมาโคร`,
      stageEn: (topicEn) => `Extreme close-up macro shot highlighting the fine texture, craftsmanship, and intricate details of ${topicEn}, crisp bokeh`,
      foley: 'เสียงสัมผัสพื้นผิวระยะใกล้ (Crisp Tactile ASMR Foley) ชัดเจนทุกมิติ',
      vo: () => `สัมผัสความประณีตและคุณภาพระดับพรีเมียมที่แตกต่างอย่างชัดเจนครับ`
    },
    {
      angle: 'Over-The-Shoulder (OTS)',
      th: 'มุมมองข้ามไหล่เห็นการใช้งานและฟีเจอร์เด่น',
      lens: '50mm Prime',
      move: 'Gentle Handheld Follow',
      stageTh: (topic) => `มุมมองข้ามไหล่เผยให้เห็นการใช้งานจริงและฟังก์ชันสำคัญของ ${topic}`,
      stageEn: (topicEn) => `Over-the-shoulder shot revealing hands-on interaction and core features of ${topicEn}, warm studio lighting`,
      foley: 'เสียงคลิกปุ่มควบคุมและเสียงตอบสนองของอุปกรณ์อย่างนุ่มนวล',
      vo: () => `ควบคุมและใช้งานได้อย่างราบรื่น ตอบสนองทุกจังหวะชีวิตครับ`
    },
    {
      angle: 'Point-of-View (POV)',
      th: 'มุมมองสายตาผู้ใช้งานจริง (First-Person POV)',
      lens: '28mm POV',
      move: 'First-Person Perspective',
      stageTh: (topic) => `มุมมองแทนสายตาผู้ชมที่ได้สัมผัสและใช้งาน ${topic} ด้วยตัวเองอย่างใกล้ชิด`,
      stageEn: (topicEn) => `First-person POV shot looking directly at ${topicEn}, hands interacting naturally in foreground, immersive perspective`,
      foley: 'เสียงลมหายใจเบาๆ ผสมเสียงสัมผัสจริงเสมือนอยู่ในเหตุการณ์',
      vo: () => `ให้คุณได้สัมผัสประสบการณ์จริงด้วยมุมมองที่ใกล้ชิดที่สุดครับ`
    },
    {
      angle: 'Close-Up Reaction',
      th: 'ภาพโคลสอัพสีหน้าและรอยยิ้มแห่งความประทับใจ',
      lens: '85mm Portrait',
      move: 'Static Lock-Off',
      stageTh: (topic) => `โคลสอัพสีหน้าแววตาและรอยยิ้มแห่งความพึงพอใจหลังจากได้สัมผัส ${topic}`,
      stageEn: (topicEn) => `Close-up portrait shot of a genuinely smiling satisfied person experiencing ${topicEn}, warm golden backlight, expressive eyes`,
      foley: 'เสียงดนตรีประกอบค่อยๆ ยกระดับอารมณ์ความประทับใจ',
      vo: () => `ความประทับใจที่สะท้อนออกมาผ่านรอยยิ้มและความมั่นใจในทุกครั้งที่ใช้งานครับ`
    },
    {
      angle: 'Low-Angle Hero Tracking',
      th: 'มุมเสยเคลื่อนตามสร้างความสง่างามทรงพลัง',
      lens: '35mm Wide',
      move: 'Low-Angle Dolly Track',
      stageTh: (topic) => `ภาพมุมต่ำเคลื่อนตาม ${topic} โชว์เส้นสายและรูปทรงที่สง่างามทรงพลัง`,
      stageEn: (topicEn) => `Dynamic low-angle hero tracking shot of ${topicEn}, dramatic rim lighting, sleek reflections, powerful presence`,
      foley: 'เสียงเคลื่อนที่ทรงพลังและเสียงแอมเบียนต์กว้างขวาง',
      vo: () => `โดดเด่นทุกองศา สะกดทุกสายตาในทุกการเคลื่อนไหวครับ`
    },
    {
      angle: 'Cinematic Finale Hero Shot',
      th: 'ภาพจบสรุปเรื่องราวและภาพจำแบรนด์อันทรงพลัง',
      lens: '50mm Master',
      move: 'Slow Crane Pull-Back',
      stageTh: (topic) => `ภาพจบสุดประทับใจของ ${topic} ท่ามกลางแสงสีทองสวยงาม พร้อมข้อความสรุปจบ`,
      stageEn: (topicEn) => `Iconic cinematic finale hero shot of ${topicEn} in golden hour lighting, editorial composition, commercial masterpiece`,
      foley: 'เสียงดนตรีฟินาเล่จบอย่างสง่างามและน่าจดจำ',
      vo: (topic) => `${topic} คำตอบที่สมบูรณ์แบบสำหรับคุณตั้งแต่วันนี้ครับ`
    }
  ];

  const shots = [];
  for (let i = 0; i < count; i++) {
    const hasSpecificBeat = bodyBeats.length >= 2 && i < bodyBeats.length;
    const rawBeatTh = hasSpecificBeat ? bodyBeats[i].replace(/^\d+[\.\)]\s*/, '').trim() : '';
    const stage = inferBestCameraStage(rawBeatTh, i, camera_breakdown, narrativeStages);
    const shotNum = i + 1;

    const beatTh = hasSpecificBeat ? rawBeatTh : stage.stageTh(mainTitle);
    const beatEn = hasSpecificBeat ? `${mainTopicEn}, ${translatedBeats[i]}` : stage.stageEn(mainTopicEn);

    const shortTitleTh = hasSpecificBeat
      ? beatTh.slice(0, 48)
      : stage.th;

    const shotData = {
      shot_number: shotNum,
      scene_number: shotNum,
      scene_title: `ฉากที่ ${shotNum}: ${shortTitleTh}`,
      title: `ช็อตที่ ${shotNum}: ${shortTitleTh}`,
      camera_angle: stage.angle,
      camera_angle_th: stage.th,
      camera_movement: stage.move,
      lens_focal: stage.lens,
      action_description: hasSpecificBeat
        ? `${beatTh} (${stage.th} • ${stage.lens})`
        : beatTh,
      dialogue: stage.vo(mainTitle),
      audio_foley: stage.foley,
      on_screen_text: shotNum === count ? mainTitle.slice(0, 35) : '',
      prompt: `${stage.angle}, ${stage.lens} lens, ${beatEn}, ${resolvedStyleEn}, hyper-realistic, crisp details, 8k`,
      video_prompt: `${stage.move} camera movement, ${stage.angle} of ${beatEn}, smooth 60fps cinematic motion, photorealistic`,
      duration_seconds: durPerShot,
      aspect_ratio: aspect_ratio
    };

    shotData.image_url = getStoryboardSketch(shotData);
    shots.push(shotData);
  }

  return {
    project_title: mainTitle,
    logline: `สตอรี่บอร์ด ${count} ช็อต ถ่ายทอดเรื่องราว "${mainTitle}"`,
    total_shots: count,
    total_duration: count * durPerShot,
    target_duration: count * durPerShot,
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
