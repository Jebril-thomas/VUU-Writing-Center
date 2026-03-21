/**
 * setup.js — VUU Writing Center
 * Creates SQLite tables on first run.
 * Called automatically when server starts.
 */

const path = require('path');
const fs   = require('fs');

function setup(db) {
  // Ensure data directory exists
  const dbPath = process.env.DB_PATH || './data/writing_center.db';
  const dir = path.dirname(path.resolve(dbPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Ensure uploads directory exists
  const uploadsPath = process.env.UPLOADS_PATH || './uploads';
  if (!fs.existsSync(path.resolve(uploadsPath))) {
    fs.mkdirSync(path.resolve(uploadsPath), { recursive: true });
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      file_path  TEXT    NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'pending',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      message    TEXT    NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'pending',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('✅ Database tables ready.');
}

module.exports = setup;
