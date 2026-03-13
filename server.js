/**
 * server.js — VUU Writing Center Backend
 *
 * Endpoints:
 *   POST /api/drafts          — Submit a draft for review (multipart/form-data)
 *   POST /api/contact         — Send a contact form message (JSON)
 *   GET  /api/admin/stats     — Dashboard counts (auth required)
 *   GET  /api/admin/drafts    — List all draft submissions (auth required)
 *   GET  /api/admin/drafts/:ref        — Single draft detail (auth required)
 *   PATCH /api/admin/drafts/:ref       — Update draft status (auth required)
 *   GET  /api/admin/drafts/:ref/file   — Download submitted file (auth required)
 *   GET  /api/admin/contacts           — List all contact messages (auth required)
 *   GET  /api/admin/contacts/:ref      — Single contact detail (auth required)
 *   PATCH /api/admin/contacts/:ref     — Update contact status (auth required)
 *   GET  /admin               — Admin dashboard HTML UI
 *   GET  /health              — Health check
 */

require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const fs          = require('fs');

const draftsRouter  = require('./routes/drafts');
const contactRouter = require('./routes/contact');
const adminRouter   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // relaxed for admin HTML panel
}));

// ── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'null', // allow file:// origin during local dev
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman, same-host)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many submissions from this IP. Please try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/drafts',  submitLimiter);
app.use('/api/contact', submitLimiter);

// ── Request logging ───────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;
    const color  = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}${req.method} ${req.url} ${status} ${ms}ms\x1b[0m`);
  });
  next();
});

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/drafts',  draftsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin',   adminRouter);

// ── Admin dashboard (serves admin.html) ──────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VUU Writing Center API',
    version: '1.0.0',
    time: new Date().toISOString(),
    node: process.version,
  });
});

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  const status = err.status || err.statusCode || 500;
  const msg    = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ error: msg });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\x1b[36m');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║  VUU Writing Center — Backend API    ║');
  console.log(`  ║  Listening on http://localhost:${PORT}  ║`);
  console.log('  ║  GET /health  ·  GET /admin          ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('\x1b[0m');
  console.log(`  NODE_ENV : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  DB       : ${process.env.DB_PATH || './data/vuu_writing_center.db'}`);
  console.log(`  Uploads  : ${process.env.UPLOAD_DIR || './uploads'}`);
  console.log(`  Email    : ${process.env.EMAIL_USER || '(not configured)'}`);
});

module.exports = app; // for testing
