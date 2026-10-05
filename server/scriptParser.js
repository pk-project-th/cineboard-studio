/**
 * Universal Multi-Scene Script Parser & Storyboard Generator
 * Parses freeform and structured multi-scene scripts (e.g. Scene 1..N, ฉากที่ 1..N)
 * Fully offline, no Groq or internet required!
 */

function normalizeScriptText(rawText) {
  if (!rawText) return '';
  let text = String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Insert double newline before Scene / Shot headers if glued to previous sentence without newline
  text = text.replace(/([^\n])\s*(?:(?:Scene|Shot|ฉากที่|ฉาก|ช็อตที่|ช็อต|ซีน)\s*(\d+)[\s:：.-]*)/gi, '$1\n\nScene $2: ');

  // Insert newline before Prompt:
  text = text.replace(/([^\n])\s*(Prompt\s*[:：])/gi, '$1\n$2');

  // Insert newline before Visual Style Reference / Visual Style:
  text = text.replace(/([^\n])\s*(Visual\s*Style(?:[^\n:：]*?)?[:：])/gi, '$1\n$2');

  // Insert newline before Audio / Foley / Sound / Dialogue
  text = text.replace(/([^\n])\s*((?:Audio|Foley|Sound|เสียง|ซาวด์|Dialogue|บทพูด)\s*[:：])/gi, '$1\n$2');

  return text;
}

function parseMultiSceneScript(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return null;
  }

  const text = normalizeScriptText(rawText).trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Detect Project Title
  let projectTitle = '';
  const titleMatch = text.match(/^[🎬🎥\s]*(?:(?:Prompt|Content|คอนเทนต์|บท|สคริปต์)\s*\d*\s*[:：]|(?:Title|เรื่อง|ชื่อเรื่อง)\s*[:：])\s*([^\n\r]+)/im);
  if (titleMatch) {
    let rawTitle = titleMatch[1].trim();
    rawTitle = rawTitle.replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
    if (rawTitle.length >= 2) projectTitle = rawTitle;
  } else {
    // If first line doesn't start with Scene/Shot, use first line as title
    if (lines[0] && !/^(?:Scene|Shot|ฉาก|ช็อต|ซีน|\d+\.)/i.test(lines[0])) {
      projectTitle = lines[0].replace(/^[🎬🎥\s*#*-]+/, '').replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
    }
  }
  if (!projectTitle || projectTitle.length < 3) {
    projectTitle = 'โปรเจกต์สตอรี่บอร์ดงานภาพยนตร์';
  }

  // 2. Detect Visual Style
  let visualStyle = 'ภาพยนตร์พรีเมียม (Macro Cinematic Commercial)';
  const styleMatch = text.match(/Visual\s*Style(?:[^\n:：]*?)?[:：]\s*([^\n\r]+)/i);
  if (styleMatch) {
    let s = styleMatch[1].trim().replace(/(?:Scene|Shot|ฉาก).*$/i, '').trim();
    if (s) visualStyle = s;
  }

  // 3. Split by Scene / Shot headers
  const sceneHeaderRegex = /(?:^|\n)\s*(?:(?:Scene|Shot|ฉากที่|ฉาก|ช็อตที่|ช็อต|ซีน)\s*(\d+)[\s:：.-]*([^\n]*)|(\d+)[.)]\s*([^\n]+))/gi;

  const headerMatches = [];
  let m;
  while ((m = sceneHeaderRegex.exec(text)) !== null) {
    const sceneNum = parseInt(m[1] || m[3], 10);
    const sceneTitle = (m[2] || m[4] || '').trim();
    headerMatches.push({
      index: m.index,
      sceneNum: sceneNum,
      title: sceneTitle
    });
  }

  const parsedShots = [];

  if (headerMatches.length > 0) {
    for (let i = 0; i < headerMatches.length; i++) {
      const current = headerMatches[i];
      const startIdx = current.index;
      const endIdx = (i + 1 < headerMatches.length) ? headerMatches[i + 1].index : text.length;
      const blockText = text.substring(startIdx, endIdx).trim();

      // Within blockText, separate header, prompt, audio, etc.
      const blockLines = blockText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      // Remove first line (header)
      const contentLines = blockLines.slice(1);

      let shotPrompt = '';
      let actionDesc = '';
      let foleyDesc = '';
      let dialogueText = '';

      // Check for "Prompt: ..."
      const promptIdx = contentLines.findIndex(l => /^Prompt\s*:\s*/i.test(l));
      if (promptIdx !== -1) {
        shotPrompt = contentLines[promptIdx].replace(/^Prompt\s*:\s*/i, '').trim();
        // If there are subsequent lines before next tag, append
        for (let j = promptIdx + 1; j < contentLines.length; j++) {
          if (/^(?:Audio|Foley|Camera|Dialogue|Text|ซาวด์|เสียง|มุมกล้อง)\s*:/i.test(contentLines[j])) break;
          shotPrompt += ' ' + contentLines[j];
        }
      } else {
        // Entire remaining block is the prompt
        shotPrompt = contentLines.join(' ');
      }

      // Check for Audio / Foley
      const audioLine = contentLines.find(l => /^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:/i.test(l));
      if (audioLine) {
        foleyDesc = audioLine.replace(/^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:\s*/i, '').trim();
      }

      // Check for Dialogue
      const dialogueLine = contentLines.find(l => /^(?:Dialogue|บทพูด|เสียงพากย์)\s*:/i.test(l));
      if (dialogueLine) {
        dialogueText = dialogueLine.replace(/^(?:Dialogue|บทพูด|เสียงพากย์)\s*:\s*/i, '').trim();
      }

      // Clean up prompt
      shotPrompt = shotPrompt.trim();
      actionDesc = shotPrompt || current.title;

      // Extract camera angle & focal lens from prompt text
      const lowerPrompt = (shotPrompt + ' ' + current.title).toLowerCase();
      let cameraAngle = 'Medium Shot';
      let cameraAngleTh = 'ภาพมุมปานกลาง';
      let cameraMovement = 'Slow push-in with subtle motion';
      let lensFocal = '50mm f/1.8';
      let sketchTheme = '';

      if (lowerPrompt.includes('extreme close-up') || lowerPrompt.includes('extreme close up')) {
        cameraAngle = 'Extreme Close-Up';
        cameraAngleTh = 'โคลสอัพเจาะลึกพิเศษ';
        lensFocal = '85mm f/1.4';
        cameraMovement = 'Subtle rack focus onto metallic texture';
      } else if (lowerPrompt.includes('macro')) {
        cameraAngle = 'Macro Shot';
        cameraAngleTh = 'มาโครเจาะรายละเอียด';
        lensFocal = '100mm Macro';
        cameraMovement = 'Ultra smooth linear slider crawl';
      } else if (lowerPrompt.includes('over-the-shoulder') || lowerPrompt.includes('over the shoulder')) {
        cameraAngle = 'Over-the-Shoulder';
        cameraAngleTh = 'ข้ามหัวไหล่';
        lensFocal = '35mm f/2.0';
        cameraMovement = 'Slow creeping push-in over shoulder';
      } else if (lowerPrompt.includes('medium close-up') || lowerPrompt.includes('medium close up')) {
        cameraAngle = 'Medium Close-Up';
        cameraAngleTh = 'ปานกลางค่อนข้างใกล้';
        lensFocal = '50mm f/1.8';
        cameraMovement = 'Steady-cam lock-off with micro parallax';
      } else if (lowerPrompt.includes('close-up') || lowerPrompt.includes('close up')) {
        cameraAngle = 'Close-Up';
        cameraAngleTh = 'โคลสอัพใกล้';
        lensFocal = '50mm f/1.8';
        cameraMovement = 'Gentle handheld floating feel';
      } else if (lowerPrompt.includes('wide')) {
        cameraAngle = 'Wide Shot';
        cameraAngleTh = 'ภาพมุมกว้าง';
        lensFocal = '24mm Cine';
        cameraMovement = 'Slow establishing dolly back';
      }

      // Specific ASMR / Automotive craftsmanship mapping (Strict Priority Order)
      // 1. EV Charging Port (Must check BEFORE generic door!)
      if (lowerPrompt.includes('charging port') || lowerPrompt.includes('พอร์ตชาร์จ') || lowerPrompt.includes('charging flap') || lowerPrompt.includes('charge port') || lowerPrompt.includes('ชาร์จไฟ') || lowerPrompt.includes('ปลั๊กชาร์จ')) {
        sketchTheme = 'car_ev_charging_port';
        if (!foleyDesc) foleyDesc = 'เสียงมอเตอร์ปลดล็อกฝาพอร์ตชาร์จเปิดนุ่มนวล พร้อมเสียงสัญญาณไฟ LED (Futuristic EV Flap Opening)';
      }
      // 2. Panoramic Glass Sunroof (Must check BEFORE leather seats!)
      else if (lowerPrompt.includes('sunroof') || lowerPrompt.includes('panoramic') || lowerPrompt.includes('หลังคาแก้ว') || lowerPrompt.includes('glass roof') || lowerPrompt.includes('ซันรูฟ')) {
        sketchTheme = 'car_panoramic_sunroof';
        if (!foleyDesc) foleyDesc = 'เสียงเลื่อนแผงหลังคากระจกบานใหญ่ เงียบสนิท ไร้แรงสั่นสะเทือน (Silky Smooth Sunroof Slide)';
      }
      // 3. EV Boot-up Screen / Digital Instrument Cluster
      else if (lowerPrompt.includes('boot-up') || lowerPrompt.includes('boot up') || lowerPrompt.includes('bootup') || lowerPrompt.includes('instrument cluster') || lowerPrompt.includes('เปิดระบบ ev') || lowerPrompt.includes('wake up') || lowerPrompt.includes('waking up') || (lowerPrompt.includes('digital') && lowerPrompt.includes('dashboard')) || lowerPrompt.includes('หน้าปัด')) {
        sketchTheme = 'car_ev_bootup_screen';
        if (!foleyDesc) foleyDesc = 'เสียง Chime ต้อนรับระบบดิจิทัล EV คมชัด คลื่นเสียงไซไฟหรูหรา (Harmonic EV System Chime)';
      }
      // 4. Front Engine Hood Lift / Frunk
      else if (lowerPrompt.includes('hood') || lowerPrompt.includes('ฝากระโปรง') || lowerPrompt.includes('front hood') || lowerPrompt.includes('lifting the front hood') || lowerPrompt.includes('mechanical joints')) {
        sketchTheme = 'car_hood_lift';
        if (!foleyDesc) foleyDesc = 'เสียงกลไกล็อกฝากระโปรงปลดล็อกและเสียงโช้คอัพลมดันขึ้นอย่างนุ่มนวล (Solid Hydraulic Strut Lift)';
      }
      // 5. Center Commander Rotary Dial (Console)
      else if (lowerPrompt.includes('center commander') || lowerPrompt.includes('commander') || lowerPrompt.includes('แป้นควบคุม') || (lowerPrompt.includes('center console') && (lowerPrompt.includes('dial') || lowerPrompt.includes('knob') || lowerPrompt.includes('rotat')))) {
        sketchTheme = 'car_center_commander';
        if (!foleyDesc) foleyDesc = 'เสียงคลิกหมุนแป้นคอมมานเดอร์อลูมิเนียม แน่น ละเอียดระดับไมครอน (Tactile Rotary Dial Clicks)';
      }
      // 6. Smart Key Access
      else if (lowerPrompt.includes('key') || lowerPrompt.includes('smart key') || lowerPrompt.includes('door handle') || lowerPrompt.includes('smart access') || lowerPrompt.includes('กุญแจ')) {
        sketchTheme = 'car_smart_key_door';
        if (!foleyDesc) foleyDesc = 'เสียงสัมผัสกุญแจสมาร์ทคีย์และเสียงเปิดล็อกเซ็นทรัลล็อกนุ่มนวล (Soft key click)';
      }
      // 7. Protective Screen Film Peel
      else if (lowerPrompt.includes('peel') || lowerPrompt.includes('unpeel') || lowerPrompt.includes('protective film') || (lowerPrompt.includes('film') && lowerPrompt.includes('screen')) || lowerPrompt.includes('ฟิล์ม') || lowerPrompt.includes('ลอก')) {
        sketchTheme = 'car_unpeeling_screen';
        if (!foleyDesc) foleyDesc = 'เสียงลอกแผ่นฟิล์มใส ASMR ชัดเจน กรอบแกรบสะกดใจ ชวนผ่อนคลาย (Satisfying Film Peel)';
      }
      // 8. Tactile Climate AC Knob
      else if (lowerPrompt.includes('tactile') || lowerPrompt.includes('climate control') || (lowerPrompt.includes('dial') && lowerPrompt.includes('dashboard')) || lowerPrompt.includes('control dial') || lowerPrompt.includes('ปุ่มหมุน') || lowerPrompt.includes('ปุ่มปรับแอร์') || lowerPrompt.includes('แอร์')) {
        sketchTheme = 'car_dial_knob';
        if (!foleyDesc) foleyDesc = 'เสียงคลิกหมุนปุ่มเมทัลลิก แน่น นุ่มนวล เกรดพรีเมียม (Precision Metallic Dial Click)';
      }
      // 9. Leather & Stitching
      else if (lowerPrompt.includes('stitch') || lowerPrompt.includes('leather steering') || (lowerPrompt.includes('leather') && lowerPrompt.includes('steering')) || (lowerPrompt.includes('leather') && lowerPrompt.includes('wheel')) || lowerPrompt.includes('เย็บ') || lowerPrompt.includes('หนังแท้') || lowerPrompt.includes('พวงมาลัย')) {
        sketchTheme = 'car_leather_stitching';
        if (!foleyDesc) foleyDesc = 'เสียงสัมผัสลูบไล้หนังแท้เย็บมือสัมผัสนุ่มนวล (Soft Leather Grain Rustle)';
      }
      // 10. Door Solid Thud
      else if (lowerPrompt.includes('thud') || lowerPrompt.includes('door fully closed') || lowerPrompt.includes('closing') || lowerPrompt.includes('ปิดประตู') || lowerPrompt.includes('heavy, glossy') || lowerPrompt.includes('solid thud')) {
        sketchTheme = 'car_door_thud';
        if (!foleyDesc) foleyDesc = 'เสียงประตูปิด "ตึ้บ" ทุ้มแน่น หนักแน่น ไร้เสียงสะท้อน (Acoustic Solid Thud)';
      }

      // Default audio foley if not set
      if (!foleyDesc) {
        foleyDesc = `เสียง Foley สัมผัสวัสดุธรรมชาติ สไตล์ ASMR ระดับมาสเตอร์`;
      }

      // Live action filming guide
      const liveActionGuide = `การจัดแสง: Soft Natural Daylight เสริม Rim Light แยกพื้นผิว | เลนส์: ${lensFocal} | ควบคุมความเร็วช็อตให้ช้าและนุ่มนวลเพื่อมู้ด ASMR`;

      // Video prompt for Kling / Runway / Luma
      const videoPrompt = `[Camera: ${cameraMovement}] [Subject: ${shotPrompt}] [Style: ${visualStyle}] [Lighting: Soft natural daylight, hyper-realistic, depth of field] [Motion: 24fps cinema 4k].`;

      const shotNumber = current.sceneNum || (i + 1);
      const titleClean = current.title ? `ฉากที่ ${shotNumber}: ${current.title}` : `ฉากที่ ${shotNumber}`;

      parsedShots.push({
        shot_number: shotNumber,
        scene_number: shotNumber,
        scene_title: titleClean,
        title: titleClean,
        subtitle: `${cameraAngleTh} • ${lensFocal}`,
        camera_angle: cameraAngle,
        camera_angle_th: cameraAngleTh,
        camera_movement: cameraMovement,
        lens_focal: lensFocal,
        duration_seconds: 4.0,
        action_description: actionDesc,
        dialogue: dialogueText || 'ไม่มีเสียงพากย์ เน้นเสียงบรรยากาศ Foley ASMR แบบบริสุทธิ์',
        audio_foley: foleyDesc,
        on_screen_text: 'ไม่มีตัวหนังสือ เน้นความสะอาดตาของงานภาพ (Clean Frame)',
        prompt: shotPrompt,
        video_prompt: videoPrompt,
        live_action_guide: liveActionGuide,
        visual_style: visualStyle,
        aspect_ratio: '9:16',
        sketch_theme: sketchTheme
      });
    }
  }

  // Calculate timecodes
  let curTime = 0;
  parsedShots.forEach((s) => {
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
    project_title: projectTitle,
    visual_style: visualStyle,
    total_shots: parsedShots.length,
    total_duration: curTime,
    shots: parsedShots
  };
}

module.exports = { parseMultiSceneScript };
