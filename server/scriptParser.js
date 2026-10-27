/**
 * Universal Multi-Scene Script Parser & Storyboard Director Engine
 * Parses freeform, structured, inline numbered, or arrow-separated multi-scene scripts.
 * Enriches every shot with professional directorial actions, camera grammar, audio foley,
 * natural Thai voiceover, and high-fidelity English prompts for FLUX.1.
 * Fully offline, zero Groq dependency!
 */

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normalizes user input: handles inline numbers (1. ... 2. ...), arrow steps (->),
 * and standard Scene/Shot headers.
 */
function normalizeScriptText(rawText) {
  if (!rawText) return '';
  let text = String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 1. Convert arrow steps 'A -> B -> C' or 'A => B => C' into numbered lines if detected
  if (/(?:->|→|=>)/.test(text) && !/(?:Scene|Shot|ฉากที่|\d+\.)/i.test(text)) {
    const parts = text.split(/(?:->|→|=>)/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      text = parts.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
  }

  // 2. Insert double newline before inline numbered steps e.g. "Title 1. Step A 2. Step B 3. Step C"
  text = text.replace(/(?:^|\s+|[^\d])(?:(\d+)[\.\)]\s*|(?:ฉากที่|ช็อตที่|ซีนที่|Scene|Shot)\s*(\d+)[:\s.-]*)/gi, (match, n1, n2, offset) => {
    const num = n1 || n2;
    return (offset > 0 ? '\n\n' : '') + 'Scene ' + num + ': ';
  });

  // 3. Insert newline before Prompt:
  text = text.replace(/([^\n])\s*(Prompt\s*[:：])/gi, '$1\n$2');

  // 4. Insert newline before Visual Style Reference / Visual Style:
  text = text.replace(/([^\n])\s*(Visual\s*Style(?:[^\n:：]*?)?[:：])/gi, '$1\n$2');

  // 5. Insert newline before Audio / Foley / Sound / Dialogue
  text = text.replace(/([^\n])\s*((?:Audio|Foley|Sound|เสียง|ซาวด์|Dialogue|บทพูด|เสียงพากย์)\s*[:：])/gi, '$1\n$2');

  return text;
}

/**
 * Analyze domain and generate rich, professional directorial details for any beat
 */
function enrichSingleBeat(projectTitle, beatText, index, totalShots, visualStyleEn) {
  const combined = (projectTitle + ' ' + beatText).toLowerCase();

  // Determine domain
  const isFishing = /ตกปลา|ปลา|คันเบ็ด|รอก|เหยื่อ|บ่อปลา|แม่น้ำ|อ่างเก็บน้ำ|fish|angling/.test(combined);
  const isCar = /รถ|โชว์รูม|ส่งมอบ|ขับขี่|กุญแจ|พวงมาลัย|กระจังหน้า|mazda|ev|car|suv|handover/.test(combined);
  const isSkincare = /เซรั่ม|ผิว|ครีม|ดรอปเปอร์|แต่งหน้า|สกินแคร์|บำรุง|ริ้วรอย|skin|serum|beauty/.test(combined);
  const isFood = /กาแฟ|คาเฟ่|อาหาร|กิน|ย่าง|ทำอาหาร|ชิม|มัทฉะ|ครัว|เค้ก|ชา|cafe|food|cook|eat|restaurant/.test(combined);

  // Default values
  let angle = 'Medium Shot';
  let angleTh = 'ภาพมุมปานกลางโฟกัสการกระทำหลัก';
  let lens = '35mm Anamorphic';
  let movement = 'Smooth tracking follow';
  let actionTh = beatText;
  let dialogue = `จังหวะสำคัญของเรื่องราวที่ถ่ายทอดความรู้สึกได้อย่างน่าประทับใจครับ`;
  let foley = `เสียงบรรยากาศสถานที่จริง (Ambient Tone) และเสียงการเคลื่อนไหวคมชัด`;
  let promptEn = `${beatText}, natural cinematic commercial lighting, 8k, crisp details`;

  if (isFishing) {
    if (/ได้ปลา|ปลากิน|เย่อ|ติดเบ็ด|ปลาตัวโต|สู้ปลา|ปลาติด|ดึงปลา|กระโดดเหนือน้ำ|งัดปลา|catch|strike|got fish|hook/.test(beatText.toLowerCase())) {
      angle = 'Dynamic Low-Angle Action Shot';
      angleTh = 'มุมต่ำภาพแอคชั่นดึงปลาตัวโตเหนือน้ำ';
      lens = '28mm Lens';
      movement = 'Fast Dynamic Snap Focus';
      actionTh = `คันเบ็ดโค้งงออย่างรุนแรงเมื่อมีแรงดึงมหาศาล ละอองน้ำสาดกระจายระยิบระยับ ปลาตัวโตดิ้นกระโดดเหนือน้ำ สีหน้าตัวละครตื่นเต้นลุ้นระทึกขณะหมุนรอกด้วยความมุ่งมั่น`;
      foley = `เสียงรอกลั่นดังสนั่น ละอองน้ำสาดกระจาย และเสียงเฮลั่นด้วยความสะใจ`;
      dialogue = `"จังหวะสายเบ็ดตึงตัวและความตื่นเต้นเมื่อได้ปลาตัวโตสมการรอคอยครับ!"`;
      promptEn = `Dynamic low-angle action shot, a heavy fishing rod deeply bent under tension, a fresh gleaming freshwater fish leaping out of splashing water droplets, bright sunlit morning, thrilling action blur, photorealistic 8k`;
    } else if (/กิน|อร่อย|อเร็ด|เอร็ด|ชิม|ล้อมวง|ชนแก้ว|สุข|ทาน|ฉลอง|eat|delicious|taste|enjoy/.test(beatText.toLowerCase())) {
      angle = 'Medium Shot Reaction & Joy';
      angleTh = 'ภาพมุมปานกลางสีหน้าแห่งความสุขและความอร่อย';
      lens = '50mm Master';
      movement = 'Static Lock-Off with warm focus';
      actionTh = `ทุกคนล้อมวงรอบโต๊ะแคมป์ปิ้งไม้ ตักเนื้อปลาควันกรุ่นรับประทานอย่างเอร็ดอร่อย พูดคุยหัวเราะและชนแก้วฉลองความสำเร็จของทริปท่ามกลางแสงอาทิตย์อัสดง`;
      foley = `เสียงแก้วชนกัน เสียงหัวเราะอบอุ่น และดนตรีอคูสติกเบาๆ สร้างบรรยากาศผ่อนคลาย`;
      dialogue = `"ปิดท้ายทริปด้วยรสชาติสดหวานและความสุขที่ได้แบ่งปันร่วมกันอย่างเอร็ดอร่อยครับ"`;
      promptEn = `Medium shot, group of happy friends sitting around a rustic wooden camping table smiling and eating freshly grilled fish, joyful laughter, sunset golden hour lighting, cozy outdoor lifestyle commercial, photorealistic`;
    } else if (/ทำอาหาร|ปิ้งย่าง|เตาย่าง|(?:^|[^\u0E2D])ย่าง|แล่|ปรุง|แคมป์|เตา|กระทะ|cook|grill|prepare/.test(beatText.toLowerCase())) {
      angle = 'Extreme Close-Up Macro';
      angleTh = 'ภาพโคลสอัพมาโครย่างปลาสดริมแคมป์';
      lens = '85mm Macro';
      movement = 'Gentle Macro Slider';
      actionTh = `นำวัตถุดิบสดใหม่จากสายน้ำมาบรรจงย่างบนเตาถ่านไฟอ่อนริมแคมป์ ควันหอมฉุยลอยขึ้นมา โรยสมุนไพรสดและเกลือ เนื้อปลาเดือดฉ่าบนตะแกรงอย่างน่ารับประทาน`;
      foley = `เสียงเนื้อปลาฉ่าบนตะแกรงย่าง และเสียงเปลาะแปะของถ่านไฟแคมป์ปิ้งอย่างน่ารับประทาน`;
      dialogue = `"นำวัตถุดิบสดใหม่จากธรรมชาติมาปรุงเป็นเมนูเด็ดร้อนๆ ทันทีครับ"`;
      promptEn = `Extreme close-up shot, fresh whole fish fillets grilling over a rustic outdoor campfire charcoal grill, aromatic wisps of smoke rising, fresh lemon and rosemary herbs, appetizing food commercial cinematography`;
    } else if (/เลือกสินค้า|เลือกซื้อ|ดูคัน|ลองคัน|รอก|เหยื่อ|inspect|lure|reel/.test(beatText.toLowerCase()) || (index > 0 && /คันเบ็ด|อุปกรณ์/.test(beatText) && !/เรือ|น้ำ|บ่อ|ทะเล/.test(beatText))) {
      angle = 'Medium Close-Up';
      angleTh = 'ภาพมุมปานกลางเลือกดูอุปกรณ์ตกปลา';
      lens = '50mm Prime';
      movement = 'Subtle Handheld Follow';
      actionTh = `มือหยิบคันเบ็ดคาร์บอนไฟเบอร์น้ำหนักเบาและรอกตกปลาโลหะขึ้นมาทดสอบความยืดหยุ่น รอบข้างมีเหยื่อปลอมหลากสีสันจัดเรียงสวยงามบนแผงโชว์ในร้าน`;
      foley = `เสียงหมุนสปูลรอกตกปลาดังกริ๊กๆ ละเอียด และเสียงเคาะคันเบ็ดเบาๆ`;
      dialogue = `"เลือกคันเบ็ดและเหยื่อตัวโปรดที่เหมาะกับหมายตกปลาของเราครับ"`;
      promptEn = `Medium close-up shot, hands holding a sleek metallic fishing reel and inspecting a colorful lure inside a well-lit fishing equipment shop, detailed gear texture, warm interior lighting, shallow depth of field, photorealistic 8k`;
    } else if (/ซื้อ|ร้าน|อุปกรณ์|หน้าร้าน|tackle|shop|buy/.test(beatText.toLowerCase()) || (index === 0 && /ชวน/.test(beatText))) {
      angle = 'Wide Establishing Shot';
      angleTh = 'ภาพมุมกว้างเปิดฉากหน้าร้านอุปกรณ์ตกปลา';
      lens = '24mm Wide';
      movement = 'Slow Dolly Push-In';
      actionTh = `กลุ่มเพื่อน 2-3 คน ยืนพูดคุยอย่างตื่นเต้นหน้าร้านจำหน่ายอุปกรณ์ตกปลาขนาดใหญ่ มองดูสินค้าในตู้กระจกและชี้ชวนกันเข้าไปเลือกซื้อ แสงแดดยามเช้าสดใส`;
      foley = `เสียงเปิดประตูกระจกร้าน แอมเบียนต์ถนนตอนเช้า และเสียงทักทายอย่างเป็นกันเอง`;
      dialogue = `"ทริปวันหยุดนี้เริ่มต้นที่นี่ ชวนเพื่อนรู้ใจมาเตรียมความพร้อมด้วยกันครับ"`;
      promptEn = `Wide establishing shot, group of cheerful friends standing outside a professional modern fishing tackle shop, pointing at storefront, morning soft daylight, high-end commercial cinematography, 8k, crisp details`;
    } else if (/ออกไป|เดินทาง|ล่องเรือ|เรือ|ธรรมชาติ|หมาย|ผืนน้ำ|เหวี่ยง|ทอดสาย|travel|boat|lake|nature|cast/.test(beatText.toLowerCase())) {
      angle = 'Atmospheric Tracking Shot';
      angleTh = 'ภาพมุมกว้างแล่นเรือสู่หมายตกปลากลางธรรมชาติ';
      lens = '35mm Wide';
      movement = 'Smooth Gimbal Tracking along water';
      actionTh = `เรือหางยาวแล่นผ่าสายหมอกบางยามเช้าบนผืนน้ำสงบสู่หมายตกปลากลางธรรมชาติ บรรยากาศเงียบสงบ แสงแดดอุ่นสาดส่องผิวน้ำระยิบระยับ`;
      foley = `เสียงแหวกสายน้ำของเรือ เสียงนกร้องไกลๆ และเสียงสายลมพัดเบาๆ สดชื่น`;
      dialogue = `"มุ่งหน้าสู่หมายลับ สัมผัสสายลมและธรรมชาติรอบตัวอย่างแท้จริงครับ"`;
      promptEn = `Atmospheric tracking shot, an angler in outdoor gear standing on a wooden boat casting a fishing rod over a tranquil mist-covered lake surrounded by lush green hills, golden sunrise reflection on water surface, cinematic nature documentary`;
    }
  } else if (isCar) {
    if (/เปิดตัว|คลุมผ้า|โชว์รูม|ผ้าซาติน|unveil|reveal|showroom/.test(beatText.toLowerCase())) {
      angle = 'Wide Establishing Shot';
      angleTh = 'ภาพมุมกว้างเปิดตัวรถในโชว์รูม';
      lens = '24mm Cine';
      movement = 'Slow Dolly Track';
      actionTh = `เปิดตัวรถยนต์พรีเมียมคลุมผ้าซาตินในโชว์รูมกระจกโปร่ง แสงไฟสตูดิโอสะท้อนพื้นผิวหรูหรา บรรยากาศพรีเมียมเอ็กซ์คลูซีฟ`;
      foley = `เสียงดนตรีเปิดตัวทรงพลังและเสียงบรรยากาศโชว์รูมหรูหรา`;
      dialogue = `"สัมผัสความเหนือระดับของยนตรกรรมแห่งอนาคตที่พร้อมให้คุณเป็นเจ้าของครับ"`;
      promptEn = `Wide establishing shot, sleek modern luxury car draped in black satin sheet inside a glass luxury showroom, premium atmospheric studio lighting, reflections, 8k`;
    } else if (/ดึงผ้า|เผย|ไฟหน้า|กระจัง|pull|light|led/.test(beatText.toLowerCase())) {
      angle = 'Medium Tracking Reveal';
      angleTh = 'มุมเคลื่อนตามเปิดผ้าคลุมเผยไฟหน้า LED';
      lens = '35mm Anamorphic';
      movement = 'Low-Angle Tracking Follow';
      actionTh = `ผ้าคลุมค่อยๆ เลื่อนออก เผยให้เห็นไฟหน้า LED ดีไซน์คมกริบและกระจังหน้าโฉบเฉี่ยว แสงไฟสะท้อนตัวถังเงางามสะกดทุกสายตา`;
      foley = `เสียงผ้าซาตินเลื่อนพลิ้วไหว ASMR และเสียงระบบไฟ LED เปิดทำงานพร้อมเสียง Chime หรูหรา`;
      dialogue = `"ดีไซน์ที่ผสมผสานความประณีตและเทคโนโลยีล้ำสมัย สะกดทุกสายตาตั้งแต่แรกเห็นครับ"`;
      promptEn = `Medium shot, satin sheet sliding off a luxury car, revealing aggressive matrix LED headlights and glossy metallic paint, studio rim lighting, photorealistic 8k`;
    } else if (/กุญแจ|ส่งมอบ|กล่อง|key|handover|deliver/.test(beatText.toLowerCase())) {
      angle = 'Medium Close-Up Handover';
      angleTh = 'ภาพมุมใกล้ส่งมอบกล่องกุญแจสมาร์ทคีย์';
      lens = '50mm Prime';
      movement = 'Steady-cam Focus Push';
      actionTh = `พนักงานส่งมอบกล่องกุญแจหนังแท้และสมาร์ทคีย์ให้ลูกค้าด้วยรอยยิ้มอบอุ่น สัมผัสถึงความใส่ใจในทุกรายละเอียดของการบริการ`;
      foley = `เสียงเปิดฝากล่องกุญแจหนังแท้และเสียงสัมผัสโลหะกุญแจพรีเมียม`;
      dialogue = `"ยินดีต้อนรับสู่ครอบครัวแห่งความสุข พร้อมการเดินทางครั้งใหม่ของคุณครับ"`;
      promptEn = `Medium close-up shot, a professional sales consultant handing over a luxury leather key box with a sleek smart key to a smiling customer, warm ambient lighting, 8k`;
    } else if (/รับ|ดีใจ|ครอบครัว|โบว์|ถ่ายรูป|photo|smile|happy/.test(beatText.toLowerCase())) {
      angle = 'Medium Shot Joyful Celebration';
      angleTh = 'ภาพมุมปานกลางรอยยิ้มแห่งความประทับใจหน้ารถ';
      lens = '50mm Master';
      movement = 'Gentle Arc Pan';
      actionTh = `ลูกค้ารับมอบกุญแจด้วยรอยยิ้มเปี่ยมสุข ถ่ายรูปคู่กับรถคันใหม่ที่ประดับโบว์แดงอย่างสง่างาม ท่ามกลางบรรยากาศเฉลิมฉลองอันอบอุ่น`;
      foley = `เสียงชัตเตอร์กล้องถ่ายรูป เสียงปรบมือแสดงความยินดี และเสียงหัวเราะแห่งความสุข`;
      dialogue = `"ช่วงเวลาแห่งความภาคภูมิใจและรอยยิ้มของทุกคนในครอบครัวครับ"`;
      promptEn = `Medium shot, happy customer standing beside a brand-new luxury SUV adorned with a giant red ribbon, holding keys, joyful smiles, celebratory atmosphere, 8k`;
    } else if (/พวงมาลัย|ห้องโดยสาร|หน้าจอ|ภายใน|interior|steering|cockpit/.test(beatText.toLowerCase())) {
      angle = 'Over-The-Shoulder Cockpit';
      angleTh = 'มุมมองข้ามไหล่สัมผัสความหรูหราในห้องโดยสาร';
      lens = '35mm Wide';
      movement = 'Slow Creeping Push-In';
      actionTh = `มือสัมผัสพวงมาลัยหนังแท้เย็บมืออันประณีต หน้าจอดิจิทัลแบบพาโนรามาสว่างขึ้นพร้อมระบบอินโฟเทนเมนต์ล้ำสมัย แสงไฟแอมเบียนต์หรูหรา`;
      foley = `เสียงสัมผัสลูบไล้หนังแท้ ASMR และเสียงบูตหน้าปัดดิจิทัล EV คลื่นเสียงไซไฟนุ่มนวล`;
      dialogue = `"ทุกผิวสัมผัสถูกรังสรรค์ด้วยความประณีตระดับงานฝีมือ มอบความสะดวกสบายสูงสุดทุกการเดินทางครับ"`;
      promptEn = `Over-the-shoulder shot inside luxury car cockpit, driver touching soft stitched leather steering wheel, glowing panoramic digital dashboard waking up, ambient mood light`;
    } else if (/ขับ|เคลื่อนตัว|ถนน|เดินทาง|drive|departure|road/.test(beatText.toLowerCase())) {
      angle = 'Low-Angle Hero Tracking';
      angleTh = 'มุมต่ำเคลื่อนตามรถแล่นออกสู่ถนนยามเย็น';
      lens = '28mm Cine';
      movement = 'Low Tracking Slider';
      actionTh = `รถยนต์เคลื่อนตัวออกจากโชว์รูมอย่างนุ่มนวลและเงียบกริบ สู่ถนนกว้างยามเย็น แสงอาทิตย์สีทองสะท้อนตัวถังเงางาม ขับเคลื่อนสู่อนาคต`;
      foley = `เสียงมอเตอร์ไฟฟ้าทำงานเงียบสนิท เสียงยางสัมผัสพื้นถนนเรียบกริบ และดนตรีฟินาเล่ทรงพลัง`;
      dialogue = `"เริ่มต้นทุกบทการเดินทางด้วยความมั่นใจและสุนทรียภาพแห่งการขับขี่ที่แท้จริงครับ"`;
      promptEn = `Dynamic low-angle tracking shot, a sleek modern luxury vehicle driving smoothly out of showroom onto open road during golden hour sunset, specular reflections on paint, cinematic masterpiece`;
    }
  } else if (isFood) {
    if (/หน้าร้าน|เดินเข้า|ประตู|บรรยากาศ|entrance|door|atmosphere/.test(beatText.toLowerCase())) {
      angle = 'Wide Establishing Shot';
      angleTh = 'ภาพมุมกว้างเปิดตัวหน้าร้านและบรรยากาศอันอบอุ่น';
      lens = '24mm Wide';
      movement = 'Slow Dolly In';
      actionTh = `ผลักประตูไม้เข้าสู่ร้าน กลิ่นหอมกรุ่นของอาหารและเครื่องดื่มลอยมาต้อนรับ บรรยากาศตกแต่งอบอุ่น แสงไฟวอร์มไวท์นุ่มนวล`;
      foley = `เสียงกระดิ่งเปิดประตู แอมเบียนต์ร้านอาหารแสนอบอุ่น และเสียงดนตรีแจ๊สเบาๆ`;
      dialogue = `"สัมผัสความอร่อยและบรรยากาศสุดชิลล์ที่พร้อมให้คุณมาเช็กอินแล้ววันนี้ครับ"`;
      promptEn = `Wide establishing shot, welcoming entrance of a cozy aesthetic cafe with warm ambient lighting, wooden architecture, inviting atmosphere, 8k`;
    } else if (/ทำ|ชง|ปรุง|ตี|เท|cook|brew|pour/.test(beatText.toLowerCase())) {
      angle = 'Medium Close-Up Action';
      angleTh = 'ภาพมุมปานกลางโฟกัสการรังสรรค์เมนูพิถีพิถัน';
      lens = '50mm Prime';
      movement = 'Smooth Handheld Tracking';
      actionTh = `เชฟหรือบาริสต้ากำลังรังสรรค์เมนูอย่างตั้งใจ การเทเครื่องดื่มแยกชั้นสวยงาม หรือการผัดปรุงอาหารด้วยไฟร้อนระอุ`;
      foley = `เสียงของเหลวเทลงแก้วอย่างนุ่มนวล หรือเสียงกระทะผัดไฟลุกฉ่า`;
      dialogue = `"ใส่ใจในทุกขั้นตอนเพื่อรสชาติที่เป็นเอกลักษณ์ในทุกๆ เมนูครับ"`;
      promptEn = `Medium close-up shot, skilled barista pouring creamy steamed milk creating intricate latte art in a ceramic cup, warm steam rising, shallow depth of field, 8k`;
    } else if (/ขนม|จาน|อาหาร|โคลสอัพ|จานเด็ด|dish|plate|dessert/.test(beatText.toLowerCase())) {
      angle = 'Extreme Close-Up Macro Food';
      angleTh = 'ภาพมาโครเจาะรายละเอียดความน่ารับประทาน';
      lens = '85mm Macro';
      movement = 'Slow Linear Slider';
      actionTh = `ภาพโคลสอัพจานอาหารหรือขนมซิกเนเจอร์ ควันหอมฉุยลอยขึ้นมา สีสันสดชื่น วัตถุดิบคุณภาพพรีเมียมจัดจานอย่างมีระดับ`;
      foley = `เสียงซอสหยดช้าๆ หรือเสียงตัดผ่านความกรอบนอกนุ่มในอย่างน่าลิ้มลอง`;
      dialogue = `"ความอร่อยที่ชวนให้สัมผัส รสชาติเข้มข้นถึงใจตั้งแต่คำแรกครับ"`;
      promptEn = `Extreme close-up macro shot, mouth-watering gourmet dish with glistening sauce and delicate fresh garnish, soft natural window light, appetizing food photography`;
    } else if (/กิน|ชิม|ตัก|อร่อย|ฟิน|eat|taste|delicious/.test(beatText.toLowerCase())) {
      angle = 'Medium Shot Joyful Tasting';
      angleTh = 'ภาพมุมปานกลางสีหน้าฟินขณะลิ้มลองความอร่อย';
      lens = '50mm Master';
      movement = 'Static Lock-Off';
      actionTh = `ตักอาหารคำโตเข้าปาก สีหน้ายิ้มกว้างด้วยความประทับใจในรสชาติอันยอดเยี่ยม ชื่นชมความกลมกล่อมอย่างมีความสุข`;
      foley = `เสียงความกรุบกรอบและเสียงพึมพำชื่นชมความอร่อยอย่างเป็นธรรมชาติ`;
      dialogue = `"รสชาติกลมกล่อมที่ใครได้ลองก็ต้องตกหลุมรักครับ"`;
      promptEn = `Medium shot, person tasting delicious food with a joyful satisfied expression, cozy natural sunlight filtering through cafe window, warm authentic lifestyle`;
    }
  } else if (isSkincare) {
    if (/ขวด|สินค้า|ผลิตภัณฑ์|เซรั่ม|bottle|product|serum/.test(beatText.toLowerCase())) {
      angle = 'Extreme Close-Up Product Hero';
      angleTh = 'ภาพมาโครเจาะลึกขวดเซรั่มกระจกใส';
      lens = '100mm Macro';
      movement = 'Slow Circular Orbit';
      actionTh = `ขวดเซรั่มแก้วใสวางเด่นบนผิวน้ำกระทบแสงแดดเช้า มีหยดน้ำระยิบระยับเกาะรอบขวด สะท้อนความบริสุทธิ์และเข้มข้นของสารสกัด`;
      foley = `เสียงน้ำกระเพื่อมแผ่วเบา และเสียงกริ๊กเบาๆ ของฝาดรอปเปอร์กระจกพรีเมียม`;
      dialogue = `"สัมผัสพลังแห่งการฟื้นบำรุงล้ำลึก เพื่อผิวเปล่งประกายสุขภาพดีครับ"`;
      promptEn = `Extreme close-up macro hero shot of a luxury glass serum bottle sitting in tranquil shallow water ripples, soft golden morning light, glistening water droplets, minimalist cosmetic ad`;
    } else if (/หยด|ดรอปเปอร์|เนื้อเซรั่ม|หลังมือ|drop|dropper/.test(beatText.toLowerCase())) {
      angle = 'Macro Action Dropper';
      angleTh = 'ภาพมาโครดรอปเปอร์หยดเนื้อเซรั่มเข้มข้น';
      lens = '85mm Macro';
      movement = 'Slow Vertical Tilt Down';
      actionTh = `ดรอปเปอร์แก้วค่อยๆ ปล่อยหยดเนื้อเซรั่มใสเข้มข้นตกลงสู่ผิวหลังมืออย่างช้าๆ เนื้อสัมผัสเข้มข้นแต่บางเบาพร้อมซึมซาบ`;
      foley = `เสียงหยดน้ำสัมผัสผิว ASMR นุ่มนวล ชวนผ่อนคลาย`;
      dialogue = `"เนื้อเซรั่มบางเบา ซึมซาบไว ไม่เหนียวเหนอะหนะครับ"`;
      promptEn = `Macro shot, a glass dropper releasing a glistening golden serum droplet falling towards skin, soft morning studio light, shallow depth of field, photorealistic 8k`;
    } else if (/ทา|เกลี่ย|แก้ม|นวด|apply|blend|massage/.test(beatText.toLowerCase())) {
      angle = 'Close-Up Gentle Application';
      angleTh = 'ภาพโคลสอัพเกลี่ยเนื้อเซรั่มลงบนแก้ม';
      lens = '85mm Portrait';
      movement = 'Smooth Floating Push-In';
      actionTh = `ปลายนิ้วเกลี่ยเนื้อเซรั่มลงบนพวงแก้มอย่างอ่อนโยน เนื้อเซรั่มแตกตัวซึมสู่ผิวทันที เผยความชุ่มชื้นอิ่มน้ำ`;
      foley = `เสียงลูบไล้ผิวสัมผัสแผ่วเบา สไตล์บิวตี้ ASMR บริสุทธิ์`;
      dialogue = `"คืนความชุ่มชื้น เผยผิวอิ่มฟูฉ่ำโกลว์ในทุกๆ วันครับ"`;
      promptEn = `Close-up shot, gentle fingertip applying clear dewy serum onto woman's cheek, glowing skin texture, soft diffused window light, high-end skincare commercial`;
    } else if (/ผิวฉ่ำ|โกลว์|อิ่มน้ำ|glass skin|glow|radiant/.test(beatText.toLowerCase())) {
      angle = 'Extreme Close-Up Radiant Skin';
      angleTh = 'ภาพมาโครเจาะลึกผิวฉ่ำวาว Glass Skin';
      lens = '100mm Macro';
      movement = 'Slow Rack Focus';
      actionTh = `ซูมเจาะลึกผิวหน้าที่ดูเรียบเนียน ฉ่ำวาว อิ่มน้ำ สุขภาพดีไร้ที่ติ มีประกายอิ่มเอิบสะท้อนแสงอย่างเป็นธรรมชาติ`;
      foley = `เสียง Chime สดใสเบาๆ สื่อถึงความเปล่งประกายแห่งผิวพรรณ`;
      dialogue = `"ผลลัพธ์ผิวสุขภาพดี ฉ่ำโกลว์ มีออร่าอย่างเห็นได้ชัดครับ"`;
      promptEn = `Extreme close-up shot, radiant dewy glass skin texture with healthy natural luster, pristine studio light, crisp beauty editorial photography`;
    } else if (/กระจก|ยิ้ม|มั่นใจ|smile|mirror|confident/.test(beatText.toLowerCase())) {
      angle = 'Medium Close-Up Confident Reaction';
      angleTh = 'ภาพมุมปานกลางรอยยิ้มมั่นใจหน้ากระจก';
      lens = '50mm Master';
      movement = 'Static Lock-Off with soft light';
      actionTh = `นางแบบส่องกระจกด้วยรอยยิ้มพึงพอใจและมั่นใจในผิวหน้าสดที่ดูสดใสเปล่งปลั่ง เสริมสร้างความมั่นใจในทุกช่วงเวลา`;
      foley = `เสียงดนตรีบรรเลงอบอุ่น ปิดท้ายด้วยความมั่นใจ`;
      dialogue = `"พร้อมเผยผิวสวย มั่นใจได้ในแบบของคุณตั้งแต่วันแรกครับ"`;
      promptEn = `Medium shot, confident beautiful woman smiling gently in bathroom mirror, admiring radiant clear skin, bright clean minimalist aesthetic, photorealistic`;
    }
  }

  // Ensure promptEn includes camera angle and visual style
  const finalPrompt = `${angle}, ${lens} lens, ${promptEn}, ${visualStyleEn || 'cinematic commercial lighting'}, hyper-realistic, crisp details, 8k`;
  const videoPrompt = `[Camera: ${movement}] [Shot: ${angle}] [Action: ${promptEn}] [Style: ${visualStyleEn || 'cinematic'}], smooth 60fps motion, 8k`;

  return {
    camera_angle: angle,
    camera_angle_th: angleTh,
    camera_movement: movement,
    lens_focal: lens,
    action_description: actionTh,
    dialogue: dialogue,
    audio_foley: foley,
    prompt: finalPrompt,
    video_prompt: videoPrompt
  };
}

/**
 * Universal Multi-Scene Script Parser
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
    let rawTitle = titleMatch[1].trim();
    rawTitle = rawTitle.replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
    if (rawTitle.length >= 2) projectTitle = rawTitle;
  } else {
    // If first line doesn't start with Scene/Shot/Number, use first line as title
    if (lines[0] && !/^(?:Scene|Shot|ฉาก|ช็อต|ซีน|\d+[\.\)])/i.test(lines[0])) {
      projectTitle = lines[0].replace(/^[🎬🎥\s*#*-]+/, '').replace(/Visual\s*Style.*$/i, '').replace(/["“”]/g, '').trim();
    }
  }
  if (!projectTitle || projectTitle.length < 2) {
    projectTitle = 'โปรเจกต์สตอรี่บอร์ดงานภาพยนตร์';
  }

  // 2. Detect Visual Style
  let visualStyle = 'ภาพยนตร์พรีเมียม (Macro Cinematic Commercial)';
  let visualStyleEn = 'cinematic commercial lighting, natural volumetric light, shallow depth of field, photorealistic 8k';
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
      let foleyDesc = '';
      let dialogueText = '';

      // Check for explicit "Prompt: ..."
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

      const beatSubject = current.title || shotPrompt;
      const enriched = enrichSingleBeat(projectTitle, beatSubject, i, headerMatches.length, visualStyleEn);

      const shotNumber = current.sceneNum || (i + 1);
      const titleClean = current.title ? `ฉากที่ ${shotNumber}: ${current.title}` : `ฉากที่ ${shotNumber}`;

      parsedShots.push({
        shot_number: shotNumber,
        scene_number: shotNumber,
        scene_title: titleClean,
        title: titleClean,
        subtitle: `${enriched.camera_angle_th} • ${enriched.lens_focal}`,
        camera_angle: enriched.camera_angle,
        camera_angle_th: enriched.camera_angle_th,
        camera_movement: enriched.camera_movement,
        lens_focal: enriched.lens_focal,
        duration_seconds: 3.0,
        action_description: enriched.action_description,
        dialogue: dialogueText || enriched.dialogue,
        audio_foley: foleyDesc || enriched.audio_foley,
        on_screen_text: shotNumber === headerMatches.length ? projectTitle.slice(0, 35) : '',
        prompt: enriched.prompt,
        video_prompt: enriched.video_prompt,
        live_action_guide: `มุมกล้อง: ${enriched.camera_angle} | เลนส์: ${enriched.lens_focal} | จัดแสงธรรมชาติเน้นมิติความลึก (Depth of Field)`,
        visual_style: visualStyle,
        aspect_ratio: '16:9'
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

module.exports = {
  parseMultiSceneScript,
  normalizeScriptText,
  enrichSingleBeat
};
