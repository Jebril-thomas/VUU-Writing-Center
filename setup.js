/**
 * setup.js — one-time project setup script
 * Run once after cloning: node src/setup.js
 */

const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const DIRS = ['uploads', 'data', 'logs', 'public'];
let ok = true;

console.log('\n  VUU Writing Center — Backend Setup\n  ' + '─'.repeat(38));

// Create required directories
DIRS.forEach(dir => {
  const p = path.join(__dirname, '..', dir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log('  ✓ Created directory: ' + dir + '/');
  } else {
    console.log('  ✓ Directory exists:  ' + dir + '/');
  }
});

// Check .env file
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  const example = path.join(__dirname, '../.env.example');
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, envPath);
    console.log('\n  ⚠  Created .env from .env.example — EDIT IT before starting!');
    ok = false;
  } else {
    console.log('\n  ✕  No .env file found! Create one based on .env.example');
    ok = false;
  }
} else {
  console.log('  ✓ .env file found');
}

// Warn about unconfigured variables
const required = ['ADMIN_PASSWORD','EMAIL_USER','EMAIL_PASS','STAFF_EMAIL'];
const missing  = required.filter(k => !process.env[k] || process.env[k].includes('changeme') || process.env[k].includes('your_'));
if (missing.length) {
  console.log('\n  ⚠  These .env variables need to be configured:');
  missing.forEach(k => console.log('     - ' + k));
  ok = false;
}

// Test DB can be created
try {
  const Database = require('better-sqlite3');
  const dbPath   = process.env.DB_PATH || path.join(__dirname, '../data/vuu_writing_center.db');
  const dir      = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.close();
  console.log('  ✓ Database initialised: ' + dbPath);
} catch(e) {
  console.log('  ✕  Database error: ' + e.message);
  console.log('     Make sure you ran: npm install');
  ok = false;
}

console.log('\n  ' + (ok
  ? '✅ Setup complete! Start the server with: npm start'
  : '⚠  Setup complete with warnings. Fix the above, then: npm start'));
console.log('  Admin dashboard will be at: http://localhost:' + (process.env.PORT||3001) + '/admin\n');
