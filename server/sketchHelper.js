// CineBoard Studio — Visual Framing, Subject Composition & Text Safe-Zone Guide
// Generates an easy-to-read illustrated storyboard frame showing:
// 1. Subject silhouette & framing based on Camera Angle (Wide, Medium, Close-up, POV, Low-angle)
// 2. Text Overlay Safe-Zone (where to leave empty space in the frame for titles/captions)
// 3. Camera movement direction arrows & phone lens guide

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSubjectIllustration(angleStr, cx, cy, width, height, isVertical) {
  const a = String(angleStr || '').toLowerCase();

  // 1. Extreme Close-Up / Macro / Detail Shot (เน้นมือจับ/อาหาร/ดีเทลใกล้ๆ)
  if (/macro|extreme close|close-up|closeup|มาโคร|มุมใกล้|เจาะ/.test(a)) {
    const r = isVertical ? 140 : 120;
    return `
      <!-- Bokeh Background Circles -->
      <circle cx="${cx - 180}" cy="${cy - 90}" r="45" fill="rgba(251, 191, 36, 0.08)" />
      <circle cx="${cx + 200}" cy="${cy - 60}" r="60" fill="rgba(56, 189, 248, 0.08)" />
      <circle cx="${cx - 120}" cy="${cy + 80}" r="35" fill="rgba(251, 191, 36, 0.06)" />
      <!-- Macro Focus Ring -->
      <circle cx="${cx}" cy="${cy - 10}" r="${r}" fill="rgba(15, 23, 42, 0.55)" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="10 6" />
      <circle cx="${cx}" cy="${cy - 10}" r="${r - 22}" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
      <!-- Object / Hand Detail Silhouette -->
      <rect x="${cx - 48}" y="${cy - 58}" width="96" height="76" rx="16" fill="rgba(245, 158, 11, 0.28)" stroke="#FBBF24" stroke-width="2.5" />
      <path d="M ${cx - 85} ${cy + 40} Q ${cx - 30} ${cy + 5} ${cx + 20} ${cy + 25}" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" />
      <text x="${cx}" y="${cy - 14}" fill="#FEF3C7" font-family="sans-serif" font-weight="800" font-size="18" text-anchor="middle">🔍 โฟกัสจุดเด่นใกล้ๆ</text>
      <text x="${cx}" y="${cy + 12}" fill="#FDE68A" font-family="sans-serif" font-weight="600" font-size="13" text-anchor="middle">(หลังเบลอ • เลนส์ 1x / 2x)</text>
    `;
  }

  // 2. Wide / Establishing / Landscape Shot (มุมกว้างเห็นสถานที่ + ตัวแบบ)
  if (/wide|establishing|มุมกว้าง|พาโนรามา|0\.5x|สถานที่/.test(a)) {
    const horizonY = cy + 35;
    return `
      <!-- Sun / Sky Element -->
      <circle cx="${cx + 160}" cy="${cy - 100}" r="36" fill="rgba(251, 191, 36, 0.22)" stroke="#FBBF24" stroke-width="2" />
      <!-- Distant Mountains / Architecture Silhouette -->
      <path d="M ${width * 0.1} ${horizonY} L ${cx - 140} ${cy - 75} L ${cx - 20} ${horizonY} L ${cx + 95} ${cy - 95} L ${width * 0.9} ${horizonY} Z" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="2" />
      <!-- Horizon Line -->
      <line x1="${width * 0.08}" y1="${horizonY}" x2="${width * 0.92}" y2="${horizonY}" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
      <!-- Full-Body Subject on Rule of Thirds (Left-Third) -->
      <circle cx="${cx - 90}" cy="${horizonY - 48}" r="16" fill="#F59E0B" />
      <path d="M ${cx - 114} ${horizonY + 25} C ${cx - 114} ${horizonY - 22}, ${cx - 66} ${horizonY - 22}, ${cx - 66} ${horizonY + 25} Z" fill="rgba(245, 158, 11, 0.45)" stroke="#FBBF24" stroke-width="2" />
      <text x="${cx + 60}" y="${horizonY - 25}" fill="#E0F2FE" font-family="sans-serif" font-weight="800" font-size="17" text-anchor="middle">🏞️ เก็บบรรยากาศสถานที่กว้างๆ</text>
      <text x="${cx + 60}" y="${horizonY}" fill="#7DD3FC" font-family="sans-serif" font-weight="600" font-size="13" text-anchor="middle">(เลนส์มุมกว้าง 0.5x / 1x)</text>
    `;
  }

  // 3. POV / Walking / First-Person Shot (มุมมองสายตาเดินพาเที่ยว)
  if (/pov|walking|สายตา|เดินตาม|first person/.test(a)) {
    const horizonY = cy - 20;
    return `
      <!-- Perspective Pathway -->
      <line x1="${cx - 35}" y1="${horizonY}" x2="${cx - 220}" y2="${height * 0.85}" stroke="rgba(52, 211, 153, 0.5)" stroke-width="2.5" stroke-dasharray="8 6" />
      <line x1="${cx + 35}" y1="${horizonY}" x2="${cx + 220}" y2="${height * 0.85}" stroke="rgba(52, 211, 153, 0.5)" stroke-width="2.5" stroke-dasharray="8 6" />
      <!-- Forward Motion Arrow -->
      <path d="M ${cx} ${cy + 55} L ${cx} ${cy - 35}" stroke="#10B981" stroke-width="5" stroke-linecap="round" />
      <path d="M ${cx - 18} ${cy - 15} L ${cx} ${cy - 38} L ${cx + 18} ${cy - 15}" fill="none" stroke="#10B981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="${cx}" y="${cy + 85}" fill="#D1FAE5" font-family="sans-serif" font-weight="800" font-size="17" text-anchor="middle">🚶‍♂️ มุมมองสายตา (POV) เดินพาชม</text>
    `;
  }

  // 4. Default: Medium / Vlog / Waist-Up Subject Shot (ถ่ายคนครึ่งตัวเล่าเรื่อง + เห็นฉากหลัง)
  return `
    <!-- Background Environment Frame -->
    <rect x="${cx - 190}" y="${cy - 105}" width="380" height="190" rx="18" fill="rgba(30, 41, 59, 0.45)" stroke="rgba(148, 163, 184, 0.22)" stroke-width="1.5" />
    <!-- Person Waist-Up Silhouette -->
    <circle cx="${cx}" cy="${cy - 48}" r="30" fill="rgba(245, 158, 11, 0.35)" stroke="#FBBF24" stroke-width="2.5" />
    <path d="M ${cx - 64} ${cy + 55} C ${cx - 64} ${cy - 5}, ${cx + 64} ${cy - 5}, ${cx + 64} ${cy + 55} Z" fill="rgba(245, 158, 11, 0.28)" stroke="#FBBF24" stroke-width="2.5" />
    <!-- Focus Brackets Around Subject -->
    <path d="M ${cx - 85} ${cy - 75} L ${cx - 85} ${cy - 90} L ${cx - 70} ${cy - 90}" fill="none" stroke="#38BDF8" stroke-width="2.5" />
    <path d="M ${cx + 85} ${cy - 75} L ${cx + 85} ${cy - 90} L ${cx + 70} ${cy - 90}" fill="none" stroke="#38BDF8" stroke-width="2.5" />
    <text x="${cx}" y="${cy + 80}" fill="#FEF3C7" font-family="sans-serif" font-weight="800" font-size="16" text-anchor="middle">👤 วางตัวแบบกลางค่อนล่าง • เห็นบรรยากาศหลัง</text>
  `;
}

function getStoryboardSketch(shot) {
  const shotNum = shot?.step_number || shot?.shot_number || 1;
  const angle = escapeXml(shot?.camera_angle_th || shot?.camera_angle || 'มุมปานกลาง (Medium Shot)');
  const lens = escapeXml(shot?.lens_focal || shot?.shot_size || 'เลนส์ 1x');
  const title = escapeXml((shot?.title || `ฉากที่ ${shotNum}`).slice(0, 48));
  const actionText = escapeXml((shot?.action_description || shot?.content || 'ตั้งกล้องถ่ายตามจังหวะธรรมชาติ').slice(0, 82));
  const onScreenText = escapeXml((shot?.on_screen_text || `ข้อความพาดหัวฉากที่ ${shotNum}`).slice(0, 44));
  const roleBadge = escapeXml((shot?.shot_role || (shotNum === 1 ? '🎯 HOOK ดึงคนดู' : '🎬 ฉากเล่าเรื่อง')).slice(0, 26));
  const duration = shot?.duration_seconds ? `${shot.duration_seconds} วิ` : '3.0 วิ';

  const isVertical = shot?.aspect_ratio === '9:16';
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;
  const cx = width / 2;
  const cy = height * 0.46;

  const subjectArt = buildSubjectIllustration(shot?.camera_angle || shot?.camera_angle_th, cx, cy, width, height, isVertical);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="55%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#090D16"/>
    </linearGradient>
    <pattern id="gridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Canvas Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  <rect width="100%" height="100%" fill="url(#gridPattern)"/>

  <!-- Rule of Thirds Grid -->
  <line x1="${width * 0.333}" y1="0" x2="${width * 0.333}" y2="${height}" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="${width * 0.666}" y1="0" x2="${width * 0.666}" y2="${height}" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="0" y1="${height * 0.333}" x2="${width}" y2="${height * 0.333}" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="0" y1="${height * 0.666}" x2="${width}" y2="${height * 0.666}" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="6 6"/>

  <!-- Top Header Badge Bar -->
  <rect x="${width * 0.05}" y="${height * 0.04}" width="${isVertical ? 140 : 120}" height="38" rx="10" fill="#F59E0B"/>
  <text x="${width * 0.05 + (isVertical ? 70 : 60)}" y="${height * 0.04 + 25}" fill="#090D16" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle">ฉากที่ ${shotNum} (${duration})</text>

  <rect x="${width * 0.05 + (isVertical ? 152 : 132)}" y="${height * 0.04}" width="${isVertical ? 230 : 220}" height="38" rx="10" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="1.5"/>
  <text x="${width * 0.05 + (isVertical ? 267 : 242)}" y="${height * 0.04 + 25}" fill="#A7F3D0" font-family="sans-serif" font-weight="700" font-size="14" text-anchor="middle">${roleBadge}</text>

  <!-- TEXT SAFE-ZONE BOX (บอกจุดที่ต้องเว้นว่างไว้ใส่ข้อความบนจอ!) -->
  <rect x="${width * 0.1}" y="${height * 0.13}" width="${width * 0.8}" height="${isVertical ? 78 : 58}" rx="12" fill="rgba(245, 158, 11, 0.14)" stroke="#FBBF24" stroke-width="2" stroke-dasharray="8 5"/>
  <text x="${cx}" y="${height * 0.13 + (isVertical ? 28 : 22)}" fill="#FDE68A" font-family="sans-serif" font-weight="700" font-size="13" text-anchor="middle">📐 โซนเว้นพื้นที่ว่างใส่ข้อความพาดหัว (ห้ามให้หัวคนบังโซนนี้)</text>
  <text x="${cx}" y="${height * 0.13 + (isVertical ? 56 : 44)}" fill="#FFFFFF" font-family="sans-serif" font-weight="800" font-size="${isVertical ? 20 : 17}" text-anchor="middle">“${onScreenText}”</text>

  <!-- Subject & Angle Composition Visual -->
  ${subjectArt}

  <!-- Bottom Shooting Instruction Card -->
  <rect x="${width * 0.06}" y="${height * 0.71}" width="${width * 0.88}" height="${height * 0.23}" rx="16" fill="rgba(9, 13, 22, 0.9)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <text x="${width * 0.09}" y="${height * 0.76}" fill="#38BDF8" font-family="sans-serif" font-weight="800" font-size="${isVertical ? 18 : 15}">🎥 มุมกล้อง: ${angle} • ${lens}</text>
  <text x="${width * 0.09}" y="${height * 0.82}" fill="#FFFFFF" font-family="sans-serif" font-weight="800" font-size="${isVertical ? 22 : 18}">${title}</text>
  <text x="${width * 0.09}" y="${height * 0.88}" fill="#CBD5E1" font-family="sans-serif" font-size="${isVertical ? 17 : 14}">👉 ถ่ายอะไร: ${actionText}</text>
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
