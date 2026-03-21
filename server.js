/**
 * server.js — VUU Writing Center
 * Main Express application entry point.
 */

require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const { getDb }   = require('./db');
const setup       = require('./setup');
const draftsRouter  = require('./routes/drafts');
const contactRouter = require('./routes/contact');
const adminRouter   = require('./routes/admin');

// ── Init DB ─────────────────────────────────────────────────
const db = getDb();
setup(db);

// ── App ──────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security ─────────────────────────────────────────────────
app.use(helmet());

// CORS — allow your Vercel frontend
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate limiting ─────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many submissions from this IP. Try again in an hour.' }
});

app.use(generalLimiter);

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Health check ──────────────────────────────────────────────
app.get('/health', function (req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/drafts',  submissionLimiter, draftsRouter);
app.use('/api/contact', submissionLimiter, contactRouter);
app.use('/api/admin',   adminRouter);

// ── 404 ───────────────────────────────────────────────────────
app.use(function (req, res) {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────
app.use(function (err, req, res, next) {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, function () {
  console.log('🚀 VUU Writing Center API running on port ' + PORT);
});
