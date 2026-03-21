/**
 * db.js — VUU Writing Center
 * Opens (or creates) the SQLite database and returns the instance.
 */

const path   = require('path');
const fs     = require('fs');
const Database = require('better-sqlite3');

let _db = null;

function getDb() {
  if (_db) return _db;

  const dbPath = process.env.DB_PATH || './data/writing_center.db';
  const resolved = path.resolve(dbPath);

  // Make sure the directory exists
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(resolved);

  // Enable WAL mode for better concurrent performance
  _db.pragma('journal_mode = WAL');

  return _db;
}

module.exports = { getDb };
