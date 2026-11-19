// CineBoard Studio 4.0 — Dual-Mode Storyboard AI Engine (Master Photo Set + Viral Lifestyle Video)
// Reliable, fast, zero-crash pipeline with Thai-to-English Neural Translation & Multi-Tier Free AI Image Rendering

const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');
const {
  parseMultiSceneScript,
  buildMasterPhotoStoryboard,
  buildViralLifestyleVideoBeats,
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
  try { return JSON.parse(str); } catch (_) {}
  const cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try { return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)); } catch (_) {}
  }
  return null;
}

/**
 * Instant Thai -> English Neural Translator (~150ms, Free, No Key Required)
 */
async function translateToEnglish(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text
    .replace(/^[\s\-•*🎬🎥📸✨🚗🎧📱#\d.)]+/, '')
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
  return clean.replace(/[\u0E00-\u0E7F]+/g, ' ').replace(/\s+/g, ' ').trim() || 'editorial lifestyle travel photography';
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

  if (!callRes.ok) throw new Error(`Gradio call failed: ${callRes.status}`);
  const callData = await callRes.json();
  const eventId = callData.event_id;
  if (!eventId) throw new Error('No event_id returned from Gradio space');

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
  } else if (aspect_ratio === '4:5') {
    width = 768;
    height = 960;
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

  // 1A. SubNP Free Photorealistic Engine
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
          aspectRatio: aspect_ratio === '9:16' ? '9:16' : aspect_ratio === '4:5' ? '3:4' : '16:9'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const base64 = data.generatedImages?.[0]?.image?.imageBytes;
        if (base64) return `data:image/jpeg;base64,${base64}`;
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

async function resolveVisualStyle(styleInput, rawConcept, mode = 'video') {
  const cleanStyle = String(styleInput || '').trim();
  if (!cleanStyle || cleanStyle === 'auto' || cleanStyle.includes('อัตโนมัติ')) {
    if (mode === 'photo') {
      return 'Kinfolk & Cereal editorial lifestyle photography, natural golden hour light, Kodak Portra 400 organic film color palette, rich depth, photorealistic 8k';
    }
    return 'bright natural daylight, viral aesthetic lifestyle travel reel cinematography, shallow depth of field, vibrant natural color grading, 8k';
  }
  if (/[\u0E00-\u0E7F]/.test(cleanStyle)) {
    const tr = await translateToEnglish(cleanStyle);
    return `${tr}, editorial lifestyle photography, photorealistic, high detail`;
  }
  return cleanStyle;
}

/**
 * Plan Storyboard Shots — Dual Mode ('photo' | 'video')
 */
async function planStoryboard({
  mode = 'video', // 'photo' | 'video'
  story_concept,
  num_shots = 0,
  target_duration = 18,
  pacing = 'normal',
  visual_style = 'auto',
  camera_breakdown = 'auto_story',
  aspect_ratio
}) {
  const activeMode = mode === 'photo' ? 'photo' : 'video';
  const defaultAspect = activeMode === 'photo' ? '4:5' : '9:16';
  const finalAspect = aspect_ratio || defaultAspect;
  const rawText = String(story_concept || '').trim();
  const resolvedStyleEn = await resolveVisualStyle(visual_style, rawText, activeMode);

  // 1. Check if user pasted a structured multi-scene script
  const parsed = parseMultiSceneScript(rawText, activeMode);
  if (parsed && parsed.shots && parsed.shots.length >= 2) {
    const enrichedShots = await Promise.all(parsed.shots.map(async (s, idx) => {
      let enPrompt = s.prompt || s.title;
      if (/[\u0E00-\u0E7F]/.test(enPrompt)) {
        const tr = await translateToEnglish(s.action_description || s.title);
        enPrompt = `${s.camera_angle || 'Medium Shot'}, ${tr}, ${resolvedStyleEn}, photorealistic 8k`;
      }
      const updated = {
        ...s,
        mode: activeMode,
        shot_number: idx + 1,
        step_number: idx + 1,
        aspect_ratio: finalAspect,
        prompt: enPrompt,
        content: enPrompt
      };
      updated.image_url = getStoryboardSketch(updated);
      return updated;
    }));
    return {
      ...parsed,
      mode: activeMode,
      shots: enrichedShots
    };
  }

  // 2. Determine Target Shot Count
  let targetCount = 0;
  const countMatch = rawText.match(/(?:ขอ|เอา|อยากได้|สร้าง|ทำ|จำนวน)?\s*(\d+)\s*(?:ฉาก|ช็อต|ซีน|ภาพ|รูป|ช้อต|ตอน|shots?|scenes?|photos?)/i);
  if (countMatch) {
    targetCount = parseInt(countMatch[1], 10);
  } else if (num_shots && Number(num_shots) >= 2) {
    targetCount = parseInt(num_shots, 10);
  } else {
    targetCount = 6;
  }
  targetCount = Math.max(2, Math.min(10, targetCount || 6));

  const cleanTopic = extractCleanSubject(rawText);
  const topicEn = await translateToEnglish(cleanTopic);

  // 3. Generate tailored Photo Set OR Viral Lifestyle Video Arc
  const rawBeats = activeMode === 'photo'
    ? buildMasterPhotoStoryboard(rawText, targetCount)
    : buildViralLifestyleVideoBeats(rawText, targetCount, visual_style);

  let curTime = 0;
  const formatSec = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const s = seconds % 60;
    const sStr = s < 10 ? '0' + s.toFixed(1) : s.toFixed(1);
    return `${mins}:${sStr}`;
  };

  const shots = await Promise.all(rawBeats.map(async (beat, idx) => {
    const shotNum = idx + 1;
    const roleInfo = getShotNarrativeRole(idx, rawBeats.length, activeMode);
    const dur = activeMode === 'photo' ? 0 : (beat.duration || roleInfo.defaultDuration || 2.5);

    let promptEn = beat.promptEn || '';
    if (/[\u0E00-\u0E7F]/.test(promptEn) || !promptEn) {
      const actionEn = await translateToEnglish(beat.action || beat.title);
      promptEn = `${beat.angle}, ${actionEn} at ${topicEn}, ${resolvedStyleEn}, photorealistic, crisp details, 8k`;
    } else {
      promptEn = `${promptEn}, ${resolvedStyleEn}`;
    }

    const prefix = activeMode === 'photo' ? 'ภาพที่' : 'ฉากที่';
    const shotObj = {
      mode: activeMode,
      shot_number: shotNum,
      step_number: shotNum,
      scene_number: shotNum,
      scene_title: beat.shot_role || roleInfo.role,
      shot_role: beat.shot_role || roleInfo.role,
      title: `${prefix} ${shotNum}: ${beat.title}`,
      subtitle: `${beat.angleTh} • ${beat.lens}`,
      camera_angle: beat.angle,
      camera_angle_th: beat.angleTh,
      camera_movement: beat.movement || (activeMode === 'photo' ? 'นิ่ง / กดถ่ายรัวเก็บจังหวะ' : 'เคลื่อนกล้องนุ่มนวล'),
      lens_focal: beat.lens,
      shot_size: beat.lens,
      duration_seconds: dur,
      master_photographer: beat.masterPhotographer || null,
      depth_technique: beat.depthTechnique || null,
      story_meaning: beat.storyMeaning || null,
      pose_guide: beat.poseGuide || null,
      lighting_tip: beat.lightingTip || null,
      transition_tip: beat.transitionTip || null,
      action_description: beat.action,
      dialogue: beat.dialogue || '',
      dialogue_script: beat.dialogue || '',
      audio_foley: beat.foley || '',
      on_screen_text: beat.onScreenText || '',
      live_action_guide: beat.spaceGuide || roleInfo.textSafeZone,
      prompt: promptEn,
      content: promptEn,
      video_prompt: `[Camera: ${beat.movement || 'Smooth'}] [Angle: ${beat.angle}] ${promptEn}`,
      visual_style: visual_style === 'auto' ? 'Editorial Lifestyle Natural' : visual_style,
      aspect_ratio: finalAspect
    };

    shotObj.image_url = getStoryboardSketch(shotObj);
    return shotObj;
  }));

  shots.forEach((s) => {
    if (activeMode === 'photo') {
      s.timecode = `Slide ${s.step_number}/${shots.length}`;
    } else {
      const startSec = curTime;
      const endSec = Math.round((startSec + s.duration_seconds) * 10) / 10;
      curTime = endSec;
      s.timecode = `${formatSec(startSec)} - ${formatSec(endSec)}`;
    }
  });

  const viralHook = activeMode === 'photo'
    ? `เซ็ตภาพนิ่งไลฟ์สไตล์ ${shots.length} มุม ได้แรงบันดาลใจจากช่างภาพระดับโลก (Fan Ho, Saul Leiter, Steve McCurry, Peter Lindbergh)`
    : `สูตรไวรัลไลฟ์สไตล์ ${shots.length} ฉาก (${curTime} วิ) — เปิด Hook หยุดนิ้วใน 2.5 วิแรก + B-Roll เร่งจังหวะ + จบชวนกดเซฟ`;

  const musicVibe = activeMode === 'photo'
    ? '🎨 โทนสีแนะนำ: Warm Film / Kodak Portra (ปรับ Warmth +10, Shadows +15, Contrast +5)'
    : '🎵 แนวเพลงแนะนำ: Indie Pop / Acoustic Lo-Fi จังหวะสนุก (105-120 BPM) ตัดเข้าจังหวะบีท';

  return {
    mode: activeMode,
    project_title: cleanTopic,
    viral_hook: viralHook,
    music_vibe: musicVibe,
    logline: viralHook,
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
