/**
 * CineBoard Studio — On-the-Go Content & Travel Storyboard Director Engine
 * Turns any quick travel/content idea or multi-scene script into a connected,
 * practical shooting guide with:
 *   1. Scene Role & Duration (กี่ฉาก ฉากละกี่วิ)
 *   2. Exact Shooting Action (ถ่ายอะไรบ้าง)
 *   3. Camera Angle & Phone Lens Guide (มุมกล้องไหน ถือกล้องยังไง)
 *   4. On-Screen Text & Safe-Zone Framing (ต้องเว้นใส่ข้อความอะไรมั้ย)
 *   5. Connected Thai Voiceover Script & Tone (เสียงพากย์จะเป็นประมาณไหน)
 */

function normalizeScriptText(rawText) {
  if (!rawText) return '';
  let text = String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 1. Convert arrow steps 'A -> B -> C' into numbered lines
  if (/(?:->|→|=>|➔)/.test(text) && !/(?:Scene|Shot|ฉากที่|\d+\.)/i.test(text)) {
    const parts = text.split(/(?:->|→|=>|➔)/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      text = parts.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
  }

  // 2. Insert double newline before inline numbered steps e.g. "Title 1. Step A 2. Step B"
  text = text.replace(/(?:^|\s+|[^\d])(?:(\d+)[\.\)]\s*|(?:ฉากที่|ช็อตที่|ซีนที่|Scene|Shot)\s*(\d+)[:\s.-]*)/gi, (match, n1, n2, offset) => {
    const num = n1 || n2;
    return (offset > 0 ? '\n\n' : '') + 'Scene ' + num + ': ';
  });

  // 3. Insert newline before Prompt:, Visual Style:, Audio:, Dialogue:
  text = text.replace(/([^\n])\s*(Prompt\s*[:：])/gi, '$1\n$2');
  text = text.replace(/([^\n])\s*(Visual\s*Style(?:[^\n:：]*?)?[:：])/gi, '$1\n$2');
  text = text.replace(/([^\n])\s*((?:Audio|Foley|Sound|เสียง|ซาวด์|Dialogue|บทพูด|เสียงพากย์)\s*[:：])/gi, '$1\n$2');

  return text;
}

/**
 * Determine the Narrative Role of a shot based on its position in the video
 */
function getShotNarrativeRole(index, totalShots) {
  if (index === 0) {
    return {
      role: '🎯 HOOK เปิดคลิปหยุดนิ้ว',
      defaultDuration: 2.5,
      textSafeZone: '📐 เว้นพื้นที่ว่างด้านบน 30% (ช่วงท้องฟ้าหรือเพดาน) สำหรับวางพาดหัว Hook ขนาดใหญ่ไม่ให้บังตัวแบบ'
    };
  }
  if (index === totalShots - 1) {
    return {
      role: '📌 สรุปจบ & ชวนปักหมุด (CTA)',
      defaultDuration: 3.0,
      textSafeZone: '📐 จัดตัวแบบไว้ตรงกลางค่อนบน เว้นพื้นที่ด้านล่าง 25% สำหรับใส่ป้ายสรุปพิกัด/ชวนกดเซฟคลิป'
    };
  }
  if (index === 1) {
    return {
      role: '🚶 พาเข้าสู่บรรยากาศจริง',
      defaultDuration: 3.0,
      textSafeZone: '📐 จัดจุดเด่นไว้ตามแนวเส้นตัด 9 ช่อง เว้นขอบซ้ายหรือมุมบนใส่ข้อความบอกชื่อสถานที่'
    };
  }
  if (index === totalShots - 2 && totalShots >= 4) {
    return {
      role: '😍 โมเมนต์ความสุข & มุมถ่ายรูปปัง',
      defaultDuration: 3.0,
      textSafeZone: '📐 เน้นใบหน้าและรอยยิ้มชัดๆ เว้นพื้นที่มุมล่างขวาใส่แคปชั่นความรู้สึกสั้นๆ'
    };
  }
  return {
    role: `✨ ไฮไลท์จุดเด็ด (ช่วงที่ ${index})`,
    defaultDuration: 3.0,
    textSafeZone: '📐 โฟกัสจุดเด่นกลางภาพ เว้นพื้นที่ด้านบนหรือด้านล่าง 20% สำหรับใส่ข้อความบรรยายจุดเด่น'
  };
}

/**
 * Extract clean core subject/location from user prompt
 */
function extractCleanSubject(rawText) {
  if (!rawText) return 'ทริปเที่ยวสุดพิเศษ';
  let s = String(rawText)
    .split('\n')[0]
    .replace(/^[🎬🎥✨🚗🎧📱🔥🏖️⛩️☕#\s*\d.)\-]+/, '')
    .replace(/^(?:ขอสตอรี่บอร์ด|อยากได้สตอรี่บอร์ด|ช่วยคิดคอนเทนต์|อยากถ่ายคอนเทนต์|อยากถ่ายคลิป|พาไปเที่ยว|ไปเที่ยว|มาเที่ยว|พาเที่ยว|แวะเที่ยว|พามา|แวะ|รีวิว|คลิปสั้น|ไวรัล)\s*/gi, '')
    .replace(/(?:อยากถ่ายคลิป.*|อยากถ่ายคอนเทนต์.*|อยากได้คอนเทนต์.*|ลง\s*tiktok.*|ลง\s*reels.*|จะทำคอนเทนต์อย่างไร.*|จะทำคอนเท้นอย่างไร.*|ทำยังไงให้น่าสนใจ.*|ยังไงดี.*|หน่อยครับ.*|หน่อยค่ะ.*)$/gi, '')
    .replace(/(?:ขอ|เอา|จำนวน)\s*\d+\s*(?:ฉาก|ช็อต|ซีน|วินาที|วิ)/gi, '')
    .trim();
  if (!s || s.length < 2) s = String(rawText).trim().slice(0, 40);
  return s.slice(0, 50);
}

/**
 * Generate a deeply connected, practical multi-shot story arc for any travel or content topic
 */
function buildConnectedStoryBeats(rawConcept, targetCount) {
  const t = String(rawConcept || '').toLowerCase();
  const subject = extractCleanSubject(rawConcept);

  // 1. Temple / Cultural / Landmark / Shrine (เที่ยววัด, ไหว้พระ, เมืองเก่า, แลนด์มาร์ค)
  if (/วัด|ไหว้พระ|ขอพร|พระปรางค์|เจดีย์|เมืองเก่า|อยุธยา|พระแก้ว|วัดอรุณ|สายมู|โบราณสถาน|temple|shrine/.test(t)) {
    const pool = [
      {
        title: `ช็อตเปิด Hook: มุมไฮไลท์ต้องมนต์ของ${subject}`,
        angle: 'Low Angle Hero Shot',
        angleTh: 'มุมเสยต่ำเห็นสถาปัตยกรรมยิ่งใหญ่ (เลนส์ 0.5x)',
        lens: 'เลนส์ 0.5x Ultra-Wide',
        movement: 'เดินถือกล้องดันเข้าช้าๆ (Slow Push-In)',
        duration: 2.5,
        action: `ตั้งกล้องมุมต่ำระดับเอวเชิดขึ้นเห็นยอดพระปรางค์/อุโบสถของ${subject}ตัดกับท้องฟ้า ให้ตัวแบบหันหลังเดินก้าวเข้าเฟรมช้าๆ แล้วหันมายิ้มให้กล้อง`,
        onScreenText: `📍 ${subject} มุมนี้สวยเหมือนหลุดไปอีกโลก! ✨`,
        spaceGuide: '📐 เว้นพื้นที่ท้องฟ้าด้านบน 30% สำหรับวางพาดหัวใหญ่สีขาว-ทอง ไม่ให้บังยอดสถาปัตยกรรม',
        dialogue: `(น้ำเสียงตื่นเต้น ชวนหยุดดู) "ทุกคน... ใครจะคิดว่ามา${subject}เวลานี้ แสงจะสวยอลังการขนาดนี้ ตามมาดูมุมเด็ดกันครับ!"`,
        foley: 'เสียงกระดิ่งลมวัดเบาๆ ผสานเพลงบรรเลงร่วมสมัยโทนอบอุ่นสงบ',
        promptEn: `Low angle wide establishing shot at a breathtaking Thai temple (${subject}), ornate golden pagoda spire glowing under warm golden hour sunlight, traveler walking gracefully into frame, cinematic travel photography, 8k`
      },
      {
        title: `เดินลอดซุ้มประตูเข้าสู่บรรยากาศสงบ`,
        angle: 'Over-the-Shoulder Shot',
        angleTh: 'มุมมองตามหลังเดินลอดซุ้มประตู (เลนส์ 1x)',
        lens: 'เลนส์ 1x มุมปกติ',
        movement: 'เดินถือกล้องตามหลังนิ่งๆ (Gimbal Walk Follow)',
        duration: 3.0,
        action: `ถือกล้องเดินตามหลังตัวแบบขณะก้าวผ่านซุ้มประตูวัด เผยให้เห็นลานวัดและแสงแดดที่ส่องลอดเงาไม้กระทบพื้นหิน`,
        onScreenText: `บรรยากาศเงียบสงบ ฮีลใจสุดๆ 🍃`,
        spaceGuide: '📐 จัดตัวแบบไว้กึ่งกลางค่อนซ้าย เว้นพื้นที่ว่างฝั่งขวาสำหรับใส่ข้อความบอกเวลาที่แนะนำ',
        dialogue: `(น้ำเสียงนุ่มนวล ผ่อนคลาย) "แค่ก้าวเข้ามาด้านใน ความวุ่นวายข้างนอกก็หายไปหมดเลยครับ ลมพัดเย็นสบายมาก"`,
        foley: 'เสียงฝีเท้าเดินเบาๆ และเสียงนกร้องในบริเวณวัด',
        promptEn: `Over-the-shoulder tracking shot following a traveler stepping through an ancient ornate temple archway into a peaceful sunlit courtyard, soft natural light rays, shallow depth of field, 8k`
      },
      {
        title: `เจาะดีเทลลวดลายศิลปะ & แสงเงาใกล้ๆ`,
        angle: 'Extreme Close-up / Macro',
        angleTh: 'มุมใกล้เจาะลวดลายประณีตละลายหลัง (เลนส์ 2x)',
        lens: 'เลนส์ 2x Portrait / Tele',
        movement: 'แพนกล้องเลื่อนช้าๆ จากซ้ายไปขวา (Slow Pan)',
        duration: 3.0,
        action: `ซูมเลนส์ 2x ถ่ายเจาะรายละเอียดลวดลายกระเบื้องเคลือบ/งานปั้นศิลปะของ${subject} ที่ต้องแสงแดดเป็นประกาย โดยให้ฉากหลังเบลอสวย`,
        onScreenText: `งานศิลปะละเอียดทุกตารางนิ้ว 🔍`,
        spaceGuide: '📐 โฟกัสลวดลายตรงกลางภาพ เว้นขอบล่าง 20% สำหรับวางซับไตเติล',
        dialogue: `(น้ำเสียงชื่นชม) "ลองดูดีเทลงานฝีมือใกล้ๆ สิครับ พอโดนแสงแดดช่วงเย็นแบบนี้คือเป็นประกายสวยทุกมุมจริงๆ"`,
        foley: 'เสียงดนตรีอคูสติกนุ่มๆ คลอเบาๆ',
        promptEn: `Extreme close-up macro shot of intricate traditional Thai porcelain mosaic and golden architectural craftsmanship glowing in warm sunlight, creamy bokeh background, 8k`
      },
      {
        title: `โมเมนต์ไหว้พระขอพรเสริมสิริมงคล`,
        angle: 'Medium Close-up',
        angleTh: 'มุมระดับอกด้านข้างเห็นใบหน้าอิ่มบุญ (เลนส์ 1x)',
        lens: 'เลนส์ 1x หรือ 2x',
        movement: 'ถือกล้องนิ่งโฟกัสที่ใบหน้า (Static Focus)',
        duration: 3.0,
        action: `ถ่ายจากด้านข้างเฉียง 45 องศา ขณะตัวแบบพนมมือไหว้พระหรือจุดธูปเทียนขอพรด้วยสีหน้าสงบและมีรอยยิ้มอ่อนโยน`,
        onScreenText: `🙏 แวะไหว้พระขอพร เติมพลังบวก`,
        spaceGuide: '📐 จัดใบหน้าอยู่ฝั่งขวาบนของเฟรม เว้นพื้นที่ฝั่งซ้ายล่างวางข้อความคำอธิษฐาน/จุดไหว้',
        dialogue: `(น้ำเสียงอบอุ่น จริงใจ) "ได้แวะมาไหว้พระขอพร ตั้งจิตอธิษฐานดีๆ เหมือนได้ชาร์จพลังใจกลับไปเต็มร้อยเลยครับ"`,
        foley: 'เสียงบรรยากาศความสงบและเสียงระฆังวัดกังวานเบาๆ',
        promptEn: `Medium close-up shot, traveler with hands pressed together in respectful Thai Wai prayer inside a softly lit temple hall, peaceful warm smile, golden candlelight glow, photorealistic 8k`
      },
      {
        title: `มุมลับถ่ายรูปเช็กอินที่ห้ามพลาด`,
        angle: 'Medium Shot',
        angleTh: 'มุมระดับสายตาครึ่งตัว คู่ฉากหลังไฮไลท์ (เลนส์ 1x)',
        lens: 'เลนส์ 1x ระยะสายตา',
        movement: 'ค่อยๆ ถอยกล้องออกช้าๆ (Slow Pull-Back)',
        duration: 3.0,
        action: `ให้ตัวแบบยืนพิงระเบียงหรือมุมบันไดสวยๆ ของ${subject} หันข้างเล็กน้อยแล้วหันมายิ้มให้กล้อง ได้ภาพเหมือนปกแมกกาซีน`,
        onScreenText: `📸 มุมถ่ายรูปมหาชน ได้รูปปังแน่นอน!`,
        spaceGuide: '📐 เว้นพื้นที่ด้านบนศีรษะ 25% สำหรับวางป้ายพิกัดมุมถ่ายรูป',
        dialogue: `(น้ำเสียงสดใส เป็นกันเอง) "ส่วนมุมตรงนี้บอกเลยว่าห้ามพลาดครับ ยืนมุมไหนก็ได้รูปสวยจึ้งไม่ต้องพึ่งฟิลเตอร์เลย"`,
        foley: 'เสียงชัตเตอร์กล้อง 2 จังหวะ + เพลงจังหวะสดใสขึ้น',
        promptEn: `Medium portrait shot of a cheerful traveler posing at the most scenic corner of ${subject}, warm golden hour rim light, aesthetic travel lifestyle vlog, 8k`
      },
      {
        title: `สรุปทริป & ชวนปักหมุดตามรอยวันหยุดนี้`,
        angle: 'Wide Establishing Shot',
        angleTh: 'มุมกว้างเก็บภาพรวมยามเย็น + โบกมือลา (เลนส์ 1x)',
        lens: 'เลนส์ 1x มุมกว้าง',
        movement: 'แพนกล้องขึ้นสู่ท้องฟ้าช้าๆ (Slow Tilt Up)',
        duration: 3.0,
        action: `ถ่ายภาพมุมกว้างเห็นวิว${subject}ท่ามกลางแสงทไวไลท์ ตัวแบบหันมายิ้มโบกมือหรือชูนิ้วชวนคนดูมาเที่ยวตาม`,
        onScreenText: `📌 เซฟคลิปไว้ตามรอยวันหยุดนี้เลย!`,
        spaceGuide: '📐 เว้นพื้นที่กลางจอค่อนล่างสำหรับใส่กรอบข้อความสรุป เวลาเปิด-ปิด และการเดินทาง',
        dialogue: `(น้ำเสียงชวนติดตาม) "ใครกำลังหาที่เที่ยวฮีลใจใกล้ๆ แนะนำให้เซฟคลิปนี้ไว้ แล้วชวนคนรู้ใจมาตามรอยวันหยุดนี้เลยนะครับ!"`,
        foley: 'เพลงประกอบท่อนฮุคจบสวยงาม ประทับใจ',
        promptEn: `Cinematic wide sunset shot of ${subject} glowing against a warm twilight sky, happy traveler smiling towards camera inviting viewers, travel commercial finale, 8k`
      }
    ];
    return selectEvenly(pool, targetCount);
  }

  // 2. Cafe / Food / Street Food / Night Market (คาเฟ่, ของกิน, ร้านอาหาร, ตลาดนัด)
  if (/คาเฟ่|กาแฟ|ร้านอาหาร|ของกิน|กิน|สตรีทฟู้ด|ตลาด|เยาวราช|มัทฉะ|เค้ก|ชา|ก๋วยเตี๋ยว|บุฟเฟต์|cafe|coffee|food/.test(t)) {
    const pool = [
      {
        title: `ช็อตเปิด Hook: เมนูซิกเนเจอร์ยั่วน้ำลายตรงหน้ากล้อง`,
        angle: 'Close-up Shot',
        angleTh: 'มุมใกล้ยื่นอาหาร/แก้วเครื่องดื่มเข้าหากล้อง (เลนส์ 1x)',
        lens: 'เลนส์ 1x โฟกัสใกล้',
        movement: 'ดันกล้องเข้าหาอาหารช้าๆ (Push-In)',
        duration: 2.5,
        action: `เริ่มต้นด้วยช็อตถือแก้วเครื่องดื่มหรือตักเมนูเด็ดของ ${subject} ยื่นเข้าหากล้องให้เห็นความฉ่ำ/ควันหอมกรุ่น โดยมีบรรยากาศร้านสวยๆ เบลออยู่ด้านหลัง`,
        onScreenText: `🔥 ค้นพบร้านเด็ด! ${subject} ที่ต้องมาซ้ำ`,
        spaceGuide: '📐 เว้นพื้นที่ด้านบน 30% สำหรับใส่พาดหัวตัวโตสีสดใส ดึงคนดูหยุดเลื่อนนิ้ว',
        dialogue: `(น้ำเสียงตื่นเต้น ชวนหิว) "ทุกคน! วันนี้พามาเจอ ${subject} บอกเลยว่าทั้งบรรยากาศทั้งเมนูตรงหน้าคือเกินต้านมาก!"`,
        foley: 'เสียงน้ำแข็งกระทบแก้วสดชื่น หรือเสียงอาหารร้อนๆ + เพลงจังหวะสนุก',
        promptEn: `Appetizing close-up shot holding a signature drink and gourmet dish towards camera at ${subject}, warm natural daylight, shallow depth of field, vibrant lifestyle food vlog, 8k`
      },
      {
        title: `พาเดินเปิดประตูเข้าร้าน เก็บบรรยากาศรอบๆ`,
        angle: 'Wide Establishing Shot',
        angleTh: 'มุมกว้างเดินเข้าร้านเห็นการตกแต่ง (เลนส์ 0.5x)',
        lens: 'เลนส์ 0.5x Ultra-Wide',
        movement: 'เดินถือกล้องก้าวผ่านประตูเข้าร้าน (Walk-In POV)',
        duration: 3.0,
        action: `ถ่ายมุมกว้างตั้งแต่หน้าร้าน ผลักประตูเดินเข้าไปเห็นมุมที่นั่ง แสงธรรมชาติที่ส่องผ่านหน้าต่าง และการตกแต่งร้านที่มีเอกลักษณ์`,
        onScreenText: `✨ มู้ดร้านดีมาก แสงสวยทุกมุม`,
        spaceGuide: '📐 เว้นพื้นที่มุมซ้ายบนหรือด้านล่างสำหรับใส่ชื่อร้านและโซนที่นั่งแนะนำ',
        dialogue: `(น้ำเสียงสดใส เล่าให้เพื่อนฟัง) "ตัวร้านตกแต่งมู้ดดีสุดๆ ครับ โปร่งโล่ง แสงธรรมชาติเข้าสวยทุกมุม สายถ่ายรูปต้องเลิฟแน่นอน"`,
        foley: 'เสียงกระดิ่งประตูร้าน + เพลง Lo-Fi / Jazz เบาๆ ในร้าน',
        promptEn: `Wide POV walking shot entering a beautifully designed aesthetic cafe (${subject}), warm sunlight streaming through large windows, cozy interior design, 8k`
      },
      {
        title: `ช็อตกำลังทำสดๆ / เทเครื่องดื่มแยกชั้นสวยๆ`,
        angle: 'Medium Close-up',
        angleTh: 'มุมเจาะตอนบาริสต้า/เชฟกำลังทำเมนูเด็ด (เลนส์ 2x)',
        lens: 'เลนส์ 2x ซูมเจาะแอคชั่น',
        movement: 'ถือกล้องนิ่งโฟกัสที่มือและการเท (Static Detail)',
        duration: 2.5,
        action: `ถ่ายเจาะจังหวะกำลังเทนมลงในกาแฟแยกชั้น หรือกำลังราดซอส/เสิร์ฟอาหารลงบนโต๊ะแบบเห็นการเคลื่อนไหวชัดๆ`,
        onScreenText: `ทำสดใหม่แก้วต่อแก้ว พิถีพิถันสุดๆ ☕`,
        spaceGuide: '📐 จัดจุดเทอยู่กลางภาพ เว้นพื้นที่ด้านบนใส่ชื่อเมนูและราคา',
        dialogue: `(น้ำเสียงน่าติดตาม) "ความเด็ดคือเขาคัดวัตถุดิบดีมาก ทำสดใหม่กลิ่นหอมฟุ้งไปทั้งร้านเลยครับ"`,
        foley: 'เสียงเทเครื่องดื่ม ASMR หรือเสียงเสิร์ฟจานอาหารคมชัด',
        promptEn: `Medium close-up shot of barista pouring rich espresso over milk creating beautiful layers at ${subject}, steam rising, crisp commercial food cinematography, 8k`
      },
      {
        title: `มาโครเจาะเนื้อสัมผัสอาหาร/ขนมแบบใกล้สุดๆ`,
        angle: 'Extreme Close-up / Macro',
        angleTh: 'มุมมาโครตักเค้ก/อาหารเห็นความฉ่ำเยิ้ม (เลนส์ 2x)',
        lens: 'เลนส์ 2x Macro',
        movement: 'เลื่อนกล้องเข้าช้าๆ ขณะใช้ช้อนตัด (Slow Slide)',
        duration: 3.0,
        action: `ใช้ช้อนตักหรือหั่นเมนูไฮไลท์ช้าๆ ให้เห็นความนุ่มฟูหรือไส้เยิ้มๆ เต็มเฟรม`,
        onScreenText: `ดูความฉ่ำนี้สิ... เต็มสิบไม่หัก! 🤤`,
        spaceGuide: '📐 เว้นพื้นที่ด้านล่าง 20% สำหรับวางซับไตเติลบรรยายรสชาติ',
        dialogue: `(น้ำเสียงฟินๆ) "ดูเนื้อสัมผัสใกล้ๆ สิครับ นุ่มละมุนมาก พอตักขึ้นมาคือหอมสุดๆ"`,
        foley: 'เสียงช้อนตักผ่านขนม/อาหาร ASMR ชัดเจน',
        promptEn: `Extreme macro shot of a spoon cutting into a decadent signature dessert/dish at ${subject}, rich glossy texture, soft natural window light, 8k`
      },
      {
        title: `ช็อตชิมคำแรก & รีแอคชั่นความอร่อยจริงใจ`,
        angle: 'Medium Shot',
        angleTh: 'มุมระดับสายตาถ่ายตอนชิมแล้วพยักหน้าฟิน (เลนส์ 1x)',
        lens: 'เลนส์ 1x ระยะสายตา',
        movement: 'ถือกล้องนิ่งระดับสายตา (Eye-Level)',
        duration: 3.0,
        action: `ถ่ายตัวแบบตักอาหารชิมคำแรกหรือยกแก้วขึ้นดื่ม แล้วหันมายิ้มตาเป็นประกาย พยักหน้าคอนเฟิร์มความอร่อย`,
        onScreenText: `รสชาติกลมกล่อม อร่อยแสงออกปาก! ⭐`,
        spaceGuide: '📐 จัดตัวแบบอยู่กลางภาพ เว้นพื้นที่ด้านบนศีรษะสำหรับใส่คะแนนรีวิว (เช่น 10/10)',
        dialogue: `(น้ำเสียงประทับใจ) "คำแรกเข้าไปคือว้าวเลย รสชาติกลมกล่อม ไม่หวานโดด ลงตัวมากๆ ครับ"`,
        foley: 'เสียงเอฟเฟกต์ปิ๊งสดใส + เสียงเพลงสนุกสนาน',
        promptEn: `Medium shot of a happy vlogger tasting delicious food and smiling with genuine delight at ${subject}, bright natural cafe lighting, authentic lifestyle, 8k`
      },
      {
        title: `สรุปพิกัดร้าน & ชวนเพื่อนตามมาเช็กอิน`,
        angle: 'Medium Shot',
        angleTh: 'มุมถ่ายคู่โต๊ะอาหารพร้อมยกแก้วชวนคนดู (เลนส์ 1x)',
        lens: 'เลนส์ 1x มุมปกติ',
        movement: 'ค่อยๆ ถอยกล้องออกเห็นทั้งโต๊ะ (Pull-Out)',
        duration: 3.0,
        action: `เห็นตัวแบบนั่งยิ้มสดใสพร้อมเมนูบนโต๊ะ ยกแก้วชนกล้องเหมือนชวนคนดูมาด้วยกัน`,
        onScreenText: `📍 พิกัด: ${subject} (กดเซฟไว้ตามมาเลย!)`,
        spaceGuide: '📐 เว้นพื้นที่ว่างด้านล่าง 25% สำหรับใส่ป้ายพิกัด เวลาเปิด-ปิด และที่จอดรถ',
        dialogue: `(น้ำเสียงชวนคุย) "ใครสายกินสายคาเฟ่ กดเซฟคลิปนี้ไว้แล้วแท็กชวนเพื่อนตามมาเช็กอินที่ ${subject} กันได้เลยครับ!"`,
        foley: 'เพลงจบฟีลกู๊ด สดใส',
        promptEn: `Medium wide shot of cheerful creator raising a drink towards camera at a beautifully arranged table at ${subject}, warm inviting vibe, 8k`
      }
    ];
    return selectEvenly(pool, targetCount);
  }

  // 3. Sea / Beach / Mountain / Nature / Camping / Hotel (ทะเล, ภูเขา, ดอย, แคมป์ปิ้ง, ที่พัก)
  if (/ทะเล|ชายหาด|เกาะ|ภูเขา|ดอย|หมอก|แคมป์|กางเต็นท์|น้ำตก|ที่พัก|โรงแรม|พูลวิลล่า|รีสอร์ท|ธรรมชาติ|beach|sea|mountain|camp|hotel|resort/.test(t)) {
    const pool = [
      {
        title: `ช็อตเปิด Hook: เปิดม่าน/เปิดประตูเจอวิวหลักล้านของ${subject}`,
        angle: 'POV Reveal Shot',
        angleTh: 'มุมสายตาเดินเปิดประตูเผยวิวสวยเต็มตา (เลนส์ 0.5x)',
        lens: 'เลนส์ 0.5x Ultra-Wide',
        movement: 'เดินถือกล้องพุ่งออกไปหาวิว (Forward Reveal)',
        duration: 2.5,
        action: `เริ่มจากมุมมืดด้านใน ค่อยๆ เปิดประตูหรือเดินก้าวออกมาเจอวิวธรรมชาติ/วิวของ${subject}แบบเต็มตา แสงแดดและสายลมพัดเข้ามา`,
        onScreenText: `🌊 เปิดมาเจอวิวแบบนี้ที่ ${subject} คือคุ้มค่าเหนื่อย!`,
        spaceGuide: '📐 เว้นพื้นที่ช่วงท้องฟ้าด้านบน 30% สำหรับวางพาดหัวใหญ่ดึงดูดสายตา',
        dialogue: `(น้ำเสียงตื่นเต้น ประทับใจ) "ทุกคนดูวิวตรงหน้านี้สิครับ! วันนี้เราพามาพักผ่อนกันที่ ${subject} บอกเลยว่าของจริงสวยกว่าในรูปสิบเท่า!"`,
        foley: 'เสียงคลื่นทะเลหรือเสียงลมพัดธรรมชาติ + เพลงเปิดคลิปแนว Travel Vlog',
        promptEn: `POV wide reveal shot stepping out onto a scenic balcony overlooking breathtaking panoramic view of ${subject}, bright natural sunlight, crystal clear sky, 8k`
      },
      {
        title: `เดินสำรวจบรรยากาศ & สัมผัสธรรมชาติรอบตัว`,
        angle: 'Wide Establishing Shot',
        angleTh: 'มุมกว้างถ่ายตัวแบบเดินชมวิวสบายๆ (เลนส์ 0.5x หรือ 1x)',
        lens: 'เลนส์ 1x มุมปกติ',
        movement: 'แพนกล้องตามตัวแบบช้าๆ (Slow Tracking Pan)',
        duration: 3.0,
        action: `ตั้งกล้องหรือให้เพื่อนเดินถ่ายจากด้านข้าง เห็นตัวแบบกางแขนรับลมหรือเดินเล่นท่ามกลางบรรยากาศสวยๆ ของ${subject}`,
        onScreenText: `🍃 ทิ้งงานมาชาร์จแบต สูดอากาศเต็มปอด`,
        spaceGuide: '📐 จัดตัวแบบไว้เส้นตัด 9 ช่องฝั่งซ้าย เว้นพื้นที่วิวฝั่งขวาใส่ข้อความบอกบรรยากาศ',
        dialogue: `(น้ำเสียงชิลล์ สบายใจ) "อากาศดีมาก ลมพัดเย็นตลอดทั้งวัน เหมาะกับการหนีความวุ่นวายมาพักสมองสุดๆ ครับ"`,
        foley: 'เสียงธรรมชาติจริงคลอไปกับดนตรีอคูสติกฟังสบาย',
        promptEn: `Wide cinematic lifestyle shot of a happy traveler walking and enjoying the breeze at ${subject}, lush scenery, golden daylight, 8k`
      },
      {
        title: `เจาะดีเทลมุมพักผ่อน & พร็อพถ่ายรูปเก๋ๆ`,
        angle: 'Close-up Shot',
        angleTh: 'มุมใกล้ถ่ายพร็อพ/เครื่องดื่มฉากหลังเป็นวิวสวย (เลนส์ 2x)',
        lens: 'เลนส์ 2x ละลายฉากหลัง',
        movement: 'ถือกล้องนิ่งโฟกัสวัตถุด้านหน้า (Rack Focus)',
        duration: 2.5,
        action: `วางแก้วเครื่องดื่ม/หมวก/หนังสือ หรือถ่ายมือที่กำลังสัมผัสธรรมชาติ โดยมีวิวสวยๆ ของ${subject}เบลออยู่ด้านหลัง`,
        onScreenText: `✨ มู้ดดีทุกมุม ถ่ายรูปเพลินมาก`,
        spaceGuide: '📐 เว้นพื้นที่ด้านบน 25% สำหรับใส่แคปชั่นสั้นๆ สไตล์มินิมอล',
        dialogue: `(น้ำเสียงอบอุ่น) "ไม่ว่าจะหันไปทางไหนก็มีมุมเก๋ๆ ให้เก็บภาพความประทับใจเพียบเลยครับ"`,
        foley: 'เสียงลมพัดใบไม้หรือเสียงคลื่นเบาๆ ผ่อนคลาย',
        promptEn: `Close-up aesthetic lifestyle shot of refreshing drink and travel props in foreground with blurred scenic view of ${subject} in background, warm sunlight, 8k`
      },
      {
        title: `กิจกรรมไฮไลท์สนุกๆ ที่ต้องทำเมื่อมาถึง`,
        angle: 'Medium Shot',
        angleTh: 'มุมปานกลางเกาะติดกิจกรรมสนุกๆ (เลนส์ 1x)',
        lens: 'เลนส์ 1x ระยะสายตา',
        movement: 'ถือกล้องเคลื่อนตามจังหวะแอคชั่น (Handheld Dynamic)',
        duration: 3.0,
        action: `ถ่ายจังหวะกำลังทำกิจกรรมไฮไลท์ของทริป เช่น ลงเล่นน้ำ นั่งชิลล์ริมระเบียง หรือปิกนิกชมวิวด้วยรอยยิ้มสนุกสนาน`,
        onScreenText: `🔥 ไฮไลท์เด็ดของทริปนี้ ห้ามพลาด!`,
        spaceGuide: '📐 เว้นพื้นที่ด้านล่าง 20% สำหรับวางซับไตเติลคำบรรยาย',
        dialogue: `(น้ำเสียงสนุกสนาน มีชีวิตชีวา) "และไฮไลท์ที่พลาดไม่ได้เลยคือมุมนี้ครับ ได้มาใช้เวลาชิลล์ๆ แบบนี้คือมีความสุขมาก"`,
        foley: 'เสียงหัวเราะสนุกสนานและเพลงจังหวะสดใส',
        promptEn: `Medium dynamic shot of happy travelers enjoying outdoor activity at ${subject}, genuine laughter, bright sunlit atmosphere, 8k`
      },
      {
        title: `ช็อตแสงเย็น Golden Hour สุดโรแมนติก`,
        angle: 'Medium Close-up',
        angleTh: 'มุมย้อนแสงอาทิตย์ตกดิน เห็นแสงริมไลท์สีทอง (เลนส์ 2x)',
        lens: 'เลนส์ 2x Portrait',
        movement: 'เคลื่อนกล้องโค้งรอบตัวแบบช้าๆ (Slow Arc)',
        duration: 3.0,
        action: `ถ่ายช่วงพระอาทิตย์ใกล้ตกดิน แสงสีส้มทองส่องกระทบเส้นผมและใบหน้า ตัวแบบหันมายิ้มให้กล้องอย่างอบอุ่น`,
        onScreenText: `🌅 แสงเย็นตอนพระอาทิตย์ตกคือที่สุด!`,
        spaceGuide: '📐 เว้นพื้นที่ด้านบนศีรษะสำหรับวางข้อความสรุปความประทับใจ',
        dialogue: `(น้ำเสียงประทับใจ) "ยิ่งช่วงเย็นตอนแสงพระอาทิตย์กำลังจะลับขอบฟ้า โทนสีท้องฟ้าคือสวยโรแมนติกมากจริงๆ ครับ"`,
        foley: 'เสียงดนตรีท่อนไคลแม็กซ์อบอุ่นกินใจ',
        promptEn: `Medium close-up portrait at ${subject} during golden hour sunset, warm glowing rim light on hair, serene joyful smile, cinematic 8k`
      },
      {
        title: `สรุปความประทับใจ & ชวนเซฟคลิปตามรอย`,
        angle: 'Wide Establishing Shot',
        angleTh: 'มุมกว้างเก็บภาพรวมส่งท้ายทริป (เลนส์ 1x)',
        lens: 'เลนส์ 1x มุมกว้าง',
        movement: 'ถือกล้องนิ่งให้ตัวแบบโบกมือลา (Static Outro)',
        duration: 3.0,
        action: `ถ่ายภาพมุมกว้างเห็นตัวแบบและวิวสวยๆ ของ${subject} พร้อมขึ้นข้อความสรุปพิกัดและชวนคนดูมาเที่ยวตาม`,
        onScreenText: `📌 ปักหมุด ${subject} เซฟไว้มาตามรอยกัน!`,
        spaceGuide: '📐 เว้นพื้นที่กลางค่อนล่างสำหรับใส่ป้ายสรุปพิกัด งบประมาณ และคำแนะนำ',
        dialogue: `(น้ำเสียงชวนคุย) "เป็นอีกหนึ่งทริปที่ประทับใจสุดๆ ใครอยากมาสัมผัสบรรยากาศแบบนี้ กดเซฟคลิปไว้แล้วแพ็กกระเป๋ามาเที่ยวกันนะครับ!"`,
        foley: 'เสียงเพลงจบ Fade Out นุ่มนวล',
        promptEn: `Wide scenic outro shot at ${subject} during twilight, happy traveler waving goodbye to camera, travel vlog finale, 8k`
      }
    ];
    return selectEvenly(pool, targetCount);
  }

  // 4. Universal Travel / Vlog / Content Story Arc (ใช้ได้กับทุกโจทย์ที่โยนเข้ามา เชื่อมโยงชื่อเรื่องทุกฉาก!)
  const universalPool = [
    {
      title: `ช็อตเปิด Hook: ดึงสายตาเข้าสู่ ${subject}`,
      angle: 'Low Angle Hero Shot',
      angleTh: 'มุมกว้างเชิดขึ้นเล็กน้อยเห็นทั้งคนและสถานที่ (เลนส์ 0.5x)',
      lens: 'เลนส์ 0.5x Ultra-Wide',
      movement: 'เดินถือกล้องดันเข้าหาตัวแบบช้าๆ (Slow Push-In)',
      duration: 2.5,
      action: `เริ่มต้นหน้าจุดเด่นที่สุดของ "${subject}" ให้ตัวแบบหันมาสบตากล้องด้วยท่าทางตื่นเต้นแล้วผายมือชวนเข้าสู่ฉาก`,
      onScreenText: `🔥 พาบุก ${subject}! จะเด็ดแค่ไหนมาดูกัน`,
      spaceGuide: '📐 เว้นพื้นที่ว่างด้านบน 30% (เหนือศีรษะ) สำหรับวางพาดหัว Hook ขนาดใหญ่ไม่ให้บังหน้าคนพูด',
      dialogue: `(น้ำเสียงตื่นเต้น ดึงดูดคนดูใน 3 วิแรก) "ทุกคนครับ! วันนี้เรามาอยู่กันที่ ${subject} ที่หลายคนถามหากันเข้ามาเยอะมาก ตามมาดูกันเลยว่าของจริงจะเด็ดขนาดไหน!"`,
      foley: 'เสียงเอฟเฟกต์ Whoosh เปิดคลิป + เพลงจังหวะสนุกชวนติดตาม',
      promptEn: `Dynamic wide establishing hook shot featuring ${subject}, enthusiastic presenter welcoming viewers into the scene, bright natural lighting, commercial vlog style, 8k`
    },
    {
      title: `พาเดินเข้าสู่บรรยากาศจริงของ ${subject}`,
      angle: 'Over-the-Shoulder Shot',
      angleTh: 'มุมมองเดินตามหลัง พาคนดูเข้าสู่สถานที่ (เลนส์ 1x)',
      lens: 'เลนส์ 1x มุมปกติ',
      movement: 'เดินถือกล้องตามหลังนิ่งๆ (Smooth Walk Follow)',
      duration: 3.0,
      action: `ถือกล้องเดินตามหลังตัวแบบก้าวเข้าสู่พื้นที่หลักของ "${subject}" แพนกล้องให้เห็นบรรยากาศรอบข้างที่คึกคักหรือสวยงาม`,
      onScreenText: `✨ บรรยากาศจริง มู้ดดีตั้งแต่ก้าวแรก`,
      spaceGuide: '📐 จัดตัวแบบไว้ฝั่งซ้ายของจอ เว้นพื้นที่ฝั่งขวาสำหรับใส่ป้ายบอกพิกัดหรือเวลา',
      dialogue: `(น้ำเสียงเล่าเรื่องเป็นกันเอง) "พอเดินเข้ามาข้างใน บรรยากาศจริงคือดีมากครับ มีมุมน่าสนใจให้เราแวะชมตลอดทางเลย"`,
      foley: 'เสียงบรรยากาศสถานที่จริง (Ambient) เบาๆ คลอกับเสียงเพลง',
      promptEn: `Smooth over-the-shoulder tracking shot following traveler exploring ${subject}, rich environmental details, warm natural daylight, cinematic 8k`
    },
    {
      title: `เจาะจุดไฮไลท์อันดับ 1 ที่ห้ามพลาด`,
      angle: 'Medium Shot',
      angleTh: 'มุมปานกลางระดับสายตา โฟกัสจุดไฮไลท์ (เลนส์ 1x)',
      lens: 'เลนส์ 1x ระยะสายตา',
      movement: 'แพนกล้องจากจุดเด่นมาหาตัวแบบ (Pan Reveal)',
      duration: 3.0,
      action: `ถ่ายจุดไฮไลท์สำคัญของ "${subject}" ให้เห็นชัดๆ เต็มเฟรม แล้วแพนกล้องมาที่ตัวแบบซึ่งกำลังทำกิจกรรมหรือชี้ให้ดูจุดเด่น`,
      onScreenText: `⭐ ไฮไลท์เด็ดประจำทริปที่ต้องมาโดน!`,
      spaceGuide: '📐 โฟกัสจุดเด่นกลางจอ เว้นพื้นที่ด้านล่าง 20% สำหรับวางซับไตเติลบรรยาย',
      dialogue: `(น้ำเสียงเน้นจังหวะสำคัญ) "และจุดไฮไลท์ที่ทุกคนต้องแวะเมื่อมาถึง ${subject} ก็คือตรงนี้เลยครับ เป็นซิกเนเจอร์ที่คุ้มค่ากับการมามากๆ"`,
      foley: 'เสียงเอฟเฟกต์ Pop สดใสเน้นจุดไฮไลท์',
      promptEn: `Medium shot showcasing the main highlight of ${subject}, vibrant colors, crisp focus, engaging lifestyle presentation, 8k`
    },
    {
      title: `ซูมเจาะดีเทลใกล้ๆ เพิ่มมิติให้ภาพดูโปร`,
      angle: 'Extreme Close-up / Macro',
      angleTh: 'มุมใกล้เจาะรายละเอียด ละลายฉากหลัง (เลนส์ 2x)',
      lens: 'เลนส์ 2x Tele / Macro',
      movement: 'เลื่อนกล้องช้าๆ จากซ้ายไปขวา (Slow Slider)',
      duration: 2.5,
      action: `สลับมาถ่ายมุมใกล้ (Close-up) เจาะรายละเอียดสิ่งของ อาหาร งานฝีมือ หรือการสัมผัสใกล้ๆ ใน "${subject}" เพื่อตัดจังหวะให้คลิปไม่น่าเบื่อ`,
      onScreenText: `🔍 ดีเทลใกล้ๆ สวยคมชัดทุกมุม`,
      spaceGuide: '📐 เว้นขอบบนของเฟรม 20% สำหรับใส่ข้อความสั้นๆ อธิบายจุดเด่น',
      dialogue: `(น้ำเสียงชื่นชม) "ลองดูรายละเอียดใกล้ๆ สิครับ พอถ่ายเจาะมุมนี้ยิ่งเห็นความพิเศษชัดเจนเลย"`,
      foley: 'เสียง ASMR สัมผัสหรือเสียงบรรยากาศใกล้ๆ คมชัด',
      promptEn: `Extreme close-up macro detail shot capturing fine textures and highlights of ${subject}, shallow depth of field with creamy bokeh, 8k`
    },
    {
      title: `โมเมนต์ความประทับใจ & มุมถ่ายรูปเช็กอิน`,
      angle: 'Medium Close-up',
      angleTh: 'มุมครึ่งตัวเห็นรอยยิ้มและฉากหลังสวยๆ (เลนส์ 1x หรือ 2x)',
      lens: 'เลนส์ 1x หรือ 2x',
      movement: 'ถือกล้องนิ่งโฟกัสรอยยิ้มตัวแบบ (Static Portrait)',
      duration: 3.0,
      action: `ถ่ายตัวแบบในมุมที่แสงสวยที่สุดของ "${subject}" ยิ้มอย่างมีความสุขและแสดงความรู้สึกประทับใจแบบธรรมชาติ`,
      onScreenText: `😍 ประทับใจสุดๆ ได้รูปสวยกลับบ้านเพียบ`,
      spaceGuide: '📐 จัดใบหน้าอยู่กึ่งกลางค่อนบน เว้นช่วงอกลงมาสำหรับวางซับไตเติล',
      dialogue: `(น้ำเสียงอบอุ่น จริงใจ) "บอกเลยว่ามาที่นี่นอกจากจะได้ความสุขกลับไปแล้ว ยังได้รูปสวยๆ กลับไปอัปลงโซเชียลเพียบเลยครับ"`,
      foley: 'เสียงชัตเตอร์กล้องถ่ายรูป + ดนตรีฟีลกู๊ด',
      promptEn: `Medium close-up portrait of a smiling happy creator enjoying the moment at ${subject}, warm golden sunlight, authentic lifestyle photography, 8k`
    },
    {
      title: `สรุปความคุ้มค่า & ชวนคนดูกดเซฟตามรอย`,
      angle: 'Wide Establishing Shot',
      angleTh: 'มุมกว้างเก็บภาพรวมส่งท้าย + ชวนคอมเมนต์ (เลนส์ 1x)',
      lens: 'เลนส์ 1x มุมกว้าง',
      movement: 'ค่อยๆ ถอยกล้องออกช้าๆ (Slow Pull-Out)',
      duration: 3.0,
      action: `ถ่ายมุมกว้างเห็นภาพรวมของ "${subject}" ตัวแบบหันมายิ้มโบกมือลาและชี้ชวนให้คนดูกดเซฟหรือแชร์คลิปนี้`,
      onScreenText: `📌 กดเซฟคลิปไว้ตามรอย ${subject} ได้เลย!`,
      spaceGuide: '📐 เว้นพื้นที่ว่างด้านล่าง 25% สำหรับใส่กรอบสรุปพิกัด งบประมาณ และชวนกดติดตาม',
      dialogue: `(น้ำเสียงชวนติดตาม) "ใครที่กำลังวางแพลนอยู่ กดเซฟคลิปนี้เก็บไว้ แล้วชวนเพื่อนหรือคนรู้ใจมาตามรอยที่ ${subject} กันได้เลยนะครับ!"`,
      foley: 'เพลงประกอบท่อนจบชัดเจน ประทับใจ',
      promptEn: `Wide cinematic outro shot at ${subject}, cheerful presenter waving and smiling at camera, warm sunset lighting, 8k`
    }
  ];

  // If user requested more than 6 shots (up to 12), expand with intermediate discovery beats
  if (targetCount > universalPool.length) {
    const extraPool = [
      universalPool[0],
      universalPool[1],
      {
        ...universalPool[2],
        title: `สำรวจมุมแรกที่น่าตื่นตาตื่นใจของ ${subject}`,
        onScreenText: `✨ จุดเช็กอินที่ 1 ที่ต้องแวะชม`,
        dialogue: `(น้ำเสียงกระตือรือร้น) "จุดแรกที่เราแวะมาดูกัน บอกเลยว่าโดดเด่นสะดุดตาตั้งแต่เดินเข้ามาเลยครับ"`
      },
      universalPool[3],
      universalPool[2],
      {
        ...universalPool[3],
        title: `มุมมองจากอีกฝั่ง เก็บภาพบรรยากาศกว้างๆ`,
        angle: 'High Angle / Bird Eye',
        angleTh: 'มุมสูงเห็นภาพรวมมุมกว้าง (เลนส์ 0.5x)',
        onScreenText: `📸 มุมสูงเห็นวิวครบทุกมิติ`,
        dialogue: `(น้ำเสียงเพลิดเพลิน) "พอมองจากมุมนี้ จะเห็นภาพรวมที่สวยงามลงตัวมากๆ ครับ"`
      },
      universalPool[4],
      universalPool[5]
    ];
    return selectEvenly(extraPool, targetCount);
  }

  return selectEvenly(universalPool, targetCount);
}

function selectEvenly(pool, count) {
  if (count <= 1) return [pool[0]];
  if (count >= pool.length) {
    const res = [...pool];
    while (res.length < count) {
      const idx = res.length + 1;
      const base = pool[(res.length) % pool.length];
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

/**
 * Enrich an individual beat (when user provides explicit numbered steps or scenes)
 */
function enrichSingleBeat(projectTitle, beatText, index, totalShots, visualStyleEn) {
  const roleInfo = getShotNarrativeRole(index, totalShots);
  const cleanBeat = String(beatText || '').replace(/^(?:ฉากที่|ช็อตที่|Scene|Shot)\s*\d+[:\s.-]*/i, '').trim();
  const cleanTitle = extractCleanSubject(projectTitle);

  // Choose varied camera angle across shots so it's never monotonous
  const cameraRotation = [
    { angle: 'Wide Establishing Shot', angleTh: 'มุมกว้างเปิดฉากเห็นสถานที่ (เลนส์ 0.5x)', lens: 'เลนส์ 0.5x Ultra-Wide', movement: 'เดินถือกล้องดันเข้าช้าๆ (Slow Push-In)' },
    { angle: 'Medium Shot', angleTh: 'มุมปานกลางระดับสายตาเล่าเรื่อง (เลนส์ 1x)', lens: 'เลนส์ 1x ระยะสายตา', movement: 'ถือกล้องเดินตามนุ่มนวล (Smooth Follow)' },
    { angle: 'Close-up Shot', angleTh: 'มุมใกล้โฟกัสจุดเด่นชัดๆ (เลนส์ 2x)', lens: 'เลนส์ 2x ละลายหลัง', movement: 'ถือกล้องนิ่งโฟกัสจุดสำคัญ (Static Focus)' },
    { angle: 'Extreme Close-up / Macro', angleTh: 'มุมมาโครเจาะดีเทลใกล้พิเศษ (เลนส์ 2x)', lens: 'เลนส์ 2x Macro', movement: 'เลื่อนกล้องช้าๆ ด้านข้าง (Slow Slide)' },
    { angle: 'Low Angle Hero Shot', angleTh: 'มุมเสยต่ำเพิ่มความอลังการ (เลนส์ 0.5x/1x)', lens: 'เลนส์ 1x มุมต่ำ', movement: 'แพนกล้องเชิดขึ้นช้าๆ (Slow Tilt Up)' },
    { angle: 'Over-the-Shoulder Shot', angleTh: 'มุมมองข้ามไหล่พาคนดูมีส่วนร่วม (เลนส์ 1x)', lens: 'เลนส์ 1x มุมปกติ', movement: 'เดินตามหลังตัวแบบ (Walk-With)' }
  ];

  // Infer camera angle from keywords in beatText if mentioned, else rotate smartly
  let cam = cameraRotation[index % cameraRotation.length];
  const lower = cleanBeat.toLowerCase();
  if (/มาโคร|macro|ใกล้มาก|extreme close/.test(lower)) cam = cameraRotation[3];
  else if (/โคลสอัพ|close-up|มุมใกล้|ใบหน้า|มือ/.test(lower)) cam = cameraRotation[2];
  else if (/มุมกว้าง|wide|เปิดตัว|ทั้งร้าน|วิว/.test(lower)) cam = cameraRotation[0];
  else if (/มุมต่ำ|low angle|เสย/.test(lower)) cam = cameraRotation[4];
  else if (/ตามหลัง|ข้ามไหล่|เดินเข้า/.test(lower)) cam = cameraRotation[5];

  // Craft connected voiceover based on position in story
  let dialogue = '';
  if (index === 0) {
    dialogue = `(น้ำเสียงตื่นเต้น เปิดคลิปดึงคนดู) "ทุกคนครับ! วันนี้พามาที่ ${cleanTitle} เริ่มกันที่ช็อตแรก ${cleanBeat} บอกเลยว่าห้ามพลาด!"`;
  } else if (index === totalShots - 1) {
    dialogue = `(น้ำเสียงประทับใจ ชวนกดเซฟ) "ปิดท้ายด้วย ${cleanBeat} เป็นทริปที่คุ้มค่ามาก ใครชอบแนวนี้กดเซฟคลิปไว้ตามรอยได้เลยครับ!"`;
  } else if (index === 1) {
    dialogue = `(น้ำเสียงเล่าเรื่องสนุกๆ) "พอเข้ามาถึง เราก็เริ่มด้วย ${cleanBeat} บรรยากาศจริงคือดีงามมากครับ"`;
  } else {
    dialogue = `(น้ำเสียงเพลิดเพลิน) "ไปต่อกันที่ไฮไลท์ช็อตนี้เลยครับ ${cleanBeat} มุมนี้ถ่ายออกมาแล้วสวยลงตัวสุดๆ"`;
  }

  const onScreenText = index === 0
    ? `🔥 ${cleanBeat.slice(0, 32)}`
    : index === totalShots - 1
    ? `📌 พิกัด: ${cleanTitle.slice(0, 28)} (เซฟไว้เลย!)`
    : `✨ ${cleanBeat.slice(0, 34)}`;

  const actionTh = `ถ่ายช็อต "${cleanBeat}" โดยใช้${cam.angleTh} (${cam.movement}) ให้เห็นแอคชั่นและอารมณ์ในฉากชัดเจน`;
  const foley = index === 0
    ? 'เสียงเอฟเฟกต์เปิดคลิป + เพลงจังหวะสนุกดึงดูดสายตา'
    : 'เสียงบรรยากาศจริงในฉาก (Ambient) คลอไปกับเพลงประกอบ';

  const promptEn = `${cam.angle}, ${cleanBeat} (${cleanTitle}), ${visualStyleEn || 'natural daylight, high-end travel lifestyle photography'}, hyper-realistic, crisp details, 8k`;
  const videoPrompt = `[Camera: ${cam.movement}] [Shot: ${cam.angle}] [Action: ${cleanBeat}] [Style: ${visualStyleEn || 'cinematic'}], smooth 60fps motion, 8k`;

  return {
    shot_role: roleInfo.role,
    duration_seconds: roleInfo.defaultDuration,
    camera_angle: cam.angle,
    camera_angle_th: cam.angleTh,
    camera_movement: cam.movement,
    lens_focal: cam.lens,
    action_description: actionTh,
    dialogue: dialogue,
    audio_foley: foley,
    on_screen_text: onScreenText,
    live_action_guide: roleInfo.textSafeZone,
    prompt: promptEn,
    video_prompt: videoPrompt
  };
}

/**
 * Parse structured multi-scene script when user explicitly numbers scenes (1..N or Scene 1..N)
 */
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
    let rawTitle = titleMatch[1].trim().replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
    if (rawTitle.length >= 2) projectTitle = rawTitle;
  } else if (lines[0] && !/^(?:Scene|Shot|ฉาก|ช็อต|ซีน|\d+[\.\)])/i.test(lines[0])) {
    projectTitle = lines[0].replace(/^[🎬🎥\s*#*-]+/, '').replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
  }
  if (!projectTitle || projectTitle.length < 2) {
    projectTitle = 'สตอรี่บอร์ดคอนเทนต์พร้อมถ่าย';
  }

  // 2. Detect Visual Style
  let visualStyle = 'แสงธรรมชาติคมชัด สไตล์ครีเอเตอร์มืออาชีพ';
  let visualStyleEn = 'natural volumetric daylight, shallow depth of field, photorealistic lifestyle commercial 8k';
  const styleMatch = text.match(/Visual\s*Style(?:[^\n:：]*?)?[:：]\s*([^\n\r]+)/i);
  if (styleMatch) {
    let s = styleMatch[1].trim().replace(/(?:Scene|Shot|ฉาก).*$/i, '').trim();
    if (s) {
      visualStyle = s;
      visualStyleEn = s;
    }
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

  if (headerMatches.length < 2) {
    return null;
  }

  const parsedShots = [];
  for (let i = 0; i < headerMatches.length; i++) {
    const current = headerMatches[i];
    const startIdx = current.index;
    const endIdx = (i + 1 < headerMatches.length) ? headerMatches[i + 1].index : text.length;
    const blockText = text.substring(startIdx, endIdx).trim();

    const blockLines = blockText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const contentLines = blockLines.slice(1);

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
    if (audioLine) {
      foleyDesc = audioLine.replace(/^(?:Audio|Foley|Sound|เสียง|ซาวด์)\s*:\s*/i, '').trim();
    }

    const dialogueLine = contentLines.find(l => /^(?:Dialogue|บทพูด|เสียงพากย์)\s*:/i.test(l));
    if (dialogueLine) {
      dialogueText = dialogueLine.replace(/^(?:Dialogue|บทพูด|เสียงพากย์)\s*:\s*/i, '').trim();
    }

    const beatSubject = current.title || shotPrompt;
    const enriched = enrichSingleBeat(projectTitle, beatSubject, i, headerMatches.length, visualStyleEn);
    const shotNumber = current.sceneNum || (i + 1);
    const titleClean = current.title ? `ฉากที่ ${shotNumber}: ${current.title}` : `ฉากที่ ${shotNumber}`;

    parsedShots.push({
      shot_number: shotNumber,
      scene_number: shotNumber,
      scene_title: enriched.shot_role,
      shot_role: enriched.shot_role,
      title: titleClean,
      subtitle: `${enriched.camera_angle_th} • ${enriched.lens_focal}`,
      camera_angle: enriched.camera_angle,
      camera_angle_th: enriched.camera_angle_th,
      camera_movement: enriched.camera_movement,
      lens_focal: enriched.lens_focal,
      duration_seconds: enriched.duration_seconds,
      action_description: enriched.action_description,
      dialogue: dialogueText || enriched.dialogue,
      audio_foley: foleyDesc || enriched.audio_foley,
      on_screen_text: enriched.on_screen_text,
      live_action_guide: enriched.live_action_guide,
      prompt: shotPrompt && !/[\u0E00-\u0E7F]/.test(shotPrompt) ? `${shotPrompt}, ${visualStyleEn}` : enriched.prompt,
      video_prompt: enriched.video_prompt,
      visual_style: visualStyle,
      aspect_ratio: '9:16'
    });
  }

  let curTime = 0;
  parsedShots.forEach((s) => {
    const startSec = curTime;
    const endSec = Math.round((startSec + s.duration_seconds) * 10) / 10;
    curTime = endSec;
    const formatSec = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const sec = seconds % 60;
      const sStr = sec < 10 ? '0' + sec.toFixed(1) : sec.toFixed(1);
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

module.exports = {
  parseMultiSceneScript,
  normalizeScriptText,
  enrichSingleBeat,
  buildConnectedStoryBeats,
  getShotNarrativeRole,
  extractCleanSubject
};
