// CineBoard Studio — Storyboard Visual Helper (Client)
// Generates professional Director's Slates and renders real AI images

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getStoryboardSketch(shot) {
  const shotNum = shot?.step_number || shot?.shot_number || 1;
  const sceneNum = shot?.scene_number || 1;
  const angle = escapeXml(shot?.camera_angle || shot?.camera_angle_th || 'Medium Shot');
  const lens = escapeXml(shot?.lens_focal || shot?.shot_size || '35mm');
  const title = escapeXml((shot?.title || `ช็อตที่ ${shotNum}`).slice(0, 50));
  const desc = escapeXml((shot?.action_description || shot?.dialogue_script || shot?.content || 'กำลังวางแผนองค์ประกอบภาพ...').slice(0, 90));
  const movement = escapeXml(shot?.camera_movement || 'Static / Lock Off');
  const duration = shot?.duration_seconds ? `${shot.duration_seconds}s` : '2.5s';

  const isVertical = shot?.aspect_ratio === '9:16';
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="50%" stop-color="#0f0f11"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  <rect width="100%" height="100%" fill="url(#gridPattern)"/>

  <rect x="${width * 0.08}" y="${height * 0.1}" width="${width * 0.84}" height="${height * 0.8}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8 6"/>

  <line x1="${width * 0.36}" y1="${height * 0.1}" x2="${width * 0.36}" y2="${height * 0.9}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <line x1="${width * 0.64}" y1="${height * 0.1}" x2="${width * 0.64}" y2="${height * 0.9}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <line x1="${width * 0.08}" y1="${height * 0.37}" x2="${width * 0.92}" y2="${height * 0.37}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <line x1="${width * 0.08}" y1="${height * 0.63}" x2="${width * 0.92}" y2="${height * 0.63}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

  <circle cx="${width / 2}" cy="${height / 2}" r="18" fill="none" stroke="rgba(247, 28, 37, 0.4)" stroke-width="1.5"/>
  <line x1="${width / 2 - 28}" y1="${height / 2}" x2="${width / 2 + 28}" y2="${height / 2}" stroke="rgba(247, 28, 37, 0.6)" stroke-width="1.5"/>
  <line x1="${width / 2}" y1="${height / 2 - 28}" x2="${width / 2}" y2="${height / 2 + 28}" stroke="rgba(247, 28, 37, 0.6)" stroke-width="1.5"/>

  <path d="M ${width * 0.08} ${height * 0.1 + 24} L ${width * 0.08} ${height * 0.1} L ${width * 0.08 + 24} ${height * 0.1}" fill="none" stroke="#F71C25" stroke-width="3"/>
  <path d="M ${width * 0.92 - 24} ${height * 0.1} L ${width * 0.92} ${height * 0.1} L ${width * 0.92} ${height * 0.1 + 24}" fill="none" stroke="#F71C25" stroke-width="3"/>
  <path d="M ${width * 0.08} ${height * 0.9 - 24} L ${width * 0.08} ${height * 0.9} L ${width * 0.08 + 24} ${height * 0.9}" fill="none" stroke="#F71C25" stroke-width="3"/>
  <path d="M ${width * 0.92 - 24} ${height * 0.9} L ${width * 0.92} ${height * 0.9} L ${width * 0.92} ${height * 0.9 - 24}" fill="none" stroke="#F71C25" stroke-width="3"/>

  <rect x="${width * 0.08}" y="${height * 0.1}" width="${width * 0.84}" height="${isVertical ? 56 : 48}" fill="rgba(24, 24, 27, 0.85)"/>
  
  <rect x="${width * 0.09}" y="${height * 0.1 + (isVertical ? 10 : 8)}" width="${isVertical ? 120 : 100}" height="${isVertical ? 36 : 32}" rx="6" fill="#F71C25"/>
  <text x="${width * 0.09 + (isVertical ? 60 : 50)}" y="${height * 0.1 + (isVertical ? 33 : 29)}" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', sans-serif" font-weight="800" font-size="${isVertical ? 18 : 15}" text-anchor="middle">ช็อต ${shotNum}</text>

  <text x="${width * 0.28}" y="${height * 0.1 + (isVertical ? 34 : 30)}" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="${isVertical ? 17 : 14}">🎬 ซีน ${sceneNum} • ${lens} • ${duration}</text>
  <text x="${width * 0.91}" y="${height * 0.1 + (isVertical ? 34 : 30)}" fill="#FBEFC5" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="${isVertical ? 17 : 14}" text-anchor="end">CINEBOARD</text>

  <rect x="${width * 0.12}" y="${height * 0.62}" width="${width * 0.76}" height="${height * 0.24}" rx="12" fill="rgba(9, 9, 11, 0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

  <rect x="${width * 0.14}" y="${height * 0.65}" width="${Math.min(300, angle.length * 11 + 24)}" height="26" rx="4" fill="rgba(247, 28, 37, 0.15)" stroke="rgba(247, 28, 37, 0.4)" stroke-width="1"/>
  <text x="${width * 0.14 + 10}" y="${height * 0.65 + 18}" fill="#FF6B6B" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', sans-serif" font-weight="700" font-size="13">📐 ${angle}</text>

  <text x="${width * 0.86}" y="${height * 0.65 + 18}" fill="#A1A1AA" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', sans-serif" font-size="12" text-anchor="end">🎥 ${movement}</text>

  <text x="${width * 0.14}" y="${height * 0.73}" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', sans-serif" font-weight="700" font-size="${isVertical ? 22 : 18}">
    ${title}
  </text>

  <text x="${width * 0.14}" y="${height * 0.79}" fill="#D4D4D8" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', sans-serif" font-size="${isVertical ? 16 : 13}">
    ${desc}
  </text>

  <text x="${width / 2}" y="${height * 0.94}" fill="#71717A" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', sans-serif" font-size="12" text-anchor="middle">
    กดปุ่ม "⚡ เจนภาพ AI" บนการ์ด เพื่อเรนเดอร์ภาพความละเอียดสูง
  </text>
</svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function resolveSketchTheme(shot) {
  return shot?.camera_angle || 'Medium Shot';
}

export function getShotDisplayImage(shot) {
  if (!shot) return getStoryboardSketch(shot);
  const url = shot.image_url;
  // If user has a real image (AI generated, upload, or media), SHOW IT!
  if (url && typeof url === 'string' && url.trim().length > 0) {
    return url;
  }
  return getStoryboardSketch(shot);
}

export function getStoryboardFallback(shot) {
  return getStoryboardSketch(shot);
}
