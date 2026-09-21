// CineBoard Director Simple & Clean Storyboard Sketch Generator
// 100% Strict Valid XML, Zero Broken Images, Clear Iconic Storyboard Visuals
// Supports: Temple & Thai Culture, Travel & Nature, Automotive, Cafe & Beverage, Skincare, and Universal Film Angles

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveSketchTheme(shot) {
  if (!shot) return 'temple_gate_wide';
  if (shot.sketch_theme) return shot.sketch_theme;

  const shotNum = shot.step_number || shot.shot_number || 1;
  const title = (shot.title || '').toLowerCase();
  const desc = (shot.action_description || shot.content || '').toLowerCase();
  const prompt = (shot.prompt || '').toLowerCase();
  const angle = (shot.camera_angle || '').toLowerCase();
  const angleTh = (shot.camera_angle_th || '').toLowerCase();
  const allText = `${title} ${desc} ${prompt} ${angle} ${angleTh}`;

  // 1. TEMPLE, CULTURE, FAITH & THAI TRADITION (High Priority)
  const isTemple = allText.includes('วัด') || allText.includes('temple') || allText.includes('อุโบสถ') ||
                   allText.includes('โบสถ์') || allText.includes('เจดีย์') || allText.includes('เจดีย') ||
                   allText.includes('pagoda') || allText.includes('stupa') || allText.includes('buddha') ||
                   allText.includes('พระพุทธ') || allText.includes('ทำบุญ') || allText.includes('ไหว้พระ') ||
                   allText.includes('สงฆ์') || allText.includes('ศรัทธา') || allText.includes('สังฆทาน') ||
                   allText.includes('ประติมากรรม') || allText.includes('แกะสลัก') || allText.includes('ลายไทย') ||
                   allText.includes('monk') || allText.includes('shrine') || allText.includes('worship') ||
                   allText.includes('ธูป') || allText.includes('เทียน') || allText.includes('ดอกบัว') ||
                   allText.includes('ลานวัด') || allText.includes('ศาลา') || allText.includes('พุทธ');

  if (isTemple) {
    if (allText.includes('ประตู') || allText.includes('gate') || (shotNum === 1 && (allText.includes('wide') || allText.includes('เข้า')))) {
      return 'temple_gate_wide';
    }
    if (allText.includes('ประติมากรรม') || allText.includes('พระพุทธ') || allText.includes('แกะสลัก') || allText.includes('buddha') || (shotNum === 2)) {
      return 'temple_buddha_close';
    }
    if (allText.includes('ลานวัด') || allText.includes('เดิน') || allText.includes('ศาลา') || allText.includes('courtyard') || (shotNum === 3)) {
      return 'temple_courtyard_walk';
    }
    if (allText.includes('พระอาทิตย์') || allText.includes('sunset') || allText.includes('เจดีย์') || allText.includes('วิว') || (shotNum === 4)) {
      return 'temple_sunset_peace';
    }
    if (allText.includes('ไหว้') || allText.includes('บัว') || allText.includes('ธูป') || allText.includes('พนมมือ') || (shotNum === 5)) {
      return 'temple_worship_lotus';
    }
    if (allText.includes('ระฆัง') || allText.includes('bell') || allText.includes('โพธิ์') || (shotNum === 6)) {
      return 'temple_bell_macro';
    }
    if (allText.includes('ยิ้ม') || allText.includes('ความสุข') || allText.includes('สีหน้า') || (shotNum === 7)) {
      return 'temple_culture_smile';
    }
    const templeThemes = [
      'temple_gate_wide', 'temple_buddha_close', 'temple_courtyard_walk', 'temple_sunset_peace',
      'temple_worship_lotus', 'temple_bell_macro', 'temple_culture_smile', 'temple_hero_cta'
    ];
    return templeThemes[(shotNum - 1) % templeThemes.length];
  }

  // 2. AUTOMOTIVE / CAR (Strict whole-word to prevent false positives like 'carving' or 'สามารถ')
  const isCarWordEn = /\b(car|cars|supercar|automobile|motor|engine|highway|dealership|vehicle|vehicles|racing|cockpit)\b/i.test(allText);
  const isCarWordTh = /(รถยนต์|รถสปอร์ต|รถเก๋ง|รถมือสอง|โชว์รูมรถ|โชว์รูม|กระจังหน้า|ล้อแม็ก|พวงมาลัยรถ|ค็อกพิท|ปุ่มสตาร์ท|กุญแจรถ|เต็นท์รถ|เครื่องยนต์|ซูเปอร์คาร์)/i.test(allText);
  const isCar = isCarWordEn || isCarWordTh;

  if (isCar) {
    if (allText.includes('โชว์รูม') || allText.includes('เต็นท์') || allText.includes('dealership') || allText.includes('showroom') || (shotNum === 1 && (allText.includes('wide') || allText.includes('กว้าง')))) {
      return 'car_showroom_wide';
    }
    if (allText.includes('หน้ารถ') || allText.includes('ไฟหน้า') || allText.includes('กระจังหน้า') || allText.includes('grill') || (shotNum === 2)) {
      return 'car_front_grill';
    }
    if (allText.includes('ล้อ') || allText.includes('ยาง') || allText.includes('wheel') || allText.includes('tire') || allText.includes('เลียดพื้น') || (shotNum === 3)) {
      return 'car_wheel_road';
    }
    if (allText.includes('ภายใน') || allText.includes('พวงมาลัย') || allText.includes('ค็อกพิท') || allText.includes('cockpit') || allText.includes('dashboard') || allText.includes('หน้าปัด') || (shotNum === 4)) {
      return 'car_interior_cockpit';
    }
    if (allText.includes('ทางหลวง') || allText.includes('ไฮเวย์') || allText.includes('highway') || allText.includes('dutch') || allText.includes('เอียง') || (shotNum === 5)) {
      return 'car_highway_speed';
    }
    if (allText.includes('สตาร์ท') || allText.includes('start') || allText.includes('ปุ่ม') || allText.includes('pov') || (shotNum === 6)) {
      return 'car_push_start_pov';
    }
    if (allText.includes('กุญแจ') || allText.includes('key') || allText.includes('เกียร์') || allText.includes('macro') || allText.includes('มาโคร') || (shotNum === 7)) {
      return 'car_macro_key';
    }
    if (allText.includes('สีหน้า') || allText.includes('คนขับ') || allText.includes('ยิ้ม') || allText.includes('reaction') || (shotNum === 8)) {
      return 'car_driver_reaction';
    }
    if (allText.includes('โดรน') || allText.includes('drone') || allText.includes('มุมสูง') || allText.includes('aerial') || (shotNum === 9)) {
      return 'car_drone_aerial';
    }
    if (allText.includes('ด้านข้าง') || allText.includes('profile') || allText.includes('side') || allText.includes('whip') || (shotNum === 10)) {
      return 'car_side_profile';
    }
    if (allText.includes('ส่งมอบ') || allText.includes('ลูกค้า') || allText.includes('จับมือ') || allText.includes('handover') || (shotNum === 11)) {
      return 'car_handover_dealership';
    }
    if (allText.includes('cta') || allText.includes('จบ') || allText.includes('ความสุข') || (shotNum >= 12)) {
      return 'car_hero_cta';
    }
    const carThemes = ['car_showroom_wide', 'car_front_grill', 'car_wheel_road', 'car_interior_cockpit', 'car_highway_speed', 'car_push_start_pov', 'car_macro_key', 'car_driver_reaction', 'car_drone_aerial', 'car_side_profile', 'car_handover_dealership', 'car_hero_cta'];
    return carThemes[(shotNum - 1) % carThemes.length];
  }

  // 3. COFFEE & CAFE
  const isCoffee = allText.includes('กาแฟ') || allText.includes('coffee') || allText.includes('cafe') || 
                   allText.includes('คาเฟ่') || allText.includes('บาริสต้า') || allText.includes('barista');

  if (isCoffee) {
    if (allText.includes('หน้าร้าน') || (shotNum === 1)) return 'cafe_storefront_wide';
    if (allText.includes('เมล็ด') || allText.includes('บด') || (shotNum === 2)) return 'coffee_beans_grind';
    if (allText.includes('สกัด') || allText.includes('espresso') || (shotNum === 3)) return 'coffee_espresso_stream';
    if (allText.includes('เท') || allText.includes('art') || allText.includes('นม') || (shotNum === 4)) return 'coffee_latte_art';
    if (allText.includes('แก้ว') || allText.includes('ควัน') || (shotNum === 5)) return 'coffee_cup_macro';
    if (allText.includes('จิบ') || allText.includes('ชิม') || allText.includes('ยิ้ม') || (shotNum === 6)) return 'coffee_sipping_reaction';
    if (allText.includes('เพื่อน') || (shotNum === 7)) return 'coffee_two_shot_chat';
    return 'coffee_hero_cta';
  }

  // 4. SKINCARE & BEAUTY
  const isSkincare = allText.includes('เซรั่ม') || allText.includes('ครีม') || allText.includes('serum') || 
                     allText.includes('skin') || allText.includes('ผิว') || allText.includes('หน้าใส') || 
                     allText.includes('cosmetic') || allText.includes('beauty');

  if (isSkincare) {
    if (allText.includes('โต๊ะ') || (shotNum === 1)) return 'skincare_vanity_wide';
    if (allText.includes('ขวด') || allText.includes('แท่น') || (shotNum === 2)) return 'skincare_bottle_pedestal';
    if (allText.includes('ดรอป') || allText.includes('หยด') || (shotNum === 3)) return 'skincare_dropper_macro';
    if (allText.includes('ทา') || allText.includes('แก้ม') || (shotNum === 4)) return 'skincare_apply_face';
    if (allText.includes('โกลว์') || allText.includes('ผิว') || (shotNum === 5)) return 'skincare_glow_reaction';
    if (allText.includes('กระจก') || (shotNum === 6)) return 'skincare_mirror_smile';
    return 'skincare_hero_cta';
  }

  // 5. TRAVEL & NATURE
  const isTravel = allText.includes('ภูเขา') || allText.includes('ทะเล') || allText.includes('mountain') ||
                   allText.includes('beach') || allText.includes('sea') || allText.includes('camp') ||
                   allText.includes('แคมป์') || allText.includes('ธรรมชาติ');
  if (isTravel) {
    if (allText.includes('ทะเล') || allText.includes('หาด') || allText.includes('beach')) return 'travel_beach_sea';
    return 'travel_mountain_nature';
  }

  // Universal Camera Angle fallback
  if (angle.includes('wide') || allText.includes('กว้าง') || shotNum === 1) return 'general_wide_city';
  if (angle.includes('reaction') || angle.includes('face') || allText.includes('สีหน้า')) return 'general_close_portrait';
  if (angle.includes('low') || angle.includes('ground') || angle.includes('track') || allText.includes('เลียดพื้น') || allText.includes('ติดตาม')) return 'general_low_motion';
  if (angle.includes('shoulder') || angle.includes('ots') || allText.includes('ข้ามหัวไหล่') || allText.includes('สนทนา')) return 'general_two_ots';
  if (angle.includes('dutch') || angle.includes('canted') || allText.includes('เอียง')) return 'general_dutch_dynamic';
  if (angle.includes('pov') || angle.includes('first-person') || allText.includes('สายตา')) return 'general_pov_hands';
  if (angle.includes('macro') || angle.includes('extreme') || allText.includes('มาโคร')) return 'general_macro_focus';
  if (angle.includes('medium long') || angle.includes('cowboy')) return 'general_cowboy_pose';
  if (angle.includes('high') || angle.includes('drone') || allText.includes('มุมสูง')) return 'general_high_drone';
  if (angle.includes('whip') || angle.includes('pan')) return 'general_whip_pan';
  if (angle.includes('hero') || angle.includes('cta') || angle.includes('resolution') || shotNum >= 12) return 'general_hero_cta';

  const generalThemes = ['general_wide_city', 'general_close_portrait', 'general_low_motion', 'general_two_ots', 'general_dutch_dynamic', 'general_pov_hands', 'general_macro_focus', 'general_high_drone', 'general_whip_pan', 'general_hero_cta'];
  return generalThemes[(shotNum - 1) % generalThemes.length];
}

// Render clean, simple, unmistakable storyboard illustrations
function renderSimpleIllustration(theme) {
  switch (theme) {
    // -------------------------------------------------------------
    // TEMPLE & THAI CULTURAL TRAVEL THEMES
    // -------------------------------------------------------------
    // 1. TEMPLE ENTRANCE GATE & GABLE ROOF (ซุ้มประตูวัด / หน้าบันพระอุโบสถ)
    case 'temple_gate_wide':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#12131c" stroke="#333348" stroke-width="3"/>
        <!-- Radiant Morning Sunbeam behind Temple -->
        <circle cx="384" cy="400" r="90" fill="#facc15" opacity="0.25"/>
        <!-- Classic Thai Temple Tiered Gable Roof (หน้าบัน ช่อฟ้า ใบระกา) -->
        <g transform="translate(384, 330)">
          <!-- Top Spire (ช่อฟ้า) -->
          <polygon points="0,-70 12,-20 -12,-20" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
          <path d="M -12 -20 Q 0 -60 30 -50" stroke="#facc15" stroke-width="4" fill="none"/>
          <!-- Top Tier Roof -->
          <polygon points="0,-20 180,90 -180,90" fill="#0f172a" stroke="#ccff00" stroke-width="4"/>
          <!-- Middle Tier Roof -->
          <polygon points="0,50 240,160 -240,160" fill="#1e293b" stroke="#facc15" stroke-width="4.5"/>
          <!-- Golden Pediment / Gable Center (หน้าบันปิดทอง) -->
          <polygon points="0,60 110,150 -110,150" fill="#ca8a04" stroke="#ffffff" stroke-width="2"/>
          <circle cx="0" cy="115" r="24" fill="#facc15" stroke="#000000" stroke-width="2"/>
        </g>
        <!-- Temple Entrance Gate Pillars (เสาซุ้มประตูวัด) -->
        <g transform="translate(194, 490)">
          <rect x="0" y="0" width="50" height="240" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
          <rect x="330" y="0" width="50" height="240" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
          <!-- Entrance Arch Opening -->
          <path d="M 50 80 Q 190 20 330 80" stroke="#ccff00" stroke-width="4" fill="none"/>
          <!-- Steps & Pathway -->
          <polygon points="50,240 330,240 370,280 10,280" fill="#090a0f" stroke="#475569" stroke-width="2.5"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">THAI TEMPLE ENTRANCE GATE</text>
        </g>
      `;

    // 2. SACRED GOLDEN BUDDHA STATUE & SCULPTURE (พระพุทธรูปทองคำ / ลายกนก)
    case 'temple_buddha_close':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <!-- Golden Aura Halo (รัศมีพระพุทธรูป) -->
        <circle cx="384" cy="430" r="130" stroke="#facc15" stroke-width="2" opacity="0.35" stroke-dasharray="10 8" fill="none"/>
        <g transform="translate(384, 440)">
          <!-- Ushnisha Flame Spire (พระเกศเปลวเพลิง) -->
          <path d="M 0 -150 Q 15 -180 0 -210 Q -15 -180 0 -150 Z" fill="#facc15" stroke="#ffffff" stroke-width="2.5"/>
          <!-- Buddha Head Oval -->
          <ellipse cx="0" cy="-70" rx="65" ry="78" fill="#ca8a04" stroke="#f8fafc" stroke-width="4"/>
          <path d="M -50 -100 Q 0 -140 50 -100" stroke="#facc15" stroke-width="6" fill="none"/>
          <!-- Meditative Closed Eyes & Serene Smile -->
          <path d="M -35 -70 Q -22 -62 -10 -70" stroke="#000000" stroke-width="3.5" fill="none"/>
          <path d="M 10 -70 Q 22 -62 35 -70" stroke="#000000" stroke-width="3.5" fill="none"/>
          <path d="M -16 -40 Q 0 -28 16 -40" stroke="#000000" stroke-width="3.5" fill="none"/>
          <!-- Long Earlobes (พระกรรณยาว) -->
          <path d="M -65 -80 Q -78 -30 -65 -15" stroke="#f8fafc" stroke-width="3.5" fill="none"/>
          <path d="M 65 -80 Q 78 -30 65 -15" stroke="#f8fafc" stroke-width="3.5" fill="none"/>
          <!-- Shoulders with Golden Robe (จีวรห่มเฉียง) -->
          <path d="M -140 100 Q -110 0 0 0 Q 110 0 140 100 Z" fill="#ca8a04" stroke="#f8fafc" stroke-width="4"/>
          <line x1="-70" y1="25" x2="60" y2="100" stroke="#facc15" stroke-width="4"/>
          <!-- Lotus Pedestal Base (ฐานบัวรองรับ) -->
          <g transform="translate(0, 100)">
            <ellipse cx="0" cy="15" rx="160" ry="30" fill="#0f172a" stroke="#ccff00" stroke-width="3.5"/>
            <!-- Lotus Petals -->
            <path d="M -120 15 Q -100 -10 -80 15 Q -60 -10 -40 15 Q -20 -10 0 15 Q 20 -10 40 15 Q 60 -10 80 15 Q 100 -10 120 15" stroke="#facc15" stroke-width="3" fill="none"/>
          </g>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">SACRED BUDDHA &amp; THAI SCULPTURE</text>
        </g>
      `;

    // 3. TEMPLE COURTYARD & PAVILION WALKWAY (เดินผ่านลานวัด / ศาลาสงบร่มรื่น)
    case 'temple_courtyard_walk':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#0e1017" stroke="#333348" stroke-width="3"/>
        <!-- Horizon & Courtyard Flagstone Ground -->
        <polygon points="100,520 668,520 668,780 100,780" fill="#131722"/>
        <line x1="100" y1="520" x2="668" y2="520" stroke="#475569" stroke-width="3"/>
        <!-- Perspective Walkway Flagstones -->
        <line x1="384" y1="520" x2="160" y2="780" stroke="#334155" stroke-width="3"/>
        <line x1="384" y1="520" x2="608" y2="780" stroke="#334155" stroke-width="3"/>
        <line x1="384" y1="520" x2="384" y2="780" stroke="#facc15" stroke-width="3.5" stroke-dasharray="16 10"/>
        <!-- Thai Chedi & Pavilion in Background -->
        <g transform="translate(490, 410)">
          <!-- Small Chedi Stupa -->
          <polygon points="0,-110 30,50 -30,50" fill="#ca8a04" stroke="#facc15" stroke-width="2.5"/>
          <circle cx="0" cy="-115" r="5" fill="#ffffff"/>
        </g>
        <!-- Walking Traveler Silhouette (เดินชมบรรยากาศ) -->
        <g transform="translate(350, 560)">
          <circle cx="34" cy="-35" r="18" fill="#f8fafc"/>
          <path d="M 22 -15 L 46 -15 L 52 45 L 16 45 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
          <!-- Legs in Walking Motion -->
          <line x1="25" y1="45" x2="10" y2="100" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
          <line x1="43" y1="45" x2="58" y2="95" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
          <!-- Shoulder Bag -->
          <path d="M 22 -5 L 45 35" stroke="#ccff00" stroke-width="4"/>
        </g>
        <!-- Green Bodhi Tree Branch Silhouette (กิ่งต้นโพธิ์) -->
        <g transform="translate(130, 290)">
          <path d="M 0 0 Q 70 20 120 80" stroke="#22c55e" stroke-width="5" fill="none"/>
          <circle cx="60" cy="18" r="14" fill="#15803d" opacity="0.8"/>
          <circle cx="100" cy="50" r="16" fill="#15803d" opacity="0.8"/>
          <circle cx="130" cy="85" r="18" fill="#15803d" opacity="0.8"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">TEMPLE COURTYARD WALKWAY</text>
        </g>
      `;

    // 4. TEMPLE SUNSET & PAGODA STUPA SILHOUETTE (วิวพระอาทิตย์ตก / เจดีย์ทองยามเย็น)
    case 'temple_sunset_peace':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#1a1118" stroke="#333348" stroke-width="3"/>
        <!-- Glowing Sunset Sun and Sky Gradients -->
        <circle cx="384" cy="460" r="110" fill="#f97316" opacity="0.4"/>
        <line x1="100" y1="580" x2="668" y2="580" stroke="#facc15" stroke-width="3"/>
        <!-- Majestic Thai Pagoda Stupa Spire (ยอดเจดีย์ทรงระฆัง) -->
        <g transform="translate(384, 320)">
          <!-- Tiered Umbrella Spire (ยอดฉัตร) -->
          <line x1="0" y1="-80" x2="0" y2="0" stroke="#facc15" stroke-width="3"/>
          <ellipse cx="0" cy="-60" rx="14" ry="4" fill="#facc15"/>
          <ellipse cx="0" cy="-45" rx="22" ry="5" fill="#facc15"/>
          <ellipse cx="0" cy="-30" rx="30" ry="6" fill="#facc15"/>
          <!-- Bell-shaped Dome (องค์ระฆังคว่ำ) -->
          <path d="M -70 120 Q -65 20 0 0 Q 65 20 70 120 Z" fill="#0f172a" stroke="#facc15" stroke-width="4.5"/>
          <!-- Base Pedestal (ฐานเจดีย์ลดหลั่น) -->
          <rect x="-100" y="120" width="200" height="26" rx="4" fill="#090a0f" stroke="#f97316" stroke-width="3"/>
          <rect x="-130" y="146" width="260" height="34" rx="4" fill="#090a0f" stroke="#f97316" stroke-width="3"/>
          <rect x="-160" y="180" width="320" height="40" rx="4" fill="#090a0f" stroke="#f97316" stroke-width="3"/>
        </g>
        <!-- Traveler Sitting on Steps Watching Sunset -->
        <g transform="translate(220, 520)">
          <circle cx="20" cy="-15" r="14" fill="#facc15"/>
          <path d="M 10 0 L 30 0 L 35 45 L 5 45 Z" fill="#090a0f" stroke="#facc15" stroke-width="2"/>
          <line x1="5" y1="45" x2="45" y2="45" stroke="#facc15" stroke-width="4"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#f97316" opacity="0.18" stroke="#f97316" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#f97316" text-anchor="middle">TEMPLE SUNSET &amp; SERENITY</text>
        </g>
      `;

    // 5. LOTUS OFFERING & PRAYING HANDS (ดอกบัวบูชา / พนมมือไหว้ / ควันธูป)
    case 'temple_worship_lotus':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <!-- Swirling Incense Smoke (ควันธูปพริ้วไหว) -->
        <path d="M 330 460 Q 300 380 340 320 T 310 240" stroke="#e2e8f0" stroke-width="3.5" fill="none" opacity="0.6"/>
        <path d="M 350 460 Q 380 370 340 300 T 370 230" stroke="#facc15" stroke-width="2.5" fill="none" opacity="0.5"/>
        <g transform="translate(384, 480)">
          <!-- Three Incense Sticks (ธูป 3 ดอก) -->
          <line x1="-15" y1="40" x2="-25" y2="-40" stroke="#ef4444" stroke-width="3"/>
          <line x1="0" y1="40" x2="0" y2="-50" stroke="#ef4444" stroke-width="3"/>
          <line x1="15" y1="40" x2="25" y2="-40" stroke="#ef4444" stroke-width="3"/>
          <circle cx="-25" cy="-40" r="3" fill="#facc15"/>
          <circle cx="0" cy="-50" r="3" fill="#facc15"/>
          <circle cx="25" cy="-40" r="3" fill="#facc15"/>
          <!-- Sacred Lotus Bud (ดอกบัวหลวงตูม) -->
          <g transform="translate(0, -10)">
            <path d="M 0 -70 Q 35 -30 25 15 Q 0 35 -25 15 Q -35 -30 0 -70 Z" fill="#ec4899" stroke="#ffffff" stroke-width="3.5"/>
            <path d="M 0 -70 Q 18 -25 12 15 Q 0 25 -12 15 Q -18 -25 0 -70 Z" fill="#f472b6"/>
            <!-- Folded Petals -->
            <path d="M -25 15 Q -40 5 -20 -15" stroke="#ffffff" stroke-width="2.5" fill="none"/>
            <path d="M 25 15 Q 40 5 20 -15" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          </g>
          <!-- Hands in Anjali Mudra / Wai (พนมมือไหว้) -->
          <path d="M -50 80 Q -30 30 0 15 Q 30 30 50 80 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="4"/>
          <line x1="0" y1="15" x2="0" y2="80" stroke="#ccff00" stroke-width="3"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ec4899" opacity="0.18" stroke="#ec4899" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ec4899" text-anchor="middle">LOTUS OFFERING &amp; WORSHIP</text>
        </g>
      `;

    // 6. TRADITIONAL TEMPLE BELL (ระฆังทองเหลืองวัด / ใบโพธิ์)
    case 'temple_bell_macro':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#14141d" stroke="#333348" stroke-width="3"/>
        <!-- Temple Bell Wooden Beam Support -->
        <rect x="150" y="270" width="468" height="36" rx="8" fill="#1e2230" stroke="#facc15" stroke-width="3"/>
        <g transform="translate(384, 306)">
          <!-- Bell Hanger Ring -->
          <ellipse cx="0" cy="25" rx="22" ry="18" fill="none" stroke="#facc15" stroke-width="6"/>
          <!-- Bronze Temple Bell Body (ระฆังทองเหลือง) -->
          <path d="M -40 45 Q -100 90 -90 190 L 90 190 Q 100 90 40 45 Z" fill="#ca8a04" stroke="#ffffff" stroke-width="5"/>
          <!-- Decorative Circular Relief Rings (ลายขอบระฆัง) -->
          <ellipse cx="0" cy="190" rx="90" ry="24" fill="#a16207" stroke="#ffffff" stroke-width="4"/>
          <ellipse cx="0" cy="140" rx="72" ry="16" fill="none" stroke="#facc15" stroke-width="3"/>
          <ellipse cx="0" cy="95" rx="55" ry="12" fill="none" stroke="#facc15" stroke-width="2.5"/>
          <!-- Hanging Bodhi Leaf Clapper (ใบโพธิ์แขวนใต้ระฆัง) -->
          <line x1="0" y1="190" x2="0" y2="250" stroke="#facc15" stroke-width="3.5"/>
          <path d="M 0 250 Q 35 270 30 300 Q 15 330 0 350 Q -15 330 -30 300 Q -35 270 0 250 Z" fill="#facc15" stroke="#ffffff" stroke-width="3"/>
          <line x1="0" y1="260" x2="0" y2="340" stroke="#ca8a04" stroke-width="2.5"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">TRADITIONAL TEMPLE BELL</text>
        </g>
      `;

    // 7. PEACEFUL PILGRIM REACTION (นักท่องเที่ยวอิ่มบุญ / รอยยิ้มสงบ)
    case 'temple_culture_smile':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <g transform="translate(384, 460)">
          <!-- Head -->
          <ellipse cx="0" cy="10" rx="95" ry="120" fill="#1e293b" stroke="#f8fafc" stroke-width="4.5"/>
          <path d="M -85 -30 Q 0 -110 85 -30 Q 65 -70 0 -70 Q -65 -70 -85 -30 Z" fill="#0f172a" stroke="#ccff00" stroke-width="3.5"/>
          <!-- Gentle Smiling Eyes -->
          <path d="M -45 5 Q -30 -10 -15 5" stroke="#f8fafc" stroke-width="4.5" fill="none"/>
          <path d="M 15 5 Q 30 -10 45 5" stroke="#f8fafc" stroke-width="4.5" fill="none"/>
          <!-- Serene Grateful Smile -->
          <path d="M -30 55 Q 0 88 30 55" stroke="#ccff00" stroke-width="5" fill="#ffffff"/>
          <!-- Flower Garland / Jasmine Malai in Hands (พวงมาลัยมะลิ) -->
          <ellipse cx="0" cy="150" rx="45" ry="25" fill="none" stroke="#fef08a" stroke-width="10" stroke-dasharray="12 6"/>
          <circle cx="0" cy="175" r="10" fill="#ef4444"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">PEACEFUL PILGRIM REACTION</text>
        </g>
      `;

    // 8. TEMPLE HERO CTA (บทสรุปการท่องเที่ยววัด / เชิญชวน 5 ดาว)
    case 'temple_hero_cta':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#15141f" stroke="#333348" stroke-width="3"/>
        <!-- Golden Stupa in Center -->
        <g transform="translate(230, 420)">
          <polygon points="0,-120 35,40 -35,40" fill="#ca8a04" stroke="#facc15" stroke-width="3"/>
          <circle cx="0" cy="-125" r="6" fill="#ffffff"/>
          <rect x="-45" y="40" width="90" height="40" rx="6" fill="#1e2230" stroke="#facc15" stroke-width="2"/>
        </g>
        <!-- Proud Traveler with Hands Folded / Heart -->
        <g transform="translate(470, 430)">
          <circle cx="0" cy="-40" r="32" fill="#1e293b" stroke="#f8fafc" stroke-width="3.5"/>
          <path d="M -25 5 Q 0 0 25 5 L 20 80 L -20 80 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="3"/>
          <circle cx="0" cy="18" r="14" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
        </g>
        <!-- 5-Star Approved Badge -->
        <g transform="translate(244, 630)">
          <rect width="280" height="46" rx="12" fill="#090a0f" stroke="#facc15" stroke-width="2"/>
          <text x="140" y="30" font-family="sans-serif" font-size="17" font-weight="900" fill="#facc15" text-anchor="middle">TEMPLE VLOG 5 STARS</text>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">TEMPLE TRAVEL RESOLUTION</text>
        </g>
      `;

    // -------------------------------------------------------------
    // TRAVEL & NATURE THEMES
    // -------------------------------------------------------------
    case 'travel_mountain_nature':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#0c1214" stroke="#333348" stroke-width="3"/>
        <circle cx="384" cy="380" r="80" fill="#facc15" opacity="0.3"/>
        <!-- Majestic Mountain Peaks -->
        <polygon points="120,680 320,380 480,680" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
        <polygon points="320,380 350,440 310,450 330,480 300,470 280,520" fill="#f8fafc"/>
        <polygon points="360,680 490,440 640,680" fill="#0f172a" stroke="#22c55e" stroke-width="3.5"/>
        <!-- Trail Line -->
        <path d="M 220 680 Q 384 620 540 680" stroke="#facc15" stroke-width="4" stroke-dasharray="14 10" fill="none"/>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#22c55e" opacity="0.18" stroke="#22c55e" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#22c55e" text-anchor="middle">MOUNTAIN &amp; NATURE SCENIC</text>
        </g>
      `;

    case 'travel_beach_sea':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#0a131a" stroke="#333348" stroke-width="3"/>
        <circle cx="260" cy="380" r="70" fill="#f97316" opacity="0.35"/>
        <line x1="100" y1="520" x2="668" y2="520" stroke="#38bdf8" stroke-width="3"/>
        <!-- Ocean Waves -->
        <path d="M 100 560 Q 240 540 384 560 T 668 560" stroke="#38bdf8" stroke-width="4" fill="none"/>
        <path d="M 100 620 Q 240 600 384 620 T 668 620" stroke="#38bdf8" stroke-width="5" fill="none"/>
        <!-- Tropical Palm Tree Silhouette -->
        <g transform="translate(540, 420)">
          <path d="M 10 240 Q -20 120 0 0" stroke="#854d0e" stroke-width="8" fill="none"/>
          <path d="M 0 0 Q -50 -30 -90 -10" stroke="#22c55e" stroke-width="5" fill="none"/>
          <path d="M 0 0 Q 30 -40 70 -20" stroke="#22c55e" stroke-width="5" fill="none"/>
          <path d="M 0 0 Q -30 -60 -10 -90" stroke="#22c55e" stroke-width="5" fill="none"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">BEACH &amp; OCEAN LANDSCAPE</text>
        </g>
      `;

    // -------------------------------------------------------------
    // AUTOMOTIVE THEMES
    // -------------------------------------------------------------
    // 1. CAR SHOWROOM
    case 'car_showroom_wide':
      return `
        <rect x="100" y="240" width="568" height="340" rx="16" fill="#181a26" stroke="#475569" stroke-width="3"/>
        <rect x="130" y="265" width="508" height="50" rx="10" fill="#0f172a" stroke="#ccff00" stroke-width="2"/>
        <text x="384" y="298" font-family="sans-serif" font-size="20" font-weight="900" fill="#ccff00" text-anchor="middle">CAR SHOWROOM</text>
        <line x1="200" y1="315" x2="200" y2="580" stroke="#38bdf8" stroke-width="2" opacity="0.4"/>
        <line x1="384" y1="315" x2="384" y2="580" stroke="#38bdf8" stroke-width="2" opacity="0.4"/>
        <line x1="568" y1="315" x2="568" y2="580" stroke="#38bdf8" stroke-width="2" opacity="0.4"/>
        <path d="M 80 580 L 688 580 L 718 820 L 50 820 Z" fill="#0b0d14" stroke="#334155" stroke-width="3"/>
        <!-- Showcase Car in Center -->
        <g transform="translate(234, 590)">
          <ellipse cx="150" cy="170" rx="160" ry="24" fill="#000000" opacity="0.7"/>
          <path d="M 30 110 Q 80 40 150 40 Q 220 40 270 110 L 290 145 L 10 145 Z" fill="#1e293b" stroke="#ccff00" stroke-width="4"/>
          <path d="M 60 95 Q 150 55 240 95 Z" fill="#38bdf8" opacity="0.4" stroke="#38bdf8" stroke-width="2.5"/>
          <polygon points="35,115 75,120 65,135 25,125" fill="#facc15"/>
          <polygon points="265,115 225,120 235,135 275,125" fill="#facc15"/>
          <rect x="105" y="115" width="90" height="28" rx="6" fill="#090a0f" stroke="#ccff00" stroke-width="2"/>
          <circle cx="45" cy="148" rx="22" ry="16" fill="#090a0f" stroke="#ffffff" stroke-width="3"/>
          <circle cx="255" cy="148" rx="22" ry="16" fill="#090a0f" stroke="#ffffff" stroke-width="3"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">SHOWROOM ESTABLISHING</text>
        </g>
      `;

    // 2. CAR FRONT GRILL & HEADLIGHTS
    case 'car_front_grill':
      return `
        <g transform="translate(134, 320)">
          <!-- Car Hood -->
          <path d="M 50 40 L 450 40 L 490 260 L 10 260 Z" fill="#141824" stroke="#334155" stroke-width="3"/>
          <line x1="160" y1="40" x2="110" y2="240" stroke="#ccff00" stroke-width="3" stroke-dasharray="10 8"/>
          <line x1="340" y1="40" x2="390" y2="240" stroke="#ccff00" stroke-width="3" stroke-dasharray="10 8"/>
          <!-- Front Bumper -->
          <path d="M 0 240 Q 250 200 500 240 L 490 400 Q 250 440 10 400 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="5"/>
          <!-- Headlights Left and Right -->
          <polygon points="20,240 120,260 90,300 10,280" fill="#fef08a" stroke="#ccff00" stroke-width="3"/>
          <polygon points="480,240 380,260 410,300 490,280" fill="#fef08a" stroke="#ccff00" stroke-width="3"/>
          <!-- Big Honeycomb Grille -->
          <rect x="140" y="240" width="220" height="130" rx="16" fill="#090a0f" stroke="#ccff00" stroke-width="4"/>
          <circle cx="250" cy="285" r="28" fill="#ccff00" stroke="#ffffff" stroke-width="3"/>
          <text x="250" y="293" font-family="sans-serif" font-size="18" font-weight="900" fill="#000000" text-anchor="middle">GT</text>
          <text x="250" y="345" font-family="sans-serif" font-size="14" font-weight="900" fill="#38bdf8" text-anchor="middle">TWIN TURBO</text>
          <!-- Tires Peeking -->
          <rect x="-15" y="350" width="40" height="90" rx="12" fill="#090a0f" stroke="#94a3b8" stroke-width="3"/>
          <rect x="475" y="350" width="40" height="90" rx="12" fill="#090a0f" stroke="#94a3b8" stroke-width="3"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">CAR FRONT FASCIA &amp; LED</text>
        </g>
      `;

    // 3. CAR WHEEL ON ROAD
    case 'car_wheel_road':
      return `
        <!-- Road Asphalt Ground -->
        <rect x="80" y="260" width="608" height="540" rx="20" fill="#0d0e14" stroke="#334155" stroke-width="3"/>
        <line x1="80" y1="620" x2="688" y2="620" stroke="#64748b" stroke-width="5"/>
        <line x1="120" y1="710" x2="300" y2="710" stroke="#facc15" stroke-width="8"/>
        <line x1="380" y1="710" x2="560" y2="710" stroke="#facc15" stroke-width="8"/>
        <line x1="640" y1="710" x2="688" y2="710" stroke="#facc15" stroke-width="8"/>
        <!-- Motion Speed Streaks -->
        <line x1="100" y1="520" x2="260" y2="520" stroke="#38bdf8" stroke-width="4" stroke-dasharray="16 10"/>
        <line x1="80" y1="560" x2="280" y2="560" stroke="#ccff00" stroke-width="3" stroke-dasharray="24 14"/>
        <!-- 21 Inch Alloy Wheel -->
        <g transform="translate(390, 520)">
          <!-- Tire -->
          <circle cx="0" cy="0" r="170" fill="#13141d" stroke="#f8fafc" stroke-width="8"/>
          <circle cx="0" cy="0" r="140" fill="#1e2230" stroke="#475569" stroke-width="4"/>
          <!-- Brake Rotor and Red Caliper -->
          <circle cx="0" cy="0" r="100" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
          <path d="M 50 -80 Q 105 -35 100 35 L 65 25 Q 70 -20 35 -60 Z" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
          <text x="68" y="-8" font-family="sans-serif" font-size="11" font-weight="900" fill="#ffffff" transform="rotate(45, 68, -8)">SPORT</text>
          <!-- 5-Spoke Alloy Rim -->
          <circle cx="0" cy="0" r="45" fill="#090a0f" stroke="#ccff00" stroke-width="4"/>
          <g stroke="#ffffff" stroke-width="8">
            <line x1="0" y1="-40" x2="0" y2="-135"/>
            <line x1="38" y1="-12" x2="128" y2="-42"/>
            <line x1="24" y1="32" x2="80" y2="110"/>
            <line x1="-24" y1="32" x2="-80" y2="110"/>
            <line x1="-38" y1="-12" x2="-128" y2="-42"/>
          </g>
          <circle cx="0" cy="0" r="22" fill="#ccff00" stroke="#000000" stroke-width="3"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">WHEEL TRACKING SHOT</text>
        </g>
      `;

    // 4. CAR INTERIOR COCKPIT & STEERING WHEEL
    case 'car_interior_cockpit':
      return `
        <rect x="100" y="240" width="568" height="540" rx="20" fill="#0d1117" stroke="#334155" stroke-width="3"/>
        <path d="M 120 260 L 648 260 L 600 460 L 168 460 Z" fill="#070a10" stroke="#38bdf8" stroke-width="2"/>
        <line x1="384" y1="260" x2="384" y2="460" stroke="#facc15" stroke-width="3" stroke-dasharray="12 8"/>
        <!-- Dashboard Body -->
        <path d="M 100 460 Q 384 430 668 460 L 668 780 L 100 780 Z" fill="#181a24" stroke="#475569" stroke-width="4"/>
        <path d="M 110 475 Q 384 445 658 475" stroke="#ccff00" stroke-width="3" fill="none"/>
        <!-- Digital Speedometer Gauge -->
        <g transform="translate(160, 490)">
          <rect width="170" height="90" rx="12" fill="#090a0f" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="85" cy="45" r="32" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
          <line x1="85" y1="45" x2="105" y2="25" stroke="#ef4444" stroke-width="3.5"/>
          <text x="85" y="70" font-family="monospace" font-size="13" font-weight="bold" fill="#ccff00" text-anchor="middle">120 KM/H</text>
        </g>
        <!-- Nav Screen -->
        <g transform="translate(420, 490)">
          <rect width="190" height="90" rx="12" fill="#090a0f" stroke="#38bdf8" stroke-width="2"/>
          <path d="M 20 65 Q 80 20 120 50 T 170 30" stroke="#38bdf8" stroke-width="3" fill="none"/>
          <text x="95" y="24" font-family="sans-serif" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">GPS NAVIGATION</text>
        </g>
        <!-- Big Steering Wheel in Center -->
        <g transform="translate(245, 660)">
          <circle cx="0" cy="0" r="130" fill="none" stroke="#f8fafc" stroke-width="14"/>
          <circle cx="0" cy="0" r="45" fill="#1e2230" stroke="#f8fafc" stroke-width="5"/>
          <line x1="-125" y1="0" x2="-45" y2="0" stroke="#f8fafc" stroke-width="9"/>
          <line x1="45" y1="0" x2="125" y2="0" stroke="#f8fafc" stroke-width="9"/>
          <line x1="0" y1="45" x2="0" y2="125" stroke="#f8fafc" stroke-width="9"/>
          <circle cx="0" cy="0" r="18" fill="#ccff00" stroke="#000000" stroke-width="2"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">COCKPIT STEERING WHEEL</text>
        </g>
      `;

    // 5. CAR HIGHWAY SPEED (DUTCH ANGLE)
    case 'car_highway_speed':
      return `
        <g transform="rotate(-15, 384, 540)">
          <rect x="60" y="320" width="648" height="440" rx="16" fill="#0e1017" stroke="#334155" stroke-width="3"/>
          <line x1="60" y1="460" x2="708" y2="460" stroke="#64748b" stroke-width="4"/>
          <line x1="100" y1="580" x2="280" y2="580" stroke="#facc15" stroke-width="7"/>
          <line x1="360" y1="580" x2="540" y2="580" stroke="#facc15" stroke-width="7"/>
          <!-- Moving Sports Car -->
          <g transform="translate(180, 440)">
            <path d="M 80 40 Q 180 -10 320 0 L 380 40 L 460 55 Q 490 70 490 100 L 490 125 L 0 125 Q 0 85 40 65 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="4"/>
            <path d="M 100 35 L 220 35 L 220 10 L 160 10 Z" fill="#38bdf8" opacity="0.4" stroke="#38bdf8" stroke-width="2"/>
            <path d="M 235 35 L 345 35 L 320 10 L 235 10 Z" fill="#38bdf8" opacity="0.4" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="100" cy="125" r="38" fill="#090a0f" stroke="#f8fafc" stroke-width="5"/>
            <circle cx="100" cy="125" r="18" fill="#ccff00"/>
            <circle cx="390" cy="125" r="38" fill="#090a0f" stroke="#f8fafc" stroke-width="5"/>
            <circle cx="390" cy="125" r="18" fill="#ccff00"/>
            <polygon points="490,85 640,45 660,135 490,110" fill="#fef08a" opacity="0.3"/>
          </g>
          <line x1="80" y1="480" x2="200" y2="480" stroke="#38bdf8" stroke-width="3" stroke-dasharray="14 8"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">HIGHWAY DYNAMIC CRUISE</text>
        </g>
      `;

    // 6. ENGINE START BUTTON POV
    case 'car_push_start_pov':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#12131c" stroke="#334155" stroke-width="3"/>
        <rect x="234" y="275" width="300" height="50" rx="12" fill="#090a0f" stroke="#ccff00" stroke-width="2"/>
        <text x="384" y="307" font-family="monospace" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">SYSTEM READY 450 HP</text>
        <g transform="translate(384, 490)">
          <circle cx="0" cy="0" r="120" stroke="#ef4444" stroke-width="3" opacity="0.4" stroke-dasharray="10 8"/>
          <circle cx="0" cy="0" r="95" fill="#1e2230" stroke="#f8fafc" stroke-width="6"/>
          <circle cx="0" cy="0" r="78" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
          <text x="0" y="-12" font-family="sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle">ENGINE</text>
          <text x="0" y="14" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">START</text>
          <text x="0" y="34" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fef08a" text-anchor="middle">STOP</text>
        </g>
        <g transform="translate(384, 520)">
          <path d="M -30 240 L -15 110 Q 0 50 10 15 L 20 15 Q 30 50 45 110 L 60 240 Z" fill="#1e2230" stroke="#f8fafc" stroke-width="5"/>
          <circle cx="15" cy="12" r="16" fill="#facc15" stroke="#ffffff" stroke-width="3"/>
          <path d="M -20 -5 L -10 10 M 35 -5 L 25 10" stroke="#ccff00" stroke-width="3"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ef4444" opacity="0.18" stroke="#ef4444" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ef4444" text-anchor="middle">POV ENGINE START BUTTON</text>
        </g>
      `;

    // 7. CAR SMART KEY FOB
    case 'car_macro_key':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <text x="384" y="290" font-family="monospace" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="middle">EXTREME MACRO 100mm</text>
        <g transform="translate(294, 340)">
          <rect x="0" y="0" width="180" height="260" rx="48" fill="#1e293b" stroke="#f8fafc" stroke-width="5"/>
          <rect x="16" y="16" width="148" height="228" rx="36" fill="#0f172a" stroke="#ccff00" stroke-width="2.5"/>
          <circle cx="90" cy="70" r="28" fill="#ccff00" stroke="#ffffff" stroke-width="3"/>
          <polygon points="90,52 104,78 76,78" fill="#000000"/>
          <rect x="40" y="125" width="100" height="38" rx="10" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
          <text x="90" y="150" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">LOCK</text>
          <rect x="40" y="175" width="100" height="38" rx="10" fill="#1e293b" stroke="#ccff00" stroke-width="2"/>
          <text x="90" y="200" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ccff00" text-anchor="middle">UNLOCK</text>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">LUXURY SMART KEY FOB</text>
        </g>
      `;

    // 8. DRIVER REACTION SMILE
    case 'car_driver_reaction':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <g transform="translate(384, 450)">
          <path d="M -160 220 L 160 80" stroke="#ef4444" stroke-width="14"/>
          <ellipse cx="0" cy="20" rx="100" ry="125" fill="#1e293b" stroke="#f8fafc" stroke-width="4.5"/>
          <path d="M -90 -20 Q 0 -110 90 -20 Q 70 -60 0 -60 Q -70 -60 -90 -20 Z" fill="#0f172a" stroke="#ccff00" stroke-width="3.5"/>
          <circle cx="-35" cy="0" r="10" fill="#ffffff"/>
          <circle cx="-35" cy="0" r="5" fill="#000000"/>
          <circle cx="35" cy="0" r="10" fill="#ffffff"/>
          <circle cx="35" cy="0" r="5" fill="#000000"/>
          <path d="M -50 -18 Q -35 -26 -20 -18" stroke="#ccff00" stroke-width="4" fill="none"/>
          <path d="M 20 -18 Q 35 -26 50 -18" stroke="#ccff00" stroke-width="4" fill="none"/>
          <path d="M -30 60 Q 0 95 30 60" stroke="#ccff00" stroke-width="5" fill="#ffffff"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">DRIVER DELIGHT REACTION</text>
        </g>
      `;

    // 9. HIGH ANGLE DRONE
    case 'car_drone_aerial':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#0b100b" stroke="#334155" stroke-width="3"/>
        <path d="M 120 250 Q 200 400 440 430 T 600 770" stroke="#334155" stroke-width="80" fill="none"/>
        <path d="M 120 250 Q 200 400 440 430 T 600 770" stroke="#facc15" stroke-width="4" stroke-dasharray="16 12" fill="none"/>
        <g transform="translate(440, 430) rotate(45)">
          <rect x="-18" y="-32" width="36" height="64" rx="8" fill="#ccff00" stroke="#ffffff" stroke-width="2.5"/>
          <rect x="-14" y="-18" width="28" height="34" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
        </g>
        <circle cx="384" cy="500" r="140" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="10 8" fill="none"/>
        <text x="384" y="285" font-family="monospace" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">DRONE 4K ALT: 120M</text>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">HIGH ANGLE DRONE ROAD</text>
        </g>
      `;

    // 10. CAR SIDE PROFILE
    case 'car_side_profile':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#0e1017" stroke="#333348" stroke-width="3"/>
        <line x1="100" y1="620" x2="668" y2="620" stroke="#64748b" stroke-width="4"/>
        <line x1="140" y1="690" x2="628" y2="690" stroke="#facc15" stroke-width="6" stroke-dasharray="24 14"/>
        <g transform="translate(140, 470)">
          <path d="M 0 120 Q 20 70 70 60 L 150 25 Q 240 -5 330 25 L 430 60 Q 470 70 480 120 L 470 145 L 10 145 Z" fill="#1e293b" stroke="#ccff00" stroke-width="4"/>
          <path d="M 160 35 L 300 35 L 380 60 L 120 60 Z" fill="#38bdf8" opacity="0.4" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="100" cy="145" r="42" fill="#090a0f" stroke="#f8fafc" stroke-width="5"/>
          <circle cx="100" cy="145" r="18" fill="#ccff00"/>
          <circle cx="380" cy="145" r="42" fill="#090a0f" stroke="#f8fafc" stroke-width="5"/>
          <circle cx="380" cy="145" r="18" fill="#ccff00"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">CAR SIDE TRACKING</text>
        </g>
      `;

    // 11. KEY HANDOVER & HANDSHAKE
    case 'car_handover_dealership':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <g transform="translate(244, 300)">
          <path d="M 20 70 Q 120 30 220 70 L 235 110 L 5 110 Z" fill="#1e293b" stroke="#475569" stroke-width="2.5"/>
          <ellipse cx="120" cy="45" rx="30" ry="16" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
        </g>
        <g transform="translate(180, 440)">
          <circle cx="40" cy="40" r="35" fill="#1e293b" stroke="#f8fafc" stroke-width="3.5"/>
          <path d="M 15 110 L 28 75 Q 40 80 52 75 L 65 110 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="3"/>
          <path d="M 50 90 L 110 110" stroke="#f8fafc" stroke-width="5"/>
          <circle cx="125" cy="112" r="12" fill="#ccff00" stroke="#000000" stroke-width="2.5"/>
        </g>
        <g transform="translate(420, 440)">
          <circle cx="40" cy="40" r="35" fill="#1e293b" stroke="#f8fafc" stroke-width="3.5"/>
          <path d="M 15 110 L 28 75 Q 40 80 52 75 L 65 110 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="3"/>
          <path d="M 30 90 L -30 110" stroke="#f8fafc" stroke-width="5"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#22c55e" opacity="0.18" stroke="#22c55e" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#22c55e" text-anchor="middle">KEY HANDOVER &amp; HANDSHAKE</text>
        </g>
      `;

    // 12. HERO CTA / OWNER 5 STARS
    case 'car_hero_cta':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#141420" stroke="#333348" stroke-width="3"/>
        <g transform="translate(130, 480)">
          <path d="M 20 60 Q 130 20 260 60 L 280 110 L 0 110 Z" fill="#1e293b" stroke="#ccff00" stroke-width="3.5"/>
          <circle cx="50" cy="110" r="26" fill="#090a0f" stroke="#ffffff" stroke-width="3"/>
          <circle cx="230" cy="110" r="26" fill="#090a0f" stroke="#ffffff" stroke-width="3"/>
        </g>
        <g transform="translate(430, 360)">
          <circle cx="50" cy="50" r="42" fill="#1e293b" stroke="#f8fafc" stroke-width="4"/>
          <path d="M 35 62 Q 50 82 65 62" stroke="#ccff00" stroke-width="4" fill="#ffffff"/>
          <path d="M 15 130 L 32 92 Q 50 96 68 92 L 85 130 Z" fill="#1e293b" stroke="#f8fafc" stroke-width="4"/>
          <circle cx="-15" cy="105" r="14" fill="#ccff00" stroke="#000000" stroke-width="2.5"/>
          <line x1="-15" y1="95" x2="-15" y2="108" stroke="#000000" stroke-width="4"/>
        </g>
        <g transform="translate(244, 650)">
          <rect width="280" height="46" rx="12" fill="#090a0f" stroke="#facc15" stroke-width="2"/>
          <text x="140" y="30" font-family="sans-serif" font-size="18" font-weight="900" fill="#facc15" text-anchor="middle">APPROVED 5 STARS</text>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">HERO OWNER RESOLUTION</text>
        </g>
      `;

    // -------------------------------------------------------------
    // CAFE & COFFEE
    // -------------------------------------------------------------
    case 'cafe_storefront_wide':
    case 'coffee_beans_grind':
    case 'coffee_espresso_stream':
    case 'coffee_latte_art':
    case 'coffee_cup_macro':
    case 'coffee_sipping_reaction':
    case 'coffee_two_shot_chat':
    case 'coffee_hero_cta':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#141110" stroke="#333348" stroke-width="3"/>
        <g transform="translate(384, 480)">
          <ellipse cx="0" cy="0" rx="120" ry="40" fill="#451a03" stroke="#f8fafc" stroke-width="4"/>
          <ellipse cx="0" cy="0" rx="95" ry="28" fill="#78350f"/>
          <path d="M -120 0 L -90 150 Q 0 180 90 150 L 120 0 Z" fill="#1e2230" stroke="#f8fafc" stroke-width="5"/>
          <path d="M 120 25 C 180 25 180 120 100 130" stroke="#f8fafc" stroke-width="9" fill="none"/>
          <path d="M -30 -50 Q -50 -100 -20 -150" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 8" fill="none"/>
          <path d="M 30 -50 Q 50 -100 20 -150" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 8" fill="none"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#f59e0b" opacity="0.18" stroke="#f59e0b" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#f59e0b" text-anchor="middle">COFFEE &amp; CAFE SCENE</text>
        </g>
      `;

    // -------------------------------------------------------------
    // SKINCARE & BEAUTY
    // -------------------------------------------------------------
    case 'skincare_vanity_wide':
    case 'skincare_bottle_pedestal':
    case 'skincare_dropper_macro':
    case 'skincare_apply_face':
    case 'skincare_glow_reaction':
    case 'skincare_mirror_smile':
    case 'skincare_hero_cta':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#16121a" stroke="#333348" stroke-width="3"/>
        <g transform="translate(384, 480)">
          <rect x="-20" y="-170" width="40" height="34" rx="8" fill="#fce7f3" stroke="#ffffff" stroke-width="2.5"/>
          <rect x="-30" y="-136" width="60" height="20" rx="5" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
          <rect x="-55" y="-116" width="110" height="230" rx="24" fill="#1e1828" stroke="#f8fafc" stroke-width="4"/>
          <rect x="-42" y="-40" width="84" height="140" rx="14" fill="#ec4899" opacity="0.35" stroke="#f472b6" stroke-width="2"/>
          <text x="0" y="25" font-family="sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle">SERUM</text>
          <path d="M 100 -70 Q 100 -30 80 -20 Q 60 -30 60 -70 Q 80 -105 100 -70 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2.5"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ec4899" opacity="0.18" stroke="#ec4899" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ec4899" text-anchor="middle">LUXURY SKINCARE PRODUCT</text>
        </g>
      `;

    // -------------------------------------------------------------
    // UNIVERSAL ANGLES (NO CAR WHEEL IN GENERAL THEMES!)
    // -------------------------------------------------------------
    case 'general_wide_city':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#10121a" stroke="#333348" stroke-width="3"/>
        <circle cx="384" cy="420" r="70" fill="#facc15" opacity="0.3"/>
        <rect x="150" y="440" width="60" height="220" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
        <rect x="230" y="380" width="70" height="280" fill="#0f172a" stroke="#ccff00" stroke-width="2"/>
        <rect x="320" y="320" width="80" height="340" fill="#0f172a" stroke="#f8fafc" stroke-width="3"/>
        <rect x="420" y="360" width="70" height="300" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
        <rect x="510" y="420" width="60" height="240" fill="#0f172a" stroke="#ccff00" stroke-width="2"/>
        <line x1="100" y1="660" x2="668" y2="660" stroke="#facc15" stroke-dasharray="20 12" stroke-width="4"/>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">WIDE ESTABLISHING SHOT</text>
        </g>
      `;

    case 'general_close_portrait':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <g transform="translate(384, 460)">
          <ellipse cx="0" cy="20" rx="105" ry="135" fill="#1e293b" stroke="#f8fafc" stroke-width="4.5"/>
          <circle cx="-35" cy="0" r="12" fill="#ffffff"/>
          <circle cx="-35" cy="0" r="6" fill="#000000"/>
          <circle cx="35" cy="0" r="12" fill="#ffffff"/>
          <circle cx="35" cy="0" r="6" fill="#000000"/>
          <path d="M -30 65 Q 0 100 30 65" stroke="#ccff00" stroke-width="5" fill="#ffffff"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">CLOSE-UP REACTION PORTRAIT</text>
        </g>
      `;

    // Clean Walking Low-Ground Motion (Feet & Path, NOT Car Wheel!)
    case 'general_low_motion':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#10131d" stroke="#333348" stroke-width="3"/>
        <!-- Low Ground Pathway & Forward Motion Arrows -->
        <polygon points="100,560 668,560 668,780 100,780" fill="#090d14"/>
        <line x1="100" y1="560" x2="668" y2="560" stroke="#38bdf8" stroke-width="4"/>
        <line x1="384" y1="560" x2="200" y2="780" stroke="#facc15" stroke-width="3"/>
        <line x1="384" y1="560" x2="568" y2="780" stroke="#facc15" stroke-width="3"/>
        <!-- Forward Tracking Arrows -->
        <g stroke="#ccff00" stroke-width="5" fill="none" stroke-linecap="round">
          <path d="M 350 630 L 384 600 L 418 630"/>
          <path d="M 330 690 L 384 650 L 438 690"/>
          <path d="M 310 750 L 384 700 L 458 750"/>
        </g>
        <!-- Walking Feet Silhouette -->
        <g transform="translate(340, 500)">
          <path d="M 10 0 L 25 50 L 55 50" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>
          <path d="M 60 -15 L 75 35 L 105 35" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" fill="none"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">LOW GROUND TRACKING SHOT</text>
        </g>
      `;

    // Over-The-Shoulder (OTS)
    case 'general_two_ots':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#13141f" stroke="#333348" stroke-width="3"/>
        <!-- Background Focal Point -->
        <circle cx="480" cy="460" r="45" fill="#facc15" opacity="0.3"/>
        <g transform="translate(480, 470)">
          <circle cx="0" cy="-30" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
          <path d="M -25 35 L -18 0 Q 0 -10 18 0 L 25 35 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
        </g>
        <!-- Foreground Shoulder Silhouette -->
        <g transform="translate(200, 560)">
          <path d="M -100 220 Q -40 80 40 40 Q 90 20 140 70 L 140 220 Z" fill="#090a0f" stroke="#ccff00" stroke-width="4.5"/>
          <circle cx="10" cy="20" r="38" fill="#090a0f" stroke="#ccff00" stroke-width="4"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#ccff00" opacity="0.18" stroke="#ccff00" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#ccff00" text-anchor="middle">OVER-THE-SHOULDER (OTS)</text>
        </g>
      `;

    case 'general_dutch_dynamic':
      return `
        <g transform="rotate(-15, 384, 510)">
          <rect x="80" y="260" width="608" height="500" rx="20" fill="#131520" stroke="#333348" stroke-width="3"/>
          <line x1="80" y1="510" x2="688" y2="510" stroke="#facc15" stroke-width="4"/>
          <line x1="80" y1="400" x2="688" y2="400" stroke="#38bdf8" stroke-width="3" stroke-dasharray="14 10"/>
          <circle cx="384" cy="510" r="70" fill="#1e293b" stroke="#ccff00" stroke-width="4"/>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">DUTCH ANGLE DYNAMIC</text>
        </g>
      `;

    case 'general_high_drone':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#0b120f" stroke="#333348" stroke-width="3"/>
        <path d="M 120 260 Q 250 420 450 450 T 620 760" stroke="#334155" stroke-width="70" fill="none"/>
        <path d="M 120 260 Q 250 420 450 450 T 620 760" stroke="#facc15" stroke-width="4" stroke-dasharray="16 12" fill="none"/>
        <circle cx="384" cy="510" r="130" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8 8" fill="none"/>
        <text x="384" y="290" font-family="monospace" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="middle">AERIAL 4K DRONE VIEW</text>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#38bdf8" opacity="0.18" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">HIGH ANGLE DRONE VIEW</text>
        </g>
      `;

    case 'general_hero_cta':
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#141420" stroke="#333348" stroke-width="3"/>
        <circle cx="384" cy="460" r="110" fill="#1e2230" stroke="#facc15" stroke-width="4"/>
        <polygon points="384,390 405,445 465,445 415,480 435,535 384,500 333,535 353,480 303,445 363,445" fill="#facc15"/>
        <g transform="translate(244, 630)">
          <rect width="280" height="46" rx="12" fill="#090a0f" stroke="#facc15" stroke-width="2"/>
          <text x="140" y="30" font-family="sans-serif" font-size="17" font-weight="900" fill="#facc15" text-anchor="middle">CINEMATIC RESOLUTION</text>
        </g>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">HERO RESOLUTION &amp; CTA</text>
        </g>
      `;

    default:
      return `
        <rect x="100" y="240" width="568" height="540" rx="24" fill="#141420" stroke="#333348" stroke-width="3"/>
        <circle cx="384" cy="480" r="80" fill="#1e293b" stroke="#ccff00" stroke-width="4"/>
        <text x="384" y="630" font-family="sans-serif" font-size="20" font-weight="900" fill="#facc15" text-anchor="middle">CINEMATIC SCENE KEYFRAME</text>
        <g transform="translate(384, 875)">
          <rect x="-240" y="-22" width="480" height="44" rx="22" fill="#facc15" opacity="0.18" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="6" font-family="sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">STORYBOARD KEYFRAME</text>
        </g>
      `;
  }
}

function getStoryboardSketch(shot) {
  if (!shot) shot = {};
  const shotNum = shot.step_number || shot.shot_number || 1;
  const angle = escapeXml(shot.camera_angle || 'Medium Shot');
  const lens = escapeXml(shot.lens_focal || '35mm');
  const rawTitle = shot.title || ('Shot #' + shotNum);
  const title = escapeXml(rawTitle.slice(0, 36));
  const sceneNum = shot.scene_number || 1;
  const movement = escapeXml((shot.camera_movement || 'Camera Motion').slice(0, 48));
  const rawDesc = shot.action_description || shot.subtitle || shot.content || title;
  const desc = escapeXml(rawDesc.slice(0, 52));
  const durSec = shot.duration_seconds ? Number(shot.duration_seconds).toFixed(1) : '2.5';
  const rawTimecode = shot.timecode ? shot.timecode.split('(')[0].trim() : '';
  const timecode = escapeXml(rawTimecode);

  const theme = resolveSketchTheme(shot);
  const illustrationSvg = renderSimpleIllustration(theme);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1344" viewBox="0 0 768 1344">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181f"/>
      <stop offset="50%" stop-color="#111116"/>
      <stop offset="100%" stop-color="#0b0b0e"/>
    </linearGradient>
    <pattern id="dirGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#23232c" stroke-width="1.2"/>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  <rect width="100%" height="100%" fill="url(#dirGrid)" opacity="0.8"/>

  <rect x="36" y="36" width="696" height="1272" rx="28" fill="none" stroke="#383848" stroke-width="2.5" stroke-dasharray="16 8"/>
  
  <path d="M 56 76 L 96 76 M 76 56 L 76 96" stroke="#ccff00" stroke-width="3"/>
  <path d="M 712 76 L 672 76 M 692 56 L 692 96" stroke="#ccff00" stroke-width="3"/>
  <path d="M 56 1268 L 96 1268 M 76 1248 L 76 1288" stroke="#ccff00" stroke-width="3"/>
  <path d="M 712 1268 L 672 1268 M 692 1248 L 692 1288" stroke="#ccff00" stroke-width="3"/>

  <!-- Top Clapper Slate Header -->
  <g transform="translate(64, 80)">
    <rect width="640" height="96" rx="20" fill="#1c1c24" stroke="#333344" stroke-width="2"/>
    
    <rect x="18" y="24" width="115" height="48" rx="12" fill="#292524" stroke="#facc15" stroke-width="1.5"/>
    <text x="75" y="55" font-family="monospace" font-size="18" font-weight="900" fill="#facc15" text-anchor="middle">SCENE ${sceneNum}</text>

    <rect x="140" y="24" width="120" height="48" rx="12" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
    <text x="200" y="55" font-family="monospace" font-size="20" font-weight="900" fill="#ccff00" text-anchor="middle">SHOT ${shotNum}</text>

    <rect x="268" y="24" width="120" height="48" rx="12" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="328" y="55" font-family="monospace" font-size="19" font-weight="900" fill="#facc15" text-anchor="middle">TIME ${durSec}s</text>

    <text x="618" y="46" font-family="sans-serif" font-size="17" font-weight="bold" fill="#ffffff" text-anchor="end">${angle}</text>
    <text x="618" y="70" font-family="monospace" font-size="14" fill="#a1a1aa" text-anchor="end">LENS: ${lens}</text>
  </g>

  <!-- Illustration Canvas -->
  <g transform="translate(0, 40)">
    ${illustrationSvg}
  </g>

  <!-- Bottom Director Notebook Footer -->
  <g transform="translate(64, 980)">
    <rect width="640" height="260" rx="24" fill="#14141a" stroke="#2b2b38" stroke-width="2"/>
    
    <text x="32" y="44" font-family="sans-serif" font-size="22" font-weight="900" fill="#ffffff">${title}</text>
    
    <g transform="translate(32, 65)">
      <rect width="576" height="38" rx="10" fill="#27272a" stroke="#3f3f46" stroke-width="1"/>
      <text x="14" y="24" font-family="monospace" font-size="13" font-weight="bold" fill="#ccff00">CAM: ${movement}</text>
    </g>

    <text x="32" y="140" font-family="sans-serif" font-size="15" fill="#d4d4d8">${desc}</text>
    <text x="32" y="170" font-family="sans-serif" font-size="14" fill="#94a3b8">CineBoard Director Instant Storyboard Sketch</text>

    <g transform="translate(360, 190)">
      <rect width="250" height="42" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="125" y="26" font-family="monospace" font-size="12" font-weight="bold" fill="#38bdf8" text-anchor="middle">${durSec}s ${timecode ? '(' + timecode + ')' : ''}</text>
    </g>
  </g>
</svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export { getStoryboardSketch, resolveSketchTheme };

export function getShotDisplayImage(shot) {
  if (!shot) return getStoryboardSketch(shot);
  const url = shot.image_url;
  if (!url || url.includes('pollinations.ai')) {
    return getStoryboardSketch(shot);
  }
  return url;
}

export function getStoryboardFallback(shot) {
  return getStoryboardSketch(shot);
}
