/**
 * server.js
 * ------------------------------------------------------------
 * The entry point for the FinanceFlow backend.
 *
 * Responsibilities:
 *   1. Load environment variables (.env)
 *   2. Connect to MongoDB Atlas
 *   3. Initialise Express + middleware (compression, cors, json, morgan)
 *   4. Rate-limit the auth + AI endpoints
 *   5. Register API routes under /api/*
 *   6. Mount 404 + central error handlers
 *   7. Start listening on PORT
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route modules
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const savingsGoalRoutes = require('./routes/savingsGoalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const exportRoutes = require('./routes/exportRoutes');
const aiRoutes = require('./routes/aiRoutes');

// 1) DB connection
connectDB();

// 2) Express app
const app = express();

// 3) Trust proxy when deployed behind Render / Vercel (so req.ip is correct,
// which the rate limiter needs)
app.set('trust proxy', 1);

// 4) gzip compression — runs FIRST so every downstream response is
// automatically compressed when the client supports it. The cost is
// negligible CPU per request; the win is ~60-80 percent smaller JSON
// payloads on /api/expenses, /api/analytics/*, and the PDF/CSV streams.
app.use(compression());

// 5) CORS
//
// Why this is shaped the way it is:
//   - CLIENT_ORIGIN is a comma-separated allow-list (e.g. localhost + the
//     canonical production domain).
//   - We ALSO allow any *.vercel.app origin. Vercel preview/branch/alias
//     deployments get a per-deploy hashed subdomain
//     (e.g. finance-flow-abc123-team.vercel.app) that changes every push, so
//     they can't be hardcoded. Without this, logging in on any URL other than
//     the one pinned in CLIENT_ORIGIN fails with an opaque CORS error.
//     This is safe here: auth uses a Bearer token in the Authorization header
//     (not cookies), so a stray origin can't ride on ambient credentials.
//   - The spec disallows `credentials: true` with `origin: "*"`, so we echo a
//     specific origin back via the function form.
//   - Tools like curl/postman send no Origin header — allowed for local dev.
const normaliseOrigin = (s) => {
  if (!s) return '';
  try {
    const u = new URL(s.trim());
    return u.origin;
  } catch {
    return s.trim().replace(/\/+$/, '').toLowerCase();
  }
};

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(normaliseOrigin)
  .filter(Boolean);

// Any Vercel deployment of this app: production, previews, and project aliases.
const VERCEL_ORIGIN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (incoming) =>
  allowedOrigins.includes(incoming) || VERCEL_ORIGIN.test(incoming);

console.log('CORS allow-list:', allowedOrigins, '(+ *.vercel.app)');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const incoming = normaliseOrigin(origin);
      if (isAllowedOrigin(incoming)) return callback(null, true);
      console.warn(
        `CORS: rejected origin "${origin}" (normalised: "${incoming}"). Allow-list: ${JSON.stringify(
          allowedOrigins
        )} (+ *.vercel.app)`
      );
      return callback(null, false);
    },
    credentials: true,
  })
);

// 6) Body parsers + logging
//
// Body limit reduced from 5mb to 512kb — we never accept file uploads
// (exports go OUT as streams, not IN as bodies). Smaller limit shrinks
// the attack surface against payload-bloat DoS.
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// 7) Health-check
// Cached for 10 seconds at the edge / by uptime monitors so they don't
// hammer the DB-connected process every minute. /api/health is also the
// keep-warm endpoint we recommend external pingers use to keep the
// Render free-tier process from sleeping.
app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=10, s-maxage=10');
  res.json({
    ok: true,
    name: 'FinanceFlow API',
    env: process.env.NODE_ENV || 'development',
    allowedOrigins,
    vercelWildcard: true,
    aiEnabled: !!process.env.OPENAI_API_KEY,
    time: new Date().toISOString(),
  });
});

// 8) Rate-limit the auth endpoints — slows credential stuffing without
// blocking real users. 5 attempts per 15 minutes per IP for both
// login and register. The 429 responses still include CORS headers
// because we mount this AFTER `cors`.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts. Please wait 15 minutes and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 8b) Rate-limit the AI endpoints separately — these call OpenAI, which
// costs money per request. 20 requests per 15 minutes per IP is generous
// for a real user but caps abuse / runaway loops. /status is excluded
// because it's a free local check.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message:
      'AI request limit reached (20 per 15 minutes). Please wait a little while.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/status',
});

app.use('/api/ai', aiLimiter);

// 9) Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/savings', savingsGoalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);

// 10) 404 + error handler (must be LAST)
app.use(notFound);
app.use(errorHandler);

// 11) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 FinanceFlow API running on http://localhost:${PORT}`)
);
