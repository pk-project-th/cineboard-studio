// CineBoard Studio 3.0 — On-the-Go Content & Travel Storyboard AI Engine
// Designed for real-world content creators & travelers:
//   1. Connected Story Arcs (Hook -> Arrival -> Highlight -> Detail -> Emotion -> CTA)
//   2. Complete Shooting Guide per Shot (กี่วิ • ถ่ายอะไร • มุมกล้องมือถือ • เว้นที่ใส่ข้อความ • บทพากย์)
//   3. Accurate Thai-to-English Neural Translation + Multi-Tier Free AI Image Rendering (FLUX.1 / SubNP / Pollinations)

const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');
const {
  parseMultiSceneScript,
  enrichSingleBeat,
  buildConnectedStoryBeats,
  getShotNarrativeRole,
  extractCleanSubject
} = require('./scriptParser');

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
 */
async function translateToEnglish(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text
    .replace(/^[\s\-•*🎬🎥✨🚗🎧📱#\d.)]+/, '')
    .replace(/เซลล์/g, 'พนักงานขายรถยนต์')
    .trim();
  if (!clean) return '';
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
  return clean.replace(/[\u0E00-\u0E7F]+/g, ' ').replace(/\s+/g, ' ').trim() || 'cinematic travel lifestyle scene';
}

/**
 * Optional LLM Caller (Gemini / OpenAI if configured)
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
 */
async function generateAIImage(prompt, options = {}) {
  const {
    aspect_ratio = '9:16',
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

  // 1A. SubNP High-Speed Photorealistic Engine
  try {
    const subnpRes = await callSubnpFreeImage(cleanTextPrompt, 'magic');
    if (subnpRes && subnpRes.buffer) {
      return `data:${subnpRes.mime};base64,${subnpRes.buffer.toString('base64')}`;
    }
  } catch (e) {
    console.warn('[AI Image SubNP Notice]:', e.message);
  }

  // 1B. FLUX.1-schnell via Gradio API
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

  // 2. Pollinations API Key (if configured)
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

  // 3. Gemini Imagen (if key configured)
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

  // 4. Pollinations Free Turbo Endpoint
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
 * Resolve Visual Style into English for Image Generation
 */
async function resolveVisualStyle(styleInput, rawConcept) {
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
    if (/วัด|พระ|โบราณ|เมืองเก่า|temple/.test(text)) {
      return 'warm golden hour sunlight, rich cultural travel photography, cinematic depth of field, vibrant natural colors, 8k';
    }
    if (/คาเฟ่|กาแฟ|มัทฉะ|อาหาร|ขนม|ของกิน|cafe|food/.test(text)) {
      return 'bright natural window daylight, appetizing lifestyle food & cafe cinematography, shallow depth of field, warm aesthetic';
    }
    if (/ทะเล|ชายหาด|ภูเขา|ดอย|ธรรมชาติ|แคมป์|beach|mountain/.test(text)) {
      return 'crisp sunny travel vlog photography, vibrant sky and natural scenery, golden hour rim lighting, photorealistic 8k';
    }
    return 'bright natural daylight, high-end lifestyle travel & creator cinematography, shallow depth of field, hyper-realistic 8k';
  }

  if (/[\u0E00-\u0E7F]/.test(cleanStyle)) {
    const tr = await translateToEnglish(cleanStyle);
    return `${tr}, photorealistic, high detail`;
  }
  return cleanStyle;
}

/**
 * Plan Storyboard Shots — Connected, Cohesive, Practical Shooting Guide
 */
async function planStoryboard({
  story_concept,
  num_shots = 0,
  target_duration = 20,
  pacing = 'normal',
  visual_style = 'auto',
  camera_breakdown = 'auto_story',
  aspect_ratio = '9:16'
}) {
  const rawText = String(story_concept || '').trim();
  const resolvedStyleEn = await resolveVisualStyle(visual_style, rawText);

  // 1. Check if user pasted a multi-scene numbered script
  const parsed = parseMultiSceneScript(rawText);
  if (parsed && parsed.shots && parsed.shots.length >= 2) {
    const enrichedShots = await Promise.all(parsed.shots.map(async (s, idx) => {
      let enPrompt = s.prompt || s.title;
      if (/[\u0E00-\u0E7F]/.test(enPrompt)) {
        const tr = await translateToEnglish(s.action_description || s.title);
        enPrompt = `${s.camera_angle || 'Medium Shot'}, ${tr}, ${resolvedStyleEn}, photorealistic 8k`;
      }
      const updated = {
        ...s,
        shot_number: idx + 1,
        step_number: idx + 1,
        aspect_ratio: aspect_ratio || '9:16',
        prompt: enPrompt,
        content: enPrompt
      };
      updated.image_url = getStoryboardSketch(updated);
      return updated;
    }));
    return {
      ...parsed,
      shots: enrichedShots
    };
  }

  // 2. Determine Target Shot Count
  let targetCount = 0;
  const countMatch = rawText.match(/(?:ขอ|เอา|อยากได้|สร้าง|ทำ|จำนวน)?\s*(\d+)\s*(?:ฉาก|ช็อต|ซีน|ช้อต|ตอน|shots?|scenes?|cuts?)/i);
  if (countMatch) {
    targetCount = parseInt(countMatch[1], 10);
  } else if (num_shots && Number(num_shots) >= 2) {
    targetCount = parseInt(num_shots, 10);
  } else {
    targetCount = 6; // Ideal 6-scene story arc (Hook -> Walk-in -> Highlight -> Detail -> Emotion -> CTA)
  }
  targetCount = Math.max(2, Math.min(12, targetCount || 6));

  const cleanTopic = extractCleanSubject(rawText);
  const topicEn = await translateToEnglish(cleanTopic);

  // 3. Build deeply connected story beats tailored to the user's topic
  const connectedBeats = buildConnectedStoryBeats(rawText, targetCount);

  let curTime = 0;
  const formatSec = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const s = seconds % 60;
    const sStr = s < 10 ? '0' + s.toFixed(1) : s.toFixed(1);
    return `${mins}:${sStr}`;
  };

  const shots = await Promise.all(connectedBeats.map(async (beat, idx) => {
    const shotNum = idx + 1;
    const roleInfo = getShotNarrativeRole(idx, connectedBeats.length);
    const dur = beat.duration || roleInfo.defaultDuration || 3.0;

    // Ensure English prompt is 100% English and specific to the user's topic + beat
    let promptEn = beat.promptEn || '';
    if (/[\u0E00-\u0E7F]/.test(promptEn) || !promptEn) {
      const actionEn = await translateToEnglish(beat.action || beat.title);
      promptEn = `${beat.angle}, ${actionEn} at ${topicEn}, ${resolvedStyleEn}, photorealistic, crisp details, 8k`;
    } else {
      promptEn = `${promptEn}, ${resolvedStyleEn}`;
    }

    const shotObj = {
      shot_number: shotNum,
      step_number: shotNum,
      scene_number: shotNum,
      scene_title: roleInfo.role,
      shot_role: roleInfo.role,
      title: `ฉากที่ ${shotNum}: ${beat.title}`,
      subtitle: `${beat.angleTh} • ${beat.lens}`,
      camera_angle: beat.angle,
      camera_angle_th: beat.angleTh,
      camera_movement: beat.movement,
      lens_focal: beat.lens,
      shot_size: beat.lens,
      duration_seconds: dur,
      action_description: beat.action,
      dialogue: beat.dialogue,
      dialogue_script: beat.dialogue,
      audio_foley: beat.foley,
      on_screen_text: beat.onScreenText,
      live_action_guide: beat.spaceGuide || roleInfo.textSafeZone,
      prompt: promptEn,
      content: promptEn,
      video_prompt: `[Camera: ${beat.movement}] [Angle: ${beat.angle}] ${promptEn}`,
      visual_style: visual_style === 'auto' ? 'แสงธรรมชาติคมชัด สไตล์ครีเอเตอร์' : visual_style,
      aspect_ratio: aspect_ratio || '9:16'
    };

    shotObj.image_url = getStoryboardSketch(shotObj);
    return shotObj;
  }));

  // Compute cumulative timecodes synchronously
  shots.forEach((s) => {
    const startSec = curTime;
    const endSec = Math.round((startSec + s.duration_seconds) * 10) / 10;
    curTime = endSec;
    s.timecode = `${formatSec(startSec)} - ${formatSec(endSec)} (${s.duration_seconds}s)`;
  });

  return {
    project_title: cleanTopic,
    logline: `สตอรี่บอร์ดพร้อมถ่าย ${shots.length} ฉาก (${curTime} วินาที) สำหรับ "${cleanTopic}"`,
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
