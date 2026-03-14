/**
 * routes/admin.js — /api/admin/*
 * Password-protected admin API for managing submissions and messages.
 * In production, use proper JWT auth or session middleware.
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { stmts } = require('../db');

const router = express.Router();

// ── Simple password middleware ────────────────────────────────────
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const ADMIN_PASS = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASS) {
    return res.status(503).json({ error: 'Admin auth not configured. Set ADMIN_PASSWORD in .env' });
  }
  if (!token || token !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// All admin routes require auth
router.use(requireAdmin);

// ── GET /api/admin/stats ─────────────────────────────────────────
router.get('/stats', (req, res) => {
  const drafts   = stmts.draftStats.get();
  const contacts = stmts.contactStats.get();
  res.json({ drafts, contacts });
});

// ── DRAFT SUBMISSIONS ────────────────────────────────────────────

// GET /api/admin/drafts — list all
router.get('/drafts', (req, res) => {
  const { status } = req.query;
  const rows = status ? stmts.getDraftsByStatus.all(status) : stmts.getAllDrafts.all();
  res.json({ drafts: rows });
});

// GET /api/admin/drafts/:ref — single submission detail
router.get('/drafts/:ref', (req, res) => {
  const row = stmts.getDraftByRef.get(req.params.ref);
  if (!row) return res.status(404).json({ error: 'Submission not found.' });
  res.json({ draft: row });
});

// PATCH /api/admin/drafts/:ref — update status / add tutor notes
router.patch('/drafts/:ref', (req, res) => {
  const row = stmts.getDraftByRef.get(req.params.ref);
  if (!row) return res.status(404).json({ error: 'Submission not found.' });

  const VALID_STATUSES = ['pending', 'in_review', 'feedback_sent', 'closed'];
  const status     = req.body.status     ?? row.status;
  const tutor_notes = req.body.tutor_notes ?? row.tutor_notes;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(422).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  stmts.updateDraftStatus.run({ ref: req.params.ref, status, tutor_notes: tutor_notes || null });
  res.json({ success: true, ref: req.params.ref, status });
});

// GET /api/admin/drafts/:ref/file — download the uploaded file
router.get('/drafts/:ref/file', (req, res) => {
  const row = stmts.getDraftByRef.get(req.params.ref);
  if (!row) return res.status(404).json({ error: 'Submission not found.' });
  if (!fs.existsSync(row.file_path)) {
    return res.status(404).json({ error: 'File not found on disk.' });
  }
  res.download(row.file_path, row.file_name);
});

// ── CONTACT MESSAGES ─────────────────────────────────────────────

// GET /api/admin/contacts — list all
router.get('/contacts', (req, res) => {
  const rows = stmts.getAllContacts.all();
  res.json({ contacts: rows });
});

// GET /api/admin/contacts/:ref — single message detail
router.get('/contacts/:ref', (req, res) => {
  const row = stmts.getContactByRef.get(req.params.ref);
  if (!row) return res.status(404).json({ error: 'Message not found.' });
  // Auto-mark as read when viewed
  if (row.status === 'unread') {
    stmts.updateContactStatus.run({ ref: req.params.ref, status: 'read', staff_notes: row.staff_notes });
  }
  res.json({ contact: stmts.getContactByRef.get(req.params.ref) });
});

// PATCH /api/admin/contacts/:ref — update status / add staff notes
router.patch('/contacts/:ref', (req, res) => {
  const row = stmts.getContactByRef.get(req.params.ref);
  if (!row) return res.status(404).json({ error: 'Message not found.' });

  const VALID_STATUSES = ['unread', 'read', 'replied', 'archived'];
  const status      = req.body.status      ?? row.status;
  const staff_notes = req.body.staff_notes ?? row.staff_notes;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(422).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  stmts.updateContactStatus.run({ ref: req.params.ref, status, staff_notes: staff_notes || null });
  res.json({ success: true, ref: req.params.ref, status });
});

module.exports = router;
