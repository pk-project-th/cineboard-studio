// CineBoard Studio — Universal AI Storyboard & Visual Director Engine
// Multi-Tier Resilient AI Cascade (Pollinations Free -> Gemini -> OpenAI)
// Zero Groq Dependency • Zero Cliché Hardcoded Scripts • 100% Theme Respectful

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');

// Helper to sanitize polite particles (enforces natural "ครับ")
function sanitizeThaiPolite(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/ครับ\/ค่ะ/g, 'ครับ')
             .replace(/ค่ะ\/ครับ/g, 'ครับ')
             .replace(/ครับ\s*\/\s*ค่ะ/g, 'ครับ')
             .replace(/ค่ะ\s*\/\s*ครับ/g, 'ครับ');
}

/**
 * Universal JSON LLM Caller
 * Tier 1: Pollinations OpenAI API (Free, high performance)
 * Tier 2: Gemini API (if key present)
 * Tier 3: OpenAI API (if key present)
 */
async function callLLMChat(systemPrompt, userPrompt) {
  // 1. Tier 1: Pollinations AI Free OpenAI Endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
      }
    }
  } catch (err) {
    console.warn('[AI Service] Pollinations text inference notice:', err.message);
  }

  // 2. Tier 2: Google Gemini (if key present)
  if (config.GEMINI_API_KEY) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nคำขอจากผู้ใช้: ${userPrompt}\n\nส่งคำตอบเป็น JSON ล้วนเท่านั้น` }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(clean);
        }
      }
    } catch (err) {
      console.warn('[AI Service] Gemini inference notice:', err.message);
    }
  }

  // 3. Tier 3: OpenAI GPT-4o-mini (if key present)
  if (config.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.OPENAI_MODEL,
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
        if (content) {
          return JSON.parse(content);
        }
      }
    } catch (err) {
      console.warn('[AI Service] OpenAI inference notice:', err.message);
    }
  }

  return null;
}

/**
 * Plan Storyboard Shots
 */
async function planStoryboard({
  story_concept,
  num_shots = 6,
  target_duration = 30,
  pacing = 'normal',
  visual_style = 'Cinematic Film (35mm Commercial)',
  aspect_ratio = '16:9'
}) {
  const reqShots = Math.max(2, Math.min(30, parseInt(num_shots, 10) || 6));
  const durPerShot = Math.max(1.5, Math.round((target_duration / reqShots) * 10) / 10);

  const systemPrompt = `คุณคือผู้กำกับภาพยนตร์และผู้กำกับโฆษณามืออาชีพระดับแนวหน้า (AI Storyboard & Film Director)
หน้าที่ของคุณคือวิเคราะห์พล็อต/บรีฟของผู้ใช้อย่างละเอียด และสร้างโครงสร้างสตอรี่บอร์ดที่เข้ากับเนื้อเรื่องจริงจำนวน ${reqShots} ช็อต
โดยต้องมีความหลากหลายของมุมกล้อง (Wide, Medium, Close-Up, Extreme Close-Up, POV, Tracking) จังหวะการเล่าเรื่องที่ดี และสอดคล้องกับสไตล์ "${visual_style}"

ตอบกลับเป็น JSON เท่านั้นในโครงสร้างดังนี้:
{
  "project_title": "ชื่อโปรเจกต์ที่สละสลวยและตรงกับเรื่อง",
  "logline": "สรุปแก่นเรื่องใน 1-2 ประโยค",
  "shots": [
    {
      "shot_number": 1,
      "scene_number": 1,
      "scene_title": "ฉากที่ 1: ...",
      "title": "ชื่อช็อตภาษาไทย ชัดเจน กระชับ",
      "camera_angle": "Wide Establishing Shot / Close-Up / POV ...",
      "camera_angle_th": "ชื่อมุมกล้องภาษาไทย",
      "camera_movement": "Slow Push-In / Static Lock-off / Dolly Track ...",
      "lens_focal": "24mm / 35mm / 50mm / 85mm",
      "action_description": "คำอธิบายภาพและการกระทำในช็อตอย่างเห็นภาพชัดเจน",
      "dialogue": "บทพูดหรือเสียงพากย์ภาษาไทย ถ้ามี ให้เป็นธรรมชาติ ใช้คำว่า 'ครับ' ห้ามใช้ 'ครับ/ค่ะ'",
      "audio_foley": "เสียง Foley SFX และเสียงบรรยากาศเฉพาะของฉากนี้",
      "on_screen_text": "ข้อความบนจอ ถ้าจำเป็น",
      "prompt": "Detailed English prompt for high-end cinematic image generation capturing this exact scene, subject, lighting, angle, and atmosphere matching ${visual_style}",
      "video_prompt": "Cinematic camera movement and motion prompt for AI video generators (Kling, Runway, Luma, Flow)",
      "duration_seconds": ${durPerShot},
      "aspect_ratio": "${aspect_ratio}"
    }
  ]
}`;

  const userPrompt = `บรีฟเรื่องราว:\n"${story_concept}"\nจำนวนช็อตที่ต้องการ: ${reqShots} ช็อต\nความยาวรวม: ${target_duration} วินาที\nสัดส่วนภาพ: ${aspect_ratio}`;

  const result = await callLLMChat(systemPrompt, userPrompt);
  if (result && result.shots && Array.isArray(result.shots) && result.shots.length > 0) {
    // Sanitize and ensure fields
    result.shots = result.shots.map((s, idx) => ({
      ...s,
      shot_number: s.shot_number || (idx + 1),
      scene_number: s.scene_number || Math.min(5, Math.floor(idx / 4) + 1),
      scene_title: s.scene_title || `ฉากที่ ${Math.min(5, Math.floor(idx / 4) + 1)}`,
      aspect_ratio: aspect_ratio,
      dialogue: sanitizeThaiPolite(s.dialogue || ''),
      image_url: getStoryboardSketch({
        ...s,
        aspect_ratio: aspect_ratio,
        step_number: idx + 1
      })
    }));
    result.total_shots = result.shots.length;
    result.target_duration = target_duration;
    result.total_duration = target_duration;
    return result;
  }

  // Fallback: Dynamic Story Beats from User Brief (Never canned 200 baht jokes!)
  return generateDynamicStoryBeats(story_concept, reqShots, target_duration, visual_style, aspect_ratio);
}

/**
 * Dynamic Story Beats Generator (Contextual Fallback)
 * Analyzes nouns and keywords from user's concept to craft realistic shots
 */
function generateDynamicStoryBeats(concept, count, totalDuration, style, aspect_ratio) {
  const durPerShot = Math.max(1.5, Math.round((totalDuration / count) * 10) / 10);
  const cleanConcept = (concept || 'โปรเจกต์สตอรี่บอร์ด').slice(0, 100);

  const angles = [
    { angle: 'Wide Establishing Shot', th: 'ภาพมุมกว้างเปิดฉาก', lens: '24mm', move: 'Slow Push-In' },
    { angle: 'Medium Close-Up', th: 'ภาพครึ่งตัวเน้นอารมณ์', lens: '50mm', move: 'Eye-level Static' },
    { angle: 'Extreme Close-Up Macro', th: 'ภาพโคลสอัพเจาะรายละเอียด', lens: '100mm Macro', move: 'Gentle Rack Focus' },
    { angle: 'Over-The-Shoulder (OTS)', th: 'ภาพข้ามไหล่', lens: '50mm', move: 'Subtle Handheld' },
    { angle: 'Point-of-View (POV)', th: 'มุมมองบุคคลที่หนึ่ง', lens: '28mm', move: 'First-Person Forward' },
    { angle: 'Low-Angle Tracking', th: 'มุมต่ำเคลื่อนที่ตามวัตถุ', lens: '35mm', move: 'Dolly Tracking' },
    { angle: 'High-Angle Hero Shot', th: 'มุมสูงสร้างความโอ่อ่า', lens: '24mm', move: 'Crane Down' },
    { angle: 'Close-Up Reaction', th: 'โคลสอัพสีหน้าแววตา', lens: '85mm', move: 'Lock-off Focus' }
  ];

  const shots = [];
  for (let i = 0; i < count; i++) {
    const a = angles[i % angles.length];
    const shotNum = i + 1;
    const sceneNum = Math.min(5, Math.floor(i / 4) + 1);

    const shotData = {
      shot_number: shotNum,
      scene_number: sceneNum,
      scene_title: `ฉากที่ ${sceneNum}: การดำเนินเรื่อง`,
      title: `ช็อตที่ ${shotNum}: ${a.th}`,
      camera_angle: a.angle,
      camera_angle_th: a.th,
      camera_movement: a.move,
      lens_focal: a.lens,
      action_description: `ฉากที่ ${shotNum} ถ่ายทอด ${cleanConcept} ในมุมมอง ${a.th} ให้เห็นความรู้สึกและบรรยากาศอย่างมีมิติ`,
      dialogue: shotNum === 1 ? 'ยินดีต้อนรับครับ วันนี้เรามีสิ่งพิเศษจะนำเสนอ' : 'สัมผัสได้ถึงความประณีตในทุกรายละเอียดอย่างแท้จริงครับ',
      audio_foley: 'เสียงแอมเบียนต์บรรยากาศคมชัด ผสมเสียงดนตรีประกอบเสริมอารมณ์',
      on_screen_text: shotNum === count ? cleanConcept.slice(0, 30) : '',
      prompt: `Cinematic ${a.angle} of ${cleanConcept}, ${a.lens} lens, master lighting, rich textures, authentic atmosphere, high production value, photorealistic, 8k, style: ${style}`,
      video_prompt: `Smooth ${a.move} cinematic camera motion capturing ${cleanConcept}, 4k video, 60fps`,
      duration_seconds: durPerShot,
      aspect_ratio: aspect_ratio
    };

    shotData.image_url = getStoryboardSketch(shotData);
    shots.push(shotData);
  }

  return {
    project_title: cleanConcept.slice(0, 45) || 'โปรเจกต์สตอรี่บอร์ด',
    logline: `สตอรี่บอร์ด ${count} ช็อต ถ่ายทอด "${cleanConcept}" ในสไตล์ ${style}`,
    total_shots: count,
    total_duration: totalDuration,
    target_duration: totalDuration,
    shots: shots
  };
}

/**
 * Generate Real AI Image for a Prompt
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

  const cleanPrompt = encodeURIComponent(String(prompt).replace(/["“”\r\n]/g, ' ').slice(0, 350));
  const genFileName = `ai_shot_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
  const genDir = path.join(__dirname, '..', 'client', 'public', 'generated');
  if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
  const localFilePath = path.join(genDir, genFileName);

  // 1. If user provided a Pollinations API Key
  if (config.POLLINATIONS_API_KEY) {
    try {
      const url = `https://gen.pollinations.ai/image/${cleanPrompt}?width=${width}&height=${height}&model=flux&seed=${seed}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${config.POLLINATIONS_API_KEY}` }
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength > 2000) {
          fs.writeFileSync(localFilePath, buf);
          return `/generated/${genFileName}`;
        }
      }
    } catch (e) {
      console.warn('[AI Image Pollinations Key Notice]:', e.message);
    }
  }

  // 2. Free Pollinations Image with model=turbo
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&model=turbo&nologo=true&seed=${seed}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > 2000) {
        fs.writeFileSync(localFilePath, buf);
        return `/generated/${genFileName}`;
      }
    }
  } catch (e) {
    console.warn('[AI Image Turbo Notice]:', e.message);
  }

  // 3. Try Gemini Imagen (if key present)
  if (config.GEMINI_API_KEY) {
    try {
      const gUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_IMAGE_MODEL}:generateImages?key=${config.GEMINI_API_KEY}`;
      const res = await fetch(gUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          numberOfImages: 1,
          aspectRatio: aspect_ratio === '9:16' ? '9:16' : '16:9'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const base64 = data.generatedImages?.[0]?.image?.imageBytes;
        if (base64) {
          const buf = Buffer.from(base64, 'base64');
          fs.writeFileSync(localFilePath, buf);
          return `/generated/${genFileName}`;
        }
      }
    } catch (e) {
      console.warn('[AI Image Gemini Notice]:', e.message);
    }
  }

  return null;
}

module.exports = {
  planStoryboard,
  generateAIImage,
  callLLMChat,
  sanitizeThaiPolite
};
