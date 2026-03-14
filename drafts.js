/**
 * routes/drafts.js — POST /api/drafts
 *
 * IMPORTANT — file storage on Render:
 * Render's free tier has an ephemeral filesystem. Files written to /tmp survive
 * for the lifetime of the process but are wiped on restart/redeploy. This is
 * fine for attaching files to staff notification emails (which happen immediately).
 * Long-term storage would require an S3 bucket (see README for upgrade path).
 */

const express   = require('express');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const mailer    = require('../mailer');

const router = express.Router();

// On Render (and any Linux host), use /tmp so writes always work.
// UPLOAD_DIR env var overrides for self-hosted setups.
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/vuu-uploads';
const MAX_BYTES  = (parseInt(process.env.MAX_FILE_SIZE_MB || '10')) * 1024 * 1024;
const ALLOWED    = ['.docx', '.pdf', '.txt'];

// Ensure base upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const today = new Date().toISOString().slice(0, 10);
    const dir   = path.join(UPLOAD_DIR, today);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED.includes(ext)
      ? cb(null, true)
      : cb(new Error(`File type not allowed. Please upload: ${ALLOWED.join(', ')}`));
  },
});

function validate(body) {
  const e = [];
  if (!body.student_name?.trim())    e.push('Full name is required.');
  if (!body.student_email?.trim())   e.push('Email address is required.');
  if (body.student_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.student_email))
                                     e.push('Email address is invalid.');
  if (!body.course?.trim())          e.push('Course name is required.');
  if (!body.instructor?.trim())      e.push('Instructor name is required.');
  if (!body.assignment_type?.trim()) e.push('Assignment type is required.');
  return e;
}

router.post('/', (req, res) => {
  upload.single('draft_file')(req, res, async (uploadErr) => {
    // ── Multer / file errors ───────────────────────
    if (uploadErr instanceof multer.MulterError) {
      return res.status(uploadErr.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
        .json({ error: uploadErr.code === 'LIMIT_FILE_SIZE'
          ? `File too large. Maximum is ${process.env.MAX_FILE_SIZE_MB || 10} MB.`
          : uploadErr.message });
    }
    if (uploadErr) return res.status(400).json({ error: uploadErr.message });
    if (!req.file)  return res.status(400).json({ error: 'No file attached. Please upload your draft.' });

    // ── Field validation ───────────────────────────
    const errors = validate(req.body);
    if (errors.length) {
      fs.unlink(req.file.path, () => {});
      return res.status(422).json({ error: errors[0], errors });
    }

    // ── Build DB record ────────────────────────────
    const ref = 'DS-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + uuidv4().slice(0, 4).toUpperCase();

    const record = {
      ref,
      student_name:      req.body.student_name.trim(),
      student_email:     req.body.student_email.trim().toLowerCase(),
      course:            req.body.course.trim(),
      instructor:        req.body.instructor.trim(),
      assignment_type:   req.body.assignment_type.trim(),
      citation_style:    req.body.citation_style?.trim()    || null,
      tutor_comments:    req.body.tutor_comments?.trim()    || null,
      assignment_prompt: req.body.assignment_prompt?.trim() || null,
      file_name:         req.file.originalname,
      file_path:         req.file.path,
      file_size:         req.file.size,
    };

    // ── Save to database ───────────────────────────
    try {
      stmts.insertDraft.run(record);
    } catch (dbErr) {
      fs.unlink(req.file.path, () => {});
      console.error('[DB] Draft insert error:', dbErr.message);
      return res.status(500).json({ error: 'Database error. Please try again.' });
    }

    // Respond immediately — don't wait for email
    res.status(201).json({
      success: true,
      ref,
      message: 'Draft submitted successfully. A confirmation has been sent to your email.',
    });

    // ── Send emails (non-blocking, after response) ─
    const saved = stmts.getDraftByRef.get(ref);
    Promise.allSettled([
      mailer.sendDraftConfirmationToStudent(saved),
      mailer.sendDraftNotificationToStaff(saved),
    ]).then(results => results.forEach((r, i) => {
      if (r.status === 'rejected')
        console.error(`[Email] Draft email[${i}] failed:`, r.reason?.message);
    }));
  });
});

module.exports = router;
