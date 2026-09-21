import React, { useState } from 'react';
import { Play, Sparkles, Download, Check, Copy, Maximize2, Trash2, RotateCcw, Film, ArrowRight, Video, Volume2, Camera, Layers, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const STORYBOARD_SHOWCASES = [
  {
    id: 'sc-car-commercial',
    title: 'โฆษณาเต็นท์รถมือสอง "สภาพนางฟ้า"',
    subtitle: 'Automotive Commercial • 5-Shot Storyboard Sequence',
    category: 'ยานยนต์ / ธุรกิจรถมือสอง',
    aspect_ratio: '9:16',
    visual_style: 'Modern Cinematic Commercial 4K',
    target_duration: '30 วินาที',
    description: 'สตอรี่บอร์ดตัวอย่างมาตรฐานสำหรับโฆษณาเต็นท์รถมือสอง จัดวางมุมกล้องแบบภาพยนตร์ ตั้งแต่ Drone Wide ยันส่งมอบกุญแจและโปรโมชันดาวน์ 0 บาท',
    shots: [
      {
        shot_number: 1,
        title: 'ช็อตเปิดตัว: ลานโชว์รูมรถยนต์หรูมุมสูง',
        camera_angle: 'Drone Aerial Wide Shot',
        camera_angle_th: 'มุมโดรนมุมสูงกว้าง (Drone Wide)',
        lens_focal: '24mm Ultra Wide',
        camera_movement: 'Slow Forward Aerial Push (โดรนบินกดมุมลงแล้วดันเข้าช้าๆ)',
        duration_sec: 4,
        image_url: '/generated/car_shot_1.jpg',
        prompt: 'Cinematic 9:16 drone aerial establishing shot of a modern clean premium used car dealership at dusk. Rows of polished clean luxury sedans and SUVs parked neatly with warm golden showroom floodlights, sleek reflections on black asphalt, Bangkok highway in background, 4k commercial cinematography.',
        video_prompt: 'Cinematic drone aerial shot slowly pushing forward over rows of polished luxury cars in a modern dealership at golden hour, smooth 24fps motion, volumetric soft lighting, no text, no watermark.',
        audio_foley: 'เสียงลมพัดเบาๆ ตามด้วยเสียงเครื่องยนต์สปอร์ต V8 สตาร์ตดังก้องทรงพลัง และเสียงเพลงบีตดนตรีโฆษณาจังหวะเร้าใจ',
        on_screen_text: 'เต็นท์รถยนต์มือสองเกรดพรีเมียม • ตรวจสภาพ 200 จุด',
        dialogue: 'ผู้พากย์: "กำลังมองหารถมือสองสภาพป้ายแดงอยู่ใช่ไหม? ที่นี่เราคัดสรรมาให้คุณแล้ว"',
        live_action_guide: 'โดรน DJI Inspire 3 บินสูงระดับ 12 เมตร ค่อยๆ ดันมุมก้ม 30 องศา เล็งแนวรถแถวแรกให้เป็นเส้นนำสายตา ถ่ายช่วงเวลาทไวไลท์ (Golden Hour) 17:45 น.',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 2,
        title: 'ช็อตพลังและความเงา: ล้อแม็กซ์และกระจังหน้า',
        camera_angle: 'Low-Angle Tracking Shot',
        camera_angle_th: 'มุมต่ำประชิดพื้นเคลื่อนที่ (Low Tracking)',
        lens_focal: '35mm Cine Prime',
        camera_movement: 'Low Gimbal Tracking along car side (กล้องกิมบอลระดับต่ำขนานตัวรถ)',
        duration_sec: 5,
        image_url: '/generated/car_shot_2.jpg',
        prompt: 'Low-angle dynamic tracking shot of sleek black sedan front bumper and glowing LED headlight, metallic paint reflection, clean chrome grill, 9:16 vertical commercial still, dusk golden hour.',
        video_prompt: 'Low angle camera smoothly gliding alongside a black luxury sedan, camera passes the front wheel and sweeps up toward the illuminated LED headlights, cinematic reflections, 24fps, crisp 4k.',
        audio_foley: 'เสียงยางรถยนต์บดกับพื้นคอนกรีตเรียบอย่างนุ่มนวล เสียงไฟเลี้ยว LED กะพริบ ติ๊ก-ต๊อก เบาๆ',
        on_screen_text: 'สีเดิมโรงงาน 100% ไร้ประวัติชนหนักหรือน้ำท่วม',
        dialogue: 'ผู้พากย์: "ตัวถังเดิมสนิท ไร้รอยขีดข่วน สีเดิมโรงงาน ไม่เคยชนหนักหรือน้ำท่วม การันตีคืนเงิน"',
        live_action_guide: 'ใช้ Ronin RS3 ติดเลนส์ 35mm f/1.8 ระดับความสูง 20 ซม. เหนือพื้น เดินแทร็กกิ้งไปตามแนวข้างรถ เปิดไฟสปอตไลท์ 120W ส่องย้อนเพื่อสร้าง Rim Light บนแนวโค้งตัวถัง',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 3,
        title: 'ช็อตความหรูหราภายใน: ห้องโดยสารและหน้าปัด',
        camera_angle: 'Macro Interior Close-Up',
        camera_angle_th: 'โคลสอัพภายในห้องโดยสาร (Interior Close-Up)',
        lens_focal: '50mm Macro Prime',
        camera_movement: 'Slow Pan across Dashboard & Steering Wheel (แพนช้าๆ ผ่านพวงมาลัย)',
        duration_sec: 6,
        image_url: '/generated/car_shot_3.jpg',
        prompt: 'Interior cockpit close-up shot of a modern car, clean tan leather steering wheel and digital dashboard glow, polished console, fresh immaculate interior condition, 9:16 vertical aspect ratio.',
        video_prompt: 'Interior car cabin shot, camera pans slowly across supple leather steering wheel and vibrant digital touchscreen display glowing with navigation map, ambient cabin lighting, smooth 24fps.',
        audio_foley: 'เสียงประตูปิดนุ่มนวลแบบดูดสุญญากาศ (Thump) ตามด้วยเสียงระบบปรับอากาศดิจิทัลเริ่มทำงานแผ่วเบา',
        on_screen_text: 'ไมล์แท้ 42,xxx กม. เช็กศูนย์ทุกระยะ เบาะหนังแท้กลิ่นใหม่',
        dialogue: 'ผู้พากย์: "ภายในสะอาดเหมือนใหม่ เบาะหนังแท้ไร้รอยย่น กลิ่นหอมสะอาด ระบบดิจิทัลครบครัน"',
        live_action_guide: 'วางกล้องบนเบาะหลัง เล็งผ่านพนักพิงหน้าระหว่างเบาะคู่ ใช้ไฟ Softbox ส่องผ่านกระจกซันรูฟด้านบนเพื่อกระจายแสงนุ่มให้ทั่วเบาะหนัง',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 4,
        title: 'ช็อตความสุขและความมั่นใจ: ส่งมอบกุญแจลูกค้า',
        camera_angle: 'Medium Shot (Emotional Connection)',
        camera_angle_th: 'ช็อตระยะกลางสร้างอารมณ์ร่วม (Medium Shot)',
        lens_focal: '85mm Portrait Cine Lens',
        camera_movement: 'Subtle Handheld Push-In (ถือกล้องขยับดันเข้าหาใบหน้าช้าๆ)',
        duration_sec: 5,
        image_url: '/generated/car_shot_4.jpg',
        prompt: 'Medium shot of a smiling professional Thai sales representative handing modern car smart key to a delighted young couple, warm showroom lighting, blurred luxury cars in background, vertical 9:16.',
        video_prompt: 'Warm medium shot of car salesman presenting a gleaming smart car key into the smiling customer hand, authentic warm expressions, background bokeh lights gently shimmering, 24fps cinema.',
        audio_foley: 'เสียงกุญแจรถกระทบกันเบาๆ เสียงถอนหายใจโล่งอกพร้อมหัวเราะเบาๆ ของลูกค้าที่ประทับใจ',
        on_screen_text: 'อนุมัติไวใน 30 นาที • ออกรถได้ทุกอาชีพ',
        dialogue: 'เซลส์: "ยินดีด้วยครับ คุณได้รับรถคันโปรดเรียบร้อยแล้วครับ!"\nลูกค้า: "บริการดีและรวดเร็วมากเลยค่ะ"',
        live_action_guide: 'ใช้เลนส์ 85mm f/1.4 ถอยห่าง 3 เมตร เพื่อละลายฉากหลังเป็นโบเก้ดวงไฟโชว์รูม จัดไฟ Key Light 45 องศาเข้าหน้าลูกค้าเพื่อสร้างแววตาสดใส (Catchlight)',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 5,
        title: 'ช็อตปิดการขาย Hero CTA: ข้อเสนอและเบอร์ติดต่อ',
        camera_angle: 'Hero Low-Angle Packshot with CTA',
        camera_angle_th: 'ช็อตฮีโร่มุมต่ำพร้อมข้อเสนอ (Hero Shot)',
        lens_focal: '28mm Wide Cine',
        camera_movement: 'Static Locked with Subtle Zoom Out (กล้องล็อกนิ่งซูมออกช้าๆ)',
        duration_sec: 7,
        image_url: '/generated/car_shot_5.jpg',
        prompt: 'Hero low-angle wide shot of a pristine white luxury SUV parked in front of modern car showroom glass building at night, dramatic rim light, clear empty space for graphics, vertical 9:16.',
        video_prompt: 'Hero static shot of gleaming white SUV in front of lit glass showroom at dusk, dramatic headlights beaming toward camera, slow subtle optical zoom out, 24fps crisp commercial footage.',
        audio_foley: 'เสียงบีบแตรรถเบาๆ ทักทาย พร้อมเสียง Voiceover ทุ้มหนักแน่นปิดท้าย และเสียงปุ่มกดโทรศัพท์',
        on_screen_text: 'ผ่อนเริ่มต้นเพียง 5,xxx/ด. • ฟรีดาวน์ ฟรีประกันภัยชั้น 1\nโทร 08X-XXX-XXXX | LINE: @usedcarvip',
        dialogue: 'ผู้พากย์: "รีบจองวันนี้ รับฟรีประกันภัยชั้นหนึ่ง พร้อมบริการส่งรถถึงหน้าบ้านทั่วประเทศ!"',
        live_action_guide: 'ตั้งขาตั้งกล้องมั่นคง มุมต่ำกดระดับกันชนหน้า ฉีดน้ำพรมพื้นคอนกรีตหน้าตัวรถเพื่อสะท้อนแสงไฟโชว์รูมลงพื้น เว้นพื้นที่ 1/3 บนของเฟรมสำหรับใส่ Text & Logo กองถ่าย',
        visual_style: 'Modern Cinematic Commercial 4K'
      }
    ]
  },
  {
    id: 'sc-skincare-commercial',
    title: 'โฆษณาเซรั่มหน้าใสผิวฉ่ำโกลว์ (Dewy Glass Skin)',
    subtitle: 'Beauty & Skincare Commercial • 4-Shot Storyboard Sequence',
    category: 'ความงาม / สกินแคร์',
    aspect_ratio: '9:16',
    visual_style: 'Modern Cinematic Commercial 4K',
    target_duration: '20 วินาที',
    description: 'สตอรี่บอร์ดโฆษณาเครื่องสำอางและเซรั่ม โฟกัส Macro Texture หยดเซรั่มสีทอง ผิวฉ่ำเงาแบบ Glass Skin และภาพขวด Packshot สุดหรู',
    shots: [
      {
        shot_number: 1,
        title: 'ช็อตปัญหาผิว: ความแห้งกร้านและริ้วรอยจากแสงแดด',
        camera_angle: 'Extreme Close-Up (ECU)',
        camera_angle_th: 'โคลสอัพใกล้พิเศษ (Extreme Close-Up)',
        lens_focal: '100mm Macro Lens',
        camera_movement: 'Very Slow Horizontal Drift (เคลื่อนขนานผิวหน้าช้าๆ)',
        duration_sec: 4,
        image_url: '/generated/skincare_shot_1.jpg',
        prompt: 'Extreme close-up of tired skin with dramatic soft side light, showing subtle pores and natural texture, cinematic commercial cinematography, 9:16 aspect ratio, soft focus, high end beauty aesthetic.',
        video_prompt: 'Extreme close up of skin texture with soft morning light sliding across the surface, micro skin details, 24fps macro cinematography, smooth slow motion, no text.',
        audio_foley: 'เสียงลมหายใจอ่อนล้า ตามด้วยเสียงแดดแผดเผาเบาๆ แบบซาวด์ดีไซน์ภาพยนตร์',
        on_screen_text: 'ผิวหมองคล้ำ ขาดน้ำ นอนดึกสะสม?',
        dialogue: 'ผู้พากย์: "เหนื่อยล้าจากมลภาวะและผิวที่ขาดน้ำมาทั้งวัน..."',
        live_action_guide: 'เลนส์ Macro 100mm f/2.8 ใช้ไฟ Rim Light ด้านข้างแบบ Hard Light เล็กน้อยเพื่อให้เห็น Texture ผิวอย่างชัดเจนก่อนปรับเป็นแสงนุ่มในช็อตถัดไป',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 2,
        title: 'ช็อตอนุภาคสารสกัด: หยดเซรั่มสีทองบริสุทธิ์',
        camera_angle: 'Macro Slow-Motion Dropper Shot',
        camera_angle_th: 'มาโครสโลว์โมชันหยดเซรั่ม (Macro Dropper)',
        lens_focal: '100mm Cine Macro with Extension Tube',
        camera_movement: 'High-speed Slow Motion Tilt Down (สโลว์โมชันตามแนวหยดเซรั่ม)',
        duration_sec: 5,
        image_url: '/generated/skincare_shot_2.jpg',
        prompt: 'Macro close-up shot of an elegant glass cosmetic dropper dispensing a crystal clear golden skincare serum droplet, suspended in mid-air, glistening dewy water particles, soft focus studio lighting, clean background, 9:16 vertical commercial still.',
        video_prompt: 'High speed macro 120fps video of a single drop of golden viscous serum releasing from glass pipette and falling in hyper slow motion, glistening liquid surface, soft studio lighting.',
        audio_foley: 'เสียงหยดน้ำกระทบผิวน้ำดัง "ติ๋ง" ก้องกังวาน (Liquid Drop Reverb) ตามด้วยเสียงชิมเมอร์ประกายแก้ว',
        on_screen_text: 'นวัตกรรมไฮยาลูรอนโมเลกุลคู่ × สารสกัดทองคำบริสุทธิ์',
        dialogue: 'ผู้พากย์: "ผสานคุณค่าเข้มข้น สารสกัดระดับโมเลกุล ซึมลึกทันทีที่สัมผัส"',
        live_action_guide: 'ถ่ายที่ 120fps บน Phantom Flex หรือ Sony FX6 บันทึกความเร็วสูง ใช้ไฟ LED Spotlight 2 ดวงประกบซ้ายขวาเพื่อให้หยดน้ำสะท้อนแสงสองข้าง',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 3,
        title: 'ช็อตผลลัพธ์และความมั่นใจ: ผิวฉ่ำโกลว์อิ่มน้ำ',
        camera_angle: 'Medium Close-Up (MCU) Radiance Glow',
        camera_angle_th: 'มีเดียมโคลสอัพเผยผิวฉ่ำโกลว์ (Radiance MCU)',
        lens_focal: '85mm f/1.4 Portrait Lens',
        camera_movement: 'Subtle Arching Orbit (กล้องหมุนโค้งตามการเคลื่อนไหวของใบหน้า)',
        duration_sec: 5,
        image_url: '/generated/skincare_shot_3.jpg',
        prompt: 'Medium close-up of a radiant beautiful young Asian woman smiling serenely, applying a drop of face serum onto her cheek with her fingertip, dewy glowing glass skin texture, soft warm morning window light, high-end skincare commercial, 9:16 vertical.',
        video_prompt: 'Medium close up of a radiant young Asian woman gently tapping serum on her glowing dewy cheek, smiling in genuine bliss, soft sunlight illuminating glass skin texture, 24fps beauty commercial.',
        audio_foley: 'เสียงแตะผิวเบาๆ สดชื่น (Soft Gentle Tap) ตามด้วยเสียงเพลงฮาร์ปหวานละมุน',
        on_screen_text: 'ผิวกระจ่างใส ฉ่ำวาว อิ่มน้ำใน 7 วัน',
        dialogue: 'นางแบบ: "รู้สึกได้ตั้งแต่คืนแรก... ตื่นมาผิวเด้งฉ่ำโกลว์แบบที่ไม่เคยเป็นมาก่อน"',
        live_action_guide: 'ใช้แผ่นสะท้อนแสง (Reflector) สีเงินและขาวจากด้านล่างคางเพื่อลบเงาใต้ตา เปิดม่านให้แสงเช้าส่องเข้า 45 องศา ใช้ฟิลเตอร์ Black Pro-Mist 1/4 เพื่อให้แสงฟุ้งนุ่ม',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 4,
        title: 'ช็อตแบรนด์ Packshot: ขวดเซรั่มระดับพรีเมียม',
        camera_angle: 'Hero Product Packshot',
        camera_angle_th: 'ช็อตโชว์สินค้าฮีโร่ (Hero Packshot)',
        lens_focal: '90mm Studio Macro',
        camera_movement: 'Slow 360 Turntable / Camera Dolly In (กล้องค่อยๆ ดันเข้าพร้อมแสงปาด)',
        duration_sec: 6,
        image_url: '/generated/skincare_shot_4.jpg',
        prompt: 'Hero packshot of luxury glass skincare bottle standing on wet slate stone with subtle water ripples and golden backlighting, vertical 9:16 commercial.',
        video_prompt: 'Commercial packshot of golden luxury glass serum bottle, subtle water mist rising, light beam sweep across the brand typography, premium cosmetic advertising, 24fps.',
        audio_foley: 'เสียงสวูชแสงสะท้อน (Light Sweep Whoosh) พร้อมเสียงกระซิบสโลแกนแบรนด์',
        on_screen_text: 'GLOW SERUM ELIXIR • วางจำหน่ายแล้ววันนี้ที่ร้านค้าชั้นนำ\nโปรโมชัน 1 แถม 1 เฉพาะสัปดาห์นี้',
        dialogue: 'ผู้พากย์: "Glow Serum — ปลดล็อกผิวสวยสมบูรณ์แบบของคุณ"',
        live_action_guide: 'ตั้งขวดสินค้าบนแท่นหมุน (Motorized Turntable) ความเร็ว 1 รอบ/30 วินาที ฉีดละอองน้ำสเปรย์ด้วยกลีเซอรีนเพื่อให้น้ำเกาะตัวเป็นเม็ดกลมไม่ไหลย้อย',
        visual_style: 'Modern Cinematic Commercial 4K'
      }
    ]
  },
  {
    id: 'sc-thai-comedy',
    title: 'หนังสั้นแนวตลกไทยคลาสสิก (1980s Retro Comedy)',
    subtitle: 'Classic Thai Narrative • 4-Shot Storyboard Sequence',
    category: 'ภาพยนตร์ / ซีรีส์คอมเมดี้',
    aspect_ratio: '9:16',
    visual_style: '1980s Retro Thai Comedy Commercial',
    target_duration: '25 วินาที',
    description: 'สตอรี่บอร์ดแนวตลกไทยคลาสสิก คอสตูมจัดจ้าน โลเคชั่นริมบ่อปลาบ้านทุ่ง เน้นจังหวะตบมุก Deadpan และโทนภาพฟิล์ม 16mm ยุค 2530',
    shots: [
      {
        shot_number: 1,
        title: 'ช็อตเปิดตัว: ริมบ่อปลาทุ่งนาแดดบ่าย',
        camera_angle: 'Wide Establishing Shot',
        camera_angle_th: 'มุมกว้างเปิดสถานที่ (Establishing Wide)',
        lens_focal: '28mm Vintage Prime',
        camera_movement: 'Static Shot with Tripod (กล้องล็อกนิ่งบนขาตั้ง)',
        duration_sec: 5,
        image_url: '/media/scene_pond_1.jpg',
        prompt: '1980s vintage Thai retro film still, expired 16mm color stock, heavy grain. Three Thai friends sitting on edge of rural fish pond, bamboo trees in background, harsh afternoon sunlight, vertical 9:16.',
        video_prompt: 'Static wide shot of three friends by a fish pond in rural Thailand 1980s, heat haze shimmering, gentle water ripples, 16mm vintage film aesthetic, 24fps.',
        audio_foley: 'เสียงจั๊กจั่นเรไรดังระงม ตามด้วยเสียงปลาฮุบเหยื่อ "จ๋อม!" กลางบ่อน้ำ',
        on_screen_text: 'ณ บ่อปลาท้ายหมู่บ้าน เวลา 15:30 น.',
        dialogue: 'สมศักดิ์: "ข้าว่าปลามันรู้ทันพวกเราแล้วว่ะ นั่งมาสามชั่วโมงยังไม่กระดิกเลย"',
        live_action_guide: 'ตั้งกล้องรับแสงแดดย้อนหลัง (Backlight) เล็กน้อย ใส่ฟิลเตอร์ Warm Sepia ย้อมโทนให้อุ่นเหมือนฟิล์มเก่า',
        visual_style: '1980s Retro Thai Comedy Commercial'
      },
      {
        shot_number: 2,
        title: 'ช็อตปฏิกิริยาหน้าตาย: ความเครียดระดับโลก',
        camera_angle: 'Medium Reaction Two-Shot',
        camera_angle_th: 'ช็อตสองคนปฏิกิริยา (Two-Shot)',
        lens_focal: '50mm Standard Cine',
        camera_movement: 'Sudden Snap Zoom In (ซูมกระชากเข้าหาใบหน้าเพื่อตบมุก)',
        duration_sec: 4,
        image_url: '/media/scene_pond_2.jpg',
        prompt: '1980s vintage Thai film still, two funny Thai men with deadpan serious expressions staring at fishing line, 16mm film grain, 9:16 vertical.',
        video_prompt: 'Fast snap zoom into deadpan funny expressions of two men staring intensely at water surface, comedy timing, 16mm vintage colors, 24fps.',
        audio_foley: 'เสียงกลองตุ้งแช่ตบมุก (Rimshot) สไตล์ตลกคาเฟ่ไทย',
        on_screen_text: '',
        dialogue: 'สมหมาย: "ไม่ใช่ปลามันฉลาดหรอกพี่... ลืมเกี่ยวกระดี่เหยื่อปลอม!"',
        live_action_guide: 'ดึงซูมด้วยมืออย่างรวดเร็ว (Snap Zoom) จังหวะเดียวกับที่นักแสดงพูดประโยคหักมุม ตัวละครห้ามยิ้มเด็ดขาด',
        visual_style: '1980s Retro Thai Comedy Commercial'
      },
      {
        shot_number: 3,
        title: 'ช็อตตั้งเตาต้มยำ: แปลงวิกฤตเป็นงานเลี้ยง',
        camera_angle: 'Low-Angle Charcoal Stove Close-Up',
        camera_angle_th: 'มุมต่ำเตาถ่านต้มยำเดือด (Low-Angle Close-Up)',
        lens_focal: '35mm Cine',
        camera_movement: 'Tilt Up from Bubbling Pot to Faces (ทิลต์จากหม้อขึ้นสู่ใบหน้า)',
        duration_sec: 6,
        image_url: '/media/scene_tomyum_1.jpg',
        prompt: '1980s vintage Thai comedy film still, small dented aluminium pot of spicy tom yum soup boiling over charcoal stove on rural ground, steam rising, vertical 9:16.',
        video_prompt: 'Low angle shot of steaming hot pot of spicy soup on red hot charcoal stove, camera slowly tilts up to friends laughing heartily around the fire at dusk, 24fps vintage grain.',
        audio_foley: 'เสียงน้ำซุปเดือดปุดๆ เสียงฟืนไม้ประทุ และเสียงซดน้ำแกงร้อนๆ ดัง "ซี้ดดด"',
        on_screen_text: 'ไม่ได้ปลา... แต่ได้ต้มยำไก่แทน!',
        dialogue: 'สมชาย: "ตกปลาไม่ได้ ก็กินไก่ต้มน้ำปลาแทนสิวะ จะยากอะไร!"',
        live_action_guide: 'จุดเตาถ่านจริงให้มีควันและประกายไฟลอยขึ้นหน้าเลนส์เพื่อสร้างความอบอุ่น ถ่ายช่วงเวลาพลบค่ำ (Dusk)',
        visual_style: '1980s Retro Thai Comedy Commercial'
      },
      {
        shot_number: 4,
        title: 'ช็อตบทสรุปมิตรภาพ: วงล้อมรอบกองไฟยามค่ำ',
        camera_angle: 'Warm Fireglow Full Shot',
        camera_angle_th: 'ช็อตรวมวงไฟยามค่ำคืน (Night Full Shot)',
        lens_focal: '35mm Wide Aperture',
        camera_movement: 'Slow Dolly Pullback (ดอลลี่ถอยออกอย่างอบอุ่น)',
        duration_sec: 6,
        image_url: '/media/scene_tomyum_3.jpg',
        prompt: '1980s Thai film still, friends sitting on plastic stools around warm glowing fire pot at night in rural countryside, star filled sky, warm nostalgic feeling, 9:16 vertical.',
        video_prompt: 'Camera slowly pulls back from friends chatting around warm fire at night in Thai countryside, lanterns softly swaying in night breeze, nostalgic 16mm film stock, 24fps.',
        audio_foley: 'เสียงกีตาร์โปร่งดีดคลอเบาๆ เสียงหัวเราะอบอุ่น และเสียงจิ้งหรีดกลางคืน',
        on_screen_text: 'บางครั้ง สิ่งที่มีค่าที่สุด ไม่ใช่สิ่งที่เราออกไปหา แต่คือคนที่นั่งข้างๆ เรา',
        dialogue: 'ผู้พากย์: "ความสุขง่ายๆ ไม่ต้องรอโชคดี แค่มีเพื่อนรู้ใจ"',
        live_action_guide: 'ใช้แสงจริงจากกองไฟและตะเกียงเจ้าพายุเสริมด้วยไฟ LED อุณหภูมิสี 2700K ซ่อนอยู่หลังหม้อเพื่อสร้างออร่าสีส้มทองบนใบหน้า',
        visual_style: '1980s Retro Thai Comedy Commercial'
      }
    ]
  }
];

export default function InspirationsView({ onSelectItem, onStoryboardCommitted }) {
  const [activeShowcaseId, setActiveShowcaseId] = useState(STORYBOARD_SHOWCASES[0].id);
  const [copiedPromptId, setCopiedPromptId] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const activeShowcase = STORYBOARD_SHOWCASES.find(sc => sc.id === activeShowcaseId) || STORYBOARD_SHOWCASES[0];

  const handleCopyVideoPrompt = (e, shot) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shot.video_prompt);
    setCopiedPromptId(shot.shot_number);
    confetti({ particleCount: 25, spread: 45 });
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleCopyMasterPlan = () => {
    const fullPlan = activeShowcase.shots.map(s => 
      `SHOT ${s.shot_number}: ${s.title}\n• มุมกล้อง: ${s.camera_angle_th} (${s.lens_focal})\n• การเคลื่อนกล้อง: ${s.camera_movement}\n• Video Prompt: ${s.video_prompt}\n• On-Screen Text: ${s.on_screen_text}\n• Live-Action Guide: ${s.live_action_guide}\n`
    ).join('\n---\n\n');

    navigator.clipboard.writeText(`สตอรี่บอร์ด: ${activeShowcase.title}\nสไตล์: ${activeShowcase.visual_style}\n\n${fullPlan}`);
    alert('คัดลอกแผนสตอรี่บอร์ดทั้งชุดเรียบร้อยแล้ว!');
    confetti({ particleCount: 35, spread: 60 });
  };

  const handleCommitShowcaseToBoard = async () => {
    setIsCommitting(true);
    try {
      const res = await fetch('/api/storyboard/commit-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shots: activeShowcase.shots,
          project_title: activeShowcase.title,
          visual_style: activeShowcase.visual_style
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        alert(`นำเข้าสตอรี่บอร์ด "${activeShowcase.title}" (${data.data.length} ช็อต) ขึ้นบอร์ดเรียบร้อยแล้ว!`);
        if (onStoryboardCommitted) {
          onStoryboardCommitted(data.data);
        }
      } else {
        alert(data.error || 'ไม่สามารถนำเข้าสตอรี่บอร์ดได้');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 select-none space-y-6 max-w-7xl mx-auto">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STORYBOARD_SHOWCASES.map(sc => (
          <button
            key={sc.id}
            onClick={() => setActiveShowcaseId(sc.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer active:scale-98 ${
              activeShowcaseId === sc.id
                ? 'bg-gradient-to-r from-[#F71C25] to-[#FF4438] text-white shadow-md shadow-red-500/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-50 shadow-2xs'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{sc.title}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeShowcaseId === sc.id ? 'bg-white/20 text-white font-bold' : 'bg-[#FBEFC5] text-stone-900 font-bold border border-[#E5D7A3]'}`}>
              {sc.shots.length} ช็อต
            </span>
          </button>
        ))}
      </div>

      {/* Active Showcase Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-3 py-1 rounded-full bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 font-mono font-bold">
              {activeShowcase.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 font-mono text-[11px]">
              ⏱️ ความยาวเป้าหมาย: {activeShowcase.target_duration}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 font-mono text-[11px]">
              สัดส่วน {activeShowcase.aspect_ratio}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {activeShowcase.title}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {activeShowcase.description}
          </p>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          <button
            onClick={handleCopyMasterPlan}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-bold text-stone-800 flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            title="คัดลอกรายละเอียดทุกช็อตพร้อมมุมกล้องและ Video Prompts"
          >
            <Copy className="w-3.5 h-3.5 text-[#F71C25]" />
            <span>คัดลอกแผนทั้งเรื่อง</span>
          </button>

          <button
            onClick={handleCommitShowcaseToBoard}
            disabled={isCommitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isCommitting ? (
              <span>กำลังนำเข้าสู่บอร์ด...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>📥 นำเข้าสตอรี่บอร์ดชุดนี้ขึ้นบอร์ด</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sequential Storyboard Shots Rail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-600 px-1">
          <span className="font-bold flex items-center gap-1.5 text-stone-900">
            <Camera className="w-4 h-4 text-[#F71C25]" />
            <span>ลำดับช็อตสตอรี่บอร์ด ({activeShowcase.shots.length} ช็อตต่อเนื่อง) — คลิกที่การ์ดเพื่อตรวจรายละเอียดใน Inspector</span>
          </span>
          <span className="font-mono text-[11px] text-stone-500">คลิกการ์ดเพื่อซูมดูรูป HD / มุมกล้อง</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {activeShowcase.shots.map((shot) => (
            <div
              key={shot.shot_number}
              onClick={() => onSelectItem({
                id: `showcase-${activeShowcase.id}-${shot.shot_number}`,
                step_number: shot.shot_number,
                title: shot.title,
                subtitle: shot.camera_angle_th,
                content: shot.prompt,
                video_prompt: shot.video_prompt,
                audio_foley: shot.audio_foley,
                on_screen_text: shot.on_screen_text,
                camera_angle: shot.camera_angle,
                camera_movement: shot.camera_movement,
                live_action_guide: shot.live_action_guide,
                image_url: shot.image_url,
                aspect_ratio: activeShowcase.aspect_ratio,
                visual_style: shot.visual_style || activeShowcase.visual_style,
                dialogue_script: shot.dialogue
              })}
              className="bg-white border border-stone-200 hover:border-[#F71C25] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image Viewport */}
              <div className="relative aspect-[9/16] bg-[#FAF9F5] overflow-hidden border-b border-stone-100">
                <img
                  src={shot.image_url}
                  alt={shot.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badge: Shot Number & Camera Angle */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-[10px] font-mono font-black text-[#F71C25] border border-[#F71C25]/30 shadow-xs">
                    SHOT {shot.shot_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#FBEFC5]/95 backdrop-blur-md text-[9px] font-mono text-stone-900 font-bold border border-[#E5D7A3] shadow-xs">
                    {shot.lens_focal}
                  </span>
                </div>

                {/* Duration Pill */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-[10px] font-mono text-stone-800 font-bold border border-stone-200 shadow-xs pointer-events-none">
                  ⏱️ {shot.duration_sec}s
                </div>
              </div>

              {/* Shot Details Body */}
              <div className="p-3.5 space-y-2 bg-[#FAF9F5] border-t border-stone-100 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#F71C25] font-bold uppercase truncate">
                    {shot.camera_angle_th}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#F71C25] transition-colors line-clamp-1 mt-0.5">
                    {shot.title}
                  </h4>

                  {/* On-screen text or action summary */}
                  {shot.on_screen_text && (
                    <div className="mt-1.5 text-[10px] text-stone-800 font-sans line-clamp-2 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                      💬 <span className="font-bold text-stone-900">ข้อความบนจอ:</span> {shot.on_screen_text}
                    </div>
                  )}
                </div>

                {/* Bottom Action: Copy Video Prompt */}
                <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono text-stone-500 truncate">
                    🎥 Video Ready
                  </span>
                  <button
                    onClick={(e) => handleCopyVideoPrompt(e, shot)}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[10px] font-mono font-bold text-purple-800 flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="คัดลอก Video Prompt สำหรับ Kling / Runway"
                  >
                    {copiedPromptId === shot.shot_number ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-purple-600" />
                        <span>Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
