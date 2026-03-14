/**
 * server.js — VUU Writing Center Backend
 * Deployed on Render. Frontend deployed on Vercel.
 *
 * POST /api/drafts                    — Submit a draft (multipart/form-data)
 * POST /api/contact                   — Send a contact message (JSON)
 * GET  /api/admin/stats               — Dashboard stats (auth required)
 * GET  /api/admin/drafts              — List drafts (auth required)
 * GET  /api/admin/drafts/:ref         — Draft detail (auth required)
 * PATCH /api/admin/drafts/:ref        — Update draft (auth required)
 * GET  /api/admin/drafts/:ref/file    — Download file (auth required)
 * GET  /api/admin/contacts            — List messages (auth required)
 * GET  /api/admin/contacts/:ref       — Message detail (auth required)
 * PATCH /api/admin/contacts/:ref      — Update message (auth required)
 * GET  /admin                         — Admin dashboard
 * GET  /health                        — Health check
 */

require('dotenv').config();

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const draftsRouter       = require('./routes/drafts');
const contactRouter      = require('./routes/contact');
const adminRouter        = require('./routes/admin');
const appointmentsRouter = require('./routes/appointments');

const app  = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ── Trust proxy (required on Render for rate limiting) ────────────
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──────────────────────────────────────────────────────────
// Accepts:
//  • The exact FRONTEND_ORIGIN from .env (your Vercel production URL)
//  • Any Vercel preview URL: https://*.vercel.app
//  • localhost for local development
function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin, curl, Postman
  if (origin === 'null') return true; // file:// in dev

  // Exact match from env (e.g. https://vuu-writing-center.vercel.app)
  const exact = process.env.FRONTEND_ORIGIN;
  if (exact && origin === exact) return true;

  // Any Vercel preview deployment URL
  if (/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;

  // Localhost (any port) for dev
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;

  return false;
}

app.use(cors({
  origin: (origin, cb) => isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed — ' + origin)),
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.options('*', cors());

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
}));
// Stricter limiter for form submissions
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions from this IP. Please try again later.' },
});
app.use('/api/drafts',       submitLimiter);
app.use('/api/contact',      submitLimiter);
app.use('/api/appointments', submitLimiter);

// ── Request logging ───────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms  = Date.now() - start;
    const s   = res.statusCode;
    const col = s >= 500 ? '\x1b[31m' : s >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${col}${req.method} ${req.url} ${s} ${ms}ms\x1b[0m  [${req.headers['origin'] || 'no-origin'}]`);
  });
  next();
});

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/drafts',       draftsRouter);
app.use('/api/contact',      contactRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/admin',        adminRouter);

// ── Admin dashboard ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'VUU Writing Center API',
    version: '1.0.0',
    env:     process.env.NODE_ENV || 'development',
    time:    new Date().toISOString(),
    node:    process.version,
  });
});

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.url}` }));

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({ error: isProd ? 'Internal server error' : err.message });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n\x1b[36m  VUU Writing Center — Backend API');
  console.log(`  http://localhost:${PORT}\x1b[0m`);
  console.log(`  CORS origin : ${process.env.FRONTEND_ORIGIN || '(any Vercel URL + localhost)'}`);
  console.log(`  DB path     : ${process.env.DB_PATH || './data/vuu_writing_center.db'}`);
  console.log(`  Upload dir  : ${process.env.UPLOAD_DIR || '/tmp/vuu-uploads'}`);
  console.log(`  Email user  : ${process.env.EMAIL_USER || '(not configured)'}`);
  console.log(`  Admin UI    : http://localhost:${PORT}/admin\n`);
});

module.exports = app;
