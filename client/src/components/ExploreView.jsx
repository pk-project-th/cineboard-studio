import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, Copy, Check, Flame, Film, Compass, Zap, Camera, Clock, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export const STORYBOARD_TEMPLATES = [
  {
    id: 'tpl-automotive-sales',
    category: 'ยานยนต์ & โชว์รูม (Automotive Commercial)',
    title: 'โฆษณาเต็นท์รถมือสองสภาพป้ายแดง (5 Shots)',
    formula: 'โดรนลานรถหรู × ซูมกระจังหน้าเงาวับ × แดชบอร์ดดิจิทัล × ส่งมอบกุญแจ × โปรดาวน์ 0 บาท',
    image: '/generated/car_shot_1.jpg',
    aspect: '9:16',
    duration: '30 วินาที',
    visual_style: 'Modern Cinematic Commercial 4K',
    shots_count: 5,
    summary: 'สูตรสตอรี่บอร์ดโฆษณาขายรถยนต์มือสองเกรดพรีเมียม สร้างความน่าเชื่อถือด้วยภาพมุมกว้าง ตรวจสอบสภาพรถ และปิดด้วยความสุขของลูกค้าพร้อมเบอร์โทรและข้อเสนอพิเศษ',
    shots: [
      {
        shot_number: 1,
        title: 'Drone Aerial Establishing',
        camera_angle: 'Drone Aerial Wide Shot',
        camera_angle_th: 'มุมโดรนมุมสูงกว้าง (Drone Wide)',
        lens_focal: '24mm Ultra Wide',
        camera_movement: 'Slow Forward Push-In',
        duration_sec: 4,
        image_url: '/generated/car_shot_1.jpg',
        prompt: 'Cinematic 9:16 drone aerial establishing shot of a modern clean premium used car dealership at dusk. Rows of polished clean luxury sedans and SUVs parked neatly with warm golden showroom floodlights, sleek reflections on black asphalt, Bangkok highway in background, 4k commercial cinematography.',
        video_prompt: 'Cinematic drone aerial shot slowly pushing forward over rows of polished luxury cars in a modern dealership at golden hour, smooth 24fps motion, volumetric soft lighting, no text, no watermark.',
        audio_foley: 'เสียงลมพัดและเครื่องยนต์ V8 สตาร์ตดังก้อง',
        on_screen_text: 'เต็นท์รถยนต์มือสองเกรดพรีเมียม • ตรวจสภาพ 200 จุด',
        dialogue: 'ผู้พากย์: "กำลังมองหารถมือสองสภาพป้ายแดงอยู่ใช่ไหม? ที่นี่เราคัดสรรมาให้คุณแล้ว"',
        live_action_guide: 'โดรนระดับความสูง 12 เมตร กดมุมกล้อง 30 องศา ดันไปข้างหน้าช้าๆ ถ่ายช่วงเวลา Golden Hour 17:45 น.',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 2,
        title: 'Low-Angle Wheel & Grille Tracking',
        camera_angle: 'Low-Angle Tracking Shot',
        camera_angle_th: 'มุมต่ำประชิดพื้นเคลื่อนที่ (Low Tracking)',
        lens_focal: '35mm Cine Prime',
        camera_movement: 'Low Gimbal Tracking along car side',
        duration_sec: 5,
        image_url: '/generated/car_shot_2.jpg',
        prompt: 'Low-angle dynamic tracking shot of sleek black sedan front bumper and glowing LED headlight, metallic paint reflection, clean chrome grill, 9:16 vertical commercial still, dusk golden hour.',
        video_prompt: 'Low angle camera smoothly gliding alongside a black luxury sedan, camera passes the front wheel and sweeps up toward the illuminated LED headlights, cinematic reflections, 24fps, crisp 4k.',
        audio_foley: 'เสียงยางรถยนต์บดกับพื้นเรียบ เสียงไฟเลี้ยว LED ติ๊ก-ต๊อก',
        on_screen_text: 'สีเดิมโรงงาน 100% ไร้ประวัติชนหนักหรือน้ำท่วม',
        dialogue: 'ผู้พากย์: "ตัวถังเดิมสนิท ไร้รอยขีดข่วน สีเดิมโรงงาน ไม่เคยชนหนักหรือน้ำท่วม การันตีคืนเงิน"',
        live_action_guide: 'Gimbal สูง 20 ซม. เหนือพื้น เดินขนานข้างรถ จัดไฟ Rim Light ส่องสันเหลี่ยมตัวถัง',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 3,
        title: 'Interior Cockpit & Touchscreen Macro',
        camera_angle: 'Macro Interior Close-Up',
        camera_angle_th: 'โคลสอัพภายในห้องโดยสาร (Interior Close-Up)',
        lens_focal: '50mm Macro Prime',
        camera_movement: 'Slow Pan across Dashboard & Steering Wheel',
        duration_sec: 6,
        image_url: '/generated/car_shot_3.jpg',
        prompt: 'Interior cockpit close-up shot of a modern car, clean tan leather steering wheel and digital dashboard glow, polished console, fresh immaculate interior condition, 9:16 vertical aspect ratio.',
        video_prompt: 'Interior car cabin shot, camera pans slowly across supple leather steering wheel and vibrant digital touchscreen display glowing with navigation map, ambient cabin lighting, smooth 24fps.',
        audio_foley: 'เสียงประตูปิดดูดสุญญากาศนุ่มนวล เสียงแอร์ดิจิทัลเริ่มทำงาน',
        on_screen_text: 'ไมล์แท้ 42,xxx กม. เช็กศูนย์ทุกระยะ เบาะหนังแท้กลิ่นใหม่',
        dialogue: 'ผู้พากย์: "ภายในสะอาดเหมือนใหม่ เบาะหนังแท้ไร้รอยย่น กลิ่นหอมสะอาด ระบบดิจิทัลครบครัน"',
        live_action_guide: 'ถ่ายจากเบาะหลังผ่านพนักพิงหน้าระหว่างเบาะคู่ จัดไฟ Softbox ส่องผ่านซันรูฟ',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 4,
        title: 'Car Key Handover & Customer Joy',
        camera_angle: 'Medium Shot (Emotional Connection)',
        camera_angle_th: 'ช็อตระยะกลางสร้างอารมณ์ร่วม (Medium Shot)',
        lens_focal: '85mm Portrait Cine Lens',
        camera_movement: 'Subtle Handheld Push-In',
        duration_sec: 5,
        image_url: '/generated/car_shot_4.jpg',
        prompt: 'Medium shot of a smiling professional Thai sales representative handing modern car smart key to a delighted young couple, warm showroom lighting, blurred luxury cars in background, vertical 9:16.',
        video_prompt: 'Warm medium shot of car salesman presenting a gleaming smart car key into the smiling customer hand, authentic warm expressions, background bokeh lights gently shimmering, 24fps cinema.',
        audio_foley: 'เสียงกุญแจรถกระทบกันเบาๆ เสียงถอนหายใจโล่งอกพร้อมรอยยิ้ม',
        on_screen_text: 'อนุมัติไวใน 30 นาที • ออกรถได้ทุกอาชีพ',
        dialogue: 'เซลส์: "ยินดีด้วยครับ คุณได้รับรถคันโปรดเรียบร้อยแล้วครับ!"\nลูกค้า: "บริการดีและรวดเร็วมากเลยค่ะ"',
        live_action_guide: 'เลนส์ 85mm f/1.4 ถอยห่าง 3 เมตร ละลายฉากหลังเป็นโบเก้ดวงไฟโชว์รูม จัดไฟ Key Light 45 องศา',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 5,
        title: 'Hero Showroom Packshot & CTA',
        camera_angle: 'Hero Low-Angle Packshot with CTA',
        camera_angle_th: 'ช็อตฮีโร่มุมต่ำพร้อมข้อเสนอ (Hero Shot)',
        lens_focal: '28mm Wide Cine',
        camera_movement: 'Static Locked with Subtle Zoom Out',
        duration_sec: 7,
        image_url: '/generated/car_shot_5.jpg',
        prompt: 'Hero low-angle wide shot of a pristine white luxury SUV parked in front of modern car showroom glass building at night, dramatic rim light, clear empty space for graphics, vertical 9:16.',
        video_prompt: 'Hero static shot of gleaming white SUV in front of lit glass showroom at dusk, dramatic headlights beaming toward camera, slow subtle optical zoom out, 24fps crisp commercial footage.',
        audio_foley: 'เสียงบีบแตรรถเบาๆ ทักทาย พร้อมเสียง Voiceover ทุ้มหนักแน่น',
        on_screen_text: 'ผ่อนเริ่มต้นเพียง 5,xxx/ด. • ฟรีดาวน์ ฟรีประกันภัยชั้น 1\nโทร 08X-XXX-XXXX | LINE: @usedcarvip',
        dialogue: 'ผู้พากย์: "รีบจองวันนี้ รับฟรีประกันภัยชั้นหนึ่ง พร้อมบริการส่งรถถึงหน้าบ้านทั่วประเทศ!"',
        live_action_guide: 'ตั้งขาตั้งกล้องมั่นคง มุมต่ำกดระดับกันชนหน้า ฉีดน้ำพรมพื้นคอนกรีตให้สะท้อนแสงไฟ',
        visual_style: 'Modern Cinematic Commercial 4K'
      }
    ]
  },
  {
    id: 'tpl-skincare-glow',
    category: 'ความงาม & เครื่องสำอาง (Beauty & Skincare)',
    title: 'โฆษณาเซรั่มบำรุงผิวหน้าฉ่ำวาว (4 Shots)',
    formula: 'โคลสอัพปัญหาผิวแห้ง × หยดเซรั่มสีทอง 120fps × ทาผิวฉ่ำ Glass Skin × ขวดเซรั่มประกายน้ำ',
    image: '/generated/skincare_shot_3.jpg',
    aspect: '9:16',
    duration: '20 วินาที',
    visual_style: 'Modern Cinematic Commercial 4K',
    shots_count: 4,
    summary: 'โครงสร้างสตอรี่บอร์ดสกินแคร์มาตรฐานระดับสากล เริ่มจากปัญหาผิว เข้าสู่อนุภาคสารสกัด ผลลัพธ์ผิวฉ่ำวาว และแพ็กช็อตขวดสินค้าสุดหรู',
    shots: [
      {
        shot_number: 1,
        title: 'Skin Dryness Problem Close-Up',
        camera_angle: 'Extreme Close-Up (ECU)',
        camera_angle_th: 'โคลสอัพใกล้พิเศษ (Extreme Close-Up)',
        lens_focal: '100mm Macro Lens',
        camera_movement: 'Very Slow Horizontal Drift',
        duration_sec: 4,
        image_url: '/generated/skincare_shot_1.jpg',
        prompt: 'Extreme close-up of tired skin with dramatic soft side light, showing subtle pores and natural texture, cinematic commercial cinematography, 9:16 aspect ratio, soft focus, high end beauty aesthetic.',
        video_prompt: 'Extreme close up of skin texture with soft morning light sliding across the surface, micro skin details, 24fps macro cinematography, smooth slow motion, no text.',
        audio_foley: 'เสียงลมหายใจอ่อนล้า ตามด้วยเสียงแดดแผดเผาเบาๆ',
        on_screen_text: 'ผิวหมองคล้ำ ขาดน้ำ นอนดึกสะสม?',
        dialogue: 'ผู้พากย์: "เหนื่อยล้าจากมลภาวะและผิวที่ขาดน้ำมาทั้งวัน..."',
        live_action_guide: 'เลนส์ Macro 100mm f/2.8 ใช้ไฟ Rim Light ด้านข้างแบบ Hard Light เล็กน้อยเพื่อให้เห็น Texture',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 2,
        title: 'Golden Viscous Dropper Macro',
        camera_angle: 'Macro Slow-Motion Dropper Shot',
        camera_angle_th: 'มาโครสโลว์โมชันหยดเซรั่ม (Macro Dropper)',
        lens_focal: '100mm Cine Macro',
        camera_movement: 'High-speed Slow Motion Tilt Down',
        duration_sec: 5,
        image_url: '/generated/skincare_shot_2.jpg',
        prompt: 'Macro close-up shot of an elegant glass cosmetic dropper dispensing a crystal clear golden skincare serum droplet, suspended in mid-air, glistening dewy water particles, soft focus studio lighting, clean background, 9:16 vertical commercial still.',
        video_prompt: 'High speed macro 120fps video of a single drop of golden viscous serum releasing from glass pipette and falling in hyper slow motion, glistening liquid surface, soft studio lighting.',
        audio_foley: 'เสียงหยดน้ำ "ติ๋ง" ก้องกังวาน พร้อมเสียงชิมเมอร์ประกายแก้ว',
        on_screen_text: 'นวัตกรรมไฮยาลูรอนโมเลกุลคู่ × สารสกัดทองคำบริสุทธิ์',
        dialogue: 'ผู้พากย์: "ผสานคุณค่าเข้มข้น สารสกัดระดับโมเลกุล ซึมลึกทันทีที่สัมผัส"',
        live_action_guide: 'ถ่ายที่ 120fps บันทึกความเร็วสูง ใช้ไฟ LED Spotlight 2 ดวงซ้ายขวา',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 3,
        title: 'Dewy Glass Skin Application',
        camera_angle: 'Medium Close-Up (MCU) Radiance Glow',
        camera_angle_th: 'มีเดียมโคลสอัพเผยผิวฉ่ำโกลว์ (Radiance MCU)',
        lens_focal: '85mm f/1.4 Portrait Lens',
        camera_movement: 'Subtle Arching Orbit',
        duration_sec: 5,
        image_url: '/generated/skincare_shot_3.jpg',
        prompt: 'Medium close-up of a radiant beautiful young Asian woman smiling serenely, applying a drop of face serum onto her cheek with her fingertip, dewy glowing glass skin texture, soft warm morning window light, high-end skincare commercial, 9:16 vertical.',
        video_prompt: 'Medium close up of a radiant young Asian woman gently tapping serum on her glowing dewy cheek, smiling in genuine bliss, soft sunlight illuminating glass skin texture, 24fps beauty commercial.',
        audio_foley: 'เสียงแตะผิวเบาๆ สดชื่น เสียงเพลงฮาร์ปหวานละมุน',
        on_screen_text: 'ผิวกระจ่างใส ฉ่ำวาว อิ่มน้ำใน 7 วัน',
        dialogue: 'นางแบบ: "รู้สึกได้ตั้งแต่คืนแรก... ตื่นมาผิวเด้งฉ่ำโกลว์แบบที่ไม่เคยเป็นมาก่อน"',
        live_action_guide: 'ใช้ Reflector ขาวสะท้อนแสงใต้คาง เปิดรับแสงเช้า 45 องศา ฟิลเตอร์ Black Pro-Mist 1/4',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 4,
        title: 'Hero Brand Bottle Packshot',
        camera_angle: 'Hero Product Packshot',
        camera_angle_th: 'ช็อตโชว์สินค้าฮีโร่ (Hero Packshot)',
        lens_focal: '90mm Studio Macro',
        camera_movement: 'Slow 360 Turntable / Camera Dolly In',
        duration_sec: 6,
        image_url: '/generated/skincare_shot_4.jpg',
        prompt: 'Hero packshot of luxury glass skincare bottle standing on wet slate stone with subtle water ripples and golden backlighting, vertical 9:16 commercial.',
        video_prompt: 'Commercial packshot of golden luxury glass serum bottle, subtle water mist rising, light beam sweep across the brand typography, premium cosmetic advertising, 24fps.',
        audio_foley: 'เสียงสวูชแสงสะท้อน พร้อมเสียงกระซิบสโลแกนแบรนด์',
        on_screen_text: 'GLOW SERUM ELIXIR • วางจำหน่ายแล้ววันนี้ที่ร้านค้าชั้นนำ\nโปรโมชัน 1 แถม 1 เฉพาะสัปดาห์นี้',
        dialogue: 'ผู้พากย์: "Glow Serum — ปลดล็อกผิวสวยสมบูรณ์แบบของคุณ"',
        live_action_guide: 'ตั้งขวดสินค้าบนแท่นหมุนไฟฟ้า 1 รอบ/30 วินาที ฉีดละอองน้ำสเปรย์ด้วยกลีเซอรีน',
        visual_style: 'Modern Cinematic Commercial 4K'
      }
    ]
  },
  {
    id: 'tpl-cafe-review',
    category: 'อาหาร & คาเฟ่ (Cafe & Artisan Food)',
    title: 'รีวิวคาเฟ่ลับ & Specialty Coffee (4 Shots)',
    formula: 'บรรยากาศร้านมินิมอลแสงธรรมชาติ × ดริปกาแฟ V60 ควันกรุ่น × ผ่าครัวซองต์ไส้ทะลัก × จิบกาแฟรอยยิ้มฟิน',
    image: '/media/scene_tomyum_2.jpg',
    aspect: '9:16',
    duration: '20 วินาที',
    visual_style: 'Modern Cinematic Commercial 4K',
    shots_count: 4,
    summary: 'สตอรี่บอร์ดรีวิวร้านอาหารและคาเฟ่ยอดฮิตบน TikTok/Reels ให้ความรู้สึกอบอุ่น สดใหม่ และชวนหิวภายใน 20 วินาที',
    shots: [
      {
        shot_number: 1,
        title: 'Warm Minimalist Cafe Ambience',
        camera_angle: 'Wide Establishing Shot',
        camera_angle_th: 'มุมกว้างเปิดบรรยากาศร้าน (Establishing Wide)',
        lens_focal: '24mm Wide Prime',
        camera_movement: 'Slow Smooth Push Through Doorway',
        duration_sec: 4,
        image_url: '/media/scene_pond_1.jpg',
        prompt: 'Cinematic wide interior shot of a cozy minimalist Nordic cafe in Bangkok, warm wooden furniture, sunlight through linen curtains, plants, 9:16 vertical.',
        video_prompt: 'Camera smoothly pushes through the wooden front door of a serene aesthetic coffee shop in soft morning sunlight, peaceful atmospheric cafe vibe, 24fps.',
        audio_foley: 'เสียงกระดิ่งหน้าร้านดังกริ๊งเบาๆ เสียงเพลง Lo-Fi แจ๊สเบาๆ และเสียงบดเมล็ดกาแฟ',
        on_screen_text: 'คาเฟ่ลับเปิดใหม่ย่านอารีย์ • บรรยากาศสุดโฮมมี่',
        dialogue: 'ผู้พากย์: "ใครกำลังมองหาที่นั่งชิลพักผ่อน วันนี้พามาเช็กอินคาเฟ่ลับที่เพิ่งเปิดใหม่"',
        live_action_guide: 'เดินกิมบอลผ่านประตูหน้าร้าน ใช้แสงธรรมชาติช่วง 9:00 - 10:30 น.',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 2,
        title: 'Artisan V60 Pour-Over Coffee Bloom',
        camera_angle: 'Macro Close-Up Pour Over',
        camera_angle_th: 'มาโครดริปกาแฟควันกรุ่น (Pour-Over Macro)',
        lens_focal: '85mm Macro',
        camera_movement: 'Circular Tracking around Dripper',
        duration_sec: 5,
        image_url: '/media/scene_tomyum_1.jpg',
        prompt: 'Macro shot of hot water slowly poured from copper kettle onto freshly ground specialty coffee in a glass V60 dripper, rich crema blooming, steam rising, vertical 9:16.',
        video_prompt: 'Macro slow motion shot of delicate water stream spiraling over dark roasted coffee grounds, rich caramel blooming foam, aromatic steam rising, 24fps.',
        audio_foley: 'เสียงน้ำร้อนหยดกระทบเหยือกแก้ว "ติ๋ง... ติ๋ง..." และเสียงสูดดมกลิ่นหอม',
        on_screen_text: 'Specialty Beans • Ethiopia Guji Natural Process',
        dialogue: 'บาริสต้า: "ตัวนี้จะมีเทสต์โน้ตเป็นบลูเบอร์รีและดอกไม้สีขาว สดชื่นมากครับ"',
        live_action_guide: 'ใช้เลนส์ 85mm ถ่ายขนานระดับสายตา จัดไฟส่องทะลุไอน้ำเพื่อให้เห็นควันพวยพุ่งชัดเจน',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 3,
        title: 'Flaky Golden Croissant Fork Cut',
        camera_angle: 'Extreme Close-Up Food Texture',
        camera_angle_th: 'โคลสอัพเท็กซ์เจอร์อาหาร (Food Texture Close-Up)',
        lens_focal: '100mm Macro',
        camera_movement: 'Static with Dynamic Food Action',
        duration_sec: 5,
        image_url: '/media/scene_tomyum_4.jpg',
        prompt: 'Extreme close-up of a knife gently cutting through a freshly baked golden butter croissant, crispy layers flaking off, steaming warm interior honeycomb texture, vertical 9:16.',
        video_prompt: 'Close up shot of golden crispy croissant being pulled apart, audio-visual sensory food crunch, steam releasing, appetizing warm studio lighting, 24fps.',
        audio_foley: 'เสียงแป้งครัวซองต์กรอบดัง "แครก!" เสียงลื่นของเนยฝรั่งเศสฉ่ำๆ',
        on_screen_text: 'ครัวซองต์เนยสดฝรั่งเศสแท้ • อบสดใหม่จากเตาทุกชั่วโมง',
        dialogue: 'ผู้พากย์: "ดูความกรอบนอกนุ่มในสิทุกคน กลิ่นเนยหอมฟุ้งไปทั้งร้าน"',
        live_action_guide: 'ตั้งไมค์ Shotgun จ่อห่างจากครัวซองต์เพียง 15 ซม. เพื่อบันทึกเสียงแป้งกรอบแบบ ASMR',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 4,
        title: 'Customer Sip Delight & Location Pin',
        camera_angle: 'Medium Shot Lifestyle with Location Pin',
        camera_angle_th: 'มีเดียมช็อตจิบกาแฟฟินพร้อมพิกัด (Lifestyle Shot)',
        lens_focal: '50mm Cine',
        camera_movement: 'Static Shot with Floating Location Pin',
        duration_sec: 6,
        image_url: '/media/scene_pond_2.jpg',
        prompt: 'Medium shot of a smiling girl taking a delighted sip of coffee by the sunny window, cozy outfit, cafe garden blurred in background, graphic overlay space, vertical 9:16.',
        video_prompt: 'Medium shot of a smiling girl drinking coffee by cafe window, eyes closing in appreciation, warm sunbeams, gentle bokeh, smooth 24fps cinematography.',
        audio_foley: 'เสียงวางแก้วกาแฟลงบนจานรองแก้วเซรามิก "คลิก" เบาๆ ตามด้วยเสียงถอนหายใจชื่นใจ',
        on_screen_text: '📍 พิกัด: Artisan Cafe (BTS อารีย์ ทางออก 3)\nเปิดทุกวัน 08:00 - 17:00 น. มีที่จอดรถ',
        dialogue: 'ผู้พากย์: "บันทึกคลิปนี้ไว้แล้วแท็กเพื่อนด่วนๆ สุดสัปดาห์นี้ต้องไม่พลาด!"',
        live_action_guide: 'ถ่ายริมหน้าต่างให้แสงแดดส่องเป็น Backlight ที่เส้นผม เว้นพื้นที่ด้านล่าง 1/3 สำหรับปักหมุดแผนที่',
        visual_style: 'Modern Cinematic Commercial 4K'
      }
    ]
  },
  {
    id: 'tpl-tiktok-viral',
    category: 'E-Commerce & ไวรัล (TikTok / Reels Viral)',
    title: 'สูตรคลิปไวรัล TikTok ขายสินค้าแก้ปัญหา (3 Shots)',
    formula: '3 วินาทีแรกเบรกสายตา (Scroll-Stopper) × สาธิตปัญหา vs แก้ได้ทันที × ชี้ตะกร้าเหลืองด่วน',
    image: '/media/nu_character_sheet.jpg',
    aspect: '9:16',
    duration: '15 วินาที',
    visual_style: 'Modern Cinematic Commercial 4K',
    shots_count: 3,
    summary: 'สูตรสำเร็จ 15 วินาทีสำหรับยิงแอด TikTok และ Reels เน้น Hook คนดูภายใน 3 วินาทีแรกด้วยปัญหา และปิดด้วย Call to Action ชี้พิกัดตะกร้า',
    shots: [
      {
        shot_number: 1,
        title: '3-Second Visual Hook (The Disaster)',
        camera_angle: 'Fast Snap Zoom Close-Up',
        camera_angle_th: 'ซูมกระชากเบรกสายตา (Snap Zoom Hook)',
        lens_focal: '28mm Wide',
        camera_movement: 'Aggressive Fast Push-In',
        duration_sec: 3,
        image_url: '/media/sak_character_sheet.jpg',
        prompt: 'Extreme dramatic fast close-up of a shocking messy coffee spill on a pristine white couch, frozen action, high contrast, vertical 9:16.',
        video_prompt: 'Fast snap zoom into a dramatic coffee spill on white fabric, high energy motion, crisp lighting, 24fps dynamic commercial hook.',
        audio_foley: 'เสียงเอฟเฟกต์ "วู้ชชช!" พร้อมเสียงแก้วกาแฟตกแตก "เพล้ง!"',
        on_screen_text: 'หยุดเลื่อนก่อน! ถ้าไม่อยากเสียเงินซื้อโซฟาใหม่',
        dialogue: 'เสียงพากย์เร็ว: "อย่าเพิ่งเลื่อนผ่าน! ถ้าคุณเคยเจอปัญหาคราบฝังแน่นแบบนี้"',
        live_action_guide: 'ถือกล้องมือถ่าย (Handheld) ดันกระชากเข้าหาจุดเปื้อนอย่างรวดเร็วเพื่อสร้างความตกใจ',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 2,
        title: 'Problem Solved in 3 Seconds Demo',
        camera_angle: 'Over-The-Shoulder (OTS) Product Action',
        camera_angle_th: 'ช็อตข้ามไหล่สาธิตสินค้า (OTS Demo)',
        lens_focal: '35mm Cine',
        camera_movement: 'Whip Pan from Dirty to Clean',
        duration_sec: 6,
        image_url: '/media/joy_character_sheet.jpg',
        prompt: 'Split action close up: foam spray applied to stain, single wipe reveals completely clean white spotless fabric instantly, satisfying cleaning demo, 9:16 vertical.',
        video_prompt: 'Close up satisfying wipe of foam cleaner across heavy dark stain, instantly revealing sparkling white surface underneath, bright clean studio lighting, 24fps.',
        audio_foley: 'เสียงฉีดสเปรย์ "ฟู่..." ตามด้วยเสียงเช็ดสะอาดดัง "เอี๊ยดดด"',
        on_screen_text: 'ฉีดแล้วเช็ดครั้งเดียว คราบกาแฟ ซอส ปากกา หายเกลี้ยง!',
        dialogue: 'ผู้พากย์: "แค่ฉีดสเปรย์โฟมตัวนี้ทิ้งไว้ 5 วินาที เช็ดทีเดียวคราบฝังลึก 3 ปี หายวับทันที!"',
        live_action_guide: 'บันทึกเสียงเช็ดให้ชัดเจนเพื่อสร้างความฟิน (Satisfying ASMR)',
        visual_style: 'Modern Cinematic Commercial 4K'
      },
      {
        shot_number: 3,
        title: 'Urgency CTA & Basket Finger Point',
        camera_angle: 'Medium Shot with Hand Pointing to Basket',
        camera_angle_th: 'มีเดียมช็อตชี้ตะกร้าด่วน (CTA Point)',
        lens_focal: '50mm Prime',
        camera_movement: 'Static Shot with Bouncing Arrow Animation',
        duration_sec: 6,
        image_url: '/media/nu_character_sheet.jpg',
        prompt: 'Medium shot of an energetic Thai creator pointing downward with both hands toward the bottom left shopping basket icon, holding the clean spray bottle, bright studio, 9:16 vertical.',
        video_prompt: 'Energetic creator smiling excitedly, holding up spray bottle and pointing down repeatedly toward bottom left corner, cheerful dynamic lighting, 24fps.',
        audio_foley: 'เสียงกระดิ่ง "กริ๊งๆๆ!" ถี่ๆ พร้อมเสียงปิ๊งเอฟเฟกต์ชี้พิกัด',
        on_screen_text: '👇 กดสั่งซื้อที่ตะกร้าสีเหลืองมุมซ้ายล่างได้เลย!\nโปรวันนี้ ซื้อ 1 แถม 1 ส่งฟรีทั่วไทย',
        dialogue: 'ผู้พากย์: "ตอนนี้มีโปร 1 แถม 1 กดตะกร้าสีเหลืองมุมซ้ายล่างก่อนของจะหมดนะคะ!"',
        live_action_guide: 'ให้นักแสดงชี้มือลงไปที่พิกัดมุมซ้ายล่างของจอ (ตำแหน่งตะกร้า TikTok)',
        visual_style: 'Modern Cinematic Commercial 4K'
      }
    ]
  }
];

export default function ExploreView({ onUseTemplate }) {
  const [selectedTpl, setSelectedTpl] = useState(null);

  const handleApply = (tpl) => {
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    if (onUseTemplate) {
      onUseTemplate(tpl);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Explore Banner */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 relative overflow-hidden shadow-sm">
        <div className="max-w-3xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 font-mono text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>CineBoard Storyboard Templates • เทมเพลตสตอรี่บอร์ดพร้อมใช้งาน</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
            คลังเทมเพลตสตอรี่บอร์ดโฆษณา & ภาพยนตร์ระดับโปร
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            เลือกเทมเพลตสตอรี่บอร์ดสำเร็จรูปที่จัดโครงสร้างมุมกล้อง (Shot Sequence), เลนส์, บทพากย์, Video AI Prompts (Kling/Runway) และคู่มือกองถ่ายมาให้ครบถ้วน คลิก <strong>"โหลดสตอรี่บอร์ดชุดนี้ขึ้นบอร์ด"</strong> เพื่อนำขึ้นบอร์ดทำงานต่อได้ทันที
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {STORYBOARD_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white border border-stone-200 hover:border-[#F71C25] rounded-3xl overflow-hidden transition-all duration-300 p-5 flex flex-col justify-between group shadow-xs hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Category & Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-stone-900 px-2.5 py-0.5 rounded-md bg-[#FBEFC5] border border-[#E5D7A3]">
                  {tpl.category}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-stone-800 font-bold px-2 py-0.5 bg-stone-50 rounded border border-stone-200">
                    ⏱️ {tpl.duration}
                  </span>
                  <span className="text-[#F71C25] font-bold px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                    {tpl.shots_count} ช็อต
                  </span>
                </div>
              </div>

              {/* Title & Formula */}
              <div>
                <h3 className="text-lg font-black text-stone-900 group-hover:text-[#F71C25] transition-colors">
                  {tpl.title}
                </h3>
                <div className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {tpl.summary}
                </div>
                <div className="text-[11px] text-stone-700 font-mono mt-1.5 bg-[#FAF9F5] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#F71C25] font-bold">โครงสร้างช็อต:</span> {tpl.formula}
                </div>
              </div>

              {/* Shot Sequences Breakdown Preview */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-mono font-bold text-stone-600 uppercase flex items-center gap-1">
                  <Camera className="w-3 h-3 text-[#F71C25]" />
                  <span>รายการช็อตในสตอรี่บอร์ดนี้:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                  {tpl.shots.map((s) => (
                    <div key={s.shot_number} className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-stone-700 flex flex-col justify-between">
                      <span className="text-[#F71C25] font-bold text-[10px]">SHOT {s.shot_number}</span>
                      <span className="text-[10px] text-stone-400 truncate mt-0.5">{s.camera_angle_th}</span>
                      <span className="text-[9px] text-stone-500 font-mono mt-1">⏱️ {s.duration_sec}s</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">
                สไตล์: {tpl.visual_style}
              </span>

              <button
                onClick={() => handleApply(tpl)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>โหลดสตอรี่บอร์ดชุดนี้ขึ้นบอร์ด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
