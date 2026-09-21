const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'cineprompt.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    summary TEXT,
    pilot_episode TEXT,
    joke_formula TEXT,
    cover_image TEXT,
    author TEXT,
    author_link TEXT,
    course_name TEXT,
    course_url TEXT,
    course_price_note TEXT,
    views_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    series_id TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    step_title TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    prompt_type TEXT NOT NULL,
    recommended_tool TEXT,
    aspect_ratio TEXT,
    content TEXT NOT NULL,
    dialogue_script TEXT,
    variables_schema TEXT,
    image_url TEXT,
    reference_image TEXT,
    copy_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    source TEXT DEFAULT 'prompt_hub',
    interest TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    target_id TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'character' | 'scene' | 'product'
    description TEXT,
    prompt TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migrations for prompts table
const promptMigrations = [
  `ALTER TABLE prompts ADD COLUMN reference_image TEXT;`,
  `ALTER TABLE prompts ADD COLUMN camera_angle TEXT;`,
  `ALTER TABLE prompts ADD COLUMN shot_size TEXT;`,
  `ALTER TABLE prompts ADD COLUMN character_asset_id TEXT;`,
  `ALTER TABLE prompts ADD COLUMN scene_asset_id TEXT;`,
  `ALTER TABLE prompts ADD COLUMN product_asset_id TEXT;`,
  `ALTER TABLE prompts ADD COLUMN video_prompt TEXT;`,
  `ALTER TABLE prompts ADD COLUMN audio_foley TEXT;`,
  `ALTER TABLE prompts ADD COLUMN on_screen_text TEXT;`,
  `ALTER TABLE prompts ADD COLUMN camera_movement TEXT;`,
  `ALTER TABLE prompts ADD COLUMN action_description TEXT;`,
  `ALTER TABLE prompts ADD COLUMN live_action_guide TEXT;`,
  `ALTER TABLE prompts ADD COLUMN visual_style TEXT;`,
  `ALTER TABLE prompts ADD COLUMN scene_number INTEGER DEFAULT 1;`,
  `ALTER TABLE prompts ADD COLUMN scene_title TEXT;`,
  `ALTER TABLE prompts ADD COLUMN duration_seconds REAL DEFAULT 2.5;`,
  `ALTER TABLE prompts ADD COLUMN timecode TEXT;`,
  `ALTER TABLE series ADD COLUMN target_duration REAL DEFAULT 30.0;`,
  `ALTER TABLE series ADD COLUMN pacing TEXT DEFAULT 'fast';`
];

promptMigrations.forEach(stmt => {
  try { db.exec(stmt); } catch (e) { /* Column already exists */ }
});

// Seed starter assets if empty
try {
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get();
  if (assetCount.count === 0) {
    const insertAsset = db.prepare(`
      INSERT INTO assets (id, name, type, description, prompt, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertAsset.run(
      'asset-char-sak',
      'ศักดิ์ (พระเอกชุดซูเปอร์ฮีโร่บ้านๆ)',
      'character',
      'หนุ่มช่างแอร์ สวมชุดซูเปอร์ฮีโร่ทำเองจากโฟมและถังสี หน้าซื่อจริงจัง deadpan',
      '1980s Thai comedy superhero character, skinny Thai man wearing handmade colorful robot armor made of painted plastic buckets and cardboard, deadpan stoic facial expression, 16mm film photo.',
      '/media/tpl_aircon_hero.jpg'
    );

    insertAsset.run(
      'asset-scene-market',
      'ตลาดสดคลองเตยยามเช้า (1980s)',
      'scene',
      'ตลาดสดพื้นแฉะ แผงขายผัก ผลไม้ ร่มหลากสี ป้ายโฆษณาเขียนมือแบบวินเทจ',
      '1980s bustling Bangkok wet market in the morning, colorful market umbrellas, wet concrete ground, wooden stalls with fresh vegetables, vintage hand-painted Thai signs, warm morning sunlight, 16mm celluloid grain.',
      '/media/tpl_swat_market.jpg'
    );

    insertAsset.run(
      'asset-prod-drink',
      'น้ำส้มไบเล่ขวดแก้ววินเทจ (สินค้าสปอนเซอร์)',
      'product',
      'ขวดแก้วน้ำส้มโบราณ ฉลากสีส้มเหลืองพิมพ์ลายนูน มีหยดน้ำเกาะเย็นฉ่ำ วางเด่นในช็อตโฆษณา',
      'Vintage 1980s Thai glass orange soda bottle, condensation droplets dripping, bright retro label, cinematic studio lighting, commercial hero product shot, expired 35mm film aesthetic.',
      '/media/tpl_wukong_motorcycle.jpg'
    );

    console.log('[DB] Seeded starter storyboard assets (character, scene, product).');
  }
} catch (e) {
  console.warn('[DB Asset Seed Warning]:', e.message);
}

console.log('Database initialized successfully at:', dbPath);

module.exports = db;
