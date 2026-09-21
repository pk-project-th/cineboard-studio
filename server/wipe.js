const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, 'cineprompt.db'));

db.exec('DELETE FROM prompts;');
db.exec('DELETE FROM leads;');
db.exec('DELETE FROM analytics_events;');

const pCount = db.prepare('SELECT COUNT(*) as c FROM prompts').get().c;
const lCount = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;

console.log('=== DATABASE WIPED CLEAN ===');
console.log('Prompts count:', pCount);
console.log('Leads count:', lCount);
