/**
 * routes/contact.js — POST /api/contact
 * Saves message to DB, sends confirmation + staff notification emails.
 */

const express   = require('express');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const mailer    = require('../mailer');

const router = express.Router();

function validate(body) {
  const e = [];
  if (!body.first_name?.trim())  e.push('First name is required.');
  if (!body.last_name?.trim())   e.push('Last name is required.');
  if (!body.email?.trim())       e.push('Email is required.');
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) e.push('Email is invalid.');
  if (!body.subject?.trim())     e.push('Subject is required.');
  if (!body.message?.trim())     e.push('Message is required.');
  if (body.message && body.message.trim().length < 10) e.push('Message is too short.');
  return e;
}

router.post('/', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(422).json({ error: errors[0], errors });

  const ref = 'CM-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + uuidv4().slice(0,4).toUpperCase();

  const record = {
    ref,
    first_name: req.body.first_name.trim(),
    last_name:  req.body.last_name.trim(),
    email:      req.body.email.trim().toLowerCase(),
    role:       req.body.role?.trim() || null,
    subject:    req.body.subject.trim(),
    message:    req.body.message.trim(),
  };

  try {
    stmts.insertContact.run(record);
  } catch (dbErr) {
    console.error('[DB] Contact insert failed:', dbErr.message);
    return res.status(500).json({ error: 'Database error. Please try again.' });
  }

  const saved = stmts.getContactByRef.get(ref);

  Promise.allSettled([
    mailer.sendContactConfirmationToSender(saved),
    mailer.sendContactNotificationToStaff(saved),
  ]).then(results => results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[Email] Contact email ${i} failed:`, r.reason?.message);
  }));

  return res.status(201).json({ success: true, ref, message: 'Message sent. We will respond within 1-2 business days.' });
});

module.exports = router;
