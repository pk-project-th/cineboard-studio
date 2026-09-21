const express = require('express');
const cors = require('cors');
const db = require('./db');
const config = require('./config');
// Helper to sanitize polite particles (never output ครับ/ค่ะ slash)
function sanitizeThaiPolite(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/ครับ\/ค่ะ/g, 'ครับ')
             .replace(/ค่ะ\/ครับ/g, 'ครับ')
             .replace(/ครับ\s*\/\s*ค่ะ/g, 'ครับ')
             .replace(/ค่ะ\s*\/\s*ครับ/g, 'ครับ');
}

const { getStoryboardSketch } = require('./sketchHelper');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- SERIES ENDPOINTS ---
app.get('/api/series', (req, res) => {
  try {
    const series = db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS shot_count,
        (SELECT p.image_url FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1 ORDER BY p.step_number ASC, p.sort_order ASC LIMIT 1) AS preview_image,
        (SELECT SUM(p.duration_seconds) FROM prompts p WHERE p.series_id = s.id AND p.is_active = 1) AS total_duration
      FROM series s 
      ORDER BY s.created_at DESC
    `).all();
    res.json({ success: true, data: series });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single series with all shots
app.get('/api/series/:id', (req, res) => {
  try {
    const { id } = req.params;
    const s = db.prepare('SELECT * FROM series WHERE id = ?').get(id);
    if (!s) {
      return res.status(404).json({ success: false, error: 'ไม่พบโปรเจกต์สตอรี่บอร์ด' });
    }
    const shots = db.prepare('SELECT * FROM prompts WHERE series_id = ? AND is_active = 1 ORDER BY step_number ASC, sort_order ASC').all(id);
    res.json({
      success: true,
      data: {
        ...s,
        shots: shots.map(p => ({
          ...p,
          variables_schema: p.variables_schema ? JSON.parse(p.variables_schema) : []
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete series and all its prompts (Idempotent & Safe)
app.delete('/api/series/:id', (req, res) => {
  try {
    const { id } = req.params;
    const s = db.prepare('SELECT * FROM series WHERE id = ?').get(id);
    
    // Always delete any remaining prompts for this series_id
    const delPrompts = db.prepare('DELETE FROM prompts WHERE series_id = ?').run(id);
    
    if (s) {
      db.prepare('DELETE FROM series WHERE id = ?').run(id);
      console.log(`[DELETE SERIES] Successfully deleted series ${id} (${s.title}), removed ${delPrompts.changes} prompts`);
    } else {
      console.log(`[DELETE SERIES] Series ${id} was already deleted or not found, cleaned up prompts (${delPrompts.changes})`);
    }

    res.json({
      success: true,
      message: s ? `ลบโปรเจกต์ "${s.title}" เรียบร้อยแล้ว` : 'โปรเจกต์นี้ถูกลบเรียบร้อยแล้ว',
      deletedId: id
    });
  } catch (err) {
    console.error('[DELETE SERIES Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- PROMPTS ENDPOINTS ---
app.get('/api/prompts', (req, res) => {
  try {
    const { series_id, step, search, type } = req.query;
    let query = 'SELECT * FROM prompts WHERE is_active = 1';
    const params = [];

    if (series_id) {
      query += ' AND series_id = ?';
      params.push(series_id);
    }
    if (step) {
      query += ' AND step_number = ?';
      params.push(parseInt(step, 10));
    }
    if (type && type !== 'all') {
      query += ' AND prompt_type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ? OR subtitle LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY step_number ASC, sort_order ASC';
    const prompts = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: prompts.length,
      data: prompts.map(p => ({
        ...p,
        variables_schema: p.variables_schema ? JSON.parse(p.variables_schema) : []
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real AI Generation API with Groq LPU / Gemini enhancement
app.post('/api/generate', async (req, res) => {
  try {
    const {
      prompt,
      title = 'ผลงาน AI สร้างใหม่',
      aspect_ratio = '9:16',
      model = 'Studio High-Res Engine',
      step_number = 3,
      reference_image = null,
      series_id = null
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกคำสั่ง Prompt' });
    }

    let width = 768;
    let height = 1344;
    if (aspect_ratio === '16:9') {
      width = 1344;
      height = 768;
    } else if (aspect_ratio === '1:1') {
      width = 1024;
      height = 1024;
    }

    let enhancedPrompt = prompt;

    // Use Groq LPU API if selected or to enrich the prompt
    if (model.includes('Groq') && config.GROQ_API_KEY) {
      try {
        console.log(`[Groq AI] Enhancing prompt with ${config.GROQ_MODEL}...`);
        const gRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 200,
            messages: [
              {
                role: 'system',
                content: 'You are an elite prompt engineer for 1980s Thai retro cinema. Enhance the prompt with 16mm expired film grain, natural lighting, and deadpan mood. Output ONLY the English prompt string.'
              },
              { role: 'user', content: prompt }
            ]
          })
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          const enriched = gData.choices?.[0]?.message?.content?.trim();
          if (enriched) enhancedPrompt = enriched;
          console.log('[Groq AI] Prompt enhanced successfully');
        }
      } catch (err) {
        console.warn('[Groq AI Enhancement Warning]:', err.message);
      }
    } else if (model.includes('Gemini') && config.GEMINI_API_KEY) {
      try {
        console.log(`[Gemini API] Enhancing prompt with ${config.GEMINI_MODEL}...`);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
        const gRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Enhance this 1980s retro film prompt for image generation: "${prompt}". Return only the final English prompt.` }] }]
          })
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          const enriched = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (enriched) enhancedPrompt = enriched;
        } else {
          console.warn('[Gemini Notice]: Prepayment credit status logged, auto-rendering with high-fidelity studio engine.');
        }
      } catch (err) {
        console.warn('[Gemini Enhancement Warning]:', err.message);
      }
    }

    const fs = require('fs');
    const path = require('path');

    // Generate matching Thai comedy dialogue script using Groq or creative rule
    let generatedDialogue = `1. ชายในภาพ: "วิชาลับขั้นสุดยอดของข้า... จะเปิดเผย ณ บัดนี้!"\n2. เพื่อนบ้าน: "หยุดก่อนพี่! ผงชูรสหมด ไปซื้อที่ร้านค้าก่อน"\n3. ชายในภาพ: (ลดมือลง สายตาเดดแพน) "งั้นข้าขอเก็บลมปราณไว้ก่อน..."`;
    if (config.GROQ_API_KEY) {
      try {
        const dRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.GROQ_MODEL,
            temperature: 0.75,
            max_tokens: 150,
            messages: [
              {
                role: 'system',
                content: 'คุณเป็นผู้กำกับบทละครตลกสั้นไทยยุค 2530 เขียนบทสนทนา 3 บรรทัด สไตล์เดดแพน (ตัวละครจริงจัง × เรื่องปากท้องคนไทย) จบใน 15 วินาที ไม่ต้องเกริ่น ให้ขึ้นต้นด้วย 1. 2. 3. ทันที'
              },
              { role: 'user', content: `บทสำหรับฉาก: "${prompt}"` }
            ]
          })
        });
        if (dRes.ok) {
          const dData = await dRes.json();
          const scr = dData.choices?.[0]?.message?.content?.trim();
          if (scr) generatedDialogue = scr;
        }
      } catch (err) {
        console.warn('[Dialogue Script Gen Notice]: Using built-in retro dialogue.');
      }
    }

    // Save image locally to prevent slow timeouts and broken images
    const genFileName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const genDir = path.join(__dirname, '..', 'client', 'public', 'generated');
    if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
    const localFilePath = path.join(genDir, genFileName);

    let imageSaved = false;

    // 1. Primary Engine: Try Gemini 3.1 Flash-Lite Image (Google AI)
    if (config.GEMINI_API_KEY) {
      try {
        const geminiImgModel = config.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-lite-image';
        console.log(`[Gemini Image Engine] Requesting ${geminiImgModel}...`);
        const gImgUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiImgModel}:generateContent?key=${config.GEMINI_API_KEY}`;
        const gImgRes = await fetch(gImgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `Cinematic storyboard illustration: ${enhancedPrompt || prompt}` }]
            }]
          })
        });

        if (gImgRes.ok) {
          const gImgData = await gImgRes.json();
          const parts = gImgData.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const buf = Buffer.from(part.inlineData.data, 'base64');
              fs.writeFileSync(localFilePath, buf);
              imageSaved = true;
              console.log(`[Gemini Image Engine] Successfully generated image via ${geminiImgModel} (${buf.byteLength} bytes)`);
              break;
            }
          }
        } else {
          console.warn(`[Gemini Image Notice] ${geminiImgModel} status ${gImgRes.status}. Free-tier rate limit or offline; using resilient fallback.`);
        }
      } catch (err) {
        console.warn('[Gemini Image Exception]:', err.message);
      }
    }

    // 2. Secondary Engine: Pollinations AI with 12s timeout
    if (!imageSaved) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const cleanPrompt = encodeURIComponent(enhancedPrompt.replace(/[^\w\s,.-]/gi, '').slice(0, 220));
        const fetchUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width > 1000 ? 1024 : 512}&height=${height > 1000 ? 1024 : 768}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

        const imgRes = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          if (buffer.byteLength > 2000) {
            fs.writeFileSync(localFilePath, Buffer.from(buffer));
            imageSaved = true;
            console.log(`[Image Engine] Fresh image saved to ${localFilePath} (${buffer.byteLength} bytes)`);
          }
        }
      } catch (e) {
        console.warn(`[Image Engine Notice] Network fetch timed out or offline (${e.message}).`);
      }
    }

    // Dynamic sketch generation fallback if network generation is slow or offline
    let imageUrl = imageSaved ? `/generated/${genFileName}` : '';
    if (!imageUrl) {
      imageUrl = getStoryboardSketch({
        prompt: prompt || enhancedPrompt,
        title: title,
        action_description: prompt,
        camera_angle: 'Medium Shot'
      });
    }

    const id = 'pk-gen-' + Date.now();
    const countQuery = db.prepare('SELECT COUNT(*) as c FROM prompts').get();
    const sort_order = (countQuery.c || 0) + 1;

    const stepTitles = {
      1: 'STEP 1 — บล็อกคงที่ (Global)',
      2: 'STEP 2 — Character Sheet',
      3: 'STEP 3 — First Frame',
      4: 'STEP 4 — Video Prompt'
    };

    let targetSeriesId = series_id;
    if (!targetSeriesId || targetSeriesId === 'all') {
      const latestSeries = db.prepare('SELECT id FROM series ORDER BY created_at DESC LIMIT 1').get();
      targetSeriesId = latestSeries ? latestSeries.id : null;
    }

    db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle, prompt_type,
        recommended_tool, aspect_ratio, content, dialogue_script, variables_schema, image_url, sort_order, reference_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      targetSeriesId,
      step_number,
      stepTitles[step_number] || 'AI Generated',
      title,
      `สร้างด้วย ${model} • สัดส่วน ${aspect_ratio}`,
      step_number === 4 ? 'video' : step_number === 2 ? 'character' : 'first_frame',
      model,
      aspect_ratio,
      enhancedPrompt,
      generatedDialogue,
      JSON.stringify([]),
      imageUrl,
      sort_order,
      reference_image
    );

    const newPrompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: `สร้างภาพและบทด้วย ${model} สำเร็จแล้ว!`,
      data: {
        ...newPrompt,
        variables_schema: []
      }
    });
  } catch (err) {
    console.error('[Generate Endpoint Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ELEVENLABS TTS API ENDPOINT ---

// --- NATIVE THAI HIGH-FIDELITY TTS (100% Native, No Foreign Accent) ---
app.post('/api/tts/native-thai', async (req, res) => {
  try {
    let { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกข้อความที่จะพากย์เสียง' });
    }

    // Sanitize any ครับ/ค่ะ
    text = sanitizeThaiPolite(text);

    const cleanText = encodeURIComponent(text.slice(0, 200));
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${cleanText}`;

    const ttsRes = await fetch(googleTTSUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (!ttsRes.ok) {
      throw new Error(`TTS upstream error HTTP ${ttsRes.status}`);
    }

    const audioBuf = await ttsRes.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuf.byteLength
    });
    res.send(Buffer.from(audioBuf));
  } catch (err) {
    console.error('[Native Thai TTS Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tts/elevenlabs', async (req, res) => {
  try {
    const { text, voice_id = config.ELEVENLABS_DEFAULT_VOICE } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกข้อความที่จะพากย์เสียง' });
    }

    console.log(`[ElevenLabs] Requesting TTS for: "${text.slice(0, 30)}..." with voice ${voice_id}`);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[ElevenLabs Error]:', errText);
      return res.status(response.status).json({
        success: false,
        error: 'ElevenLabs API Error: ' + errText
      });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength
    });
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('[ElevenLabs Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- HIGH-RESOLUTION IMAGE UPLOAD (Supports up to 100MB) ---
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename = 'upload.jpg' } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'กรุณาเลือกไฟล์ภาพ' });
    }

    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, '..', 'client', 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let buffer;
    let ext = 'jpg';
    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const safeClean = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeName = `ref_${Date.now()}_${safeClean.endsWith('.' + ext) ? safeClean : safeClean + '.' + ext}`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${safeName}`;
    const sizeMb = (buffer.byteLength / (1024 * 1024)).toFixed(2);
    console.log(`[Upload Engine] Successfully saved high-res image: ${safeName} (${sizeMb} MB)`);

    res.json({
      success: true,
      message: `อัปโหลดภาพขนาด ${sizeMb} MB สำเร็จเรียบร้อย!`,
      data: {
        url: relativeUrl,
        filename: safeName,
        size_bytes: buffer.byteLength,
        size_mb: sizeMb
      }
    });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MULTIMODAL GEMINI 3.8 VISION ANALYSIS ---
app.post('/api/ai/vision-analyze', async (req, res) => {
  try {
    const { image_url, base64_data } = req.body;
    let base64 = base64_data;
    let mimeType = 'image/jpeg';

    const fs = require('fs');
    const path = require('path');

    if (!base64 && image_url) {
      const localPath = path.join(__dirname, '..', 'client', 'public', image_url.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        base64 = fs.readFileSync(localPath).toString('base64');
        if (localPath.endsWith('.png')) mimeType = 'image/png';
        else if (localPath.endsWith('.webp')) mimeType = 'image/webp';
      }
    }

    if (!base64) {
      return res.status(400).json({ success: false, error: 'ไม่พบข้อมูลภาพสำหรับวิเคราะห์' });
    }

    // Strip prefix if present in base64 string
    const match = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64 = match[2];
    }

    console.log(`[Gemini 3.8 Vision] Analyzing image (${(base64.length / 1024).toFixed(1)} KB base64)...`);
    let targetModel = config.GEMINI_MODEL || 'gemini-3.8-flash';
    let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${config.GEMINI_API_KEY}`;

    const promptVision = `คุณเป็นโปรดิวเซอร์ภาพยนตร์ตลกสั้นไทยยุค 2530
กรุณาวิเคราะห์ภาพนี้และสร้างชุดข้อมูลเพื่อนำไปสร้างคลิปต่อ ตอบกลับเป็น JSON เท่านั้น:
{
  "title": "ชื่อตอนตลกๆ สั้นๆ สไตล์หนังไทย 2530 จากภาพนี้",
  "joke_concept": "สรุปสูตรมุกใน 1 ประโยค (ตัวละครในภาพ × ปากท้องคนไทย)",
  "first_frame_prompt": "Prompt ภาษาอังกฤษเต็มรูปแบบ สำหรับเจนภาพ 9:16 สไตล์ 1980s Thai 16mm film โดยอ้างอิงจากตัวละครและท่าทางในภาพนี้",
  "dialogue_script": "บทสนทนาภาษาไทย 3-4 บรรทัด จบใน 20 วินาที พร้อมระบุชื่อตัวละคร",
  "character_suggest": "คำแนะนำคอสตูมทุนต่ำงบ 200 บาท อ้างอิงจากภาพ"
}`;

    let gRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptVision },
            { inline_data: { mime_type: mimeType, data: base64 } }
          ]
        }]
      })
    });

    // If 3.8 experiences temporary 503 high demand spike, retry or fallback gracefully
    if (!gRes.ok && gRes.status === 503) {
      console.warn('[Gemini 3.8 High Demand]: Retrying with secondary resilient endpoint...');
      targetModel = 'gemini-3.6-flash';
      geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${config.GEMINI_API_KEY}`;
      gRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptVision },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }]
        })
      });
    }

    if (!gRes.ok) {
      const errText = await gRes.text();
      console.warn('[Gemini Vision Failed]:', errText);
      return res.status(500).json({ success: false, error: 'Gemini Vision Error: ' + errText });
    }

    const gData = await gRes.json();
    const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
    const clean = rawText ? rawText.replace(/```json/g, '').replace(/```/g, '').trim() : '{}';
    const parsed = JSON.parse(clean);

    res.json({
      success: true,
      data: parsed,
      meta: {
        model: targetModel,
        provider: `Google Gemini ${targetModel.includes('3.8') ? '3.8' : '3.6'} Flash (Vision Multimodal)`
      }
    });
  } catch (err) {
    console.error('[Vision Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- UNIFIED LLM CASCADE: [1: Groq Cloud] ➔ [2: OpenAI] ➔ [3: Gemini] ---
async function generateWithCascade(topic) {
  const promptSystem = `คุณเป็นโปรดิวเซอร์และนักเขียนบทคลิปสั้นไวรัลของ PKShortClips Studio
เอกลักษณ์ของซีรีส์:
1. แก่นเรื่อง: คาแรคเตอร์การ์ตูน/อนิเมะมหากาพย์ ทุนต่ำงบ 200 บาท อยู่ในฉากชนบทไทย (บ่อปลา, ลานวัด, ตลาดสด)
2. สูตรมุก: ตัวละครจริงจังสุดขีด (Deadpan) ปะทะกับเรื่องปากท้องและความเป็นจริงของชีวิตคนไทย (ค่าน้ำค่าไฟ, หวย, ปุ๋ยแพง, ค่ากับข้าว)
3. สไตล์ภาพ: 1980s Thai retro comedy film still, expired 16mm color stock, heavy film grain, soft lens, vertical 9:16
4. ตอบกลับเป็น JSON format เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "title": "ชื่อตอนตลกๆ สั้นๆ ไม่เกิน 15 คำ",
  "joke_concept": "สรุปสูตรมุกใน 1 ประโยค (การ์ตูนมหากาพย์ × ปากท้องคนไทย)",
  "first_frame_prompt": "Prompt ภาษาอังกฤษเต็มรูปแบบ สำหรับเจนภาพ First Frame 9:16 สไตล์ 1980s Thai 16mm film",
  "dialogue_script": "บทสนทนาภาษาไทย 3-4 บรรทัด จบใน 20 วินาที พร้อมระบุชื่อตัวละคร",
  "character_suggest": "คำแนะนำคอสตูมทุนต่ำงบ 200 บาท",
  "audio_note": "คำแนะนำสไตล์เสียงพากย์สดในห้องอัดแบบแห้งๆ โมโนแคบ"
}`;

  // --- [อันดับ 1: Groq Cloud (Ultra-Fast LPU Inference)] ---
  if (config.GROQ_API_KEY) {
    try {
      console.log(`[Cascade 1/3] Trying Groq Cloud (${config.GROQ_MODEL})...`);
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.GROQ_MODEL,
          response_format: { type: 'json_object' },
          temperature: 0.75,
          messages: [
            { role: 'system', content: promptSystem },
            { role: 'user', content: `ขอไอเดียตอนใหม่เกี่ยวกับ: "${topic}"` }
          ]
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const parsed = JSON.parse(groqData.choices[0].message.content);
        return {
          success: true,
          data: parsed,
          meta: {
            rank: 1,
            provider: 'Groq Cloud (อันดับ 1 • LPU Ultra-Fast)',
            model: config.GROQ_MODEL,
            latency_ms: groqData.usage?.total_time ? Math.round(groqData.usage.total_time * 1000) : 320
          }
        };
      } else {
        console.warn('[Groq Cloud 1/3 Failed]:', await groqRes.text());
      }
    } catch (e) {
      console.warn('[Groq Cloud 1/3 Exception]:', e.message);
    }
  }

  // --- [อันดับ 2: OpenAI (High Precision & Reasoning)] ---
  if (config.OPENAI_API_KEY) {
    try {
      console.log(`[Cascade 2/3] Trying OpenAI (${config.OPENAI_MODEL})...`);
      const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.OPENAI_MODEL,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: promptSystem },
            { role: 'user', content: `ขอไอเดียตอนใหม่เกี่ยวกับ: "${topic}"` }
          ]
        })
      });

      if (oaiRes.ok) {
        const oaiData = await oaiRes.json();
        const parsed = JSON.parse(oaiData.choices[0].message.content);
        return {
          success: true,
          data: parsed,
          meta: {
            rank: 2,
            provider: 'OpenAI (อันดับ 2 • GPT-4o)',
            model: config.OPENAI_MODEL,
            latency_ms: 1200
          }
        };
      } else {
        console.warn('[OpenAI 2/3 Failed]:', await oaiRes.text());
      }
    } catch (e) {
      console.warn('[OpenAI 2/3 Exception]:', e.message);
    }
  }

  // --- [อันดับ 3: Gemini (Multimodal & Massive Context)] ---
  if (config.GEMINI_API_KEY) {
    try {
      console.log(`[Cascade 3/3] Trying Gemini (${config.GEMINI_MODEL})...`);
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
      const gRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptSystem + `\n\nหัวข้อ: "${topic}"` }] }]
        })
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          return {
            success: true,
            data: parsed,
            meta: {
              rank: 3,
              provider: 'Gemini (อันดับ 3 • Google AI)',
              model: config.GEMINI_MODEL,
              latency_ms: 1500
            }
          };
        }
      } else {
        console.warn('[Gemini 3/3 Failed]:', await gRes.text());
      }
    } catch (e) {
      console.warn('[Gemini 3/3 Exception]:', e.message);
    }
  }

  // --- Creative Built-in Fallback ---
  return {
    success: true,
    data: {
      title: `วิกฤตภารกิจมหากาพย์: ${topic}`,
      joke_concept: `การแปลงร่างระดับจักรวาล แต่ต้องหยุดเพราะเงินในกระเป๋าหมด`,
      first_frame_prompt: `A deadpan anime-style character in a cheap DIY costume beside a rustic muddy Thai fish pond, sunny day, 1980s Thai retro comedy film still, expired 16mm color film, heavy grain, vertical 9:16 composition`,
      dialogue_script: `1. ศักดิ์: "วิชาลับขั้นสุดยอดของข้า... จะเปิดเผย ณ บัดนี้!"\n2. จอย: "หยุดก่อนพี่ ค่าไฟงวดนี้มาแล้ว เจ็ดร้อยสี่สิบบาท"\n3. ศักดิ์: (ลดมือลง หน้านิ่ง) "งั้นข้าขอเก็บพลังไว้ก่อน... ไปดับพัดลมเดี๋ยวนี้"`,
      character_suggest: `เสื้อกั๊กวินมอเตอร์ไซค์ ดัดแปลงเป็นชุดเกราะด้วยเทปโฟม, ถือไม้กวาดทางมะพร้าวแทนกระบี่ งบ 150 บาท`,
      audio_note: `เสียงพากย์แห้งสนิท สไตล์ห้องอัดเก่า ไม่มีรีเวิร์บ เสียงซ่า Optical Track Hiss ชัดเจน`
    },
    meta: {
      rank: 4,
      provider: 'PKShortClips Engine (Built-in Fallback)',
      model: 'fallback-v1',
      latency_ms: 20
    }
  };
}

// Unified Script Generation Endpoint (Cascade 1 ➔ 2 ➔ 3)
app.post('/api/ai/script', async (req, res) => {
  try {
    const { topic = 'นินจาขอหวยริมบ่อปลาหลังบ้าน' } = req.body;
    const result = await generateWithCascade(topic);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Alias endpoints for backwards compatibility
app.post('/api/groq/generate', async (req, res) => {
  try {
    const { topic = 'นินจาขอหวยริมบ่อปลาหลังบ้าน' } = req.body;
    const result = await generateWithCascade(topic);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { topic = 'ภารกิจลับจับปลาบ่อหลังบ้าน' } = req.body;
    const result = await generateWithCascade(topic);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Increment copy counter
app.post('/api/prompts/:id/copy', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE prompts SET copy_count = copy_count + 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT id, copy_count FROM prompts WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update an individual shot (Keep Master Prompt and SQLite strictly synchronized)
app.put('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ไม่พบช็อตนี้ในระบบ' });
    }

    const {
      title,
      content,
      dialogue_script,
      camera_angle,
      camera_movement,
      lens_focal,
      action_description,
      video_prompt,
      audio_foley,
      on_screen_text,
      live_action_guide,
      duration_seconds,
      image_url
    } = req.body;

    const updatedTitle = title !== undefined ? title : existing.title;
    const updatedContent = content !== undefined ? content : existing.content;
    const updatedDialogue = dialogue_script !== undefined ? sanitizeThaiPolite(dialogue_script) : existing.dialogue_script;
    const updatedCameraAngle = camera_angle !== undefined ? camera_angle : existing.camera_angle;
    const updatedCameraMovement = camera_movement !== undefined ? camera_movement : existing.camera_movement;
    const updatedShotSize = lens_focal !== undefined ? lens_focal : existing.shot_size;
    const updatedAction = action_description !== undefined ? action_description : existing.action_description;
    const updatedVideoPrompt = video_prompt !== undefined ? video_prompt : existing.video_prompt;
    const updatedAudioFoley = audio_foley !== undefined ? audio_foley : existing.audio_foley;
    const updatedOnScreenText = on_screen_text !== undefined ? on_screen_text : existing.on_screen_text;
    const updatedLiveAction = live_action_guide !== undefined ? live_action_guide : existing.live_action_guide;
    const updatedDuration = duration_seconds !== undefined ? duration_seconds : existing.duration_seconds;
    const updatedImageUrl = image_url !== undefined ? image_url : existing.image_url;

    db.prepare(`
      UPDATE prompts SET
        title = ?,
        content = ?,
        dialogue_script = ?,
        camera_angle = ?,
        camera_movement = ?,
        shot_size = ?,
        action_description = ?,
        video_prompt = ?,
        audio_foley = ?,
        on_screen_text = ?,
        live_action_guide = ?,
        duration_seconds = ?,
        image_url = ?
      WHERE id = ?
    `).run(
      updatedTitle,
      updatedContent,
      updatedDialogue,
      updatedCameraAngle,
      updatedCameraMovement,
      updatedShotSize,
      updatedAction,
      updatedVideoPrompt,
      updatedAudioFoley,
      updatedOnScreenText,
      updatedLiveAction,
      updatedDuration,
      updatedImageUrl,
      id
    );

    const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    console.log(`[PROMPT UPDATED] Shot #${updated.step_number} (${id}) updated. Master prompt sync active.`);
    res.json({
      success: true,
      message: 'อัปเดตข้อมูลช็อตเรียบร้อย ข้อมูลเชื่อมโยงกับ Master Prompt ทันที',
      data: updated
    });
  } catch (err) {
    console.error('[PUT Prompt Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Context-Aware Shot Refiner (Refines a single shot without breaking series continuity)
app.post('/api/prompts/:id/refine', async (req, res) => {
  try {
    const { id } = req.params;
    const { instruction = '' } = req.body;

    const targetPrompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    if (!targetPrompt) {
      return res.status(404).json({ success: false, error: 'ไม่พบช็อตนี้ในระบบ' });
    }

    const series = targetPrompt.series_id 
      ? db.prepare('SELECT * FROM series WHERE id = ?').get(targetPrompt.series_id)
      : null;

    const allShots = targetPrompt.series_id
      ? db.prepare('SELECT step_number, title, camera_angle, content, dialogue_script FROM prompts WHERE series_id = ? ORDER BY step_number ASC').all(targetPrompt.series_id)
      : [];

    const currentIndex = allShots.findIndex(s => s.step_number === targetPrompt.step_number);
    const prevShot = currentIndex > 0 ? allShots[currentIndex - 1] : null;
    const nextShot = currentIndex !== -1 && currentIndex < allShots.length - 1 ? allShots[currentIndex + 1] : null;

    const promptText = `
You are an expert film director and AI prompt doctor.
The user is directing a cohesive video project and needs to tweak/fix a specific shot that failed or needs adjustment.

PROJECT TITLE: "${series ? series.title : 'โปรเจกต์สตอรี่บอร์ด'}"
PROJECT LOGLINE/CONCEPT: "${series ? series.description || '' : ''}"
TOTAL SHOTS IN PROJECT: ${allShots.length}

CURRENT SHOT (To Refine):
- Shot #${targetPrompt.step_number}: "${targetPrompt.title}"
- Camera Angle: ${targetPrompt.camera_angle || 'Medium Shot'}
- Current Image Prompt: ${targetPrompt.content || ''}
- Current Video Prompt: ${targetPrompt.video_prompt || ''}
- Current Dialogue (VO): "${targetPrompt.dialogue_script || ''}"

NEIGHBORING STORY CONTEXT:
${prevShot ? `- Previous Shot #${prevShot.step_number}: "${prevShot.title}" (VO: "${prevShot.dialogue_script}")` : '- This is the opening shot.'}
${nextShot ? `- Next Shot #${nextShot.step_number}: "${nextShot.title}" (VO: "${nextShot.dialogue_script}")` : '- This is the ending shot.'}

USER ADJUSTMENT REQUEST:
"${instruction || 'ปรับแต่งให้ภาพสร้างได้ง่ายขึ้น สื่อสารชัดเจนและคุมโทนให้เข้ากับเรื่องเดิม 100%'}"

STRICT CONTINUITY & QUALITY RULES:
1. Maintain 100% story, character, wardrobe, and environmental consistency with the rest of the project.
2. If the story is about a temple / visiting a temple, NEVER include unrelated items like cars, sports cars, or futuristic tech.
3. Keep the dialogue flowing naturally between the previous shot and the next shot.
4. STRICT POLITE PARTICLE RULE: NEVER use "ครับ/ค่ะ" or "ค่ะ". In Thai dialogue, strictly use "ครับ" for polite ending.
5. Provide detailed, photorealistic prompt descriptions for AI image generation (Midjourney / Flux) and video motion (Kling / Runway).

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown wrapping, no explanation):
{
  "title": "ชื่อช็อตภาษาไทยที่ปรับแก้",
  "content": "English Master Image Keyframe Prompt with photorealistic 4K cinematic keywords",
  "video_prompt": "English Video AI Motion Prompt (Kling / Runway Gen-3 camera movement & action)",
  "dialogue_script": "บทพูดภาษาไทยที่สอดคล้องกับเรื่อง โดยลงท้ายด้วยคำว่าครับอย่างสุภาพ",
  "camera_angle": "${targetPrompt.camera_angle || 'Medium Shot'}",
  "camera_movement": "คำอธิบายการเคลื่อนกล้องภาษาไทย",
  "action_description": "คำอธิบายแอ็กชันของตัวละครในฉากภาษาไทย",
  "live_action_guide": "คำแนะนำการจัดแสงและถ่ายทำจริงหน้าเซ็ตภาษาไทย"
}
`;

    let refinedData = null;

    // 1. Try Groq LPU
    if (config.GROQ_API_KEY) {
      try {
        console.log(`[AI Shot Refiner] Requesting Groq ${config.GROQ_MODEL}...`);
        const gRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.GROQ_MODEL,
            temperature: 0.5,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are an elite cinematic script doctor and prompt engineer. Output valid JSON only.'
              },
              { role: 'user', content: promptText }
            ]
          })
        });

        if (gRes.ok) {
          const gData = await gRes.json();
          const raw = gData.choices?.[0]?.message?.content?.trim();
          refinedData = JSON.parse(raw);
          console.log('[AI Shot Refiner] Groq refinement successful');
        }
      } catch (err) {
        console.warn('[AI Shot Refiner Groq Warning]:', err.message);
      }
    }

    // 2. Fallback to Gemini
    if (!refinedData && config.GEMINI_API_KEY) {
      try {
        console.log(`[AI Shot Refiner] Fallback to Gemini ${config.GEMINI_MODEL}...`);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
        const gmRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (gmRes.ok) {
          const gmData = await gmRes.json();
          const text = gmData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) refinedData = JSON.parse(text);
          console.log('[AI Shot Refiner] Gemini refinement successful');
        }
      } catch (err) {
        console.warn('[AI Shot Refiner Gemini Warning]:', err.message);
      }
    }

    if (!refinedData) {
      return res.status(500).json({ success: false, error: 'ไม่สามารถเกลา Prompt ช็อตนี้ได้ กรุณาลองใหม่อีกครั้ง' });
    }

    // Sanitize dialogue to guarantee "ครับ"
    if (refinedData.dialogue_script) {
      refinedData.dialogue_script = sanitizeThaiPolite(refinedData.dialogue_script);
    }

    res.json({
      success: true,
      message: 'เกลา Prompt ช็อตนี้สำเร็จโดยคุมโทนและเนื้อเรื่องเดิม 100%',
      data: refinedData
    });
  } catch (err) {
    console.error('[Refine Endpoint Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete prompt (Idempotent & Safe)
app.delete('/api/prompts/:id', (req, res) => {
  try {
    const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);

    db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);

    // Clean up generated file if any
    if (prompt && prompt.image_url && prompt.image_url.startsWith('/generated/')) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', 'client', 'public', prompt.image_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    console.log(`[DELETE] Successfully removed prompt ${req.params.id}`);
    res.json({ success: true, message: 'ลบ Prompt สำเร็จแล้ว', deletedId: req.params.id });
  } catch (err) {
    console.error('[DELETE Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset / Seed trigger
app.post('/api/admin/reseed', (req, res) => {
  try {
    delete require.cache[require.resolve('./seed')];
    require('./seed');
    res.json({ success: true, message: 'รีเซ็ตข้อมูลเริ่มต้นของ PKShortClips Studio สำเร็จแล้ว!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear all data (Blank Slate)
app.post('/api/admin/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM prompts').run();
    db.prepare('DELETE FROM series').run();
    db.prepare('DELETE FROM leads').run();
    db.prepare('DELETE FROM analytics_events').run();
    res.json({ success: true, message: 'ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว พร้อมเริ่มใช้งานใหม่!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// --- ASSET MANAGEMENT ENDPOINTS ---
// ==========================================

// Get all assets (Characters, Scenes, Products)
app.get('/api/assets', (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM assets';
    const params = [];
    if (type && type !== 'all') {
      query += ' WHERE type = ?';
      params.push(type);
    }
    query += ' ORDER BY created_at DESC';
    const assets = db.prepare(query).all(...params);
    res.json({ success: true, count: assets.length, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new asset
app.post('/api/assets', (req, res) => {
  try {
    const { name, type, description, prompt, image_url } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อและประเภทของ Asset' });
    }

    const id = 'asset-' + Date.now();
    db.prepare(`
      INSERT INTO assets (id, name, type, description, prompt, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, type, description || '', prompt || '', image_url || '/media/tpl_aircon_hero.jpg');

    const created = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete asset
app.delete('/api/assets/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'ลบ Asset สำเร็จแล้ว', id: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Prompt Generator for Asset (when user has no real photo)
app.post('/api/assets/generate-prompt', async (req, res) => {
  try {
    const { type, name, description, style = '1980s retro Thai film' } = req.body;
    const promptReq = `คุณคือผู้เชี่ยวชาญการเขียน Prompt สร้างภาพ AI สำหรับงานสร้าง Storyboard ภาพยนตร์และโฆษณา
กรุณาเขียน Master Image Prompt ภาษาอังกฤษที่มีคุณภาพระดับ Production สำหรับสร้าง Reference Asset:
- ประเภท Asset: ${type} (เช่น ตัวละคร, ฉาก, หรือสินค้า)
- ชื่อ Asset: "${name}"
- คำบรรยายลักษณะ: "${description}"
- สไตล์ภาพ: "${style}"

ตอบกลับเฉพาะ JSON รูปแบบนี้เท่านั้น:
{
  "suggested_prompt": "English detailed photographic prompt focusing on high consistency, sharp details, accurate lighting, 35mm film or commercial photography style...",
  "thai_summary": "สรุปจุดเด่นของภาพในภาษาไทยสั้นๆ 1 บรรทัด"
}`;

    // Use Groq or Gemini cascade
    let result = null;
    if (config.GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.GROQ_MODEL,
            messages: [{ role: 'user', content: promptReq }],
            response_format: { type: 'json_object' }
          })
        });
        if (groqRes.ok) {
          const gData = await groqRes.json();
          result = JSON.parse(gData.choices[0].message.content);
        }
      } catch (e) {
        console.warn('[Asset Prompt Groq Error]:', e.message);
      }
    }

    if (!result && config.GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
        const gemRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptReq }] }] })
        });
        if (gemRes.ok) {
          const gemData = await gemRes.json();
          const clean = gemData.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, '').trim();
          result = JSON.parse(clean);
        }
      } catch (e) {
        console.warn('[Asset Prompt Gemini Error]:', e.message);
      }
    }

    if (!result) {
      result = {
        suggested_prompt: `Authentic ${style} style visual representation of ${name}, ${description}, detailed cinematic photography, professional studio lighting, 35mm celluloid film aesthetic.`,
        thai_summary: `ภาพต้นแบบ ${name} สไตล์ ${style}`
      };
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// --- AI STORYBOARD DIRECTOR ENDPOINTS ---
// ==========================================

// Helper: Dynamic Cinematic Sequence Generator supporting 1 to 50 Shots organized across Scenes
function generateCinematicSequence(story_concept, totalShots, charAsset, sceneAsset, prodAsset, isSketch, chosenStyle, targetDuration = 30, pacing = 'fast') {
  const count = Math.max(1, Math.min(50, parseInt(totalShots, 10) || 4));
  const targetSec = Math.max(5, parseFloat(targetDuration) || 30);
  const sketchPrefix = isSketch ? 'Professional black and white pencil sketch storyboard, charcoal drawing, clean concept art frame, white paper background, dynamic sketch lines, ' : '';

  // Calculate realistic cinematic Scene distribution (Acts)
  let numScenes = 1;
  if (count > 35) numScenes = 5;
  else if (count > 20) numScenes = 4;
  else if (count > 8) numScenes = 3;
  else if (count > 4) numScenes = 2;

  const sceneThemes = [
    { num: 1, title: 'ฉากที่ 1: ปูบรรยากาศและเปิดตัวสถานที่ (Act I: Establishing & World Building)', arc: 'ปูเรื่อง แนะนำสถานที่ สภาพแวดล้อม และบรรยากาศโดยรวม' },
    { num: 2, title: 'ฉากที่ 2: แนะนำตัวละครและจุดเริ่มต้นปัญหา (Act II: Protagonist & The Catalyst)', arc: 'เปิดตัวละครหลัก แสดงเป้าหมาย และปัญหาหรืออุปสรรคที่ต้องเผชิญ' },
    { num: 3, title: 'ฉากที่ 3: เผชิญหน้าความท้าทายและการเดินทาง (Act III: Rising Conflict & Journey)', arc: 'ตัวละครพยายามแก้ไขปัญหา ลองผิดลองถูก ความตึงเครียดเพิ่มขึ้น' },
    { num: 4, title: 'ฉากที่ 4: จุดไคลแม็กซ์และการแก้ปัญหาครั้งใหญ่ (Act IV: Climax & Hero Solution)', arc: 'จังหวะแอ็กชันสำคัญ การใช้สินค้าหรือการตัดสินใจเด็ดขาดที่พลิกสถานการณ์' },
    { num: 5, title: 'ฉากที่ 5: ผลลัพธ์แห่งชัยชนะและบทสรุป (Act V: Resolution & Call-to-Action)', arc: 'บรรยากาศคลี่คลาย ความสุข ความสำเร็จ รอยยิ้ม และช่องทางติดต่อ/ชวนติดตาม' }
  ];

  // 17 diverse film grammar camera angle templates - alternating between wide, close, tracking, POV
  const angleLibrary = [
    {
      angle: 'Wide Establishing Shot',
      angle_th: 'มุมกว้างมาตรฐาน แสดงตำแหน่งตัวละครท่ามกลางบรรยากาศแวดล้อม',
      movement: 'กล้องสไลด์ขวาช้าๆ (Slow Truck Right) ตามจังหวะคนและสิ่งแวดล้อมเคลื่อนไหว',
      lens: '24mm'
    },
    {
      angle: 'Close-Up Reaction',
      angle_th: 'ช็อตเจาะสีหน้าและแววตา สื่อความรู้สึกในใจอย่างลึกซึ้ง',
      movement: 'กล้องซูมเข้าเนิบๆ (Slow Optical Push-In) สู่สายตาของตัวละคร',
      lens: '85mm'
    },
    {
      angle: 'Low Ground Tracking',
      angle_th: 'กล้องเลียดพื้นวิ่งตามความเร็ว สร้างความกระฉับกระเฉงตื่นเต้น',
      movement: 'กล้องติดกิมบอลเลียดพื้นไล่ตามฝีเท้าหรือล้อ (High-Speed Ground Tracker)',
      lens: '24mm'
    },
    {
      angle: 'Over-The-Shoulder (OTS)',
      angle_th: 'มุมมองข้ามหัวไหล่ สร้างมิติความเชื่อมโยงในการสนทนาหรือการมองวัตถุ',
      movement: 'กล้องนิ่งบนขาตั้ง (Static OTS) เน้นน้ำหนักการสื่อสารระหว่างสองฝ่าย',
      lens: '50mm'
    },
    {
      angle: 'Dutch Angle / Canted',
      angle_th: 'กล้องเอียงสร้างความไม่มั่นคง ความตื่นเต้น หรือจุดหักเหของเรื่อง',
      movement: 'กล้องเอียงมุม 15 องศาแล้วเลื่อนสไลด์เร็ว (Dynamic Roll & Truck)',
      lens: '28mm'
    },
    {
      angle: 'POV First-Person',
      angle_th: 'มุมมองจากสายตาของตัวละคร ให้ผู้ชมเสมือนอยู่ในเหตุการณ์จริง',
      movement: 'กล้องเคลื่อนไหวแบบถือมือเป็นธรรมชาติ (Natural Handheld Walking POV)',
      lens: '24mm'
    },
    {
      angle: 'Extreme Close-Up / Macro',
      angle_th: 'มุมมาโครเจาะรายละเอียดเฉพาะจุด พื้นผิว สัมผัส หรือตราสินค้า',
      movement: 'โฟกัสเลื่อนเปลี่ยนระนาบอย่างประณีต (Slow Rack Focus) จากหน้าไปหลัง',
      lens: '100mm Macro'
    },
    {
      angle: 'Medium Shot',
      angle_th: 'มุมระดับเอว โฟกัสบทสนทนาและกิริยาท่าทางที่สื่อความหมายชัดเจน',
      movement: 'กล้องเคลื่อนขนานตามตัวละคร (Tracking Shot) รักษาระยะโฟกัสคงที่',
      lens: '50mm'
    },
    {
      angle: 'High Angle Shot',
      angle_th: 'มุมกดสูงมองลงมา ให้ความรู้สึกลุ้นระทึก ท้าทาย หรือมองเห็นภาพรวมการกระทำ',
      movement: 'กล้องเครนกดมุมลง (Crane Down Tilt) เข้าใกล้จุดเกิดเหตุ',
      lens: '35mm'
    },
    {
      angle: 'Whip Pan Transition',
      angle_th: 'กล้องสะบัดมุมเร็ว เปลี่ยนจังหวะอารมณ์หรือเชื่อมต่อสู่สถานที่ใหม่',
      movement: 'กล้องสะบัดขวาอย่างรวดเร็ว (Fast Whip Pan Right) พร้อมโมชันเบลอส่งต่อฉาก',
      lens: '35mm'
    },
    {
      angle: 'Medium Long Shot',
      angle_th: 'มุมระดับต้นขา (Cowboy Shot) แสดงท่วงท่าและการเคลื่อนไหวทั้งตัว',
      movement: 'กล้องดอลลี่เดินหน้าเข้าหาตัวละคร (Slow Dolly In) อย่างมั่นคง',
      lens: '35mm'
    },
    {
      angle: '360-degree Orbit Shot',
      angle_th: 'กล้องหมุนวนรอบตัวละคร แสดงความตระการตาและการค้นพบสิ่งใหม่',
      movement: 'กล้องหมุนวนครบรอบอย่างนุ่มนวล (Smooth 360 Orbit) ตัวละครอยู่กึ่งกลางเฟรม',
      lens: '35mm'
    },
    {
      angle: 'Hero Resolution / Final CTA',
      angle_th: 'ช็อตปิดท้ายเรื่อง สื่อความพึงพอใจสูงสุด พร้อมส่งมอบข้อความสำคัญให้คนดู',
      movement: 'กล้องดอลลี่ถอยหลังออกช้าๆ (Slow Dolly Out) เปิดพื้นที่ให้โลโก้และข้อความขึ้นเด่นชัด',
      lens: '50mm'
    }
  ];

  // Distribute target duration intelligently across shots
  const rawDurations = [];
  for (let i = 0; i < count; i++) {
    let weight = 1.0;
    if (i === 0) weight = 1.25; // Establishing needs breathing room
    else if (i === count - 1) weight = 1.35; // Final CTA
    else if (i % 3 === 1) weight = 0.85; // Quick reaction/macro
    else if (i % 3 === 2) weight = 0.95; // Tracking
    else weight = 1.05;
    rawDurations.push(weight);
  }

  const sumWeights = rawDurations.reduce((a, b) => a + b, 0);
  const allocatedDurations = rawDurations.map(w => {
    let s = Math.round((w / sumWeights * targetSec) * 2) / 2;
    return Math.max(1.0, s);
  });

  const curSum = allocatedDurations.reduce((a, b) => a + b, 0);
  const diff = Math.round((targetSec - curSum) * 10) / 10;
  allocatedDurations[allocatedDurations.length - 1] = Math.max(1.0, Math.round((allocatedDurations[allocatedDurations.length - 1] + diff) * 10) / 10);

  function formatSec(seconds) {
    const mins = Math.floor(seconds / 60);
    const s = seconds % 60;
    const sStr = s < 10 ? '0' + s.toFixed(1) : s.toFixed(1);
    return `${mins}:${sStr}`;
  }

  const shots = [];
  const shotsPerScene = Math.ceil(count / numScenes);
  let cumulativeTime = 0;

  const conceptLower = (story_concept || '').toLowerCase();
  const isCarConcept = conceptLower.includes('รถ') || conceptLower.includes('car') || conceptLower.includes('auto') || conceptLower.includes('เต็นท์') || conceptLower.includes('ขับ');
  const isCoffeeConcept = conceptLower.includes('กาแฟ') || conceptLower.includes('coffee') || conceptLower.includes('cafe') || conceptLower.includes('คาเฟ่') || conceptLower.includes('บาริสต้า');
  const isSkinConcept = conceptLower.includes('เซรั่ม') || conceptLower.includes('ครีม') || conceptLower.includes('serum') || conceptLower.includes('skin') || conceptLower.includes('ผิว') || conceptLower.includes('หน้าใส');

  const carSequences = [
    { title: 'เปิดตัวโชว์รูมรถยนต์ระดับพรีเมียม', subtitle: 'อาคารกระจกและลานจัดแสดงรถสปอร์ตหรู', action: 'เปิดตัวอาคารโชว์รูมกระจกทันสมัย แสงไฟจัดแสดงสะท้อนพื้นเงาวับ พร้อมแถวรถสปอร์ตหรูจอดเรียงรายตระการตา', dialogue: 'เสียงพากย์: "ยินดีต้อนรับสู่อาณาจักรรถสปอร์ตพรีเมียม ที่คัดสรรสภาพนางฟ้าทุกคัน"', theme: 'car_showroom_wide' },
    { title: 'ดีไซน์หน้ารถสปอร์ตและไฟหน้า LED', subtitle: 'ไฟหน้า LED Matrix และกระจังหน้าสุดดุดัน', action: 'โคลสอัพเจาะส่วนหน้าของรถสปอร์ต สันฝากระโปรงทรงแอโรไดนามิก ไฟหน้า LED Matrix ส่องประกายคมกริบ ดุดันสะกดสายตา', dialogue: 'เสียงพากย์: "ดีไซน์โฉบเฉี่ยวสะกดทุกสายตา พร้อมไฟหน้า LED Matrix อัจฉริยะ"', theme: 'car_front_grill' },
    { title: 'ล้อแม็กเลียดพื้นสปีดเร้าใจบนถนน', subtitle: 'ล้อแม็กฟอร์จ 21 นิ้ว คาลิปเปอร์เบรกแดง', action: 'กล้องเลียดพื้นถนนเพียงคืบหน้า จับภาพล้อแม็กฟอร์จ 21 นิ้ว หมุนด้วยความเร็วสูง พร้อมคาลิปเปอร์เบรกสีแดงสดและเส้นสายตาบนถนน', dialogue: 'Foley: [เสียงเครื่องยนต์เร่งสปีดและเสียงยางเสียดสีถนนกระชับแน่น]', theme: 'car_wheel_road' },
    { title: 'ค็อกพิทพวงมาลัยสปอร์ตและหน้าปัด', subtitle: 'พวงมาลัยมัลติฟังก์ชันและหน้าปัด 4K', action: 'มุมมองภายในห้องโดยสาร พวงมาลัยหุ้มหนังจับกระชับมือ หน้าปัดดิจิทัล 120 กม./ชม. และจอสัมผัสแสดงระบบนำทางคมชัด', dialogue: 'ผู้ขับ: "สัมผัสห้องโดยสารระดับซูเปอร์คาร์ ควบคุมง่ายเพียงปลายนิ้ว"', theme: 'car_interior_cockpit' },
    { title: 'รถแล่นโฉบเฉี่ยวบนไฮเวย์มุมเอียง', subtitle: 'มุมกล้องเอียง 20° บนทางหลวงเปิดโล่ง', action: 'กล้องเอียง 20 องศาบันทึกภาพรถแล่นฉิวบนทางหลวงโล่งกว้าง ลมพัดผ่านตัวถัง ทรงตัวนิ่งสนิทเข้าโค้งอย่างมั่นใจ', dialogue: 'เสียงพากย์: "ทะยานสู่ทุกจุดหมายด้วยขุมพลัง 450 แรงม้า นุ่มนวลแต่ทรงพลัง"', theme: 'car_highway_speed' },
    { title: 'สายตาคนขับยื่นมือกดปุ่มสตาร์ท', subtitle: 'นิ้วมือกดปุ่ม Engine Start สว่างวาบ', action: 'มุมมองบุคคลที่หนึ่ง นิ้วมือเอื้อมกดปุ่ม Engine Start วงแหวนไฟสีแดงสว่างขึ้น เสียงเครื่องยนต์คำรามพร้อมพุ่งทะยาน', dialogue: 'เสียงเครื่องยนต์: [เสียงสตาร์ทเครื่องยนต์ V8 ทุ้มแน่นกระหึ่มเร้าใจ]', theme: 'car_push_start_pov' },
    { title: 'กุญแจสมาร์ทคีย์และคันเกียร์หรู', subtitle: 'กุญแจรีโมตอัจฉริยะและวัสดุคาร์บอนไฟเบอร์', action: 'ภาพมาโครเจาะลึกกุญแจรีโมตอัจฉริยะขอบโครเมียม และคันเกียร์อัตโนมัติหุ้มหนังเย็บประณีตระดับพรีเมียม', dialogue: 'เสียงพากย์: "ทุกสัมผัสสะท้อนความประณีต วัสดุพรีเมียมเกรดอากาศยาน"', theme: 'car_macro_key' },
    { title: 'สีหน้าความประทับใจของคนขับ', subtitle: 'รอยยิ้มพึงพอใจและแววตามุ่งมั่น', action: 'เจาะสีหน้าคนขับเปี่ยมด้วยรอยยิ้มพึงพอใจ แววตามั่นใจ เพลิดเพลินกับสมรรถนะการขับขี่ที่นุ่มนวลและเงียบกริบ', dialogue: 'ผู้ขับ: "นี่ไม่ใช่แค่การขับขี่... แต่มันคือรางวัลของชีวิต"', theme: 'car_driver_reaction' },
    { title: 'มุมสูงโดรนตามโค้งถนนทิวทัศน์', subtitle: 'มุมมองทางอากาศโดรน 4K ทิวทัศน์โค้ง S', action: 'มุมมองทางอากาศโดรนมองลงมา รถแล่นตามโค้งรูปตัว S ท่ามกลางทิวทัศน์ธรรมชาติสวยงาม เงารถทอดยาวบนถนนอย่างสง่างาม', dialogue: 'Foley: [ดนตรีออร์เคสตราท่อนไคลแมกซ์ไพเราะสง่างาม]', theme: 'car_drone_aerial' },
    { title: 'สปีดด้านข้างตัวถังสปอร์ต', subtitle: 'เส้นสายฟาสต์แบ็กสะท้อนแสงไฟโชว์รูม', action: 'กล้องเคลื่อนขนานจับด้านข้างตัวรถ เส้นสายหลังคาลาดเอียงแบบฟาสต์แบ็กสะท้อนแสงไฟอย่างทรงพลัง', dialogue: 'เสียงพากย์: "ตรวจเช็กสภาพกว่า 200 จุด การันตีไร้ชนหนัก ไร้น้ำท่วม 100%"', theme: 'car_side_profile' },
    { title: 'ส่งมอบกุญแจและจับมือลูกค้า', subtitle: 'พิธีส่งมอบรถ ผูกโบของขวัญสีแดงบนฝากระโปรง', action: 'ที่ปรึกษาการขายส่งมอบกุญแจรถพร้อมจับมือแสดงความยินดีกับลูกค้า รอยยิ้มแห่งความสุขและความคุ้มค่าเบ่งบาน', dialogue: 'เซลส์: "ขอแสดงความยินดีกับรถคันใหม่ครับ ขับขี่ปลอดภัยตลอดเส้นทางครับ"', theme: 'car_handover_dealership' },
    { title: 'เจ้าของใหม่เคียงข้างรถคู่ใจ', subtitle: 'เจ้าของยกนิ้วโป้ง พร้อมการันตี 5 ดาว', action: 'เจ้าของใหม่ยืนเคียงข้างรถสปอร์ต ยกนิ้วโป้งด้วยความมั่นใจ พร้อมกราฟิก 5 ดาว และข้อความชี้พิกัดโปรโมชั่นพิเศษ', dialogue: 'ผู้บรรยาย: "จองวันนี้ รับดอกเบี้ยพิเศษ 0% ทันที คลิกจองที่ลิงก์หน้าโปรไฟล์!"', theme: 'car_hero_cta' }
  ];

  const coffeeSequences = [
    { title: 'บรรยากาศหน้าร้านคาเฟ่อบอุ่น', subtitle: 'กันสาดผ้าใบและป้ายไม้คลาสสิก', action: 'เปิดตัวหน้าร้านคาเฟ่ดีไซน์อบอุ่น กันสาดผ้าใบ ป้ายไม้ และแสงแดดยามเช้าส่องผ่านกระจกใส', dialogue: 'เสียงพากย์: "กลิ่นหอมอบอวลต้อนรับวันใหม่... เริ่มต้นได้ที่นี่"', theme: 'cafe_storefront_wide' },
    { title: 'เมล็ดกาแฟคั่วพิเศษลงเครื่องบด', subtitle: 'เมล็ดอาราบิก้าแท้เกรดพรีเมียม', action: 'เมล็ดกาแฟอาราบิก้าคั่วสดใหม่เทลงโถบด ได้ยินเสียงบดละเอียดและกลิ่นหอมฟุ้งกระจาย', dialogue: 'Foley: [เสียงเครื่องบดกาแฟทำงานอย่างนุ่มนวล กลิ่นหอมระเหย]', theme: 'coffee_beans_grind' },
    { title: 'สกัดเอสเปรสโซครีม่าสีทอง', subtitle: 'สายน้ำกาแฟเข้มข้นพร้อมครีม่าหนานุ่ม', action: 'สายน้ำกาแฟเอสเปรสโซเข้มข้นสกัดไหลผ่านก้านชงลงสู่แก้วใส ครีม่าสีทองเนียนนุ่มลอยเด่น', dialogue: 'เสียงพากย์: "สกัดด้วยแรงดันสมบูรณ์แบบ ได้รสชาติเข้มข้นกลมกล่อม"', theme: 'coffee_espresso_stream' },
    { title: 'บาริสต้าเทฟองนมวาดลาเต้อาร์ต', subtitle: 'ฟองนมเนียนนุ่มลวดลายหัวใจประณีต', action: 'บาริสต้าควบคุมพิตเชอร์สแตนเลส เทฟองนมสตรีมนุ่มละมุน วาดลวดลายหัวใจลาเต้อาร์ตอย่างประณีต', dialogue: 'บาริสต้า: "ศิลปะในแก้วกาแฟ ที่ตั้งใจทำเพื่อคุณโดยเฉพาะ"', theme: 'coffee_latte_art' },
    { title: 'เสิร์ฟแก้วกาแฟพร้อมครัวซองต์', subtitle: 'แก้วร้อนกรุ่นควันและครัวซองต์กรอบนอกนุ่มใน', action: 'แก้วกาแฟกรุ่นควันวางบนโต๊ะไม้ธรรมชาติ เคียงคู่ครัวซองต์อบกรอบสีทองน่ารับประทาน', dialogue: 'Foley: [เสียงวางแก้วเซรามิกบนโต๊ะไม้ พร้อมกลิ่นหอมกรุ่น]', theme: 'coffee_cup_macro' },
    { title: 'สัมผัสความหอมกรุ่นจิบแรก', subtitle: 'รอยยิ้มพึงพอใจกับรสชาติละมุน', action: 'สองมือยกแก้วกาแฟขึ้นจรดริมฝีปาก ไอร้อนลอยสัมผัสใบหน้า รสชาติกลมกล่อมลงตัว', dialogue: 'ลูกค้า: "อืมมม... สดชื่น ตื่นเต็มตา รสชาติดีมากจริงๆ"', theme: 'coffee_sipping_reaction' },
    { title: 'บทสนทนาแสนสุขในคาเฟ่', subtitle: 'เพื่อนสองคนพูดคุยชนแก้วกันอย่างอบอุ่น', action: 'เพื่อนสนิทนั่งพูดคุยหัวเราะอย่างเป็นกันเอง ชนแก้วกาแฟ แบ่งปันช่วงเวลาดีๆ ด้วยกัน', dialogue: 'เพื่อน: "ร้านนี้บรรยากาศดีมาก คราวหน้าต้องมาซ้ำอีกแน่นอน"', theme: 'coffee_two_shot_chat' },
    { title: 'แก้วซิกเนเจอร์พร้อมเชิญชวน', subtitle: 'แก้วกาแฟโลโก้ร้านและพิกัดความอร่อย', action: 'ช็อตปิดท้ายมุมสวยของร้าน พร้อมชื่อแบรนด์ เวลาเปิด-ปิด และแผนที่พิกัดเชิญชวนมาลิ้มลอง', dialogue: 'ผู้บรรยาย: "แวะมาเติมพลังความสุขได้ทุกวัน พิกัดร้านใจกลางเมือง เปิด 7:00-18:00 น."', theme: 'coffee_hero_cta' }
  ];

  const skincareSequences = [
    { title: 'โต๊ะเครื่องแป้งและแสงธรรมชาติ', subtitle: 'มุมบิวตี้มินิมอล แสงเช้ากระทบขวดแก้ว', action: 'บรรยากาศมุมแต่งหน้าสไตล์มินิมอล กระจกบานใหญ่ และแสงแดดอ่อนละมุนส่องกระทบขวดเซรั่ม', dialogue: 'เสียงพากย์: "เผยผิวสวยสุขภาพดี มั่นใจได้ทุกวันตั้งแต่เช้าแรก"', theme: 'skincare_vanity_wide' },
    { title: 'ขวดเซรั่มหรูบนแท่นหินอ่อน', subtitle: 'แท่นหินอ่อนพร้อมระลอกน้ำใสบริสุทธิ์', action: 'ขวดแก้วเซรั่มดีไซน์พรีเมียมสะท้อนประกายแสง วางเด่นบนแท่นหินอ่อนพร้อมระลอกน้ำใสบริสุทธิ์', dialogue: 'เสียงพากย์: "สูตรนวัตกรรมเข้มข้น ผสานคุณค่าสารสกัดบริสุทธิ์"', theme: 'skincare_bottle_pedestal' },
    { title: 'ดรอปเปอร์หยดเนื้อเซรั่มใส', subtitle: 'หยาดน้ำคริสตัลชุ่มชื้นโปร่งแสง', action: 'ดรอปเปอร์แก้วดูดเนื้อเซรั่มเข้มข้น หยดหยาดน้ำใสบริสุทธิ์ลงสู่ปลายนิ้วอย่างอ่อนโยน', dialogue: 'Foley: [เสียงหยดน้ำสัมผัสแผ่วเบา บ่งบอกความชุ่มชื้น]', theme: 'skincare_dropper_macro' },
    { title: 'แตะแต้มเซรั่มลงบนพวงแก้ม', subtitle: 'เนื้อเซรั่มซึมซาบสู่ผิวทันทีอย่างอ่อนโยน', action: 'ปลายนิ้วสัมผัสผิวหน้า เกลี่ยเนื้อเซรั่มบางเบา ซึมซาบสู่ผิวทันทีโดยไม่เหนียวเหนอะหนะ', dialogue: 'นางแบบ: "บางเบา ซึมไวมาก ไม่เหนียวเหนอะหนะเลยค่ะ"', theme: 'skincare_apply_face' },
    { title: 'ผิวหน้ากระจ่างใสฉ่ำโกลว์', subtitle: 'ผิวกระจก Glass Skin เปล่งประกายธรรมชาติ', action: 'แสงไฟสตูดิโอสะท้อนผิวหน้าที่เปล่งประกาย ผิวดูอิ่มฟู ชุ่มชื้นสุขภาพดีอย่างเป็นธรรมชาติ', dialogue: 'เสียงพากย์: "ผิวอิ่มน้ำ ฉ่ำโกลว์ รูขุมขนกระชับขึ้นอย่างเห็นได้ชัด"', theme: 'skincare_glow_reaction' },
    { title: 'ส่องกระจกด้วยความมั่นใจ', subtitle: 'รอยยิ้มสดใสพร้อมเริ่มต้นวันใหม่อย่างเฉิดฉาย', action: 'มุมมองสายตามองเงาสะท้อนในกระจก รอยยิ้มสดใสพร้อมความมั่นใจกับผิวที่เรียบเนียนขึ้น', dialogue: 'นางแบบ: "รักผิวตัวเองในกระจกตอนนี้ที่สุดเลย!"', theme: 'skincare_mirror_smile' },
    { title: 'เซ็ตโปรโมชั่นพิเศษชี้พิกัด', subtitle: 'ชุดผลิตภัณฑ์ครบสูตรการันตีความพึงพอใจ', action: 'ภาพเซ็ตผลิตภัณฑ์เด่นชัด พร้อมราคาพิเศษ และปุ่มสั่งซื้อชี้พิกัดลิงก์หน้าโปรไฟล์', dialogue: 'ผู้บรรยาย: "สั่งซื้อวันนี้รับโปรโมชั่นเปิดตัว 1 แถม 1 จัดส่งฟรีทั่วประเทศ คลิกเลย!"', theme: 'skincare_hero_cta' }
  ];

  for (let i = 0; i < count; i++) {
    const shotNum = i + 1;
    const sceneIdx = Math.min(numScenes - 1, Math.floor(i / shotsPerScene));
    const currentScene = sceneThemes[sceneIdx];

    // Pick camera angle rotating smoothly through angleLibrary
    let angleTemplate = angleLibrary[i % angleLibrary.length];
    if (shotNum === 1) angleTemplate = angleLibrary[0]; // First shot: Wide Establishing
    if (shotNum === count) angleTemplate = angleLibrary[angleLibrary.length - 1]; // Last shot: Hero Resolution

    const charName = charAsset ? charAsset.name : 'ตัวละครหลัก';
    const sceneName = sceneAsset ? sceneAsset.name : 'สถานที่เรื่องราว';
    const prodName = prodAsset ? prodAsset.name : 'องค์ประกอบหลัก';

    const shotDur = allocatedDurations[i];
    const startSec = cumulativeTime;
    const endSec = Math.round((startSec + shotDur) * 10) / 10;
    cumulativeTime = endSec;
    const timecodeStr = `${formatSec(startSec)} - ${formatSec(endSec)}`;

    let customShot = null;
    if (isCarConcept) {
      customShot = carSequences[i % carSequences.length];
    } else if (isCoffeeConcept) {
      customShot = coffeeSequences[i % coffeeSequences.length];
    } else if (isSkinConcept) {
      customShot = skincareSequences[i % skincareSequences.length];
    }

    let shotTitle = '';
    let shotSubtitle = '';
    let actionDesc = '';
    let dialogueText = '';
    let sketchTheme = '';

    if (customShot) {
      shotTitle = `ช็อตที่ ${shotNum}: ${customShot.title} [${angleTemplate.angle}]`;
      shotSubtitle = customShot.subtitle;
      actionDesc = customShot.action;
      dialogueText = customShot.dialogue;
      sketchTheme = customShot.theme;
    } else if (shotNum === 1) {
      shotTitle = `ช็อตที่ 1: ปูบรรยากาศและเปิดตัวสถานที่ [${angleTemplate.angle}]`;
      shotSubtitle = `เปิดฉากมุมกว้าง แนะนำสถานที่และบริบทเรื่องราว`;
      actionDesc = `เปิดฉากด้วยภาพมุมกว้างของ ${sceneName} แสงแดดสะท้อนบรรยากาศสมจริง ผู้ชมสัมผัสได้ถึงอารมณ์และบริบทของเรื่องราว "${story_concept}"`;
      dialogueText = `เสียงพากย์เปิดเรื่อง: "เรื่องราวเริ่มต้นขึ้นที่นี่... ท่ามกลางความท้าทายที่หลายคนคุ้นเคย"`;
      sketchTheme = 'general_wide_city';
    } else if (shotNum === count) {
      shotTitle = `ช็อตที่ ${shotNum}: บทสรุปแห่งชัยชนะและข้อความสำคัญ [${angleTemplate.angle}]`;
      shotSubtitle = `ส่งมอบความสุข รอยยิ้ม และ Call to Action`;
      actionDesc = `${charName} เผยรอยยิ้มอย่างมีความสุขและมั่นใจ บรรยากาศแห่งความสำเร็จอบอวล พร้อมมองตรงมายังผู้ชมเพื่อส่งต่อความมั่นใจ`;
      dialogueText = `ผู้บรรยาย: "ให้ทุกวันของคุณง่ายขึ้น มั่นใจเลือกสิ่งที่ดีที่สุดได้แล้ววันนี้"`;
      sketchTheme = 'general_hero_cta';
    } else {
      shotTitle = `ช็อตที่ ${shotNum}: ${currentScene.title.split(':')[1]?.split('(')[0]?.trim() || 'ภาพยนตร์'} [${angleTemplate.angle}]`;
      shotSubtitle = angleTemplate.angle_th;
      actionDesc = `ช็อตความต่อเนื่องใน ${currentScene.title}: ${charName} เคลื่อนไหวอย่างเป็นธรรมชาติใน ${sceneName} สะท้อนถึงการดำเนินเรื่อง "${story_concept}" ในมุมมอง ${angleTemplate.angle_th}`;
      dialogueText = `${charName}: "ถ้าเราไม่เริ่มลงมือทำตอนนี้ แล้วเมื่อไหร่จะสำเร็จ!"`;
    }

    let foleyText = `เสียงฝีเท้าเคลื่อนไหวบนพื้น เสียงสิ่งของกระทบกันเป็นธรรมชาติ และเสียงดนตรีสร้างจังหวะขับเคลื่อน`;
    let onScreenText = 'ไม่มีตัวหนังสือ เพื่อให้ผู้ชมซึมซับบรรยากาศจริง';
    if (shotNum === 1) {
      foleyText = `เสียงแอมเบียนต์บรรยากาศกลางแจ้ง เสียงลมพัดเบาๆ และเสียงยวดยานพาหนะแล่นผ่านในระยะไกล`;
      onScreenText = `โลโก้หรือชื่อเรื่องสตอรี่บอร์ดขึ้นแบบมินิมอลมุมบน`;
    } else if (shotNum === count) {
      foleyText = `เสียงดนตรีประกอบท่อนจบอบอุ่นทรงพลัง (Uplifting Cello & Piano) พร้อมเสียงกังวานของความสำเร็จ`;
      onScreenText = `ข้อความ Call to Action เด่นชัด: "ติดต่อสอบถาม / ชี้พิกัดที่ลิงก์หน้าโปรไฟล์"`;
    } else if (shotNum % 5 === 0) {
      onScreenText = `ข้อความไฮไลต์ใจความสำคัญของซีนนี้ (Key Takeaway)`;
    }

    const charPromptPart = charAsset ? charAsset.prompt : 'charismatic Thai protagonist, authentic emotional expression';
    const scenePromptPart = sceneAsset ? sceneAsset.prompt : 'atmospheric cinematic location, realistic detailed environment';
    const prodPromptPart = prodAsset ? `, featuring ${prodAsset.prompt}` : '';

    const imagePrompt = `${sketchPrefix}Cinematic ${angleTemplate.angle} of ${charPromptPart} in ${scenePromptPart}${prodPromptPart}, ${angleTemplate.lens} focal length, professional lighting, photorealistic textures, master composition, 8k resolution.`;

    const videoPrompt = `[Camera: ${angleTemplate.movement}] [Subject: ${charName} moving naturally with subtle micro-expressions] [Duration: ${shotDur}s] [Lighting: Cinematic realistic natural light, deep shadows, ultra smooth 24fps motion fluidity, 4k master].`;

    const liveActionGuide = `การจัดแสง: Key Light ทำมุม 45 องศา เสริม Rim Light แยกตัวแบบออกจากพื้นหลัง | เลนส์: ${angleTemplate.lens} | เวลาช็อต: ${shotDur} วินาที | กองถ่าย: ตรวจจับระนาบโฟกัสที่แววตา เคลื่อนกล้องตามคิว ${angleTemplate.movement}`;

    const shotObj = {
      shot_number: shotNum,
      scene_number: currentScene.num,
      scene_title: currentScene.title,
      title: shotTitle,
      subtitle: shotSubtitle,
      camera_angle: angleTemplate.angle,
      camera_angle_th: angleTemplate.angle_th,
      camera_movement: angleTemplate.movement,
      lens_focal: angleTemplate.lens,
      duration_seconds: shotDur,
      timecode: timecodeStr,
      action_description: actionDesc,
      dialogue: dialogueText,
      audio_foley: foleyText,
      on_screen_text: onScreenText,
      prompt: imagePrompt,
      video_prompt: videoPrompt,
      live_action_guide: liveActionGuide,
      aspect_ratio: '9:16',
      sketch_theme: sketchTheme
    };
    shotObj.image_url = getStoryboardSketch(shotObj);
    shots.push(shotObj);
  }

  return {
    project_title: story_concept.length > 50 ? story_concept.slice(0, 50) + '...' : story_concept,
    logline: `สตอรี่บอร์ดโปรดักชัน ${count} ช็อต ความยาวรวม ${targetSec} วินาที (${numScenes} ซีน) พร้อมคัตสลับมุมกล้องระดับมืออาชีพ`,
    total_shots: count,
    total_scenes: numScenes,
    target_duration: targetSec,
    total_duration: targetSec,
    pacing: pacing,
    shots: shots
  };
}

// Plan complete storyboard sequence with camera angles and asset stitching (Supports 1 to 50 shots)
app.post('/api/storyboard/ai-plan', async (req, res) => {
  try {
    const {
      story_concept,
      character_id,
      scene_id,
      product_id,
      num_shots,
      target_duration = 30,
      pacing = 'fast',
      style = 'sketch',
      visual_style = 'sketch'
    } = req.body;

    const targetSec = Math.max(5, parseFloat(target_duration) || 30);
    // Calculate default shots if not specified based on pacing
    let defaultShots = Math.round(targetSec / 2.5);
    if (pacing === 'normal') defaultShots = Math.round(targetSec / 4.0);
    else if (pacing === 'cinematic') defaultShots = Math.round(targetSec / 6.0);

    const requestedShots = Math.max(1, Math.min(50, parseInt(num_shots, 10) || defaultShots || 4));
    const chosenStyle = visual_style || style;

    if (!story_concept) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุพล็อตเรื่องหรือคอนเซปต์' });
    }

    // Fetch asset details if provided
    let charAsset = character_id ? db.prepare('SELECT * FROM assets WHERE id = ?').get(character_id) : null;
    let sceneAsset = scene_id ? db.prepare('SELECT * FROM assets WHERE id = ?').get(scene_id) : null;
    let prodAsset = product_id ? db.prepare('SELECT * FROM assets WHERE id = ?').get(product_id) : null;

    const isSketch = chosenStyle === 'sketch' || chosenStyle.includes('สเก็ตช์') || chosenStyle.includes('Sketch');

    let planData = null;

    // For smaller shot counts (<= 8), query Groq LPU directly for creative nuance
    if (requestedShots <= 8 && config.GROQ_API_KEY) {
      const systemPrompt = `คุณคือผู้กำกับภาพยนตร์และผู้กำกับโฆษณามืออาชีพ (AI Storyboard & Video Director)
หน้าที่ของคุณคือรับพล็อตเรื่อง และองค์ประกอบที่แนบมา (ตัวละคร, ฉาก, สินค้า) แล้ววางโครงสร้างสตอรี่บอร์ดจำนวน ${requestedShots} ช็อต
โดยต้องระบุทั้ง:
1. การเลือกมุมกล้องและการเคลื่อนกล้อง (Camera Angle & Movement) ตามหลักไวยากรณ์ภาพยนตร์
2. เสียงพากย์, เสียง Foley, เสียงแอมเบียนต์บรรยากาศ (Audio & Sound FX)
3. ข้อความตัวหนังสือในคลิป/ซับไตเติล (On-Screen Text) ว่าควรมีหรือไม่ และมีคำว่าอะไร
4. Prompt ภาษาอังกฤษสำหรับสร้างภาพ Keyframe (สไตล์: ${isSketch ? 'ภาพสเก็ตช์สตอรี่บอร์ดดินสอ/ชาร์โคล Professional Pencil Sketch Storyboard' : chosenStyle})
5. Prompt ภาษาอังกฤษสำหรับนำไปเจนเป็นวิดีโอ (Video Prompt สำหรับ Kling AI / Runway Gen-3 / Luma)
6. คำแนะนำสำหรับกองถ่ายจริง (Live-Action Filming Guide) การจัดแสง พร็อพ เลนส์ กำกับนักแสดง
7. กฎเหล็กสำคัญเรื่องคำลงท้ายบทพูด: ห้ามเขียนคำว่า "ครับ/ค่ะ" หรือ "ค่ะ/ครับ" เด็ดขาด ให้เลือกใช้อย่างใดอย่างหนึ่งอย่างเป็นธรรมชาติ โดยให้เน้นใช้คำว่า "ครับ" เสมอ

ข้อมูลองค์ประกอบ:
- พล็อต: "${story_concept}"
- ตัวละคร: ${charAsset ? charAsset.name : 'ตัวละครหลัก'}
- ฉาก: ${sceneAsset ? sceneAsset.name : 'สถานที่เรื่องราว'}
- สินค้า: ${prodAsset ? prodAsset.name : 'ไม่มีสินค้า'}

ตอบกลับเป็น JSON { "project_title": "...", "logline": "...", "shots": [{ "shot_number": 1, "scene_number": 1, "scene_title": "ฉากที่ 1: ...", "title": "...", "camera_angle": "Wide Shot", "camera_angle_th": "...", "camera_movement": "...", "lens_focal": "24mm", "action_description": "...", "dialogue": "...", "audio_foley": "...", "on_screen_text": "...", "prompt": "...", "video_prompt": "...", "live_action_guide": "...", "aspect_ratio": "9:16" }] } เท่านั้น`;

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.GROQ_MODEL,
            messages: [{ role: 'user', content: systemPrompt }],
            response_format: { type: 'json_object' }
          })
        });
        if (groqRes.ok) {
          const gData = await groqRes.json();
          planData = JSON.parse(gData.choices[0].message.content);
        }
      } catch (e) {
        console.warn('[Storyboard AI Plan Groq Error]:', e.message);
      }
    }

    // For larger shot counts (> 8 up to 50), or if LLM unavailable/offline, use the high-performance Cinematic Sequence Generator
    if (!planData || !planData.shots || planData.shots.length === 0) {
      planData = generateCinematicSequence(story_concept, requestedShots, charAsset, sceneAsset, prodAsset, isSketch, chosenStyle, targetSec, pacing);
    } else {
      // Ensure all shots have scene_number & scene_title even from LLM
      planData.shots = planData.shots.map((s, idx) => {
        const item = {
          ...s,
          shot_number: s.shot_number || (idx + 1),
          scene_number: s.scene_number || Math.min(5, Math.floor(idx / 5) + 1),
          scene_title: s.scene_title || `ฉากที่ ${Math.min(5, Math.floor(idx / 5) + 1)}: การดำเนินเรื่องราว`
        };
        if (!item.image_url || item.image_url.includes('pollinations.ai')) {
          item.image_url = getStoryboardSketch(item);
        }
        return item;
      });
      planData.total_shots = planData.shots.length;
    }

    res.json({
      success: true,
      data: planData,
      visual_style: chosenStyle,
      assets_used: {
        character: charAsset,
        scene: sceneAsset,
        product: prodAsset
      }
    });
  } catch (err) {
    console.error('[Storyboard AI Plan Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Commit planned shots into the board as prompts (Supports up to 50 shots with Scenes)
app.post('/api/storyboard/commit-shots', async (req, res) => {
  try {
    const { shots, project_title, character_id, scene_id, product_id, visual_style = 'sketch', target_duration = 30, pacing = 'fast' } = req.body;
    if (!shots || !Array.isArray(shots) || shots.length === 0) {
      return res.status(400).json({ success: false, error: 'ไม่พบรายการช็อต' });
    }

    const seriesId = 'series-sb-' + Date.now();
    // Insert series
    db.prepare(`
      INSERT INTO series (id, title, description, summary, target_duration, pacing)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      seriesId,
      project_title || 'สตอรี่บอร์ดโปรเจกต์ใหม่',
      `ความยาว ${target_duration} วิ (${shots.length} ช็อต สลับมุมกล้องสไตล์ ${pacing === 'fast' ? 'คัตเร็ว' : 'มาตรฐาน'})`,
      'ชุดสตอรี่บอร์ดวางมุมกล้อง ละเอียดครบทั้ง Video Prompt, Audio Foley, Scene Breakdown และ Live-Action Guide',
      parseFloat(target_duration) || 30.0,
      pacing || 'fast'
    );

    const insertedShots = [];

    for (let i = 0; i < shots.length; i++) {
      const s = shots[i];
      const shotId = 'shot-' + Date.now() + '-' + (i + 1);

      // Instant lightweight sketch generation for the shot
      let shotImageUrl = s.image_url || null;
      if (!shotImageUrl || shotImageUrl.includes('pollinations.ai')) {
        shotImageUrl = getStoryboardSketch(s);
      }

      db.prepare(`
        INSERT INTO prompts (
          id, series_id, step_number, step_title, title, subtitle,
          prompt_type, recommended_tool, aspect_ratio, content,
          dialogue_script, image_url, camera_angle, shot_size,
          character_asset_id, scene_asset_id, product_asset_id,
          video_prompt, audio_foley, on_screen_text, camera_movement,
          live_action_guide, visual_style, scene_number, scene_title,
          duration_seconds, timecode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shotId,
        seriesId,
        s.shot_number || (i + 1),
        `SHOT ${s.shot_number || (i + 1)} (${s.duration_seconds || 2.5}s) — ${s.camera_angle || 'Camera Shot'}`,
        s.title || `ช็อตที่ ${i + 1}`,
        s.camera_angle_th || s.camera_angle || 'มุมกล้องภาพยนตร์',
        'storyboard_shot',
        s.lens_focal ? `${s.camera_angle} (${s.lens_focal})` : (s.camera_angle || 'CineBoard Director'),
        s.aspect_ratio || '9:16',
        s.prompt || s.action_description,
        s.dialogue || s.action_description,
        shotImageUrl || '',
        s.camera_angle || 'Medium Shot',
        s.lens_focal || '35mm',
        character_id || null,
        scene_id || null,
        product_id || null,
        s.video_prompt || null,
        s.audio_foley || null,
        s.on_screen_text || null,
        s.camera_movement || null,
        s.live_action_guide || null,
        visual_style || s.visual_style || 'sketch',
        s.scene_number || 1,
        s.scene_title || 'ฉากที่ 1',
        s.duration_seconds || 2.5,
        s.timecode || null
      );

      const inserted = db.prepare('SELECT * FROM prompts WHERE id = ?').get(shotId);
      insertedShots.push(inserted);
    }

    res.json({
      success: true,
      message: `นำเข้าสตอรี่บอร์ด ${insertedShots.length} ช็อตสำเร็จแล้ว`,
      series_id: seriesId,
      data: insertedShots
    });
  } catch (err) {
    console.error('[Commit Shots Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Append an individual shot to existing storyboard / series
app.post('/api/storyboard/append-shot', async (req, res) => {
  try {
    const { series_id, shot } = req.body;
    if (!series_id || !shot) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
    }

    // Determine next shot number
    const maxShot = db.prepare('SELECT MAX(step_number) as max_step FROM prompts WHERE series_id = ?').get(series_id);
    const nextStep = (maxShot && maxShot.max_step ? maxShot.max_step : 0) + 1;
    const shotId = 'shot-' + Date.now() + '-' + nextStep;

    let shotImageUrl = shot.image_url || null;
    if (!shotImageUrl || shotImageUrl.includes('pollinations.ai')) {
      shotImageUrl = getStoryboardSketch(shot);
    }

    db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle,
        prompt_type, recommended_tool, aspect_ratio, content,
        dialogue_script, image_url, camera_angle, shot_size,
        character_asset_id, scene_asset_id, product_asset_id,
        video_prompt, audio_foley, on_screen_text, camera_movement,
        live_action_guide, visual_style, scene_number, scene_title,
        duration_seconds, timecode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      shotId,
      series_id,
      nextStep,
      `SHOT ${nextStep} — ${shot.camera_angle || 'Camera Shot'}`,
      shot.title || `ช็อตที่ ${nextStep}`,
      shot.camera_angle_th || shot.camera_angle || 'มุมกล้องภาพยนตร์',
      'storyboard_shot',
      shot.lens_focal ? `${shot.camera_angle} (${shot.lens_focal})` : (shot.camera_angle || 'CineBoard Director'),
      shot.aspect_ratio || '9:16',
      shot.prompt || shot.action_description,
      shot.dialogue || shot.action_description,
      shotImageUrl || '',
      shot.camera_angle || 'Medium Shot',
      shot.lens_focal || '35mm',
      shot.character_asset_id || null,
      shot.scene_asset_id || null,
      shot.product_asset_id || null,
      shot.video_prompt || null,
      shot.audio_foley || null,
      shot.on_screen_text || null,
      shot.camera_movement || null,
      shot.live_action_guide || null,
      shot.visual_style || 'sketch',
      shot.scene_number || 1,
      shot.scene_title || 'ฉากที่ 1',
      shot.duration_seconds || 2.5,
      shot.timecode || null
    );

    const inserted = db.prepare('SELECT * FROM prompts WHERE id = ?').get(shotId);
    res.json({ success: true, data: inserted });
  } catch (err) {
    console.error('[Append Shot Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stats
app.get('/api/stats', (req, res) => {
  try {
    const totalPrompts = db.prepare('SELECT COUNT(*) as c FROM prompts').get().c;
    const totalCopies = db.prepare('SELECT SUM(copy_count) as c FROM prompts').get().c || 0;
    const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
    const totalSeries = db.prepare('SELECT COUNT(*) as c FROM series').get().c;

    const topPrompts = db.prepare(`
      SELECT id, title, step_title, copy_count, recommended_tool
      FROM prompts
      ORDER BY copy_count DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        totalPrompts,
        totalCopies,
        totalLeads,
        totalSeries,
        topPrompts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Toggle/Reset shot image to instant sketch
app.post('/api/prompts/:id/sketch', (req, res) => {
  try {
    const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, error: 'ไม่พบช็อต' });
    const sketch = getStoryboardSketch(prompt);
    db.prepare("UPDATE prompts SET image_url = ?, visual_style = 'sketch' WHERE id = ?").run(sketch, req.params.id);
    const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Production Static File Serving (Full-Stack Deployment)
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving production frontend build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 PKShortClips Studio Server running on http://localhost:${PORT}`);
});

