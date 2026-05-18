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
// Why this is shaped the way it is:
//   - We use an allow-list (CLIENT_ORIGIN can be a comma-separated list of
//     allowed origins, e.g. "http://localhost:5173,https://myapp.vercel.app").
//   - The spec disallows `credentials: true` together with `origin: "*"`, so
//     we must echo a specific origin back. The function form below does that.
//   - Tools like curl/postman send no Origin header — we allow those for
//     local development convenience.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} is not allowed`));
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
