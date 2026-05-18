/**
 * server.js
 * --------------------------------------------
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

// 3) Global middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' })); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// 4) Health-check
app.get('/api/health', (req, res) =>
  res.json({ ok: true, name: 'FinanceFlow API', time: new Date().toISOString() })
);

// 5) Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/savings', savingsGoalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/export', exportRoutes);

// 6) 404 + error handler (must be LAST)
app.use(notFound);
app.use(errorHandler);

// 7) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 FinanceFlow API running on http://localhost:${PORT}`)
);
