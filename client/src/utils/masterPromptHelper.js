// CineBoard Studio - Master Production Prompt Generator
// Compiles a comprehensive, professional master production prompt packet

export function generateMasterProductionPrompt(projectTitle, logline, shots = [], options = {}) {
  const totalSec = shots.reduce((acc, s) => acc + (Number(s.duration_seconds) || 2.5), 0);
  const visualStyle = options.visualStyle || 'Modern Cinematic Commercial 4K / Photorealistic Film Grain';
  const pacing = options.pacing || 'Fast Cut (สลับมุมกล้องฉับไว)';

  let txt = '========================================================================\n';
  txt += '🎬 CINEBOARD MASTER PRODUCTION SPECIFICATION & AI PROMPTS\n';
  txt += '========================================================================\n';
  txt += `📌 ชื่อโปรเจกต์ (Project Title): ${projectTitle || 'โปรเจกต์สตอรี่บอร์ดภาพยนตร์/โฆษณา'}\n`;
  if (logline) {
    txt += `🎯 คอนเซปต์เรื่อง / พล็อตหลัก (Logline): ${logline}\n`;
  }
  txt += `⏱️ ความยาวรวมทั้งเรื่อง (Total Duration): ${totalSec.toFixed(1)} วินาที | จำนวนทั้งหมด: ${shots.length} ช็อต\n`;
  txt += '📐 สัดส่วนภาพ (Aspect Ratio): 9:16 (Vertical Video / TikTok, Reels & Shorts)\n';
  txt += `🎨 สไตล์ภาพและเกรดสี (Visual Style): ${visualStyle}\n`;
  txt += `⚡ จังหวะการสลับมุมกล้อง (Pacing Rhythm): ${pacing}\n`;
  txt += '========================================================================\n\n';

  txt += '🎥 โครงสร้างและลำดับการถ่ายทำแยกทีละช็อตอย่างละเอียด (SHOT-BY-SHOT BREAKDOWN):\n\n';

  shots.forEach((s, idx) => {
    const num = s.shot_number || s.step_number || idx + 1;
    const dur = Number(s.duration_seconds || 2.5).toFixed(1);
    const tc = s.timecode || `00:${idx * 3 < 10 ? '0' + idx * 3 : idx * 3} - 00:${(idx + 1) * 3 < 10 ? '0' + (idx + 1) * 3 : (idx + 1) * 3}`;
    
    // Clean polite particles: strictly enforce "ครับ", purge all "ครับ/ค่ะ"
    const rawDialogue = s.dialogue || s.dialogue_script || '';
    const cleanDialogue = rawDialogue
      .replace(/ครับ\s*\/\s*ค่ะ/gi, 'ครับ')
      .replace(/ค่ะ\s*\/\s*ครับ/gi, 'ครับ')
      .replace(/ครับ\/ค่ะ/gi, 'ครับ')
      .replace(/ค่ะ\/ครับ/gi, 'ครับ');

    // Smart Thai translation for camera angles
    const angleMap = {
      'Extreme Wide Shot': 'มุมกว้างพิเศษ (Extreme Wide Shot)',
      'Wide Shot': 'มุมกว้างมาตรฐาน (Wide / Full Shot)',
      'Medium Shot': 'ช็อตระดับเอว (Medium Shot)',
      'Close-Up': 'ช็อตเจาะลึก (Close-Up)',
      'Extreme Close-Up': 'เจาะระยะประชิด (Extreme Close-Up)',
      'Low Angle': 'มุมเสยขึ้น (Low Angle / Hero Shot)',
      'High Angle': 'มุมกดลง (High Angle / Overview)',
      'Dutch Angle': 'มุมกล้องเอียง (Dutch Angle / Dynamic)',
      'Over-the-Shoulder': 'ข้ามหัวไหล่ (Over-the-Shoulder)',
      'Point of View': 'มุมมองสายตาตัวละคร (POV)',
      'Drone / Bird\'s Eye View': 'มุมมองจากโดรน/มุมสูง (Bird\'s Eye View)'
    };
    const angleName = s.camera_angle || s.subtitle || 'Wide Shot';
    const angleTh = s.camera_angle_th || angleMap[angleName] || angleName;

    txt += `────────────────────────────────────────────────────────────────────────\n`;
    txt += `[ช็อตที่ ${num}] ⏱️ ${dur} วินาที (Timecode: ${tc}) | ซีนที่ ${s.scene_number || 1}\n`;
    txt += `────────────────────────────────────────────────────────────────────────\n`;
    txt += `• หัวข้อช็อต (Headline): ${s.title || `ช็อตที่ ${num}`}\n`;
    txt += `• มุมกล้อง & ขนาดภาพ: ${angleName} (${angleTh})\n`;
    txt += `• ระยะเลนส์กล้อง (Lens Focal Length): ${s.lens_focal || '35mm'}\n`;
    txt += `• การเคลื่อนไหวของกล้อง (Camera Movement): ${s.camera_movement || 'Static / Subtle Push-In'}\n`;
    if (s.action_description) {
      txt += `• แอ็กชันเหตุการณ์ในฉาก (Action Description): ${s.action_description}\n`;
    }
    if (cleanDialogue) {
      txt += `• บทพูด / เสียงพากย์ (VO / Dialogue): "${cleanDialogue}"\n`;
    }
    if (s.audio_foley) {
      txt += `• เสียงประกอบ & Foley FX (Sound Design): ${s.audio_foley}\n`;
    }
    if (s.on_screen_text) {
      txt += `• ข้อความตัวหนังสือบนจอ (On-Screen Text): ${s.on_screen_text}\n`;
    }
    if (s.prompt || s.content) {
      txt += `\n🖼️ MASTER IMAGE KEYFRAME PROMPT (Midjourney / Flux / Gemini):\n   ${s.prompt || s.content}\n`;
    }
    if (s.video_prompt) {
      txt += `\n🎬 VIDEO AI MOTION PROMPT (Kling 1.5 / Runway Gen-3 / Hailuo Minimax / Luma):\n   ${s.video_prompt}\n`;
    }
    if (s.live_action_guide) {
      txt += `\n💡 LIVE-ACTION SHOOTING GUIDE (คู่มือกองถ่ายจริง - การจัดไฟ/เลนส์/การกำกับ):\n   ${s.live_action_guide}\n`;
    }
    txt += '\n';
  });

  txt += '========================================================================\n';
  txt += '✨ CINEBOARD AI DIRECTOR SUITE • ALL-IN-ONE MASTER PRODUCTION SPECIFICATION\n';
  txt += '========================================================================\n';
  return txt;
}
