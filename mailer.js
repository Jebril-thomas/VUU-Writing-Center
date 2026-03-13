/**
 * mailer.js — Nodemailer email sending
 * Handles all outbound emails: student confirmations + staff notifications
 */

const nodemailer = require('nodemailer');

// ── Transport ────────────────────────────────────────────────────
function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Graceful timeout
    connectionTimeout: 10000,
    greetingTimeout:   10000,
  });
}

const FROM = `"${process.env.FROM_NAME || 'VUU Writing Center'}" <${process.env.FROM_EMAIL || 'writingcenter@vuu.edu'}>`;
const STAFF_EMAIL = process.env.STAFF_EMAIL || 'writingcenter@vuu.edu';

// ── Helpers ──────────────────────────────────────────────────────
function wrap(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VUU Writing Center</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#f4f4f7; margin:0; padding:24px; }
  .card { background:#fff; border-radius:12px; max-width:560px; margin:0 auto;
          box-shadow:0 2px 12px rgba(7,26,53,0.08); overflow:hidden; }
  .header { background:#071A35; padding:28px 36px; }
  .header-logo { color:#C8922A; font-size:1.5rem; font-weight:800; letter-spacing:-0.02em; }
  .header-sub  { color:rgba(255,255,255,0.55); font-size:0.78rem; margin-top:4px; letter-spacing:0.06em; }
  .body { padding:36px; }
  .body h2 { color:#071A35; font-size:1.3rem; margin:0 0 12px; }
  .body p  { color:#374151; font-size:0.93rem; line-height:1.7; margin:0 0 14px; }
  .ref-box { background:#FBF3E0; border:1px solid rgba(200,146,42,0.3); border-radius:8px;
             padding:14px 20px; margin:20px 0; text-align:center; }
  .ref-label { font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
               color:#C8922A; margin-bottom:6px; }
  .ref-number { font-family:'Courier New', monospace; font-size:1.3rem; font-weight:700;
                color:#071A35; letter-spacing:0.12em; }
  .detail-table { width:100%; border-collapse:collapse; margin:20px 0; }
  .detail-table td { padding:9px 12px; font-size:0.875rem; border-bottom:1px solid #E8EAF0; }
  .detail-table td:first-child { color:#6B7280; font-weight:600; width:38%; }
  .detail-table td:last-child  { color:#0D1B2E; }
  .cta-btn { display:inline-block; background:#C8922A; color:#fff !important;
             padding:12px 28px; border-radius:9999px; font-weight:700; font-size:0.9rem;
             text-decoration:none; margin:8px 0; }
  .footer { background:#F9FAFB; border-top:1px solid #E8EAF0; padding:20px 36px;
            font-size:0.78rem; color:#9CA3AF; text-align:center; line-height:1.6; }
  .footer a { color:#C8922A; text-decoration:none; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="header-logo">WC — Writing Center</div>
    <div class="header-sub">VIRGINIA UNION UNIVERSITY · RICHMOND, VA</div>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    VUU Writing Center · Wilder Library, Room 118 · 1500 N Lombardy Street, Richmond, VA 23220<br>
    <a href="mailto:writingcenter@vuu.edu">writingcenter@vuu.edu</a> · (804) 257-5600 ·
    <a href="https://writingcenter.vuu.edu">writingcenter.vuu.edu</a><br>
    <span style="opacity:0.6;font-size:0.7rem">Free for all enrolled VUU students</span>
  </div>
</div>
</body>
</html>`;
}

// ── DRAFT SUBMISSION emails ──────────────────────────────────────

/**
 * Send confirmation to the student after they submit a draft.
 */
async function sendDraftConfirmationToStudent(submission) {
  const transport = createTransport();
  const body = `
    <h2>Draft Received! ✅</h2>
    <p>Hi ${escHtml(submission.student_name)},</p>
    <p>Your draft has been received by the VUU Writing Center. A writing consultant will review it and send you detailed feedback within <strong>48 business hours</strong>.</p>

    <div class="ref-box">
      <div class="ref-label">Submission Reference</div>
      <div class="ref-number">${escHtml(submission.ref)}</div>
    </div>

    <table class="detail-table">
      <tr><td>Course</td><td>${escHtml(submission.course)}</td></tr>
      <tr><td>Instructor</td><td>${escHtml(submission.instructor)}</td></tr>
      <tr><td>Assignment Type</td><td>${escHtml(submission.assignment_type)}</td></tr>
      <tr><td>File Submitted</td><td>${escHtml(submission.file_name)}</td></tr>
      <tr><td>Submitted</td><td>${formatDate(submission.submitted_at)}</td></tr>
    </table>

    <p>If you have questions or need to follow up, reply to this email or contact us at
    <a href="mailto:writingcenter@vuu.edu">writingcenter@vuu.edu</a> with your reference number.</p>

    <p style="color:#6B7280;font-size:0.85rem">Please save your reference number — you'll need it if you contact us about this submission.</p>`;

  await transport.sendMail({
    from:    FROM,
    to:      submission.student_email,
    subject: `Draft Received — Ref ${submission.ref} | VUU Writing Center`,
    html:    wrap(body),
    text:    `Draft received. Ref: ${submission.ref}. Feedback within 48 business hours. Questions: writingcenter@vuu.edu`,
  });
}

/**
 * Notify staff when a new draft submission arrives.
 */
async function sendDraftNotificationToStaff(submission) {
  const transport = createTransport();
  const body = `
    <h2>New Draft Submission</h2>
    <p>A new draft has been submitted through the Writing Center website.</p>

    <div class="ref-box">
      <div class="ref-label">Reference Number</div>
      <div class="ref-number">${escHtml(submission.ref)}</div>
    </div>

    <table class="detail-table">
      <tr><td>Student</td><td>${escHtml(submission.student_name)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${escHtml(submission.student_email)}">${escHtml(submission.student_email)}</a></td></tr>
      <tr><td>Course</td><td>${escHtml(submission.course)}</td></tr>
      <tr><td>Instructor</td><td>${escHtml(submission.instructor)}</td></tr>
      <tr><td>Assignment Type</td><td>${escHtml(submission.assignment_type)}</td></tr>
      ${submission.citation_style ? `<tr><td>Citation Style</td><td>${escHtml(submission.citation_style)}</td></tr>` : ''}
      <tr><td>File</td><td>${escHtml(submission.file_name)} (${formatBytes(submission.file_size)})</td></tr>
      <tr><td>Submitted</td><td>${formatDate(submission.submitted_at)}</td></tr>
    </table>

    ${submission.tutor_comments ? `
    <p><strong>Student's note for the tutor:</strong></p>
    <p style="background:#F9FAFB;border-left:3px solid #C8922A;padding:10px 14px;border-radius:4px;font-style:italic">
      "${escHtml(submission.tutor_comments)}"
    </p>` : ''}

    ${submission.assignment_prompt ? `
    <p><strong>Assignment Prompt:</strong></p>
    <p style="background:#F9FAFB;padding:10px 14px;border-radius:4px;font-size:0.85rem">
      ${escHtml(submission.assignment_prompt)}
    </p>` : ''}

    <p>The uploaded file is stored on the server and accessible via the admin dashboard.</p>
    <p><strong>Reply-to this student:</strong> <a href="mailto:${escHtml(submission.student_email)}">${escHtml(submission.student_email)}</a></p>`;

  await transport.sendMail({
    from:     FROM,
    to:       STAFF_EMAIL,
    replyTo:  submission.student_email,
    subject:  `[New Draft] ${submission.student_name} — ${submission.assignment_type} — Ref ${submission.ref}`,
    html:     wrap(body),
    text:     `New draft from ${submission.student_name} (${submission.student_email}). Ref: ${submission.ref}. Assignment: ${submission.assignment_type}.`,
    attachments: [{
      filename: submission.file_name,
      path:     submission.file_path,
    }],
  });
}

// ── CONTACT FORM emails ──────────────────────────────────────────

/**
 * Auto-reply to the person who filled out the contact form.
 */
async function sendContactConfirmationToSender(msg) {
  const transport = createTransport();
  const body = `
    <h2>We got your message!</h2>
    <p>Hi ${escHtml(msg.first_name)},</p>
    <p>Thank you for reaching out to the VUU Writing Center. We've received your message and will respond within <strong>1–2 business days</strong>.</p>

    <div class="ref-box">
      <div class="ref-label">Message Reference</div>
      <div class="ref-number">${escHtml(msg.ref)}</div>
    </div>

    <table class="detail-table">
      <tr><td>Subject</td><td>${escHtml(msg.subject)}</td></tr>
      <tr><td>Sent</td><td>${formatDate(msg.submitted_at)}</td></tr>
    </table>

    <p>In the meantime, you can also:</p>
    <ul style="color:#374151;font-size:0.9rem;line-height:2">
      <li><a href="https://writingcenter.vuu.edu/appointments.html">Book a tutoring appointment →</a></li>
      <li><a href="https://writingcenter.vuu.edu/submit-draft.html">Submit a draft for review →</a></li>
      <li><a href="https://writingcenter.vuu.edu/resources.html">Browse writing resources →</a></li>
    </ul>`;

  await transport.sendMail({
    from:    FROM,
    to:      msg.email,
    subject: `Message Received — Ref ${msg.ref} | VUU Writing Center`,
    html:    wrap(body),
    text:    `Hi ${msg.first_name}, your message has been received. Ref: ${msg.ref}. We'll respond within 1-2 business days.`,
  });
}

/**
 * Notify staff of a new contact form message.
 */
async function sendContactNotificationToStaff(msg) {
  const transport = createTransport();
  const body = `
    <h2>New Contact Form Message</h2>
    <p>Someone submitted the contact form on the Writing Center website.</p>

    <div class="ref-box">
      <div class="ref-label">Reference Number</div>
      <div class="ref-number">${escHtml(msg.ref)}</div>
    </div>

    <table class="detail-table">
      <tr><td>Name</td><td>${escHtml(msg.first_name)} ${escHtml(msg.last_name)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${escHtml(msg.email)}">${escHtml(msg.email)}</a></td></tr>
      ${msg.role ? `<tr><td>Role</td><td>${escHtml(msg.role)}</td></tr>` : ''}
      <tr><td>Subject</td><td>${escHtml(msg.subject)}</td></tr>
      <tr><td>Sent</td><td>${formatDate(msg.submitted_at)}</td></tr>
    </table>

    <p><strong>Message:</strong></p>
    <p style="background:#F9FAFB;border-left:3px solid #C8922A;padding:14px 18px;border-radius:4px;white-space:pre-wrap;font-size:0.92rem">
      ${escHtml(msg.message)}
    </p>

    <p><a href="mailto:${escHtml(msg.email)}" class="cta-btn">Reply to ${escHtml(msg.first_name)} →</a></p>`;

  await transport.sendMail({
    from:    FROM,
    to:      STAFF_EMAIL,
    replyTo: msg.email,
    subject: `[Contact] ${msg.subject} — ${msg.first_name} ${msg.last_name} — Ref ${msg.ref}`,
    html:    wrap(body),
    text:    `New contact from ${msg.first_name} ${msg.last_name} (${msg.email}). Subject: ${msg.subject}.\n\n${msg.message}`,
  });
}

// ── Utilities ────────────────────────────────────────────────────
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return 'N/A';
  const d = new Date(iso + (iso.includes('Z') ? '' : 'Z'));
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit',
    timeZone: 'America/New_York', timeZoneName: 'short',
  });
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

module.exports = {
  sendDraftConfirmationToStudent,
  sendDraftNotificationToStaff,
  sendContactConfirmationToSender,
  sendContactNotificationToStaff,
};
