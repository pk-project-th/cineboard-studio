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

  // Image & Text Generation APIs (No Groq!)
  POLLINATIONS_API_KEY: process.env.POLLINATIONS_API_KEY || '',

  // OpenAI (Optional Precision Tier)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Google Gemini (Optional Multimodal Tier)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002'
};
