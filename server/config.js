const fs = require('fs');
const path = require('path');

// Auto-load .env if present (supports Node 20.6+ built-in loadEnvFile)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (err) {
    console.warn('Could not load .env file:', err.message);
  }
}

module.exports = {
  // Voice Synthesis
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_DEFAULT_VOICE: process.env.ELEVENLABS_DEFAULT_VOICE || 'pNInz6obpgDQGcFmaJgB', // Adam

  // LLM Routing Cascade: 1 ➔ 2 ➔ 3
  // [Rank 1] Groq Cloud (Ultra-Fast LPU Inference)
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'groq/compound-mini',

  // [Rank 2] OpenAI (High Precision & Reasoning)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // [Rank 3] Gemini (Multimodal & Massive Context)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-lite-image'
};
