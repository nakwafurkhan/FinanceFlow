/**
 * controllers/analyticsController.js
 * --------------------------------------------
 * Read-only endpoints powering the Dashboard & Analytics pages.
 * All heavy lifting happens inside MongoDB via aggregation pipelines.
 */

const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const {
  toObjectId,
  categoryBreakdownPipeline,
  dailyTrendPipeline,
  monthlyTrendPipeline,
  monthlySummaryPipeline,
} = require('../utils/aggregations');
const { computeInsights } = require('../utils/insights');

// Helper — start/end of a specific month
const monthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Resolve the "active" month to show on the dashboard.
 *
 * Defaults to the current calendar month — BUT if the current month has
 * no expenses (e.g. a demo account whose data is from previous months, or
 * a user who hasn't logged anything yet this month), we fall back to the
 * most recent month that DOES have data. This keeps the dashboard useful
 * instead of showing an empty ₹0 screen, and means the demo never rots as
 * the calendar advances.
 */
async function resolveActiveMonth(userId) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { start, end } = monthRange(year, month);

  const hasCurrent = await Expense.exists({
    user: userId,
    date: { $gte: start, $lte: end },
  });
  if (hasCurrent) return { month, year, isCurrentMonth: true };

  const latest = await Expense.findOne({ user: userId })
    .sort({ date: -1 })
    .select('date')
    .lean();
  if (!latest) return { month, year, isCurrentMonth: true }; // no data at all

  const d = new Date(latest.date);
  return { month: d.getMonth() + 1, year: d.getFullYear(), isCurrentMonth: false };
}

// @desc   Combined dashboard payload in ONE request (stats, charts,
//         budgets, recent, insights). Replaces six separate calls so a
//         cold backend is woken by a single request and the page has one
//         round trip.
// @route  GET /api/analytics/summary?month=&year=
// @access Private
const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Explicit month/year win; otherwise resolve the smart active month.
  let month = Number(req.query.month);
  let year = Number(req.query.year);
  let isCurrentMonth = true;

  if (!month || !year) {
    const resolved = await resolveActiveMonth(userId);
    month = resolved.month;
    year = resolved.year;
    isCurrentMonth = resolved.isCurrentMonth;
  } else {
    const now = new Date();
    isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  }

  const { start, end } = monthRange(year, month);
  const daysInMonth = end.getDate();

  const [summary, byCategory, daily, incomeAgg, budgetsRaw, recent, insights] =
    await Promise.all([
      Expense.aggregate(monthlySummaryPipeline(userId, year, month)),
      Expense.aggregate(categoryBreakdownPipeline(userId, start, end)),
      Expense.aggregate(dailyTrendPipeline(userId, start, end)),
      Income.aggregate([
        { $match: { user: toObjectId(userId), date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Budget.find({ user: userId, month, year }).lean(),
      Expense.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
      computeInsights(userId, month, year),
    ]);

  const totalSpent = summary[0]?.totalSpent || 0;
  const transactionCount = summary[0]?.transactionCount || 0;
  const totalIncome = incomeAgg[0]?.total || 0;
  const highestCategory = byCategory[0]
    ? { name: byCategory[0].category, amount: byCategory[0].total }
    : null;
  const avgDaily = Math.round((totalSpent / daysInMonth) * 100) / 100;
  const netCashflow = totalIncome - totalSpent;

  // Enrich budgets with spent/status, reusing the category totals we
  // already have (no extra query).
  const spentMap = Object.fromEntries(byCategory.map((c) => [c.category, c.total]));
  const budgets = budgetsRaw.map((b) => {
    const spent = spentMap[b.category] || 0;
    const remaining = b.monthlyLimit - spent;
    const percentUsed = b.monthlyLimit
      ? Math.round((spent / b.monthlyLimit) * 100)
      : 0;
    let status = 'safe';
    if (percentUsed > 100) status = 'exceeded';
    else if (percentUsed >= 80) status = 'warning';
    return {
      _id: b._id,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      month: b.month,
      year: b.year,
      spent,
      remaining,
      percentUsed,
      status,
    };
  });

  res.json({
    success: true,
    month,
    year,
    isCurrentMonth,
    stats: {
      totalSpent,
      totalIncome,
      netCashflow,
      transactionCount,
      avgDaily,
      highestCategory,
      categoriesUsed: byCategory.length,
    },
    categoryBreakdown: byCategory,
    dailyTrend: daily,
    budgets,
    recent,
    insights,
  });
});

// @desc   Dashboard headline stats
// @route  GET /api/analytics/dashboard?month=5&year=2026
// @access Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const { start, end } = monthRange(year, month);
  const daysInMonth = end.getDate();

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
  getSummary,
  getDashboardStats,
  getCategoryBreakdown,
  getDailyTrend,
  getMonthlyTrend,
};
