/**
 * server.js
 * ------------------------------------------------------------
 * The entry point for the FinanceFlow backend.
 *
 * Responsibilities:
 *   1. Load environment variables (.env)
 *   2. Connect to MongoDB Atlas
 *   3. Initialise Express + middleware (cors, json, morgan)
 *   4. Register API routes under /api/*
 *   5. Mount 404 + central error handlers
 *   6. Start listening on PORT
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
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

// 3) Trust proxy when deployed behind Render / Vercel (so req.ip is correct)
app.set('trust proxy', 1);

// 4) CORS
//
// We accept a comma-separated CLIENT_ORIGIN list and normalise both the
// list entries and incoming Origin headers (strip trailing slash, lowercase
// host) so trivial mismatches don't break the deploy. When an origin isn't
// allowed we log it (very useful in Render logs) and pass `false` to the
// cors callback — this returns a clean CORS rejection instead of throwing
// an Error that would otherwise bubble to the 500 error handler.
const normaliseOrigin = (s) => {
  if (!s) return '';
  try {
    const u = new URL(s.trim());
    // url.origin already lowercases the host and drops trailing slashes
    return u.origin;
  } catch {
    // Allow bare values like "http://localhost:5173" that already look fine
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
      // Allow non-browser requests (curl, server-to-server, mobile apps)
      if (!origin) return callback(null, true);
      const incoming = normaliseOrigin(origin);
      if (allowedOrigins.includes(incoming)) return callback(null, true);
      // Log the mismatch so we can diagnose from Render logs
      console.warn(
        `CORS: rejected origin "${origin}" (normalised: "${incoming}"). Allow-list: ${JSON.stringify(
          allowedOrigins
        )}`
      );
      // Return false (not Error) so the CORS middleware sends a clean
      // response without the allow-origin header instead of throwing
      // a 500 inside the error handler
      return callback(null, false);
    },
    credentials: true,
  })
);

// 5) Body parsers + logging
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// 6) Health-check (also used by Render to verify the service is alive)
app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    name: 'FinanceFlow API',
    env: process.env.NODE_ENV || 'development',
    allowedOrigins,
    time: new Date().toISOString(),
  })
);

// 7) Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/savings', savingsGoalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/export', exportRoutes);

// 8) 404 + error handler (must be LAST)
app.use(notFound);
app.use(errorHandler);

// 9) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 FinanceFlow API running on http://localhost:${PORT}`)
);
