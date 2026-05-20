/**
 * server.js
 * ------------------------------------------------------------
 * The entry point for the FinanceFlow backend.
 *
 * Responsibilities:
 *   1. Load environment variables (.env)
 *   2. Connect to MongoDB Atlas
 *   3. Initialise Express + middleware (compression, cors, json, morgan)
 *   4. Rate-limit the auth endpoints to slow credential-stuffing
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
//   - We use an allow-list (CLIENT_ORIGIN can be a comma-separated list of
//     allowed origins, e.g. "http://localhost:5173,https://myapp.vercel.app").
//   - The spec disallows `credentials: true` together with `origin: "*"`, so
//     we must echo a specific origin back. The function form below does that.
//   - Tools like curl/postman send no Origin header — we allow those for
//     local development convenience.
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

console.log('CORS allow-list:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const incoming = normaliseOrigin(origin);
      if (allowedOrigins.includes(incoming)) return callback(null, true);
      console.warn(
        `CORS: rejected origin "${origin}" (normalised: "${incoming}"). Allow-list: ${JSON.stringify(
          allowedOrigins
        )}`
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
    message:
      'Too many attempts. Please wait 15 minutes and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only apply the limiter to login / register, NOT to /api/auth/me or
// the profile update endpoint — those are normal authenticated calls
// the React app may make frequently.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 9) Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/savings', savingsGoalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/export', exportRoutes);

// 10) 404 + error handler (must be LAST)
app.use(notFound);
app.use(errorHandler);

// 11) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 FinanceFlow API running on http://localhost:${PORT}`)
);
