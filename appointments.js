/**
 * routes/appointments.js — POST /api/appointments
 * Saves appointment request to DB, sends staff notification email.
 * Follows the same pattern as routes/contact.js.
 */

const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const { stmts }  = require('../db');
const mailer     = require('../mailer');

const router = express.Router();

const SESSION_TYPES = ['In-Person Session', 'Virtual Session', 'Async Draft Review'];

function validate(body) {
  const e = [];
  if (!body.name?.trim())           e.push('Full name is required.');
  if (!body.email?.trim())          e.push('Email address is required.');
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
                                    e.push('Email address is invalid.');
  if (!body.session_type?.trim())   e.push('Session type is required.');
  if (!body.preferred_date?.trim()) e.push('Preferred date is required.');
  if (!body.preferred_time?.trim()) e.push('Preferred time is required.');
  return e;
}

router.post('/', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(422).json({ error: errors[0], errors });

  const ref = 'AP-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + uuidv4().slice(0, 4).toUpperCase();

  const record = {
    ref,
    name:           req.body.name.trim(),
    email:          req.body.email.trim().toLowerCase(),
    session_type:   req.body.session_type.trim(),
    preferred_date: req.body.preferred_date.trim(),
    preferred_time: req.body.preferred_time.trim(),
    message:        req.body.message?.trim() || null,
  };

  try {
    stmts.insertAppointment.run(record);
  } catch (dbErr) {
    console.error('[DB] Appointment insert failed:', dbErr.message);
    return res.status(500).json({ error: 'Database error. Please try again.' });
  }

  const saved = stmts.getAppointmentByRef.get(ref);

  // Respond immediately, send email non-blocking
  res.status(201).json({
    success: true,
    ref,
    message: 'Appointment request received. We will confirm your session via email within 1 business day.',
  });

  Promise.allSettled([
    mailer.sendAppointmentNotificationToStaff(saved),
  ]).then(results => results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[Email] Appointment email failed:`, r.reason?.message);
  }));
});

module.exports = router;
