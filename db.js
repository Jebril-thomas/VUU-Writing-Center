/**
 * db.js — SQLite database setup and schema
 * Uses better-sqlite3 (synchronous, no async needed)
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH  = process.env.DB_PATH || path.join(__dirname, '../data/vuu_writing_center.db');

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS draft_submissions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ref             TEXT    NOT NULL UNIQUE,
    student_name    TEXT    NOT NULL,
    student_email   TEXT    NOT NULL,
    course          TEXT    NOT NULL,
    instructor      TEXT    NOT NULL,
    assignment_type TEXT    NOT NULL,
    citation_style  TEXT,
    tutor_comments  TEXT,
    assignment_prompt TEXT,
    file_name       TEXT    NOT NULL,
    file_path       TEXT    NOT NULL,
    file_size       INTEGER NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'pending',
    tutor_notes     TEXT,
    submitted_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    ref          TEXT    NOT NULL UNIQUE,
    first_name   TEXT    NOT NULL,
    last_name    TEXT    NOT NULL,
    email        TEXT    NOT NULL,
    role         TEXT,
    subject      TEXT    NOT NULL,
    message      TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'unread',
    staff_notes  TEXT,
    submitted_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_drafts_email   ON draft_submissions(student_email);
  CREATE INDEX IF NOT EXISTS idx_drafts_status  ON draft_submissions(status);
  CREATE INDEX IF NOT EXISTS idx_drafts_ref     ON draft_submissions(ref);
  CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
  CREATE INDEX IF NOT EXISTS idx_contact_email  ON contact_messages(email);
`);

// ── Prepared statements ─────────────────────────────────────────
const stmts = {

  insertDraft: db.prepare(`
    INSERT INTO draft_submissions
      (ref, student_name, student_email, course, instructor,
       assignment_type, citation_style, tutor_comments, assignment_prompt,
       file_name, file_path, file_size)
    VALUES
      (@ref, @student_name, @student_email, @course, @instructor,
       @assignment_type, @citation_style, @tutor_comments, @assignment_prompt,
       @file_name, @file_path, @file_size)
  `),

  getDraftByRef: db.prepare('SELECT * FROM draft_submissions WHERE ref = ?'),

  getAllDrafts: db.prepare(`
    SELECT id, ref, student_name, student_email, course, assignment_type,
           status, submitted_at, file_name, file_size
    FROM draft_submissions ORDER BY submitted_at DESC
  `),

  getDraftsByStatus: db.prepare(`
    SELECT id, ref, student_name, student_email, course, assignment_type,
           status, submitted_at, file_name, file_size
    FROM draft_submissions WHERE status = ? ORDER BY submitted_at DESC
  `),

  updateDraftStatus: db.prepare(`
    UPDATE draft_submissions
    SET status = @status, tutor_notes = @tutor_notes, updated_at = datetime('now')
    WHERE ref = @ref
  `),

  draftStats: db.prepare(`
    SELECT COUNT(*) AS total,
      SUM(CASE WHEN status='pending'       THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='in_review'     THEN 1 ELSE 0 END) AS in_review,
      SUM(CASE WHEN status='feedback_sent' THEN 1 ELSE 0 END) AS feedback_sent,
      SUM(CASE WHEN status='closed'        THEN 1 ELSE 0 END) AS closed
    FROM draft_submissions
  `),

  insertContact: db.prepare(`
    INSERT INTO contact_messages
      (ref, first_name, last_name, email, role, subject, message)
    VALUES
      (@ref, @first_name, @last_name, @email, @role, @subject, @message)
  `),

  getAllContacts: db.prepare(`
    SELECT id, ref, first_name, last_name, email, subject, status, submitted_at
    FROM contact_messages ORDER BY submitted_at DESC
  `),

  getContactByRef: db.prepare('SELECT * FROM contact_messages WHERE ref = ?'),

  updateContactStatus: db.prepare(`
    UPDATE contact_messages
    SET status = @status, staff_notes = @staff_notes, updated_at = datetime('now')
    WHERE ref = @ref
  `),

  contactStats: db.prepare(`
    SELECT COUNT(*) AS total,
      SUM(CASE WHEN status='unread'   THEN 1 ELSE 0 END) AS unread,
      SUM(CASE WHEN status='read'     THEN 1 ELSE 0 END) AS read_count,
      SUM(CASE WHEN status='replied'  THEN 1 ELSE 0 END) AS replied,
      SUM(CASE WHEN status='archived' THEN 1 ELSE 0 END) AS archived
    FROM contact_messages
  `),
};

module.exports = { db, stmts };
