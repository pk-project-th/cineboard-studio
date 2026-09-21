const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = 'C:\\Users\\Marketing\\.gemini\\antigravity\\scratch\\cineprompt-hub\\server\\cineprompt.db';
const db = new DatabaseSync(dbPath);

console.log('Seeding 8 Viral 1980s Thai Comedy Templates into cineprompt.db...');

// Clear existing test items
db.exec('DELETE FROM prompts;');
db.exec('DELETE FROM leads;');
db.exec('DELETE FROM analytics_events;');

const seriesId = 'pk-shortclips-series-1';

// Upsert series
const existingSeries = db.prepare('SELECT id FROM series WHERE id = ?').get(seriesId);
if (!existingSeries) {
  const insertSeries = db.prepare(`
    INSERT INTO series (
      id, title, slug, description, summary, pilot_episode, joke_formula,
      cover_image, author, author_link, course_name, course_url, course_price_note, views_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSeries.run(
    seriesId,
    'สูตร Viral 1980s — ซีรีส์คอสตูมมหากาพย์ สไตล์หนังไทยเรโทร 2530',
    'viral-retro-thai-comedy',
    'คลังสูตร Prompt แนวตั้ง 9:16 สไตล์หนังไทยเรโทรยุค 80s คอมเมดี้แอ็คชั่น แปลงสถานการณ์บ้านๆ เป็นความอลังการระดับมหากาพย์',
    'สูตรลับการสร้างคลิปสั้น Viral จับสถานการณ์มหากาพย์ x มุกตลกไทยสไตล์ 2530',
    'ตอนนำร่อง: หน่วยกู้ภัยแอร์ระเบิดกลางสี่แยก',
    'สถานการณ์มหากาพย์ x ความธรรมดาของชีวิตไทย x แสงสีเรโทรฟิล์ม 16mm',
    '/media/tpl_aircon_hero.jpg',
    'PKBABY & CinePrompt Studio',
    '#',
    'Viral Retro Video Masterclass',
    '#',
    'ใช้งานฟรี รองรับ Groq Cloud / Gemini 3.8 / OpenAI',
    250
  );
} else {
  db.prepare(`
    UPDATE series SET
      title = ?,
      cover_image = ?,
      description = ?,
      summary = ?
    WHERE id = ?
  `).run(
    'สูตร Viral 1980s — ซีรีส์คอสตูมมหากาพย์ สไตล์หนังไทยเรโทร 2530',
    '/media/tpl_aircon_hero.jpg',
    'คลังสูตร Prompt แนวตั้ง 9:16 สไตล์หนังไทยเรโทรยุค 80s คอมเมดี้แอ็คชั่น แปลงสถานการณ์บ้านๆ เป็นความอลังการระดับมหากาพย์',
    'สูตรลับการสร้างคลิปสั้น Viral จับสถานการณ์มหากาพย์ x มุกตลกไทยสไตล์ 2530',
    seriesId
  );
}

const templates = [
  {
    id: 'tpl-viral-01',
    series_id: seriesId,
    step_number: 1,
    step_title: 'STEP 1 — Viral Concept',
    title: 'หน่วยกู้ภัยแอร์ระเบิด: ซ่อมแอร์กลางสี่แยก',
    subtitle: 'ภารกิจเสี่ยงตายของช่างแอร์ในตำนาน เสื้อวิน สว่านไฟฟ้าคู่ใจ บนบันไดไม้ไผ่กลางรถติด',
    prompt_type: 'video',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s vintage Thai action comedy film style, 9:16 vertical cinema, extreme low-angle dramatic shot of a fearless Thai air conditioner repairman standing on a shaky bamboo ladder strapped to a utility pole in the middle of a chaotic Bangkok traffic jam. Wearing an orange motorcycle taxi vest, grease-stained denim shorts, and aviator sunglasses with cracked lenses, heroically wielding a smoking heavy-duty electric drill. Cinematic retro movie grain, warm faded kodachrome film stock, humid golden hour sunlight, tangled messy power cables overhead, dust particles glowing in air. Masterpiece vintage Thai comedy aesthetics.',
    dialogue_script: 'ช่างเอก: "ใจเย็นน้องหนู แอร์เครื่องนี้... พี่เอาชีวิตเป็นประกันว่าจะหนาวถึงขั้วหัวใจ!"\\nป้าข้างทาง: "ระวังสายไฟด้วยไอ้ทิด!"',
    variables_schema: JSON.stringify([
      { key: 'hero', label: 'ตัวละครเอก', default: 'ช่างแอร์เสื้อวิน' },
      { key: 'location', label: 'สถานที่', default: 'สี่แยกกลางกรุงเทพฯ' }
    ]),
    image_url: '/media/tpl_aircon_hero.jpg',
    copy_count: 85,
    sort_order: 1
  },
  {
    id: 'tpl-viral-02',
    series_id: seriesId,
    step_number: 2,
    step_title: 'STEP 2 — Character Sheet',
    title: 'ประธานบริษัทซาเล้งทองคำ: มหากาพย์เก็บของเก่า',
    subtitle: 'ท่านประธานปลอมตัวมาขับซาเล้งพ่วงข้าง ติดเครื่องเสียงหมอลำ พร้อมกระสอบทองคำ',
    prompt_type: 'character',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s retro Thai comedy film style, 9:16 vertical composition, eccentric wealthy CEO disguised as an old junk collector riding a heavily customized motorized three-wheel saleng cart through an old Bangkok alleyway. Saleng decorated with golden vintage ornaments, oversized horn speakers blasting molam music, and neat stacks of cardboard boxes. The old man wears a faded floral Hawaiian shirt over an expensive silk vest, gold Rolex peeking under dirty work gloves, big cheeky grin. Vintage 35mm film grain, 1985 cinematic film tone, humid late afternoon backlight, whimsical street atmosphere.',
    dialogue_script: 'ท่านประธาน: "พวกแกคิดว่าฉันเป็นแค่คนเก็บขวดเรอะ... ดูป้ายทะเบียนซาเล้งฉันให้ดีๆ!"\\nลูกน้อง: "ทะ... ทะเบียนทองคำฝังเพชร!"',
    variables_schema: JSON.stringify([
      { key: 'vehicle', label: 'ยานพาหนะ', default: 'ซาเล้งพ่วงข้างทองคำ' }
    ]),
    image_url: '/media/tpl_chairman_saleng.jpg',
    copy_count: 72,
    sort_order: 2
  },
  {
    id: 'tpl-viral-03',
    series_id: seriesId,
    step_number: 3,
    step_title: 'STEP 3 — Climax Scene',
    title: 'หน่วยสวาทบุกตลาดสด: ภารกิจชิงแม่ค้าปลาทู',
    subtitle: 'คอมมานโดหน่วยรบพิเศษสวมแว่นตาดำบุกตลาดสดคลองเตย ปะทะแม่ค้าสับปลาทูด้วยสปาตูล่า',
    prompt_type: 'video',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s vintage Thai action comedy movie still, 9:16 vertical format, tense cinematic standoff in a wet bustling Bangkok fresh market. High-contrast dramatic neon and fluorescent tube lighting. In foreground, a tough fearless middle-aged Thai market auntie wielding a giant cleaver and cutting board, wearing a rubber apron and floral shirt. Facing her is a retro Thai SWAT commando team in vintage camouflage uniforms and aviator helmets crouching behind fruit crates. Splashes of crushed ice, water puddles, scattered chili and vegetables. Gritty expired 16mm film grain, dynamic action movie lens.',
    dialogue_script: 'หัวหน้าสวาท: "วางมีดลงป้า! ปลาทูเข่งนี้เป็นหลักฐานคดีระดับชาติ!"\\nป้าสมศรี: "จะเอาปลาทูข้ามศพเขียงป้าไปก่อนไอ้พวกเด็กเมื่อวานซืน!"',
    variables_schema: JSON.stringify([]),
    image_url: '/media/tpl_swat_market.jpg',
    copy_count: 94,
    sort_order: 3
  },
  {
    id: 'tpl-viral-04',
    series_id: seriesId,
    step_number: 1,
    step_title: 'STEP 1 — Viral Concept',
    title: 'ซุนหงอคงวินมอเตอร์ไซค์: บิดทะลุมิติด่วนดินแดง',
    subtitle: 'พญาวานรแปลงกายเป็นวินปากซอย ควบมอเตอร์ไซค์เวฟติดกระบองทองคำ หลบหลุมบนถนนไทย',
    prompt_type: 'character',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s Thai cult fantasy action comedy film, 9:16 aspect ratio vertical portrait. Sun Wukong the Monkey King reincarnated as a gritty Bangkok motorcycle taxi rider, straddling a battered vintage 1980s step-through moped. Monkey King wears a torn purple motorcycle taxi vest over traditional golden monkey warrior armor, ornate golden headband glinting, holding an extendable glowing red-and-gold staff like an exhaust pipe. Smirking confidently amid swirling exhaust smoke and rainy Bangkok street neon reflections. 1980s practical effects vibe, rich film grain, cinematic anamorphic lens flares.',
    dialogue_script: 'หงอคงวิน: "บอกว่ารีบใช่ไหมคุณนาย เกาะกระบองให้แน่น... สี่สิบบาทถึงยอดเขาเหลียงซาน!"',
    variables_schema: JSON.stringify([]),
    image_url: '/media/tpl_wukong_motorcycle.jpg',
    copy_count: 61,
    sort_order: 4
  },
  {
    id: 'tpl-viral-05',
    series_id: seriesId,
    step_number: 2,
    step_title: 'STEP 2 — Character Sheet',
    title: 'เซเลอร์มูนสาย 8: ตัวแทนแห่งสายสะพานพุทธ',
    subtitle: 'กระเป๋ารถเมล์สายในตำนาน แปลงร่างด้วยกระบอกตั๋วอลูมิเนียม สะบัดพวงมาลัยสู้เหล่าร้าย',
    prompt_type: 'character',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s Thai pop-comedy cult movie, 9:16 vertical frame, hilarious magical girl parody. A determined energetic Thai female bus fare collector standing proudly in the aisle of an iconic rattling Bangkok blue-and-white city bus number 8. She wears a campy DIY Sailor Moon outfit made of vintage Thai school uniform cloth, holding an oversized shining aluminum ticket cylinder like a magical wand, with strings of fragrant jasmine garlands around her neck. Wind blowing through open bus windows, blurry city street passing outside. Warm nostalgic 1980s film colors, lens flare, film texture.',
    dialogue_script: 'เซเลอร์กระเป๋า: "ในนามแห่งสาย 8 สะพานพุทธ... ฉันจะลงทัณฑ์แกด้วยเหรียญห้าบาท!"',
    variables_schema: JSON.stringify([]),
    image_url: '/media/tpl_sailor_bus8.jpg',
    copy_count: 88,
    sort_order: 5
  },
  {
    id: 'tpl-viral-06',
    series_id: seriesId,
    step_number: 3,
    step_title: 'STEP 3 — Climax Scene',
    title: 'มวยไทยศิษย์หนุมาน: ประลองยุทธ์งานวัดโบราณ',
    subtitle: 'การปะทะด้วยหมัดมวยคาดเชือกบนเวทีผ้าใบงานวัด ไฟนีออนสายรุ้ง เสียงเชียร์ลั่นทุ่ง',
    prompt_type: 'video',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s classic Thai martial arts comedy movie still, 9:16 vertical full body action shot. An acrobatic Thai fighter wearing traditional hemp rope hand wraps (Muay Boran kard chuek) and colorful temple fair trunks, leaping mid-air over a makeshift boxing ring in a rural temple carnival. Background filled with glowing swirling neon ferris wheel lights, cotton candy carts, and an excited cheering village crowd. Expired celluloid film stock, golden warm amber tones, sweat glistening in retro stadium spotlights, dynamic motion blur.',
    dialogue_script: 'ครูมวย: "จำไว้ไอ้ทิด ท่าหนุมานคลุกฝุ่น... ต่อให้โดนถีบตกเวที หน้าตาต้องหล่อไว้ก่อน!"',
    variables_schema: JSON.stringify([]),
    image_url: '/media/tpl_muaythai_monkey.jpg',
    copy_count: 53,
    sort_order: 6
  },
  {
    id: 'tpl-viral-07',
    series_id: seriesId,
    step_number: 1,
    step_title: 'STEP 1 — Viral Concept',
    title: 'ยักษ์ทศกัณฐ์ตัดอ้อย: วิถีเกษตรกรสิบล้อ',
    subtitle: 'พญายักษ์หน้าเขียวสวมชุดยีนส์วินเทจ ฟันอ้อยท่ามกลางแดดบ่ายเปรี้ยง รถสิบล้อคอกไม้คู่ใจ',
    prompt_type: 'character',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s Thai surrealist comedy cinema, 9:16 vertical poster layout. A muscular Thai laborer with green mythical Tosakan demon face paint and multiple golden demon tusks, wearing rolled-up denim dungarees, checked pa-kao-ma loincloth, and rubber boots. He stands heroically in an endless golden sugarcane plantation holding a massive machete, beside a colorful wooden vintage Isuzu ten-wheeler truck with painted mudflaps. Blazing tropical sun, heat haze distortion, vibrant saturated 1980s film color grading, authentic rustic Thai countryside.',
    dialogue_script: 'ทศกัณฐ์: "สิบหน้ายี่สิบมือ มีไว้ตัดอ้อยส่งโรงงานเว้ย นางสีดาไม่เกี่ยว!"',
    variables_schema: JSON.stringify([]),
    image_url: '/media/tpl_demon_sugarcane.jpg',
    copy_count: 67,
    sort_order: 7
  },
  {
    id: 'tpl-viral-08',
    series_id: seriesId,
    step_number: 2,
    step_title: 'STEP 2 — Character Sheet',
    title: 'สายลับสูทฟ้ากระดุมทอง: จารชนข้าวผัดโบราณ',
    subtitle: 'สายลับสไตล์ 007 ฉบับไทย สวมสูทวินเทจสีฟ้า นั่งกินข้าวผัดรถไฟพร้อมโทรศัพท์กระเป๋าหิ้วยักษ์',
    prompt_type: 'character',
    recommended_tool: 'Groq Cloud / Gemini 3.8 Flash',
    aspect_ratio: '9:16',
    content: '1980s Thai retro spy thriller comedy, 9:16 vertical composition. A suave Thai secret agent sitting at an old wooden dining car table on the Bangkok night train. He wears a powder blue vintage polyester suit with wide lapels and brass buttons, holding a huge 1980s brick cellular phone to his ear with one hand, and eating vintage train fried rice with cucumber slices with the other. Dim tungsten reading lamp, rain streaks on train window reflecting neon railway signals outside. Cinematic moody lighting, rich film grain, authentic 1980s noir-comedy aesthetic.',
    dialogue_script: 'สายลับ 009: "ศูนย์บัญชาการ... สายลับได้ข้าวผัดแล้ว ขอน้ำปลาพริกเพิ่มด่วน มีศัตรูซุ่มอยู่ตู้เสบียง!"',
    variables_schema: JSON.stringify([]),
    image_url: '/media/tpl_retro_spy.jpg',
    copy_count: 79,
    sort_order: 8
  }
];

const insertStmt = db.prepare(`
  INSERT INTO prompts (
    id, series_id, step_number, step_title, title, subtitle, prompt_type,
    recommended_tool, aspect_ratio, content, dialogue_script, variables_schema, image_url, copy_count, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const t of templates) {
  insertStmt.run(
    t.id,
    t.series_id,
    t.step_number,
    t.step_title,
    t.title,
    t.subtitle,
    t.prompt_type,
    t.recommended_tool,
    t.aspect_ratio,
    t.content,
    t.dialogue_script,
    t.variables_schema,
    t.image_url,
    t.copy_count,
    t.sort_order
  );
}

const count = db.prepare('SELECT COUNT(*) as c FROM prompts').get().c;
console.log(`=== SUCCESSFULLY SEEDED ${count} VIRAL PROMPTS ===`);
