/**
 * CineBoard Studio 4.0 — Dual-Mode Master Storyboard Director Engine
 * Mode 1: PHOTO STORYBOARD (📸 ภาพนิ่งระดับช่างภาพโลก — มิติ ความหมาย แสงเงา ท่าโพสไลฟ์สไตล์)
 *   References: Fan Ho, Steve McCurry, Saul Leiter, Henri Cartier-Bresson, Peter Lindbergh, William Eggleston, Alex Webb, Vivian Maier
 * Mode 2: VIRAL LIFESTYLE VIDEO (🎬 วิดีโอไวรัลไลฟ์สไตล์ — กี่ฉาก กี่วิ ถ่ายอะไร มุมกล้อง ทรานซิชัน เว้นที่วางข้อความ บทพากย์)
 */

function normalizeScriptText(rawText) {
  if (!rawText) return '';
  let text = String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (/(?:->|→|=>|➔)/.test(text) && !/(?:Scene|Shot|ฉากที่|\d+\.)/i.test(text)) {
    const parts = text.split(/(?:->|→|=>|➔)/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      text = parts.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
  }

  text = text.replace(/(?:^|\s+|[^\d])(?:(\d+)[\.\)]\s*|(?:ฉากที่|ช็อตที่|ซีนที่|ภาพที่|Scene|Shot)\s*(\d+)[:\s.-]*)/gi, (match, n1, n2, offset) => {
    const num = n1 || n2;
    return (offset > 0 ? '\n\n' : '') + 'Scene ' + num + ': ';
  });

  text = text.replace(/([^\n])\s*(Prompt\s*[:：])/gi, '$1\n$2');
  text = text.replace(/([^\n])\s*(Visual\s*Style(?:[^\n:：]*?)?[:：])/gi, '$1\n$2');
  text = text.replace(/([^\n])\s*((?:Audio|Foley|Sound|เสียง|ซาวด์|Dialogue|บทพูด|เสียงพากย์)\s*[:：])/gi, '$1\n$2');

  return text;
}

function extractCleanSubject(rawText) {
  if (!rawText) return 'ทริปไลฟ์สไตล์สุดชิลล์';
  let s = String(rawText)
    .split('\n')[0]
    .replace(/^[🎬🎥✨🚗🎧📱🔥🏖️⛩️☕📸#\s*\d.)\-]+/, '')
    .replace(/^(?:ขอสตอรี่บอร์ด|อยากได้สตอรี่บอร์ด|ช่วยคิดคอนเทนต์|อยากถ่ายคอนเทนต์|อยากถ่ายคลิป|อยากถ่ายรูป|ถ่ายภาพนิ่ง|เดินเล่นถ่ายรูป|เดินเล่น|พาไปเที่ยว|ไปเที่ยว|มาเที่ยว|พาเที่ยว|แวะเที่ยว|ไปนั่ง|มานั่ง|พามา|แวะ|รีวิว|คลิปสั้น|ไวรัล)\s*/gi, '')
    .replace(/(?:อยากถ่ายคลิป.*|อยากถ่ายคอนเทนต์.*|อยากถ่ายรูป.*|อยากได้คอนเทนต์.*|อยากได้รูป.*|อยากได้เซ็ต.*|อยากได้ภาพ.*|อยากได้มุม.*|ลง\s*tiktok.*|ลง\s*reels.*|ลง\s*ig.*|จะทำคอนเทนต์อย่างไร.*|จะทำคอนเท้นอย่างไร.*|ทำยังไงให้น่าสนใจ.*|ยังไงดี.*|หน่อยครับ.*|หน่อยค่ะ.*)$/gi, '')
    .replace(/(?:ขอ|เอา|จำนวน)\s*\d+\s*(?:ฉาก|ช็อต|ซีน|ภาพ|รูป|วินาที|วิ)/gi, '')
    .trim();
  if (!s || s.length < 2) s = String(rawText).trim().slice(0, 40);
  return s.slice(0, 50);
}

function selectEvenly(pool, count) {
  if (count <= 1) return [pool[0]];
  if (count >= pool.length) {
    const res = [...pool];
    while (res.length < count) {
      const idx = res.length + 1;
      const base = pool[res.length % pool.length];
      res.push({
        ...base,
        title: `${base.title} (มุมเสริมที่ ${idx})`
      });
    }
    return res;
  }
  const result = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (pool.length - 1)) / (count - 1));
    result.push(pool[idx]);
  }
  return result;
}

function getShotNarrativeRole(index, totalShots, mode = 'video') {
  if (mode === 'photo') {
    if (index === 0) {
      return {
        role: '🏆 ภาพปกดึงดูดสายตา (Cover Hero)',
        defaultDuration: 0,
        textSafeZone: '📐 เว้นพื้นที่ว่างด้านบน 25-30% สำหรับใส่พาดหัวปก Carousel (IG / Lemon8) ไม่ให้บังตัวแบบ'
      };
    }
    if (index === totalShots - 1) {
      return {
        role: '✨ ภาพปิดอัลบั้มประทับใจ (Closing Mood)',
        defaultDuration: 0,
        textSafeZone: '📐 จัดสมดุลภาพแบบ Minimal เว้นพื้นที่ขอบล่างสำหรับใส่พิกัดหรือเครดิต'
      };
    }
    const midRoles = [
      '🌿 ภาพเล่าบรรยากาศสถานที่ (Environmental)',
      '🎞️ ภาพมีเลเยอร์ 3 มิติ (Layered Depth)',
      '☕ ภาพเจาะดีเทลพักสายตา (Editorial Detail)',
      '💫 ภาพพอร์ตเทรตไลฟ์สไตล์ (Soulful Portrait)'
    ];
    return {
      role: midRoles[(index - 1) % midRoles.length],
      defaultDuration: 0,
      textSafeZone: '📐 จัดองค์ประกอบตามจุดตัด 9 ช่อง เว้นพื้นที่หายใจ (Negative Space) ให้ภาพดูโปร่งแพง'
    };
  }

  // Video Mode Viral Roles
  if (index === 0) {
    return {
      role: '🔥 HOOK 0-3 วิแรก (หยุดนิ้วคนดู)',
      defaultDuration: 2.5,
      textSafeZone: '📐 เว้นด้านบน 25% และขอบขวา 15% หลบปุ่มกดใจ/คอมเมนต์ของ TikTok & Reels'
    };
  }
  if (index === totalShots - 1) {
    return {
      role: '📌 ENDING & CTA (ชวนเซฟ/คอมเมนต์)',
      defaultDuration: 3.0,
      textSafeZone: '📐 จัดตัวแบบกึ่งกลางค่อนบน เว้นด้านล่าง 25% หลบแถบแคปชั่นเพื่อใส่สรุปพิกัด'
    };
  }
  if (index === 1) {
    return {
      role: '🚶 SETUP พาเข้าสู่เรื่องราว',
      defaultDuration: 2.5,
      textSafeZone: '📐 วางตัวแบบฝั่งซ้ายของเฟรม เว้นฝั่งขวาใส่ป้ายบอกสถานที่หรือเวลา'
    };
  }
  if (index === totalShots - 2 && totalShots >= 4) {
    return {
      role: '😍 REACTION & VIBE (ความรู้สึกจริง)',
      defaultDuration: 3.0,
      textSafeZone: '📐 เน้นสีหน้าและรอยยิ้มชัดๆ วางกลางเฟรมให้คนดูรู้สึกอินตาม'
    };
  }
  return {
    role: index % 2 === 0 ? '✨ HIGHLIGHT จุดพีคห้ามพลาด' : '🔍 B-ROLL เจาะดีเทลเร่งจังหวะ',
    defaultDuration: 2.5,
    textSafeZone: '📐 โฟกัสจุดเด่นกลางจอ หลบขอบขวาและขอบล่าง 20% สำหรับซับไตเติล'
  };
}

/**
 * ============================================================================
 * MODE 1: PHOTO STORYBOARD — World-Class Master Photographer Reference Engine
 * ============================================================================
 */
function buildMasterPhotoStoryboard(rawConcept, targetCount = 6) {
  const subject = extractCleanSubject(rawConcept);
  const t = String(rawConcept || '').toLowerCase();

  // Domain-specific context hints so every photo feels genuinely tailored to the user's lifestyle location
  let envProp = 'แก้วเครื่องดื่มหรือพร็อพคู่ใจ';
  let envArch = 'ซุ้มประตู ทางเดิน หรือแสงเงาของสถานที่';
  let envDetail = 'รายละเอียดพื้นผิว แสงแดดกระทบโต๊ะ หรือสิ่งของรอบตัว';
  let envColor = 'โทนสีอบอุ่นของสถานที่ตัดกับเสื้อผ้าโทนคลีน';

  if (/คาเฟ่|กาแฟ|มัทฉะ|ขนม|อาหาร|cafe|coffee|food/.test(t)) {
    envProp = 'แก้วกาแฟ/มัทฉะหรือจานขนมซิกเนเจอร์';
    envArch = 'กรอบหน้าต่างกระจกร้าน แสงแดดส่องพาดโต๊ะไม้';
    envDetail = 'แก้วกาแฟที่กำลังมีแสงแดดส่องทะลุน้ำแข็ง และลายไม้บนโต๊ะ';
    envColor = 'โทนน้ำตาลครีม-เขียวธรรมชาติของร้าน ตัดกับเสื้อผ้าโทนเอิร์ธโทน';
  } else if (/วัด|โบราณ|เมืองเก่า|เจดีย์|temple/.test(t)) {
    envProp = 'ดอกไม้ไหว้พระ พวงมาลัย หรือชุดโทนสุภาพ';
    envArch = 'ซุ้มประตูวัด เสาวิหาร และแนวระเบียงคดที่ทอดยาว';
    envDetail = 'ลวดลายกระเบื้องเคลือบ แสงแดดกระทบฉลุทอง หรือเงาน้ำ';
    envColor = 'สีทอง-อิฐส้มของสถาปัตยกรรม ตัดกับท้องฟ้าสีครามยามเย็น';
  } else if (/ทะเล|หาด|เกาะ|พูลวิลล่า|beach|sea/.test(t)) {
    envProp = 'หมวกสาน แว่นกันแดด หรือหนังสือเล่มโปรด';
    envArch = 'แนวเส้นขอบฟ้า ระเบียงริมทะเล หรือเงาใบมะพร้าว';
    envDetail = 'ฟองคลื่นกระทบทราย รองเท้าสาน หรือเครื่องดื่มเย็นๆ ริมสระ';
    envColor = 'สีฟ้าเทอร์ควอยซ์ของน้ำทะเล ตัดกับชุดสีขาวครีมหรือสีอุ่น';
  } else if (/ภูเขา|ดอย|แคมป์|หมอก|ธรรมชาติ|mountain|camp/.test(t)) {
    envProp = 'แก้วดริปกาแฟ เก้าอี้แคมป์ปิ้ง หรือเสื้อคลุมเอิร์ธโทน';
    envArch = 'แนวทิวเขา สายหมอกยามเช้า และเงาต้นสน';
    envDetail = 'ไอน้ำอุ่นจากแก้วกาแฟ หยดน้ำค้างบนใบไม้ หรือเตาแคมป์';
    envColor = 'สีเขียวเข้มของป่าและหมอกขาว ตัดกับโทนส้มอุ่นของแสงอาทิตย์';
  }

  const masterPool = [
    {
      title: `ภาพปก: มิติแสงเงาและสเกลอันน่าทึ่งของ ${subject}`,
      masterPhotographer: 'Fan Ho (ฟ่าน เหอ) — ราชาแห่งแสงเงาและเรขาคณิตเอเชีย',
      angle: 'Low Angle Hero Shot',
      angleTh: 'มุมเสยกว้าง เน้นสัดส่วนสถานที่กับลำแสงเงา (เลนส์ 0.5x หรือ 1x)',
      lens: 'เลนส์ 1x (24mm) หรือ 0.5x',
      depthTechnique: `ใช้เทคนิค Chiaroscuro (แสงสว่างตัดเงามืด) และ Scale: วางตัวแบบให้มีขนาดเล็กอยู่ตรงจุดที่แสงแดดส่องลงมา โดยมี${envArch}ขนาดใหญ่เป็นฉากหลังและเงาทอดยาวช่วยดึงสายตา`,
      storyMeaning: `สร้าง "ความรู้สึกยิ่งใหญ่ สงบ และน่าค้นหา" ตั้งแต่ภาพแรก ทำให้คนดูหยุดนิ้วและอยากปัดซ้ายดูรูปต่อในเซ็ตทันที`,
      poseGuide: `ยืนหันข้างหรือหันหลังเล็กน้อยรับลำแสง ปล่อยแขนสบายๆ เหมือนกำลังหยุดยืนซึมซับบรรยากาศ ไม่ต้องจ้องกล้องตรงๆ`,
      lightingTip: `☀️ ถ่ายช่วงเช้า (07:30-09:30) หรือบ่ายแก่ (15:30-17:30) แตะจอโฟกัสที่ส่วนสว่างแล้วดึง Exposure ลงเล็กน้อย (-0.3 ถึง -0.7) ให้เงาคมชัดมีมิติ`,
      action: `จัดเฟรมให้เห็น${envArch}ของ ${subject} เป็นกรอบใหญ่ แล้วให้ตัวแบบยืนในจุดที่แสงแดดส่องกระทบชัดเจน`,
      onScreenText: `📍 ${subject} — เก็บแสงเงาและช่วงเวลาดีๆ`,
      spaceGuide: `📐 เว้นพื้นที่ว่างด้านบน 30% (Negative Space) สำหรับวางชื่อทริปหรือปล่อยโล่งให้ภาพดูแพงแบบนิตยสาร`,
      promptEn: `Editorial lifestyle travel photography in the style of Fan Ho at ${subject}, dramatic golden hour shafts of sunlight casting long poetic shadows across architecture, human figure standing gracefully in light beam, high aesthetic depth and contrast, 35mm film look, 8k`
    },
    {
      title: `ภาพเลเยอร์ 3 มิติ: แอบมองผ่านฉากหน้าสู่ ${subject}`,
      masterPhotographer: 'Saul Leiter (ซอล ไลเตอร์) — บิดาแห่งภาพไลฟ์สไตล์มีเลเยอร์',
      angle: 'Medium Shot',
      angleTh: 'มุมระดับสายตา ถ่ายลอดผ่านฉากหน้าสร้างมิติ 3 ชั้น (เลนส์ 2x หรือ 3x)',
      lens: 'เลนส์ 2x / 3x Telephoto',
      depthTechnique: `ใช้เทคนิค Foreground Layering 3 ชั้น: ยืนห่างออกมาแล้วซูม 2x-3x ถ่ายทะลุขอบกระจก กิ่งไม้ ขอบโต๊ะ หรือกรอบประตู ให้ฉากหน้าเบลอละมุน (Layer 1) ➔ ตัวแบบคมชัด (Layer 2) ➔ บรรยากาศ${subject}เบลอหลัง (Layer 3)`,
      storyMeaning: `ให้ความรู้สึก "อบอุ่น เป็นส่วนตัว และละมุนตา" เหมือนภาพแอบถ่ายโมเมนต์จริงในหนังรัก (Poetic Candid) ไม่ดูจงใจโพสเกินไป`,
      poseGuide: `นั่งหรือยืนทำกิจกรรมตามธรรมชาติ เช่น กำลังหยิบ${envProp} มองออกไปด้านข้าง หรือก้มหน้ายิ้มเบาๆ`,
      lightingTip: `☀️ ใช้แสงธรรมชาติส่องจากด้านข้าง (Side Light) เพื่อให้ผิวหน้าและวัตถุมีมิติ แนะนำเปิดโหมด Portrait f/2.8-f/4 (ไม่เบลอปลอมเกินไป)`,
      action: `หาวัตถุใกล้เลนส์ (เช่น ใบไม้ ขอบกระจก หรือแจกัน) มาบังมุมซ้ายหรือขวาของเฟรม 20% แล้วโฟกัสทะลุไปที่ตัวแบบใน ${subject}`,
      onScreenText: `มุมเผลอๆ ที่ละมุนที่สุดของวัน 🍃`,
      spaceGuide: `📐 ใช้ฉากหน้าเบลอบังขอบซ้าย/ขวา เพื่อบีบสายตาคนดูพุ่งตรงไปที่ใบหน้าตัวแบบตรงกลาง`,
      promptEn: `Poetic lifestyle photography inspired by Saul Leiter at ${subject}, shooting softly through blurred foreground foliage and cafe window glass reflection, painterly warm colors, candid relaxed person in mid-ground, dreamy shallow depth of field, Kodak Portra 400 film aesthetic, 8k`
    },
    {
      title: `ภาพเล่าเรื่องสถานที่: กรอบซ้อนกรอบและเส้นนำสายตา`,
      masterPhotographer: 'Steve McCurry (สตีฟ แมคเคอร์รี) — ตำนาน National Geographic',
      angle: 'Wide Establishing Shot',
      angleTh: 'มุมกว้างใช้เส้นนำสายตา + กรอบธรรมชาติของสถานที่ (เลนส์ 1x)',
      lens: 'เลนส์ 1x (26-28mm)',
      depthTechnique: `ใช้เทคนิค Frame-within-a-Frame & Leading Lines: ใช้${envArch}เป็นเส้นนำสายตาพุ่งตรงไปยังตัวแบบที่ยืนบนจุดตัด 9 ช่อง พร้อมคุมคู่สีแบบ ${envColor}`,
      storyMeaning: `เล่าเรื่อง "ความสัมพันธ์ระหว่างคนกับสถานที่" ได้ครบในเฟรมเดียว ทำให้คนดูเห็นบริบทชัดเจนว่าที่นี่คือ ${subject} และบรรยากาศจริงน่าไปแค่ไหน`,
      poseGuide: `ยืนหรือเดินช้าๆ ตรงจุดตัด 9 ช่องฝั่งขวา หันลำตัวเฉียง 45 องศา แล้วหันหน้ากลับมามองกล้องด้วยแววตาสดใส`,
      lightingTip: `☀️ ถ่ายให้แสงส่องเข้าหน้าตัวแบบเฉียงๆ หลีกเลี่ยงแดดเที่ยงที่ตกใต้ตา ถ้าแดดแรงให้ยืนใต้ชายคาหรือร่มเงาแล้วหันหน้าออกหาแสง`,
      action: `ถอยหลังให้เห็นกรอบประตู/ทางเดินของ ${subject} ชัดเจน ให้เส้นพื้นหรือผนังนำสายตาตรงไปที่ตัวแบบ`,
      onScreenText: `บรรยากาศจริงของ ${subject} ✨`,
      spaceGuide: `📐 จัดตัวแบบบนจุดตัด 9 ช่องฝั่งขวา เว้นพื้นที่ฝั่งซ้ายให้เห็นเรื่องราวและบรรยากาศโดยรอบ`,
      promptEn: `National Geographic style editorial travel photograph inspired by Steve McCurry at ${subject}, natural architectural frame-within-a-frame and strong leading lines guiding eye to traveler on rule of thirds, rich harmonious natural color contrast, crisp storytelling depth, 8k`
    },
    {
      title: `ภาพจังหวะมีชีวิต: โมเมนต์ธรรมชาติที่ไม่ต้องเกร็ง`,
      masterPhotographer: 'Henri Cartier-Bresson (อองรี การ์ตีเย-แบรซง) — เจ้าแห่ง Decisive Moment',
      angle: 'Medium Shot',
      angleTh: 'มุมระดับสายตา เก็บจังหวะเคลื่อนไหวจริง (เลนส์ 1x หรือ 2x)',
      lens: 'เลนส์ 1x (35mm-50mm)',
      depthTechnique: `ใช้เทคนิค The Decisive Moment & Geometry: จัดฉากหลังให้เส้นสายเรขาคณิต (ขั้นบันได แนวเสา เส้นถนน) สมดุลก่อน แล้วค่อยกดถ่ายรัว (Burst Mode) ตอนตัวแบบกำลังก้าวเดิน หันหัวเราะ หรือขยับมือจริง`,
      storyMeaning: `ทำให้ภาพไลฟ์สไตล์ดู "มีชีวิตชีวา เป็นธรรมชาติ และน่าหลงใหล" แตกต่างจากภาพยืนแข็งทื่อหน้าแลนด์มาร์คทั่วไป`,
      poseGuide: `เดินก้าวเท้าสบายๆ ผ่านหน้ากล้อง หรือกำลังหันกลับมายิ้ม/จัดผม/ยก${envProp}ขึ้นแบบไม่ต้องหยุดนิ่ง`,
      lightingTip: `☀️ ใช้สปีดชัตเตอร์ไว (แสงกลางวันธรรมชาติ) กดถ่ายรัว 3-5 ช็อตต่อจังหวะแล้วเลือกภาพที่ปลายเท้าและจังหวะรอยยิ้มลงตัวที่สุด`,
      action: `ล็อกตำแหน่งกล้องให้นิ่งกับฉากหลังที่เส้นสายสวยของ ${subject} แล้วให้ตัวแบบเดินเข้าเฟรมพร้อมหันยิ้มอย่างเป็นธรรมชาติ`,
      onScreenText: `โมเมนต์ธรรมดาที่ทำให้ยิ้มได้ทั้งวัน 🎞️`,
      spaceGuide: `📐 เว้นพื้นที่ว่างด้านหน้าทิศทางที่ตัวแบบกำลังเดินหรือมองไป (Looking Room) เพื่อให้ภาพไม่อึดอัด`,
      promptEn: `Candid lifestyle photography in the spirit of Henri Cartier-Bresson at ${subject}, capturing the decisive moment of a joyful person mid-stride turning with an authentic laugh, clean geometric architectural lines in background, natural daylight, timeless 50mm lens look, 8k`
    },
    {
      title: `ภาพพักสายตาแบบนิตยสาร: เจาะดีเทลและพื้นผิว`,
      masterPhotographer: 'William Eggleston (วิลเลียม เอ็กเกิลสตัน) — กวีแห่งรายละเอียดชีวิตประจำวัน',
      angle: 'Extreme Close-up / Macro',
      angleTh: 'มุมใกล้เจาะดีเทล / มุมก้ม 45 องศา (เลนส์ 2x)',
      lens: 'เลนส์ 2x Macro / Detail',
      depthTechnique: `ใช้เทคนิค Tactile Close-Up & Diagonal Shadows: เข้าใกล้${envDetail} ให้แสงแดดพาดเฉียงเห็นพื้นผิวและเงาชัดๆ โดยให้มี "มือของตัวแบบ" เข้ามาในเฟรมเล็กน้อยเพื่อเชื่อมโยงว่ามีคนอยู่ในเรื่องราว`,
      storyMeaning: `เป็นภาพ "พักจังหวะสายตา" ในอัลบั้ม IG Carousel ที่ช่วยยกระดับโพสต์ให้ดูเทสต์ดีเหมือนนิตยสาร Kinfolk และถ่ายทอดสัมผัส/รสชาติของวันนั้น`,
      poseGuide: `ใช้มือจับ${envProp}เบาๆ หรือวางมือพักข้างโต๊ะแบบผ่อนคลาย เน้นองค์ประกอบเรียบง่ายแต่สีสันกลมกลืน`,
      lightingTip: `☀️ ถ่ายย้อนแสงเฉียง (Back-Side Light) จะทำให้เห็นขอบใสของแก้ว น้ำแข็ง ควันอาหาร หรือพื้นผิววัตถุเด้งมีมิติสุดๆ`,
      action: `ซูมเลนส์ 2x ก้มมุม 45 องศา ถ่ายเจาะ${envDetail}ที่ ${subject} ให้มีแสงเงาพาดผ่านและฉากหลังละลายนุ่ม`,
      onScreenText: `ดีเทลเล็กๆ ที่ตกหลุมรัก ☕✨`,
      spaceGuide: `📐 จัดวัตถุเด่นเยื้องกลางเล็กน้อย เว้นพื้นที่ว่างรอบๆ ให้ดูมินิมอล สบายตา`,
      promptEn: `Intimate editorial still-life lifestyle detail photography inspired by William Eggleston at ${subject}, close-up of hands gently holding aesthetic local items with warm afternoon sunlight casting crisp diagonal shadows, rich textures, Kinfolk magazine style, 8k`
    },
    {
      title: `ภาพพอร์ตเทรตปิดเซ็ต: แววตาและอารมณ์ที่จริงใจ`,
      masterPhotographer: 'Peter Lindbergh (ปีเตอร์ ลินด์เบิร์ก) — ปรมาจารย์พอร์ตเทรตไลฟ์สไตล์',
      angle: 'Medium Close-up',
      angleTh: 'มุมครึ่งตัวระดับสายตา เน้นแววตาและแสงธรรมชาติ (เลนส์ 2x Portrait)',
      lens: 'เลนส์ 2x (50-85mm Portrait)',
      depthTechnique: `ใช้เทคนิค Raw Natural Portrait & Catchlight: ยืนหันหน้าเฉียงหาทิศทางแสงธรรมชาติ 45° ให้เกิดประกายแสงในดวงตา (Catchlight) ใช้ระยะ 2x เพื่อลดความบิดเบี้ยวของใบหน้าและละลายฉากหลัง${subject}ให้นุ่มนวล`,
      storyMeaning: `ปิดท้ายอัลบั้มด้วย "พลังของแววตาและรอยยิ้มที่จริงใจ" สร้างความผูกพันกับคนดู (Emotional Connection) ทำให้คนกดไลก์และคอมเมนต์มากที่สุด`,
      poseGuide: `ผ่อนคลายหัวไหล่ เอียงศีรษะเล็กน้อย ปล่อยผมปลิวตามลมธรรมชาติ สบตากล้องด้วยรอยยิ้มเบาๆ เหมือนกำลังมองเพื่อนสนิท`,
      lightingTip: `☀️ แสงหน้าต่างหรือแสงเย็น Golden Hour ด้านข้าง 45° คือแสงที่ทำให้ผิวดูเนียนและหน้ามีมิติที่สุดโดยไม่ต้องแต่งหน้าจัด`,
      action: `ถ่ายครึ่งตัวระดับสายตาที่ ${subject} โฟกัสคมชัดที่ดวงตาข้างที่ใกล้กล้องที่สุด เก็บความรู้สึกผ่อนคลายและเป็นตัวของตัวเอง`,
      onScreenText: `ความสุขเรียบง่าย ณ ${subject} 🤍`,
      spaceGuide: `📐 วางระดับดวงตาไว้ที่เส้นตัด 1/3 ด้านบนของเฟรม เหลือพื้นที่เหนือศีรษะพอดีๆ ไม่ตัดขอบหัว`,
      promptEn: `Authentic editorial lifestyle portrait in the style of Peter Lindbergh at ${subject}, natural soft 45-degree golden hour side light creating gentle eye catchlight, wind-swept hair, genuine warm relaxed smile, effortless luxury mood, 85mm portrait lens bokeh, 8k`
    },
    {
      title: `ภาพมุมสะท้อนศิลปะ: เล่นกับกระจกและเงาสะท้อน`,
      masterPhotographer: 'Vivian Maier (วิเวียน ไมเออร์) — เจ้าแม่ภาพสะท้อนสุดคลาสสิก',
      angle: 'Close-up Shot',
      angleTh: 'มุมถ่ายเงาสะท้อนในกระจกหรือผิวน้ำ (เลนส์ 1x หรือ 2x)',
      lens: 'เลนส์ 1x / 2x',
      depthTechnique: `ใช้เทคนิค Reflective Layering: ถ่ายตัวแบบผ่านเงาสะท้อนของกระจกหน้าร้าน กระจกคาเฟ่ หรือผิวน้ำ ให้เห็นทั้งตัวแบบและภาพบรรยากาศของ ${subject} ซ้อนทับกันในเฟรมเดียว`,
      storyMeaning: `เพิ่มลูกเล่นและความครีเอทีฟให้เซ็ตภาพดูไม่ซ้ำใคร เหมือนมีมุมมองของช่างภาพศิลปะตัวจริง`,
      poseGuide: `มองผ่านเงาสะท้อนในกระจก หรือถือกล้อง/แก้วน้ำขึ้นมาบังหน้าบางส่วนอย่างมีสไตล์`,
      lightingTip: `☀️ ให้ฝั่งที่มีแสงสว่างส่องเข้ามาที่ตัวแบบ ส่วนด้านหลังกระจกมืดกว่าเล็กน้อย เงาสะท้อนจะคมชัดสวยที่สุด`,
      action: `หามุมกระจกใสหรือผิวน้ำใน ${subject} ถ่ายเก็บเงาสะท้อนของตัวแบบซ้อนกับวิวด้านหลัง`,
      onScreenText: `มุมมองสะท้อนที่ซ่อนอยู่ใน ${subject} 🪞`,
      spaceGuide: `📐 ใช้ขอบกระจกเป็นกรอบภาพธรรมชาติ จัดเงาตัวแบบให้อยู่จุดเด่นชัดเจน`,
      promptEn: `Artistic lifestyle reflection photography inspired by Vivian Maier at ${subject}, creative reflection of traveler and scenic surroundings layered in clean cafe glass window, soft natural light, poetic mood, 8k`
    },
    {
      title: `ภาพสตรีทสีสันหลายมิติ: ซ้อนเรื่องราวเต็มเฟรม`,
      masterPhotographer: 'Alex Webb (อเล็กซ์ เว็บบ์) — ปรมาจารย์ภาพสีสันและเลเยอร์ซับซ้อน',
      angle: 'Wide Establishing Shot',
      angleTh: 'มุมกว้างซ้อนเลเยอร์แสงสีและผู้คน (เลนส์ 1x)',
      lens: 'เลนส์ 1x (28mm)',
      depthTechnique: `ใช้เทคนิค Complex Color Layering: แบ่งภาพเป็นโซนสว่าง-มืด และสีร้อน-เย็น วางจุดเด่น 2-3 จุดในระยะใกล้-กลาง-ไกล โดยไม่ทับซ้อนกัน`,
      storyMeaning: `ถ่ายทอด "พลังงานและสีสันที่มีชีวิตชีวา" ของ ${subject} ให้คนดูสามารถกวาดสายตาสำรวจรายละเอียดได้ทั่วทั้งภาพ`,
      poseGuide: `เดินกลมกลืนไปกับจังหวะของสถานที่ แวะมองสิ่งรอบตัวแบบมีพลังชีวิตชีวา`,
      lightingTip: `☀️ แสงแดดจัดช่วงบ่าย 3-4 โมงเย็น สร้างคอนทราสต์สีสดและเงาคมสวยสไตล์ภาพยนตร์`,
      action: `เปิดเฟรมกว้างเก็บจังหวะชีวิต สีสัน และแสงเงาหลายชั้นของ ${subject}`,
      onScreenText: `สีสันและจังหวะชีวิตที่ ${subject} 🎨`,
      spaceGuide: `📐 ตรวจสอบขอบเฟรมทั้ง 4 ด้านไม่ให้มีสิ่งรบกวนตัดขาดครึ่งๆ กลางๆ`,
      promptEn: `Vibrant multi-layered street lifestyle photography inspired by Alex Webb at ${subject}, rich sunlit colors and deep shadows creating complex spatial layers, authentic lively atmosphere, crisp 28mm editorial documentary look, 8k`
    }
  ];

  // Use core 6 iconic lifestyle masters for sets <= 6, add Vivian Maier & Alex Webb for 7-8+ photo albums
  const activePool = targetCount <= 6 ? masterPool.slice(0, 6) : masterPool;
  const picked = selectEvenly(activePool, targetCount);
  return picked.map((item, idx) => {
    const roleInfo = getShotNarrativeRole(idx, picked.length, 'photo');
    return {
      ...item,
      mode: 'photo',
      shot_role: roleInfo.role,
      duration_seconds: 0
    };
  });
}

/**
 * ============================================================================
 * MODE 2: VIRAL LIFESTYLE VIDEO STORYBOARD ENGINE
 * ============================================================================
 */
function buildViralLifestyleVideoBeats(rawConcept, targetCount = 6, viralStyle = '') {
  const subject = extractCleanSubject(rawConcept);
  const t = String(rawConcept || '').toLowerCase();
  const v = String(viralStyle || '').toLowerCase();

  const isAsmr = /asmr|เสียงจริง|เงียบ|สมาธิ/.test(v) || /asmr/.test(t);

  // Domain-adapted lifestyle visual specifics
  let hookAction = `เริ่มต้นด้วยการถือกล้องเดินเปิดเข้าสู่จุดที่สวยที่สุดของ "${subject}" หรือยื่นจุดเด่นเข้าใกล้เลนส์ทันทีใน 2 วินาทีแรก`;
  let hookText = `อย่าเพิ่งเลื่อนผ่าน! ${subject} มุมนี้จึ้งเกินคาด ✨`;
  let hookVoice = `(น้ำเสียงตื่นเต้น ชวนหยุดดูใน 2 วิแรก) "ทุกคน... ถ้ามีแพลนมา${subject} แนะนำให้ดูคลิปนี้ก่อนเลยครับ เพราะมุมนี้ของจริงคือสวยเกินต้านมาก!"`;
  let brollAction = `ซูมเลนส์ 2x เก็บภาพดีเทลใกล้ๆ (เช่น แสงแดดกระทบวัตถุ มือสัมผัส แก้วเครื่องดื่ม หรือจุดซิกเนเจอร์ของ ${subject}) ถ่ายสั้นๆ 2 วินาทีเพื่อเร่งจังหวะคลิปให้ดูโปร`;
  let brollVoice = `(น้ำเสียงละมุน อินกับบรรยากาศ) "ดูดีเทลใกล้ๆ สิครับ แสงธรรมชาติกับมู้ดรอบๆ คือลงตัวทุกมุมจริงๆ"`;
  let highlightAction = `ถ่ายตัวแบบกำลังใช้เวลาฟินๆ กับกิจกรรมไฮไลท์ของ "${subject}" ด้วยท่าทางเป็นธรรมชาติ ยิ้มกว้างและหันมามองกล้อง`;
  let highlightVoice = `(น้ำเสียงเล่าให้เพื่อนฟังแบบจริงใจ) "และจุดไฮไลท์ที่ทำให้ตกหลุมรักที่นี่เลยก็คือมุมนี้ครับ มาแล้วรู้สึกได้พักผ่อนชาร์จแบตเต็มที่มาก"`;
  let foleyBase = 'เพลงไลฟ์สไตล์จังหวะชิลล์แต่ติดหู (Trending Acoustic / Lo-Fi Pop) คลอเสียงบรรยากาศจริง';

  if (/คาเฟ่|กาแฟ|มัทฉะ|อาหาร|ของกิน|ตลาด|cafe|coffee|food/.test(t)) {
    hookAction = `เริ่มด้วยช็อตยื่นแก้วเครื่องดื่มหรือตักเมนูเด็ดของ "${subject}" เข้าหาเลนส์แบบ Close-Up ให้เห็นความฉ่ำและบรรยากาศร้านสวยๆ เบลออยู่ด้านหลัง`;
    hookText = `ค้นพบร้านลับ! ${subject} ที่ต้องเซฟเก็บไว้ ☕🔥`;
    hookVoice = `(น้ำเสียงตื่นเต้นชวนหิว) "สายคาเฟ่ห้ามพลาด! วันนี้พามาเช็กอินที่ ${subject} บอกเลยว่าทั้งมู้ดร้านทั้งเมนูตรงหน้าคือเต็มสิบไม่หัก!"`;
    brollAction = `ซูมเลนส์ 2x ถ่ายช็อตเทกาแฟ/คนน้ำแข็งในแก้ว หรือใช้ช้อนตัดขนมเค้กช้าๆ ให้เห็นเนื้อสัมผัสแบบละลายหลัง`;
    brollVoice = `(น้ำเสียงฟินๆ) "ดูช็อตเทแก้วนี้สิครับ หอมละมุนมาก รสชาติกลมกล่อมไม่หวานโดดเลย"`;
    highlightAction = `ถ่ายตัวแบบนั่งริมหน้าต่างรับแสงธรรมชาติ ยกแก้วขึ้นจิบหรือชิมคำแรกแล้วยิ้มพยักหน้าคอนเฟิร์มความอร่อย`;
    highlightVoice = `(น้ำเสียงป้ายยาแบบเพื่อนบอกเพื่อน) "นอกจากอร่อยแล้ว แสงในร้านยังสวยมาก นั่งมุมไหนก็ได้รูปปังกลับบ้านแน่นอนครับ"`;
    foleyBase = 'เสียงน้ำแข็งกระทบแก้ว / เสียงช้อนตักขนม ASMR ผสานเพลง Cafe Aesthetic สดใส';
  } else if (/วัด|ไหว้พระ|เมืองเก่า|โบราณ|temple/.test(t)) {
    hookAction = `เปิดด้วยช็อตมุมเสยต่ำ (เลนส์ 0.5x) เห็นยอดสถาปัตยกรรมของ "${subject}" ตัดแสงเย็นสีทอง ให้ตัวแบบเดินก้าวเข้าเฟรมแล้วหันยิ้ม`;
    hookText = `📍 ${subject} ตอนเย็น แสงสวยเหมือนภาพวาด! ✨`;
    hookVoice = `(น้ำเสียงตื่นเต้น ประทับใจ) "ทุกคน... ถ้ามา ${subject} แนะนำให้มาช่วงบ่ายแก่ถึงเย็นเลยครับ แสงสะท้อนสวยอลังการเหมือนหลุดไปอีกโลก!"`;
    brollAction = `ซูมเลนส์ 2x แพนช้าๆ เก็บรายละเอียดลวดลายศิลปะ แสงแดดกระทบกระเบื้องเคลือบ และเงาต้นไม้`;
    brollVoice = `(น้ำเสียงนุ่มนวล ชื่นชม) "ลองดูดีเทลงานศิลปะใกล้ๆ พอโดนแสงเย็นแบบนี้คือเป็นประกายสวยทุกตารางนิ้วเลยครับ"`;
    highlightAction = `ถ่ายตัวแบบกำลังไหว้พระขอพรด้วยสีหน้าสงบอิ่มบุญ ต่อด้วยช็อตยืนถ่ายรูปมุมระเบียงไฮไลท์`;
    highlightVoice = `(น้ำเสียงอบอุ่น ฮีลใจ) "ได้มาไหว้พระขอพรเติมพลังบวก แถมได้มุมถ่ายรูปสวยๆ แบบไม่ต้องพึ่งฟิลเตอร์เลยครับ"`;
    foleyBase = 'เสียงกระดิ่งลมเบาๆ + เพลงบรรเลงร่วมสมัยโทนอบอุ่นกินใจ';
  } else if (/ทะเล|หาด|เกาะ|ภูเขา|ดอย|แคมป์|ที่พัก|พูลวิลล่า|beach|sea|mountain|hotel/.test(t)) {
    hookAction = `เริ่มจากเปิดประตูหรือแหวกผ้าม่านออกไปเจอวิวหลักล้านของ "${subject}" แบบ POV ทันทีใน 2 วินาทีแรก!`;
    hookText = `เปิดประตูมาเจอวิวนี้ที่ ${subject} คือคุ้มค่าเหนื่อย! 🌊✨`;
    hookVoice = `(น้ำเสียงตื่นเต้น พาคนดูว้าวไปด้วย) "ทุกคนดูวิวตรงหน้านี้สิครับ! แค่เปิดประตูออกมาก็เจอวิว ${subject} แบบเต็มตา ของจริงสวยกว่าในรูปสิบเท่า!"`;
    brollAction = `ซูมเลนส์ 2x ถ่ายช็อตสายลมพัดผ้าม่าน ผิวน้ำระยิบระยับ หรือวางแก้วเครื่องดื่มโดยมีวิวสวยเบลออยู่ด้านหลัง`;
    brollVoice = `(น้ำเสียงชิลล์ ผ่อนคลาย) "อากาศดีมาก ลมพัดเย็นตลอดวัน เหมาะกับการทิ้งงานมาฮีลใจสุดๆ ครับ"`;
    highlightAction = `ถ่ายตัวแบบเดินรับลมหรือนั่งพักผ่อนชิลล์ๆ ช่วงแสงเย็น Golden Hour หันมายิ้มให้กล้องอย่างมีความสุข`;
    highlightVoice = `(น้ำเสียงประทับใจ) "ยิ่งช่วงเย็นตอนแสงอาทิตย์กำลังตก โทนสีท้องฟ้าคือโรแมนติกมากจริงๆ ครับ"`;
    foleyBase = 'เสียงคลื่นหรือเสียงลมธรรมชาติจริง + เพลง Travel Vlog ฟีลกู๊ด';
  }

  if (isAsmr) {
    hookVoice = `(เน้นเสียงบรรยากาศจริง 100% — ไม่ต้องพากย์ทับ หรือกระซิบนุ่มๆ) "ลองฟังเสียงบรรยากาศจริงของ ${subject} ดูนะครับ..."`;
    brollVoice = `(ปล่อยเสียง ASMR คมชัด ไม่มีเสียงพูดแทรก ให้คนดูผ่อนคลายและดูวนซ้ำ)`;
  }

  const videoPool = [
    {
      title: `HOOK เปิดคลิปหยุดนิ้ว: เปิดตัว ${subject} ให้ว้าวทันที`,
      angle: 'Low Angle Hero Shot',
      angleTh: 'มุมเสยต่ำ / มุมเปิดฉากดึงสายตา (เลนส์ 0.5x หรือ 1x)',
      lens: 'เลนส์ 0.5x Ultra-Wide',
      movement: 'เดินดันกล้องเข้าหาจุดเด่นเร็วเล็กน้อยแล้วค่อยผ่อนช้า (Dynamic Push-In)',
      duration: 2.5,
      action: hookAction,
      lightingTip: `📱 เปิดโหมด 4K 60fps (เผื่อทำสโลว์นุ่มๆ) แตะล็อกโฟกัสแล้วดึงแสงลงนิดหน่อยให้ท้องฟ้าไม่ขาวโพลน`,
      transitionTip: `✂️ จบช็อตด้วยการขยับกล้องไปทางขวาหรือเดินผ่านกรอบประตู เพื่อเชื่อมต่อ (Match Cut) เข้าฉากที่ 2 แบบลื่นๆ`,
      onScreenText: hookText,
      spaceGuide: `📐 เว้นด้านบน 25% สำหรับพาดหัว Hook ตัวใหญ่สีขาวขอบเงา และหลบขอบขวา 15% ไม่ให้ชนปุ่ม TikTok/Reels`,
      dialogue: hookVoice,
      foley: `เสียง Whoosh เปิดคลิป + ${foleyBase}`,
      promptEn: `Viral lifestyle vertical reel hook shot at ${subject}, dynamic golden daylight reveal, authentic stylish traveler welcoming viewers, ultra crisp 8k commercial vlog`
    },
    {
      title: `SETUP พาเดินเข้าบรรยากาศจริงแบบ POV`,
      angle: 'POV Reveal Shot',
      angleTh: 'มุมมองสายตาเดินพาชมสถานที่ (เลนส์ 1x)',
      lens: 'เลนส์ 1x มุมปกติ',
      movement: 'งอเข่าเล็กน้อยเดินถือกล้องให้นิ่ง (Ninja Walk Forward)',
      duration: 2.5,
      action: `ถือกล้องระดับอกเดินก้าวเข้าสู่พื้นที่หลักของ "${subject}" แพนกล้องช้าๆ ให้คนดูรู้สึกเหมือนกำลังเดินเที่ยวอยู่ข้างๆ เรา`,
      lightingTip: `📱 ถือกล้องสองมือแนบลำตัวกันสั่น เปิดเส้นตาราง Grid 9 ช่องช่วยคุมเส้นขอบฟ้าให้ตรง`,
      transitionTip: `✂️ ตัดเข้าฉากที่ 3 ตรงจังหวะเสียงกลอง/บีทเพลง (Cut on Beat) จะทำให้คลิปดูสนุกมีจังหวะทันที`,
      onScreenText: `✨ พาเดินดูบรรยากาศจริง มู้ดดีมาก`,
      spaceGuide: `📐 วางข้อความเล็กๆ ไว้ฝั่งซ้ายกลางจอ เว้นตรงกลางให้คนดูเห็นบรรยากาศเต็มตา`,
      dialogue: isAsmr
        ? `(เสียงฝีเท้าเดิน + เสียงเปิดประตูจริงคมชัด)`
        : `(น้ำเสียงเป็นกันเองเหมือนเล่าให้เพื่อนฟัง) "พอเดินเข้ามาด้านใน บรรยากาศจริงคือโปร่งสบาย มู้ดดีตั้งแต่ก้าวแรกเลยครับ"`,
      foley: `เสียงบรรยากาศสถานที่จริง (Ambient) ระดับ 30% ผสมเพลงประกอบ`,
      promptEn: `First-person POV lifestyle vlog walking into ${subject}, sunlit aesthetic interior and scenery, smooth stabilized gimbal look, vibrant authentic colors, 8k`
    },
    {
      title: `HIGHLIGHT จุดพีคไลฟ์สไตล์ที่ต้องมาโดน`,
      angle: 'Medium Shot',
      angleTh: 'มุมปานกลางระดับสายตา เห็นทั้งคนและจุดเด่น (เลนส์ 1x)',
      lens: 'เลนส์ 1x ระยะสายตา',
      movement: 'แพนกล้องโค้งรอบตัวแบบช้าๆ 30 องศา (Smooth Orbit Arc)',
      duration: 3.0,
      action: highlightAction,
      lightingTip: `📱 ให้แสงธรรมชาติส่องเข้าใบหน้าเฉียง 45° ผิวจะดูใสสว่างขึ้นทันทีโดยไม่ต้องเปิดไฟเสริม`,
      transitionTip: `✂️ เชื่อมไปฉากที่ 4 ด้วยการซูมเข้าใกล้สิ่งของ/อาหาร (Cut to Detail) เพื่อเปลี่ยนระยะสายตาไม่ให้น่าเบื่อ`,
      onScreenText: `⭐ มุมไฮไลท์ห้ามพลาดของ ${subject}`,
      spaceGuide: `📐 วางตัวแบบกลางเฟรม เหลือพื้นที่ด้านล่าง 22% สำหรับขึ้นซับไตเติลอัตโนมัติใน CapCut`,
      dialogue: highlightVoice,
      foley: `เสียงดนตรีเข้าท่อนฮุคสดใส + เสียงบรรยากาศจริง`,
      promptEn: `Medium lifestyle shot of cheerful creator enjoying the highlight moment at ${subject}, natural warm window sunlight, authentic joyful vibe, 8k`
    },
    {
      title: `B-ROLL เจาะดีเทลใกล้ๆ เพิ่มความโปรให้คลิป`,
      angle: 'Extreme Close-up / Macro',
      angleTh: 'มุมใกล้เจาะรายละเอียด ละลายฉากหลัง (เลนส์ 2x)',
      lens: 'เลนส์ 2x Tele / Macro',
      movement: 'เลื่อนมือข้างๆ ช้าๆ แนวนอน (Slow Hand Slider)',
      duration: 2.0,
      action: brollAction,
      lightingTip: `📱 สลับไปเลนส์ 2x แล้วขยับเข้าใกล้ตัววัตถุ แตะโฟกัสที่วัตถุด้านหน้าเพื่อให้ฉากหลังเบลอสวยเหมือนกล้องใหญ่`,
      transitionTip: `✂️ คลิป B-Roll ไม่ควรยาวเกิน 2 วิ เพื่อให้คลิปกระชับ ตัดไวไปช็อตอารมณ์ต่อทันที`,
      onScreenText: `🔍 ดีเทลใกล้ๆ สวยละมุนมาก`,
      spaceGuide: `📐 โฟกัสวัตถุกลางภาพ เว้นขอบบนไว้ใส่ข้อความสั้น 3-5 คำ`,
      dialogue: brollVoice,
      foley: `เสียง ASMR ใกล้ๆ คมชัด (เสียงช้อน/น้ำแข็ง/ลม/ฝีเท้า)`,
      promptEn: `Extreme close-up cinematic B-roll detail shot at ${subject}, rich tactile texture glowing in natural sunlight, creamy bokeh background, 8k`
    },
    {
      title: `REACTION & CHECK-IN โมเมนต์ฟินๆ + มุมถ่ายรูปปัง`,
      angle: 'Medium Close-up',
      angleTh: 'มุมครึ่งตัวเห็นรอยยิ้มจริงใจ + ฉากหลังแสงสวย (เลนส์ 1x หรือ 2x)',
      lens: 'เลนส์ 2x Portrait',
      movement: 'ค่อยๆ ถอยกล้องออกช้าๆ (Slow Pull-Back)',
      duration: 3.0,
      action: `ถ่ายจังหวะตัวแบบโพสท่าสบายๆ หรือหันมายิ้มหัวเราะให้กล้องในมุมแสงสวยที่สุดของ "${subject}" (สามารถแทรกรูปภาพนิ่งสวยๆ 2 รูปตัดตามจังหวะเสียงชัตเตอร์ได้!)`,
      lightingTip: `📱 แนะนำให้ถ่ายย้อนแสงเย็นเฉียงๆ จะได้ขอบแสงสีทองบนเส้นผม (Rim Light) ดูแพงมาก`,
      transitionTip: `✂️ ใส่เสียง "แชะ!" ชัตเตอร์กล้องตอนตัดสลับโชว์รูปถ่ายสวยๆ ช่วยเพิ่มยอดดูซ้ำ (Replay) สูงมาก`,
      onScreenText: `📸 มุมนี้ถ่ายรูปออกมาสวยจึ้งทุกรูป!`,
      spaceGuide: `📐 วางใบหน้าอยู่โซนบนกลางจอ หลบขอบล่าง 25% ไม่ให้โดนชื่อแอคเคาท์ TikTok บัง`,
      dialogue: isAsmr
        ? `(เสียงชัตเตอร์กล้อง 2 จังหวะ + เสียงเพลงละมุน)`
        : `(น้ำเสียงสดใส เป็นกันเอง) "ที่ชอบสุดๆ คือมุมถ่ายรูปเยอะมาก กดถ่ายมุมไหนก็รอด ได้รูปลงไอจีเพียบเลยครับ"`,
      foley: `เสียงชัตเตอร์กล้องถ่ายรูป + ดนตรีท่อนไคลแม็กซ์`,
      promptEn: `Medium close-up portrait of stylish smiling traveler during golden hour at ${subject}, glowing sunset rim light, genuine lifestyle happiness, 8k`
    },
    {
      title: `ENDING & VIRAL CTA สรุปความคุ้มค่า + ชวนกดเซฟคลิป`,
      angle: 'Wide Establishing Shot',
      angleTh: 'มุมกว้างเก็บภาพรวมส่งท้าย + ยกมือโบกลา (เลนส์ 1x)',
      lens: 'เลนส์ 1x มุมกว้าง',
      movement: 'แพนกล้องขึ้นสู่ท้องฟ้าหรือถอยออกช้าๆ (Outro Tilt Up)',
      duration: 3.0,
      action: `ถ่ายภาพมุมกว้างเห็นตัวแบบและบรรยากาศภาพรวมของ "${subject}" ยิ้มโบกมือลา พร้อมขึ้นการ์ดข้อความสรุปพิกัดและชวนคนดูคอมเมนต์`,
      lightingTip: `📱 คุมเฟรมให้นิ่ง 3 วินาทีเต็มเพื่อให้คนดูอ่านพิกัดทัน (หรือกดหยุดดูคลิป = อัลกอริทึมดันคลิปไวรัล!)`,
      transitionTip: `✂️ ทริคไวรัล Loop: จบประโยคให้เชื่อมกลับไปต้นคลิปได้ หรือทิ้งข้อความพิกัดไว้ 2 วิให้คนกดเซฟ/แชร์ส่งให้เพื่อน`,
      onScreenText: `📌 พิกัด: ${subject} (กดเซฟไว้ตามรอยเลย!)`,
      spaceGuide: `📐 วางป้ายสรุปพิกัดไว้กลางจอค่อนล่างเล็กน้อย (เหนือระดับแคปชั่น TikTok) ให้อ่านง่ายที่สุด`,
      dialogue: isAsmr
        ? `(เพลงจบ Fade-out นุ่มนวล พร้อมขึ้นข้อความพิกัดบนจอ)`
        : `(น้ำเสียงชวนคุย กระตุ้นคอมเมนต์) "ใครอยากไปตามรอย กดเซฟคลิปนี้ไว้แล้วส่งให้เพื่อนหรือแฟนดูได้เลยครับ ใครเคยไป ${subject} แล้วชอบมุมไหนมาคอมเมนต์บอกกันนะ!"`,
      foley: `เพลงจบสวยงาม กระชับ ประทับใจ`,
      promptEn: `Wide cinematic sunset outro shot at ${subject}, happy traveler waving goodbye warmly towards camera, memorable travel vlog ending, 8k`
    }
  ];

  const picked = selectEvenly(videoPool, targetCount);
  return picked.map((item, idx) => {
    const roleInfo = getShotNarrativeRole(idx, picked.length, 'video');
    return {
      ...item,
      mode: 'video',
      shot_role: roleInfo.role
    };
  });
}

function enrichSingleBeat(projectTitle, beatText, index, totalShots, visualStyleEn, mode = 'video') {
  const roleInfo = getShotNarrativeRole(index, totalShots, mode);
  const cleanBeat = String(beatText || '').replace(/^(?:ฉากที่|ช็อตที่|ภาพที่|Scene|Shot)\s*\d+[:\s.-]*/i, '').trim();
  const cleanTitle = extractCleanSubject(projectTitle);

  const cameraRotation = [
    { angle: 'Wide Establishing Shot', angleTh: 'มุมกว้างเปิดฉากเห็นสถานที่ (เลนส์ 0.5x)', lens: 'เลนส์ 0.5x Ultra-Wide', movement: 'เดินถือกล้องดันเข้าช้าๆ (Slow Push-In)' },
    { angle: 'Medium Shot', angleTh: 'มุมปานกลางระดับสายตาเล่าเรื่อง (เลนส์ 1x)', lens: 'เลนส์ 1x ระยะสายตา', movement: 'ถือกล้องเดินตามนุ่มนวล (Smooth Follow)' },
    { angle: 'Close-up Shot', angleTh: 'มุมใกล้โฟกัสจุดเด่นชัดๆ (เลนส์ 2x)', lens: 'เลนส์ 2x ละลายหลัง', movement: 'ถือกล้องนิ่งโฟกัสจุดสำคัญ (Static Focus)' },
    { angle: 'Extreme Close-up / Macro', angleTh: 'มุมมาโครเจาะดีเทลใกล้พิเศษ (เลนส์ 2x)', lens: 'เลนส์ 2x Macro', movement: 'เลื่อนกล้องช้าๆ ด้านข้าง (Slow Slide)' },
    { angle: 'Low Angle Hero Shot', angleTh: 'มุมเสยต่ำเพิ่มความอลังการ (เลนส์ 0.5x/1x)', lens: 'เลนส์ 1x มุมต่ำ', movement: 'แพนกล้องเชิดขึ้นช้าๆ (Slow Tilt Up)' },
    { angle: 'Over-the-Shoulder Shot', angleTh: 'มุมมองข้ามไหล่พาคนดูมีส่วนร่วม (เลนส์ 1x)', lens: 'เลนส์ 1x มุมปกติ', movement: 'เดินตามหลังตัวแบบ (Walk-With)' }
  ];

  const masterRotation = [
    'Fan Ho (ฟ่าน เหอ) — แสงเงาและสเกลสถาปัตยกรรม',
    'Saul Leiter (ซอล ไลเตอร์) — ฉากหน้าเบลอ 3 เลเยอร์',
    'Steve McCurry (สตีฟ แมคเคอร์รี) — เส้นนำสายตา & สีสัน',
    'Henri Cartier-Bresson — จังหวะธรรมชาติมีชีวิต',
    'William Eggleston — ดีเทลชีวิตประจำวันแบบนิตยสาร',
    'Peter Lindbergh — พอร์ตเทรตแสงธรรมชาติจริงใจ'
  ];

  let cam = cameraRotation[index % cameraRotation.length];
  const lower = cleanBeat.toLowerCase();
  if (/มาโคร|macro|ใกล้มาก|extreme close/.test(lower)) cam = cameraRotation[3];
  else if (/โคลสอัพ|close-up|มุมใกล้|ใบหน้า|มือ/.test(lower)) cam = cameraRotation[2];
  else if (/มุมกว้าง|wide|เปิดตัว|ทั้งร้าน|วิว/.test(lower)) cam = cameraRotation[0];
  else if (/มุมต่ำ|low angle|เสย/.test(lower)) cam = cameraRotation[4];
  else if (/ตามหลัง|ข้ามไหล่|เดินเข้า/.test(lower)) cam = cameraRotation[5];

  let dialogue = '';
  if (index === 0) {
    dialogue = `(น้ำเสียงตื่นเต้น ดึงดูดคนดูใน 3 วิแรก) "ทุกคนครับ! วันนี้พามาที่ ${cleanTitle} เริ่มกันที่ช็อตแรก ${cleanBeat} บอกเลยว่าห้ามพลาด!"`;
  } else if (index === totalShots - 1) {
    dialogue = `(น้ำเสียงประทับใจ ชวนกดเซฟ) "ปิดท้ายด้วย ${cleanBeat} ใครชอบแนวนี้กดเซฟคลิปไว้ตามรอยได้เลยครับ!"`;
  } else {
    dialogue = `(น้ำเสียงเพลิดเพลิน เล่าให้เพื่อนฟัง) "ต่อด้วยจังหวะนี้เลยครับ ${cleanBeat} มู้ดจริงคือสวยลงตัวสุดๆ"`;
  }

  const onScreenText = index === 0
    ? `🔥 ${cleanBeat.slice(0, 34)}`
    : index === totalShots - 1
    ? `📌 พิกัด: ${cleanTitle.slice(0, 28)} (เซฟไว้เลย!)`
    : `✨ ${cleanBeat.slice(0, 34)}`;

  const promptEn = `${cam.angle}, ${cleanBeat} (${cleanTitle}), ${visualStyleEn || 'natural golden daylight, editorial lifestyle photography'}, hyper-realistic, crisp details, 8k`;

  return {
    mode,
    shot_role: roleInfo.role,
    duration_seconds: mode === 'photo' ? 0 : roleInfo.defaultDuration,
    master_photographer: mode === 'photo' ? masterRotation[index % masterRotation.length] : null,
    depth_technique: `จัดองค์ประกอบ 3 ระยะ (ฉากหน้า-ตัวแบบ-ฉากหลัง) ด้วย${cam.angleTh} เพื่อสร้างความลึกและมิติให้ภาพ`,
    story_meaning: `ถ่ายทอดอารมณ์ของ "${cleanBeat}" ให้เชื่อมโยงต่อเนื่องกับเรื่องราวของ ${cleanTitle}`,
    pose_guide: `ทำท่าทางธรรมชาติตามกิจกรรม "${cleanBeat}" ปล่อยไหล่สบายๆ ไม่เกร็งหน้ากล้อง`,
    lighting_tip: `☀️ ใช้แสงธรรมชาติส่องเฉียง 45° แตะโฟกัสที่ตัวแบบและปรับแสงพอดีไม่สว่างจ้าเกินไป`,
    transition_tip: `✂️ ตัดเข้าจังหวะบีทเพลง (Cut on Beat) เพื่อเชื่อมต่อไปยังช็อตถัดไปอย่างลื่นไหล`,
    camera_angle: cam.angle,
    camera_angle_th: cam.angleTh,
    camera_movement: cam.movement,
    lens_focal: cam.lens,
    action_description: `ถ่ายช็อต "${cleanBeat}" โดยใช้${cam.angleTh} (${cam.movement})`,
    dialogue,
    audio_foley: index === 0 ? 'เสียงเอฟเฟกต์เปิดคลิป + เพลงไลฟ์สไตล์ติดหู' : 'เสียงบรรยากาศจริง (Ambient) คลอเพลงประกอบ',
    on_screen_text: onScreenText,
    live_action_guide: roleInfo.textSafeZone,
    prompt: promptEn,
    video_prompt: `[Camera: ${cam.movement}] [Shot: ${cam.angle}] [Action: ${cleanBeat}], smooth 60fps motion, 8k`
  };
}

function parseMultiSceneScript(rawText, mode = 'video') {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) return null;

  const text = normalizeScriptText(rawText).trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let projectTitle = '';
  const titleMatch = text.match(/^[🎬🎥📸\s]*(?:(?:Prompt|Content|คอนเทนต์|บท|สคริปต์)\s*\d*\s*[:：]|(?:Title|เรื่อง|ชื่อเรื่อง)\s*[:：])\s*([^\n\r]+)/im);
  if (titleMatch) {
    let rawTitle = titleMatch[1].trim().replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
    if (rawTitle.length >= 2) projectTitle = rawTitle;
  } else if (lines[0] && !/^(?:Scene|Shot|ฉาก|ช็อต|ซีน|ภาพ|\d+[\.\)])/i.test(lines[0])) {
    projectTitle = lines[0].replace(/^[🎬🎥📸\s*#*-]+/, '').replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
  }
  if (!projectTitle || projectTitle.length < 2) {
    projectTitle = mode === 'photo' ? 'เซ็ตภาพนิ่งไลฟ์สไตล์' : 'สตอรี่บอร์ดวิดีโอไลฟ์สไตล์';
  }

  let visualStyle = 'แสงธรรมชาติสไตล์ Editorial Lifestyle';
  let visualStyleEn = 'natural volumetric daylight, shallow depth of field, editorial lifestyle photography 8k';
  const styleMatch = text.match(/Visual\s*Style(?:[^\n:：]*?)?[:：]\s*([^\n\r]+)/i);
  if (styleMatch) {
    let s = styleMatch[1].trim().replace(/(?:Scene|Shot|ฉาก).*$/i, '').trim();
    if (s) {
      visualStyle = s;
      visualStyleEn = s;
    }
  }

  const sceneHeaderRegex = /(?:^|\n)\s*(?:(?:Scene|Shot|ฉากที่|ฉาก|ช็อตที่|ช็อต|ซีน|ภาพที่)\s*(\d+)[\s:：.-]*([^\n]*)|(\d+)[.)]\s*([^\n]+))/gi;
  const headerMatches = [];
  let m;
  while ((m = sceneHeaderRegex.exec(text)) !== null) {
    headerMatches.push({
      index: m.index,
      sceneNum: parseInt(m[1] || m[3], 10),
      title: (m[2] || m[4] || '').trim()
    });
  }

  if (headerMatches.length < 2) return null;

  const parsedShots = [];
  for (let i = 0; i < headerMatches.length; i++) {
    const current = headerMatches[i];
    const startIdx = current.index;
    const endIdx = (i + 1 < headerMatches.length) ? headerMatches[i + 1].index : text.length;
    const blockText = text.substring(startIdx, endIdx).trim();
    const contentLines = blockText.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(1);

    let shotPrompt = '';
    let foleyDesc = '';
    let dialogueText = '';

    const promptIdx = contentLines.findIndex(l => /^Prompt\s*:\s*/i.test(l));
    if (promptIdx !== -1) {
      shotPrompt = contentLines[promptIdx].replace(/^Prompt\s*:\s*/i, '').trim();
      for (let j = promptIdx + 1; j < contentLines.length; j++) {
        if (/^(?:Audio|Foley|Camera|Dialogue|Text|ซาวด์|เสียง|มุมกล้อง)\s*:/i.test(contentLines[j])) break;
        shotPrompt += ' ' + contentLines[j];
      }
    } else if (contentLines.length > 0) {
      shotPrompt = contentLines.join(' ').trim();
    } else {
      shotPrompt = current.title;
    }

    const audioLine = contentLines.find(l => /^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:/i.test(l));
    if (audioLine) foleyDesc = audioLine.replace(/^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:\s*/i, '').trim();

    const dialogueLine = contentLines.find(l => /^(?:Dialogue|บทพูด|เสียงพากย์)\s*:/i.test(l));
    if (dialogueLine) dialogueText = dialogueLine.replace(/^(?:Dialogue|บทพูด|เสียงพากย์)\s*:\s*/i, '').trim();

    const beatSubject = current.title || shotPrompt;
    const enriched = enrichSingleBeat(projectTitle, beatSubject, i, headerMatches.length, visualStyleEn, mode);
    const shotNumber = current.sceneNum || (i + 1);
    const labelPrefix = mode === 'photo' ? 'ภาพที่' : 'ฉากที่';
    const titleClean = current.title ? `${labelPrefix} ${shotNumber}: ${current.title}` : `${labelPrefix} ${shotNumber}`;

    parsedShots.push({
      ...enriched,
      shot_number: shotNumber,
      step_number: shotNumber,
      scene_number: shotNumber,
      scene_title: enriched.shot_role,
      title: titleClean,
      subtitle: `${enriched.camera_angle_th} • ${enriched.lens_focal}`,
      dialogue: dialogueText || enriched.dialogue,
      dialogue_script: dialogueText || enriched.dialogue,
      audio_foley: foleyDesc || enriched.audio_foley,
      prompt: shotPrompt && !/[\u0E00-\u0E7F]/.test(shotPrompt) ? `${shotPrompt}, ${visualStyleEn}` : enriched.prompt,
      visual_style: visualStyle,
      aspect_ratio: mode === 'photo' ? '4:5' : '9:16'
    });
  }

  let curTime = 0;
  parsedShots.forEach((s) => {
    const startSec = curTime;
    const endSec = Math.round((startSec + (s.duration_seconds || 0)) * 10) / 10;
    curTime = endSec;
    s.timecode = mode === 'photo' ? `Slide ${s.shot_number}` : `${startSec.toFixed(1)}s - ${endSec.toFixed(1)}s`;
  });

  return {
    mode,
    project_title: projectTitle,
    visual_style: visualStyle,
    total_shots: parsedShots.length,
    total_duration: curTime,
    shots: parsedShots
  };
}

module.exports = {
  parseMultiSceneScript,
  normalizeScriptText,
  enrichSingleBeat,
  buildMasterPhotoStoryboard,
  buildViralLifestyleVideoBeats,
  getShotNarrativeRole,
  extractCleanSubject
};
