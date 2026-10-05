/**
 * Universal Multi-Scene Script Parser & Storyboard Generator (Client Edition)
 * Parses freeform and structured multi-scene scripts (e.g. Scene 1..N, ฉากที่ 1..N)
 * Fully offline, no Groq or internet required!
 */

export function parseMultiSceneScript(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return null;
  }

  const text = rawText.trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Detect Project Title
  let projectTitle = '';
  const titleLine = lines.find(l => /^(?:[🎬🎥\s]*(?:Prompt\s*\d+\s*:|Title\s*:|เรื่อง\s*:|ชื่อเรื่อง\s*:))/i.test(l));
  if (titleLine) {
    projectTitle = titleLine.replace(/^[🎬🎥\s]*(?:Prompt\s*\d+\s*:|Title\s*:|เรื่อง\s*:|ชื่อเรื่อง\s*:)\s*/i, '').replace(/["“”]/g, '').trim();
  } else {
    if (lines[0] && !/^(?:Scene|Shot|ฉาก|ช็อต|ซีน|\d+\.)/i.test(lines[0])) {
      projectTitle = lines[0].replace(/^[🎬🎥\s*#*-]+/, '').replace(/["“”]/g, '').trim();
    }
  }
  if (!projectTitle || projectTitle.length < 3) {
    projectTitle = 'โปรเจกต์สตอรี่บอร์ดงานภาพยนตร์';
  }

  // 2. Detect Visual Style
  let visualStyle = 'ภาพยนตร์พรีเมียม (Macro Cinematic Commercial)';
  const styleLine = lines.find(l => /^Visual\s*Style\s*:/i.test(l));
  if (styleLine) {
    visualStyle = styleLine.replace(/^Visual\s*Style\s*:\s*/i, '').trim();
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

      const blockLines = blockText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const contentLines = blockLines.slice(1);

      let shotPrompt = '';
      let actionDesc = '';
      let foleyDesc = '';
      let dialogueText = '';

      const promptIdx = contentLines.findIndex(l => /^Prompt\s*:\s*/i.test(l));
      if (promptIdx !== -1) {
        shotPrompt = contentLines[promptIdx].replace(/^Prompt\s*:\s*/i, '').trim();
        for (let j = promptIdx + 1; j < contentLines.length; j++) {
          if (/^(?:Audio|Foley|Camera|Dialogue|Text|ซาวด์|เสียง|มุมกล้อง)\s*:/i.test(contentLines[j])) break;
          shotPrompt += ' ' + contentLines[j];
        }
      } else {
        shotPrompt = contentLines.join(' ');
      }

      const audioLine = contentLines.find(l => /^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:/i.test(l));
      if (audioLine) {
        foleyDesc = audioLine.replace(/^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:\s*/i, '').trim();
      }

      const dialogueLine = contentLines.find(l => /^(?:Dialogue|บทพูด|เสียงพากย์)\s*:/i.test(l));
      if (dialogueLine) {
        dialogueText = dialogueLine.replace(/^(?:Dialogue|บทพูด|เสียงพากย์)\s*:\s*/i, '').trim();
      }

      shotPrompt = shotPrompt.trim();
      actionDesc = shotPrompt || current.title;

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

      if (lowerPrompt.includes('key') || lowerPrompt.includes('smart key') || lowerPrompt.includes('door handle') || lowerPrompt.includes('smart access') || lowerPrompt.includes('กุญแจ')) {
        sketchTheme = 'car_smart_key_door';
        if (!foleyDesc) foleyDesc = 'เสียงสัมผัสกุญแจสมาร์ทคีย์และเสียงเปิดล็อกเซ็นทรัลล็อกนุ่มนวล (Soft key click)';
      } else if (lowerPrompt.includes('peel') || lowerPrompt.includes('unpeel') || lowerPrompt.includes('screen') || lowerPrompt.includes('film') || lowerPrompt.includes('console') || lowerPrompt.includes('ฟิล์ม') || lowerPrompt.includes('ลอก')) {
        sketchTheme = 'car_unpeeling_screen';
        if (!foleyDesc) foleyDesc = 'เสียงลอกแผ่นฟิล์มใส ASMR ชัดเจน กรอบแกรบสะกดใจ ชวนผ่อนคลาย (Satisfying Film Peel)';
      } else if (lowerPrompt.includes('tactile') || lowerPrompt.includes('dial') || lowerPrompt.includes('knob') || lowerPrompt.includes('climate') || lowerPrompt.includes('control dial') || lowerPrompt.includes('ปุ่มหมุน') || lowerPrompt.includes('แอร์')) {
        sketchTheme = 'car_dial_knob';
        if (!foleyDesc) foleyDesc = 'เสียงคลิกหมุนปุ่มเมทัลลิก แน่น นุ่มนวล เกรดพรีเมียม (Precision Metallic Dial Click)';
      } else if (lowerPrompt.includes('stitch') || lowerPrompt.includes('leather') || lowerPrompt.includes('steering') || lowerPrompt.includes('เย็บ') || lowerPrompt.includes('หนังแท้') || lowerPrompt.includes('พวงมาลัย')) {
        sketchTheme = 'car_leather_stitching';
        if (!foleyDesc) foleyDesc = 'เสียงสัมผัสลูบไล้หนังแท้เย็บมือสัมผัสนุ่มนวล (Soft Leather Grain Rustle)';
      } else if (lowerPrompt.includes('thud') || lowerPrompt.includes('door') || lowerPrompt.includes('ประตู') || lowerPrompt.includes('ปิดประตู') || lowerPrompt.includes('solid')) {
        sketchTheme = 'car_door_thud';
        if (!foleyDesc) foleyDesc = 'เสียงประตูปิด "ตึ้บ" ทุ้มแน่น หนักแน่น ไร้เสียงสะท้อน (Acoustic Solid Thud)';
      }

      if (!foleyDesc) {
        foleyDesc = `เสียง Foley สัมผัสวัสดุธรรมชาติ สไตล์ ASMR ระดับมาสเตอร์`;
      }

      const liveActionGuide = `การจัดแสง: Soft Natural Daylight เสริม Rim Light แยกพื้นผิว | เลนส์: ${lensFocal} | ควบคุมความเร็วช็อตให้ช้าและนุ่มนวลเพื่อมู้ด ASMR`;

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

  let curTime = 0;
  parsedShots.forEach((s) => {
    const startSec = curTime;
    const endSec = Math.round((startSec + s.duration_seconds) * 10) / 10;
    curTime = endSec;
    const formatSec = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secPart = seconds % 60;
      const sStr = secPart < 10 ? '0' + secPart.toFixed(1) : secPart.toFixed(1);
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
