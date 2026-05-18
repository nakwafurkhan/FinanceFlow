/**
 * controllers/analyticsController.js
 * --------------------------------------------
 * Read-only endpoints powering the Dashboard & Analytics pages.
 * All heavy lifting happens inside MongoDB via aggregation pipelines.
 */

const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const {
  toObjectId,
  categoryBreakdownPipeline,
  dailyTrendPipeline,
  monthlyTrendPipeline,
  monthlySummaryPipeline,
} = require('../utils/aggregations');

// Helper — start/end of a specific month
const monthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc   Dashboard headline stats
// @route  GET /api/analytics/dashboard?month=5&year=2026
// @access Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const { start, end } = monthRange(year, month);
  const daysInMonth = end.getDate();

  // Three parallel aggregations — Mongo handles them concurrently
  const [summary, byCategory, incomeAgg] = await Promise.all([
    Expense.aggregate(monthlySummaryPipeline(req.user._id, year, month)),
    Expense.aggregate(categoryBreakdownPipeline(req.user._id, start, end)),
    Income.aggregate([
      {
        $match: {
          user: toObjectId(req.user._id),
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalSpent = summary[0]?.totalSpent || 0;
  const transactionCount = summary[0]?.transactionCount || 0;
  const totalIncome = incomeAgg[0]?.total || 0;
  const highestCategory = byCategory[0]
    ? { name: byCategory[0].category, amount: byCategory[0].total }
    : null;
  const avgDaily = Math.round((totalSpent / daysInMonth) * 100) / 100;
  const netCashflow = totalIncome - totalSpent;

  res.json({
    success: true,
    month,
    year,
    stats: {
      totalSpent,
      totalIncome,
      netCashflow,
      transactionCount,
      avgDaily,
      highestCategory,
      categoriesUsed: byCategory.length,
    },
  });
});

// @desc   Pie chart data for the active month
// @route  GET /api/analytics/category-breakdown?month=5&year=2026
// @access Private
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const { start, end } = monthRange(year, month);

  const data = await Expense.aggregate(
    categoryBreakdownPipeline(req.user._id, start, end)
  );
  res.json({ success: true, data });
});

// @desc   Daily spending trend (line chart) for the active month
// @route  GET /api/analytics/daily-trend?month=5&year=2026
// @access Private
const getDailyTrend = asyncHandler(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const { start, end } = monthRange(year, month);

  const data = await Expense.aggregate(
    dailyTrendPipeline(req.user._id, start, end)
  );
  res.json({ success: true, data });
});

// @desc   Monthly totals for last N months (bar chart)
// @route  GET /api/analytics/monthly-trend?months=6
// @access Private
const getMonthlyTrend = asyncHandler(async (req, res) => {
  const months = Math.max(1, Math.min(12, Number(req.query.months) || 6));
  const data = await Expense.aggregate(monthlyTrendPipeline(req.user._id, months));
  res.json({ success: true, data });
});

module.exports = {
  getDashboardStats,
  getCategoryBreakdown,
  getDailyTrend,
  getMonthlyTrend,
};
