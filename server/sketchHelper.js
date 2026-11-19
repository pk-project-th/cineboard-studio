// CineBoard Studio — Editorial Framing, Composition & Safe-Zone Visual Guide
// Supports Dual Modes:
//   1. PHOTO MODE: World-class composition diagrams (Foreground Layering, Leading Lines, Chiaroscuro Light Rays, Rule of Thirds)
//   2. VIDEO MODE: Viral Reels/TikTok framing, camera movement arrows & Text Safe-Zone guide

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildPhotoCompositionArt(shot, cx, cy, width, height) {
  const tech = String((shot?.master_photographer || '') + ' ' + (shot?.depth_technique || '') + ' ' + (shot?.camera_angle || '')).toLowerCase();

  // 1. Saul Leiter: Foreground Layering / Frame through glass or foliage
  if (/leiter|layer|ฉากหน้า|ลอดผ่าน|กระจก|ใบไม้/.test(tech)) {
    return `
      <!-- Soft Out-of-Focus Foreground Frame (Left & Right) -->
      <ellipse cx="${width * 0.12}" cy="${cy}" rx="${width * 0.16}" ry="${height * 0.42}" fill="rgba(180, 83, 9, 0.18)" stroke="rgba(217, 119, 6, 0.45)" stroke-width="2" stroke-dasharray="6 6"/>
      <ellipse cx="${width * 0.88}" cy="${cy - 40}" rx="${width * 0.14}" ry="${height * 0.35}" fill="rgba(16, 185, 129, 0.14)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="2" stroke-dasharray="6 6"/>
      <!-- Midground Sharp Subject -->
      <circle cx="${cx}" cy="${cy - 32}" r="28" fill="rgba(217, 119, 6, 0.25)" stroke="#D97706" stroke-width="2.5"/>
      <path d="M ${cx - 58} ${cy + 58} C ${cx - 58} ${cy + 2}, ${cx + 58} ${cy + 2}, ${cx + 58} ${cy + 58} Z" fill="rgba(217, 119, 6, 0.18)" stroke="#D97706" stroke-width="2.5"/>
      <!-- Depth Layer Labels -->
      <text x="${width * 0.12}" y="${cy}" fill="#F59E0B" font-family="sans-serif" font-weight="800" font-size="13" text-anchor="middle">ฉากหน้าเบลอ</text>
      <text x="${cx}" y="${cy + 82}" fill="#18181B" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">ตัวแบบคมชัด (Layer 2) • หลังละลาย (Layer 3)</text>
    `;
  }

  // 2. Fan Ho: Chiaroscuro Light Shafts & Architectural Scale
  if (/fan ho|แสงเงา|chiaroscuro|ย้อนแสง|เงาทอดยาว|scale|สถาปัตย/.test(tech)) {
    return `
      <!-- Diagonal Sunlight Shafts -->
      <polygon points="${width * 0.15},0 ${width * 0.52},0 ${width * 0.85},${height * 0.72} ${width * 0.42},${height * 0.72}" fill="rgba(245, 158, 11, 0.16)"/>
      <line x1="${width * 0.15}" y1="0" x2="${width * 0.42}" y2="${height * 0.72}" stroke="#D97706" stroke-width="2" stroke-dasharray="8 6"/>
      <line x1="${width * 0.52}" y1="0" x2="${width * 0.85}" y2="${height * 0.72}" stroke="#D97706" stroke-width="2" stroke-dasharray="8 6"/>
      <!-- Dramatic Shadow Block -->
      <rect x="${width * 0.06}" y="${cy - 110}" width="${width * 0.22}" height="210" rx="8" fill="rgba(24, 24, 27, 0.12)" stroke="rgba(24,24,27,0.22)" stroke-width="1.5"/>
      <!-- Small Subject Standing in the Light Beam -->
      <circle cx="${cx + 70}" cy="${cy + 8}" r="14" fill="#18181B"/>
      <path d="M ${cx + 50} ${cy + 62} C ${cx + 50} ${cy + 26}, ${cx + 90} ${cy + 26}, ${cx + 90} ${cy + 62} Z" fill="#18181B"/>
      <!-- Long Ground Shadow -->
      <ellipse cx="${cx + 25}" cy="${cy + 66}" rx="48" ry="8" fill="rgba(24,24,27,0.2)"/>
      <text x="${cx}" y="${cy - 80}" fill="#B45309" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">☀️ ลำแสงเฉียงสร้างมิติแสงเงา (Chiaroscuro)</text>
    `;
  }

  // 3. Steve McCurry / Leading Lines & Frame-within-a-Frame
  if (/mccurry|เส้นนำสายตา|leading|ซุ้มประตู|frame|มุมกว้าง|wide/.test(tech)) {
    const horizonY = cy + 20;
    return `
      <!-- Architectural Archway / Frame-within-a-Frame -->
      <rect x="${width * 0.14}" y="${height * 0.16}" width="${width * 0.72}" height="${height * 0.56}" rx="20" fill="none" stroke="rgba(24,24,27,0.25)" stroke-width="2.5"/>
      <!-- Converging Leading Lines -->
      <line x1="${width * 0.08}" y1="${height * 0.72}" x2="${cx + 55}" y2="${horizonY}" stroke="#0284C7" stroke-width="2.5" stroke-dasharray="8 5"/>
      <line x1="${width * 0.92}" y1="${height * 0.72}" x2="${cx + 55}" y2="${horizonY}" stroke="#0284C7" stroke-width="2.5" stroke-dasharray="8 5"/>
      <!-- Subject on Right Third Intersection -->
      <circle cx="${cx + 55}" cy="${horizonY - 26}" r="18" fill="#D97706"/>
      <path d="M ${cx + 30} ${horizonY + 34} C ${cx + 30} ${horizonY - 4}, ${cx + 80} ${horizonY - 4}, ${cx + 80} ${horizonY + 34} Z" fill="rgba(217, 119, 6, 0.35)" stroke="#B45309" stroke-width="2"/>
      <text x="${cx - 80}" y="${horizonY - 12}" fill="#0369A1" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">↗ เส้นนำสายตาสู่ตัวแบบ</text>
    `;
  }

  // 4. Close-Up / Still Life Detail (William Eggleston / Macro)
  if (/eggleston|macro|detail|close-up|มาโคร|ใกล้|อาหาร|แก้ว|ดีเทล/.test(tech)) {
    return `
      <!-- Soft Bokeh Circles -->
      <circle cx="${cx - 150}" cy="${cy - 60}" r="36" fill="rgba(217, 119, 6, 0.12)"/>
      <circle cx="${cx + 165}" cy="${cy - 45}" r="48" fill="rgba(14, 165, 233, 0.10)"/>
      <!-- Focus Circle -->
      <circle cx="${cx}" cy="${cy - 5}" r="96" fill="rgba(255,255,255,0.65)" stroke="#D97706" stroke-width="2.5" stroke-dasharray="10 6"/>
      <rect x="${cx - 42}" y="${cy - 42}" width="84" height="68" rx="14" fill="rgba(217, 119, 6, 0.22)" stroke="#B45309" stroke-width="2"/>
      <text x="${cx}" y="${cy - 4}" fill="#78350F" font-family="sans-serif" font-weight="800" font-size="15" text-anchor="middle">🔍 เจาะดีเทล</text>
      <text x="${cx}" y="${cy + 16}" fill="#92400E" font-family="sans-serif" font-weight="600" font-size="12" text-anchor="middle">หลังละลาย (2x)</text>
    `;
  }

  // 5. Default Portrait / Decisive Moment (Peter Lindbergh / Cartier-Bresson)
  return `
    <!-- Side Light Direction Arrow -->
    <path d="M ${width * 0.12} ${cy - 70} L ${cx - 85} ${cy - 30}" stroke="#D97706" stroke-width="3" stroke-linecap="round"/>
    <text x="${width * 0.16}" y="${cy - 82}" fill="#B45309" font-family="sans-serif" font-weight="800" font-size="13">☀️ แสงข้าง 45° สร้างมิติใบหน้า</text>
    <!-- Rule of Thirds Focus Subject -->
    <circle cx="${cx}" cy="${cy - 36}" r="30" fill="rgba(217, 119, 6, 0.22)" stroke="#B45309" stroke-width="2.5"/>
    <path d="M ${cx - 64} ${cy + 58} C ${cx - 64} ${cy + 2}, ${cx + 64} ${cy + 2}, ${cx + 64} ${cy + 58} Z" fill="rgba(24, 24, 27, 0.08)" stroke="#18181B" stroke-width="2"/>
    <!-- Eye-level guide line -->
    <line x1="${width * 0.12}" y1="${cy - 36}" x2="${width * 0.88}" y2="${cy - 36}" stroke="rgba(2, 132, 199, 0.35)" stroke-width="1.5" stroke-dasharray="6 4"/>
    <text x="${cx}" y="${cy + 82}" fill="#18181B" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">👤 วางระดับสายตาบนเส้นตัด 1/3 ด้านบน</text>
  `;
}

function buildVideoMotionArt(shot, cx, cy, width, height) {
  const a = String((shot?.camera_angle || '') + ' ' + (shot?.camera_movement || '')).toLowerCase();
  if (/macro|close-up|ใกล้|เจาะ/.test(a)) {
    return `
      <circle cx="${cx}" cy="${cy}" r="92" fill="rgba(255,255,255,0.7)" stroke="#D97706" stroke-width="2.5" stroke-dasharray="8 5"/>
      <rect x="${cx - 42}" y="${cy - 34}" width="84" height="64" rx="14" fill="rgba(217,119,6,0.22)" stroke="#B45309" stroke-width="2"/>
      <text x="${cx}" y="${cy + 6}" fill="#78350F" font-family="sans-serif" font-weight="800" font-size="15" text-anchor="middle">🔍 โคลสอัพ (2x)</text>
    `;
  }
  if (/pov|เดิน|ตามหลัง|push|walk|forward/.test(a)) {
    return `
      <line x1="${cx - 32}" y1="${cy - 40}" x2="${cx - 190}" y2="${height * 0.72}" stroke="rgba(5,150,105,0.45)" stroke-width="2.5" stroke-dasharray="8 5"/>
      <line x1="${cx + 32}" y1="${cy - 40}" x2="${cx + 190}" y2="${height * 0.72}" stroke="rgba(5,150,105,0.45)" stroke-width="2.5" stroke-dasharray="8 5"/>
      <path d="M ${cx} ${cy + 50} L ${cx} ${cy - 35}" stroke="#059669" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M ${cx - 16} ${cy - 15} L ${cx} ${cy - 38} L ${cx + 16} ${cy - 15}" fill="none" stroke="#059669" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${cx}" y="${cy + 78}" fill="#065F46" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">🚶‍♂️ เดินถือกล้องดันเข้าช้าๆ (Smooth Push-In)</text>
    `;
  }
  return `
    <circle cx="${cx}" cy="${cy - 34}" r="28" fill="rgba(217, 119, 6, 0.2)" stroke="#D97706" stroke-width="2.5"/>
    <path d="M ${cx - 58} ${cy + 52} C ${cx - 58} ${cy + 2}, ${cx + 58} ${cy + 2}, ${cx + 58} ${cy + 52} Z" fill="rgba(24, 24, 27, 0.08)" stroke="#18181B" stroke-width="2"/>
    <!-- Smooth Horizontal Pan Arrow -->
    <path d="M ${cx - 130} ${cy + 76} L ${cx + 130} ${cy + 76}" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
    <path d="M ${cx + 114} ${cy + 66} L ${cx + 132} ${cy + 76} L ${cx + 114} ${cy + 86}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${cx}" y="${cy + 100}" fill="#0369A1" font-family="sans-serif" font-weight="800" font-size="13" text-anchor="middle">🎥 จัดตัวแบบกลางค่อนล่าง • เคลื่อนกล้องนุ่มนวล</text>
  `;
}

function getStoryboardSketch(shot) {
  const isPhoto = shot?.mode === 'photo';
  const shotNum = shot?.step_number || shot?.shot_number || 1;
  const angle = escapeXml(shot?.camera_angle_th || shot?.camera_angle || 'Medium Shot');
  const lens = escapeXml(shot?.lens_focal || shot?.shot_size || 'เลนส์ 1x');
  const title = escapeXml((shot?.title || `ช็อตที่ ${shotNum}`).slice(0, 48));
  const onScreenText = escapeXml((shot?.on_screen_text || '').slice(0, 44));
  const badgeText = escapeXml(
    isPhoto
      ? (shot?.master_photographer || 'Master Composition').slice(0, 34)
      : (shot?.shot_role || (shotNum === 1 ? '🎯 HOOK ดึงคนดู' : `ฉากที่ ${shotNum}`)).slice(0, 28)
  );
  const duration = shot?.duration_seconds ? `${shot.duration_seconds} วิ` : '3.0 วิ';

  const width = 960;
  const height = 540;
  const cx = width / 2;
  const cy = height * 0.49;

  const illustration = isPhoto
    ? buildPhotoCompositionArt(shot, cx, cy, width, height)
    : buildVideoMotionArt(shot, cx, cy, width, height);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="paperBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDFCF8"/>
      <stop offset="100%" stop-color="#F2EFE7"/>
    </linearGradient>
    <pattern id="dotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1" fill="rgba(24,24,27,0.09)"/>
    </pattern>
  </defs>

  <!-- Warm Editorial Paper Background -->
  <rect width="100%" height="100%" fill="url(#paperBg)"/>
  <rect width="100%" height="100%" fill="url(#dotGrid)"/>

  <!-- Rule of Thirds Grid -->
  <line x1="${width * 0.333}" y1="0" x2="${width * 0.333}" y2="${height}" stroke="rgba(24,24,27,0.08)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="${width * 0.666}" y1="0" x2="${width * 0.666}" y2="${height}" stroke="rgba(24,24,27,0.08)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="0" y1="${height * 0.333}" x2="${width}" y2="${height * 0.333}" stroke="rgba(24,24,27,0.08)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="0" y1="${height * 0.666}" x2="${width}" y2="${height * 0.666}" stroke="rgba(24,24,27,0.08)" stroke-width="1" stroke-dasharray="6 6"/>

  <!-- Top Bar Badges -->
  <rect x="28" y="22" width="${isPhoto ? 124 : 148}" height="34" rx="10" fill="#18181B"/>
  <text x="${isPhoto ? 90 : 102}" y="44" fill="#FFFFFF" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle">${isPhoto ? `ภาพที่ ${shotNum}` : `ฉากที่ ${shotNum} (${duration})`}</text>

  <rect x="${isPhoto ? 164 : 188}" y="22" width="320" height="34" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="${isPhoto ? 324 : 348}" y="44" fill="#92400E" font-family="sans-serif" font-weight="800" font-size="13" text-anchor="middle">${isPhoto ? `🏆 ${badgeText}` : badgeText}</text>

  <rect x="${width - 178}" y="22" width="150" height="34" rx="10" fill="#FFFFFF" stroke="#D6D3CB" stroke-width="1.5"/>
  <text x="${width - 103}" y="44" fill="#3F3F46" font-family="sans-serif" font-weight="700" font-size="13" text-anchor="middle">📱 ${lens}</text>

  <!-- Text Safe-Zone Banner -->
  ${onScreenText ? `
  <rect x="${width * 0.14}" y="72" width="${width * 0.72}" height="52" rx="12" fill="rgba(255, 251, 235, 0.92)" stroke="#D97706" stroke-width="1.8" stroke-dasharray="7 4"/>
  <text x="${cx}" y="92" fill="#B45309" font-family="sans-serif" font-weight="700" font-size="11" text-anchor="middle">📐 โซนเว้นพื้นที่ว่างสำหรับวางข้อความพาดหัว (ห้ามให้ใบหน้าบังโซนนี้)</text>
  <text x="${cx}" y="114" fill="#18181B" font-family="sans-serif" font-weight="800" font-size="15" text-anchor="middle">“${onScreenText}”</text>
  ` : ''}

  <!-- Visual Subject & Composition Diagram -->
  ${illustration}

  <!-- Bottom Editorial Footer -->
  <rect x="28" y="${height - 86}" width="${width - 56}" height="64" rx="14" fill="rgba(255,255,255,0.92)" stroke="#E4E1D8" stroke-width="1.5"/>
  <text x="48" y="${height - 58}" fill="#18181B" font-family="sans-serif" font-weight="800" font-size="16">${title}</text>
  <text x="48" y="${height - 34}" fill="#52525B" font-family="sans-serif" font-weight="600" font-size="13">📐 ${angle}</text>
</svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function resolveSketchTheme(shot) {
  return shot?.camera_angle || 'Medium Shot';
}

module.exports = {
  getStoryboardSketch,
  resolveSketchTheme
};
