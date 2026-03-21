/**
 * mailer.js — VUU Writing Center
 * Nodemailer wrapper.  Email failures are logged but never crash the server.
 */

const nodemailer = require('nodemailer');

// Build transporter once
function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn('⚠️  Email credentials not fully set — emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,          // true for 465, false for 587
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

const transporter = createTransporter();

/**
 * sendEmail({ to, subject, text, html })
 * Returns a Promise.  Always resolves (catches errors internally).
 */
async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.log('[Email skipped — no transporter]', subject);
    return;
  }

  const from = process.env.EMAIL_USER;

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('📧 Email error:', err.message);
    throw err; // caller can decide to swallow
  }
}

module.exports = { sendEmail };
