const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const config = require('./config');
const { getStoryboardSketch } = require('./sketchHelper');
const { parseMultiSceneScript } = require('./scriptParser');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Request logger
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.url.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ==========================================
// 1. SERIES / PROJECT ENDPOINTS
// ==========================================

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
          variables_schema: p.variables_schema ? JSON.parse(p.variables_schema) : null
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/series/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM prompts WHERE series_id = ?').run(id);
    const result = db.prepare('DELETE FROM series WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'ไม่พบโปรเจกต์ที่ต้องการลบ' });
    }
    res.json({ success: true, message: 'ลบโปรเจกต์สตอรี่บอร์ดและช็อตทั้งหมดเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PROMPT & SHOT ENDPOINTS
// ==========================================

app.get('/api/prompts', (req, res) => {
  try {
    const { series_id } = req.query;
    let query = 'SELECT * FROM prompts WHERE is_active = 1';
    const params = [];

    if (series_id && series_id !== 'all') {
      query += ' AND series_id = ?';
      params.push(series_id);
    }
    query += ' ORDER BY step_number ASC, sort_order ASC';

    const prompts = db.prepare(query).all(...params);
    res.json({
      success: true,
      data: prompts.map(p => ({
        ...p,
        variables_schema: p.variables_schema ? JSON.parse(p.variables_schema) : null
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate / Append a single shot into a project
app.post('/api/generate', async (req, res) => {
  try {
    const {
      prompt,
      title = 'ช็อตสร้างใหม่',
      aspect_ratio = '16:9',
      series_id = null
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกคำสั่ง Prompt' });
    }

    let imageUrl = await aiService.generateAIImage(prompt, { aspect_ratio });
    if (!imageUrl) {
      imageUrl = getStoryboardSketch({
        prompt,
        title,
        action_description: prompt,
        camera_angle: 'Medium Shot',
        aspect_ratio
      });
    }

    const id = 'pk-gen-' + Date.now();
    const countQuery = db.prepare('SELECT COUNT(*) as c FROM prompts').get();
    const sort_order = (countQuery.c || 0) + 1;

    let targetSeriesId = series_id;
    if (!targetSeriesId || targetSeriesId === 'all') {
      const latestSeries = db.prepare('SELECT id FROM series ORDER BY created_at DESC LIMIT 1').get();
      targetSeriesId = latestSeries ? latestSeries.id : 'series-default';
    }

    const insertStmt = db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle,
        prompt_type, recommended_tool, aspect_ratio, content,
        dialogue_script, variables_schema, image_url, copy_count,
        sort_order, is_active, camera_angle, action_description, video_prompt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      targetSeriesId,
      1,
      'ช็อตเดี่ยว',
      title,
      'ภาพเดี่ยวจาก AI Prompt',
      'first_frame',
      'AI Image Generator',
      aspect_ratio,
      prompt,
      '',
      null,
      imageUrl,
      sort_order,
      'Medium Shot',
      prompt,
      `Smooth cinematic camera motion capturing ${prompt}`
    );

    const inserted = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    res.json({ success: true, data: inserted });
  } catch (err) {
    console.error('[Generate Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate or Regenerate real AI image for a specific shot
app.post('/api/prompts/:id/generate-image', async (req, res) => {
  try {
    const { id } = req.params;
    const promptRow = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    if (!promptRow) {
      return res.status(404).json({ success: false, error: 'ไม่พบช็อตนี้ในระบบ' });
    }

    const {
      prompt = promptRow.content || promptRow.title,
      aspect_ratio = promptRow.aspect_ratio || '16:9'
    } = req.body;

    console.log(`[AI Shot Image] Generating image for shot ${id}...`);
    const imgUrl = await aiService.generateAIImage(prompt, { aspect_ratio });

    if (imgUrl) {
      db.prepare('UPDATE prompts SET image_url = ?, aspect_ratio = ? WHERE id = ?').run(imgUrl, aspect_ratio, id);
      const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
      return res.json({ success: true, data: updated, image_url: imgUrl });
    } else {
      return res.status(500).json({
        success: false,
        error: 'ระบบสร้างภาพ AI ขัดข้องชั่วคราว หรือเกินโควตาฟรี (1 ภาพ/45 วินาที) กรุณาลองใหม่อีกครั้ง หรือใส่ API Key ในการตั้งค่า'
      });
    }
  } catch (err) {
    console.error('[Generate Shot Image Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update an individual shot
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
      shot_size,
      action_description,
      audio_foley,
      on_screen_text,
      video_prompt,
      visual_style,
      duration_seconds,
      image_url,
      aspect_ratio
    } = req.body;

    db.prepare(`
      UPDATE prompts SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        dialogue_script = COALESCE(?, dialogue_script),
        camera_angle = COALESCE(?, camera_angle),
        camera_movement = COALESCE(?, camera_movement),
        shot_size = COALESCE(?, shot_size),
        action_description = COALESCE(?, action_description),
        audio_foley = COALESCE(?, audio_foley),
        on_screen_text = COALESCE(?, on_screen_text),
        video_prompt = COALESCE(?, video_prompt),
        visual_style = COALESCE(?, visual_style),
        duration_seconds = COALESCE(?, duration_seconds),
        image_url = COALESCE(?, image_url),
        aspect_ratio = COALESCE(?, aspect_ratio)
      WHERE id = ?
    `).run(
      title, content, dialogue_script, camera_angle, camera_movement, shot_size,
      action_description, audio_foley, on_screen_text, video_prompt, visual_style,
      duration_seconds, image_url, aspect_ratio, id
    );

    const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Batch update prompts (reordering, batch editing)
app.put('/api/prompts-batch', (req, res) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: 'ข้อมูลอัปเดตไม่ถูกต้อง' });
    }

    const updateStmt = db.prepare(`
      UPDATE prompts SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        step_number = COALESCE(?, step_number),
        sort_order = COALESCE(?, sort_order),
        camera_angle = COALESCE(?, camera_angle),
        duration_seconds = COALESCE(?, duration_seconds),
        action_description = COALESCE(?, action_description),
        dialogue_script = COALESCE(?, dialogue_script),
        video_prompt = COALESCE(?, video_prompt),
        audio_foley = COALESCE(?, audio_foley)
      WHERE id = ?
    `);

    for (const item of updates) {
      if (item.id) {
        updateStmt.run(
          item.title,
          item.content,
          item.step_number,
          item.sort_order,
          item.camera_angle,
          item.duration_seconds,
          item.action_description,
          item.dialogue_script,
          item.video_prompt,
          item.audio_foley,
          item.id
        );
      }
    }

    res.json({ success: true, message: `อัปเดต ${updates.length} ช็อตเรียบร้อย` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a shot
app.delete('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM prompts WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'ไม่พบช็อตที่ต้องการลบ' });
    }
    res.json({ success: true, message: 'ลบช็อตเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Copy counter
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

// Toggle/Reset shot image to clean slate
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

// ==========================================
// 3. STORYBOARD DIRECTOR & PLANNING PIPELINE
// ==========================================

app.post('/api/storyboard/ai-plan', async (req, res) => {
  try {
    const {
      story_concept,
      num_shots = 6,
      target_duration = 30,
      pacing = 'normal',
      style = 'Cinematic Film',
      visual_style = 'Cinematic Film',
      aspect_ratio = '16:9'
    } = req.body;

    if (!story_concept || !story_concept.trim()) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุพล็อตเรื่องหรือคอนเซปต์' });
    }

    const chosenStyle = visual_style || style;

    // Check if user pasted a structured multi-scene script (Scene 1..N, ฉากที่ 1..N)
    const parsedScript = parseMultiSceneScript(story_concept);
    let planData = null;

    if (parsedScript && parsedScript.shots && parsedScript.shots.length >= 2) {
      console.log(`[Script Parser] Directly detected ${parsedScript.shots.length} structured scenes from prompt.`);
      const enrichedShots = await Promise.all(parsedScript.shots.map(async (s, idx) => {
        let enPrompt = s.prompt || s.content || s.title || '';
        if (/[\u0E00-\u0E7F]/.test(enPrompt)) {
          const tr = await aiService.translateToEnglish(enPrompt);
          enPrompt = `${s.camera_angle || 'Cinematic Shot'}, ${tr}, ${parsedScript.visual_style || chosenStyle}, hyper-realistic, crisp details, 8k`;
        }
        return {
          ...s,
          shot_number: idx + 1,
          prompt: enPrompt,
          content: enPrompt,
          aspect_ratio: aspect_ratio,
          image_url: s.image_url || getStoryboardSketch({ ...s, step_number: idx + 1, aspect_ratio: aspect_ratio })
        };
      }));
      planData = {
        project_title: parsedScript.project_title,
        logline: `สตอรี่บอร์ด ${enrichedShots.length} ฉาก จากบทสคริปต์ (${parsedScript.visual_style || chosenStyle})`,
        total_shots: enrichedShots.length,
        total_scenes: enrichedShots.length,
        target_duration: parsedScript.total_duration || target_duration,
        total_duration: parsedScript.total_duration || target_duration,
        pacing: pacing,
        shots: enrichedShots
      };
    } else {
      // Call modern AI Director
      planData = await aiService.planStoryboard({
        story_concept,
        num_shots,
        target_duration,
        pacing,
        visual_style: chosenStyle,
        aspect_ratio
      });
    }

    res.json({
      success: true,
      data: planData,
      visual_style: chosenStyle
    });
  } catch (err) {
    console.error('[Storyboard AI Plan Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Commit planned shots into the board as prompts
app.post('/api/storyboard/commit-shots', async (req, res) => {
  try {
    const { shots, project_title, visual_style = 'Cinematic Film', target_duration = 30, pacing = 'normal', aspect_ratio = '16:9' } = req.body;
    if (!shots || !Array.isArray(shots) || shots.length === 0) {
      return res.status(400).json({ success: false, error: 'ไม่พบรายการช็อต' });
    }

    const seriesId = 'series-sb-' + Date.now();
    const finalTitle = project_title || `สตอรี่บอร์ดงานภาพยนตร์ (${shots.length} ช็อต)`;

    let timeSec = 0;
    const formatSec = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secPart = seconds % 60;
      const sStr = secPart < 10 ? '0' + secPart.toFixed(1) : secPart.toFixed(1);
      return `${mins}:${sStr}`;
    };

    const finalShots = shots.map((s, idx) => {
      const dur = parseFloat(s.duration_seconds) || 2.5;
      const startSec = timeSec;
      const endSec = Math.round((startSec + dur) * 10) / 10;
      timeSec = endSec;

      return {
        ...s,
        step_number: idx + 1,
        sort_order: idx + 1,
        duration_seconds: dur,
        aspect_ratio: s.aspect_ratio || aspect_ratio,
        timecode: `${formatSec(startSec)} - ${formatSec(endSec)} (${dur}s)`
      };
    });

    const totalDurationSec = Math.round(timeSec * 10) / 10;

    // Create series entry
    const insertSeries = db.prepare(`
      INSERT INTO series (id, title, description, summary, target_duration, pacing)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertSeries.run(
      seriesId,
      finalTitle,
      `ความยาว ${totalDurationSec} วิ (${shots.length} ช็อต • สไตล์ ${visual_style})`,
      `ชุดสตอรี่บอร์ดจัดวางมุมกล้อง ละเอียดครบทั้ง Video Prompt, Audio Foley, Scene Breakdown และสคริปต์บรรยาย`,
      totalDurationSec,
      pacing
    );

    // Insert all shots
    const insertPrompt = db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle,
        prompt_type, recommended_tool, aspect_ratio, content,
        dialogue_script, variables_schema, image_url, reference_image,
        copy_count, sort_order, is_active, camera_angle, shot_size,
        video_prompt, audio_foley, on_screen_text, camera_movement,
        action_description, visual_style, scene_number, scene_title,
        duration_seconds, timecode
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        0, ?, 1, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `);

    const createdRows = [];

    for (const s of finalShots) {
      const pId = 'shot-' + Date.now() + '-' + s.step_number;
      let finalImg = s.image_url;
      if (!finalImg || !finalImg.trim()) {
        finalImg = getStoryboardSketch({
          ...s,
          step_number: s.step_number,
          aspect_ratio: s.aspect_ratio || aspect_ratio
        });
      }

      insertPrompt.run(
        pId,
        seriesId,
        s.step_number,
        `ช็อตที่ ${s.step_number}`,
        s.title || `ช็อตที่ ${s.step_number}`,
        s.camera_angle_th || s.camera_angle || 'Medium Shot',
        'first_frame',
        'Midjourney / Flux / Kling',
        s.aspect_ratio || aspect_ratio,
        s.prompt || s.content || s.title,
        s.dialogue || s.dialogue_script || '',
        null,
        finalImg,
        s.reference_image || null,
        s.sort_order,
        s.camera_angle || 'Medium Shot',
        s.lens_focal || s.shot_size || '35mm',
        s.video_prompt || `Cinematic camera motion capturing ${s.title}`,
        s.audio_foley || 'เสียงบรรยากาศคมชัดและดนตรีประกอบ',
        s.on_screen_text || null,
        s.camera_movement || 'Static Lock-off',
        s.action_description || s.title,
        visual_style,
        s.scene_number || 1,
        s.scene_title || 'ฉากที่ 1',
        s.duration_seconds,
        s.timecode
      );

      createdRows.push(db.prepare('SELECT * FROM prompts WHERE id = ?').get(pId));
    }

    res.json({
      success: true,
      series_id: seriesId,
      total_shots: createdRows.length,
      total_duration: totalDurationSec,
      data: createdRows
    });
  } catch (err) {
    console.error('[Commit Storyboard Exception]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Append a single shot into current active project
app.post('/api/storyboard/append-shot', async (req, res) => {
  try {
    const { series_id, shot } = req.body;
    if (!series_id || !shot) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
    }

    const currentShots = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE series_id = ?').get(series_id);
    const nextStep = (currentShots.count || 0) + 1;
    const pId = 'shot-' + Date.now() + '-' + nextStep;

    const sketch = getStoryboardSketch({
      ...shot,
      step_number: nextStep,
      aspect_ratio: shot.aspect_ratio || '16:9'
    });

    const insert = db.prepare(`
      INSERT INTO prompts (
        id, series_id, step_number, step_title, title, subtitle,
        prompt_type, recommended_tool, aspect_ratio, content,
        dialogue_script, image_url, copy_count, sort_order,
        is_active, camera_angle, shot_size, video_prompt,
        audio_foley, on_screen_text, camera_movement, action_description,
        visual_style, scene_number, scene_title, duration_seconds, timecode
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        'first_frame', 'Midjourney / Flux / Kling', ?, ?,
        ?, ?, 0, ?,
        1, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    insert.run(
      pId,
      series_id,
      nextStep,
      `ช็อตที่ ${nextStep}`,
      shot.title || `ช็อตที่ ${nextStep}`,
      shot.camera_angle || 'Medium Shot',
      shot.aspect_ratio || '16:9',
      shot.prompt || shot.action_description || 'ช็อตใหม่',
      shot.dialogue || '',
      shot.image_url || sketch,
      nextStep,
      shot.camera_angle || 'Medium Shot',
      shot.lens_focal || '35mm',
      shot.video_prompt || `Cinematic camera motion of ${shot.title || 'shot'}`,
      shot.audio_foley || 'เสียงบรรยากาศ',
      shot.on_screen_text || null,
      shot.camera_movement || 'Static Lock-off',
      shot.action_description || shot.prompt || '',
      shot.visual_style || 'Cinematic Film',
      shot.scene_number || 1,
      shot.scene_title || 'ฉากเพิ่มเติม',
      shot.duration_seconds || 2.5,
      `${nextStep * 2.5}s`
    );

    const inserted = db.prepare('SELECT * FROM prompts WHERE id = ?').get(pId);
    res.json({ success: true, data: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. SETTINGS & UTILITY ENDPOINTS
// ==========================================

// Settings API for user custom keys
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      has_pollinations_key: !!config.POLLINATIONS_API_KEY,
      has_gemini_key: !!config.GEMINI_API_KEY,
      has_openai_key: !!config.OPENAI_API_KEY
    }
  });
});

app.post('/api/settings', (req, res) => {
  try {
    const { pollinations_key, gemini_key, openai_key } = req.body;
    if (pollinations_key !== undefined) config.POLLINATIONS_API_KEY = pollinations_key.trim();
    if (gemini_key !== undefined) config.GEMINI_API_KEY = gemini_key.trim();
    if (openai_key !== undefined) config.OPENAI_API_KEY = openai_key.trim();

    res.json({
      success: true,
      data: {
        has_pollinations_key: !!config.POLLINATIONS_API_KEY,
        has_gemini_key: !!config.GEMINI_API_KEY,
        has_openai_key: !!config.OPENAI_API_KEY
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// High-res Image Upload
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'กรุณาแนบไฟล์รูปภาพ' });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'รูปแบบรูปภาพ Base64 ไม่ถูกต้อง' });
    }

    const ext = filename ? path.extname(filename).toLowerCase() || '.png' : '.png';
    const cleanBaseName = filename ? path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_') : 'image';
    const uniqueFileName = `ref_${Date.now()}_${cleanBaseName}${ext}`;

    const uploadsDir = path.join(__dirname, '..', 'client', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, uniqueFileName);
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    res.json({
      success: true,
      data: {
        url: publicUrl,
        size_mb: (buffer.length / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stats API
app.get('/api/stats', (req, res) => {
  try {
    const totalPrompts = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE is_active = 1').get();
    const totalSeries = db.prepare('SELECT COUNT(*) as count FROM series').get();
    const totalCopies = db.prepare('SELECT SUM(copy_count) as total FROM prompts').get();

    res.json({
      success: true,
      data: {
        totalPrompts: totalPrompts.count,
        totalSeries: totalSeries.count,
        totalCopies: totalCopies.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Clear All Data
app.post('/api/admin/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM prompts').run();
    db.prepare('DELETE FROM series').run();
    res.json({ success: true, message: 'ล้างกระดานสตอรี่บอร์ดทั้งหมดเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. PRODUCTION STATIC FILE SERVING
// ==========================================

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
  console.log(`🚀 CineBoard Studio Server running on http://localhost:${PORT}`);
});
