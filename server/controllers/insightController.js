/**
 * controllers/insightController.js
 * --------------------------------------------
 * "Smart Insights" — rule-based natural-language tips like
 *   "You spent 40% more on Food this month."
 *
 * Why rule-based instead of an LLM?
 *   - Deterministic, fast, and free.
 *   - Easy to explain in viva ("we compare this month vs last month
 *     per category and generate a sentence from the delta").
 *   - Can be swapped for an actual LLM later without changing the API.
 */

const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Income = require('../models/Income');
const { toObjectId } = require('../utils/aggregations');

const getInsights = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const thisStart = new Date(year, month - 1, 1);
  const thisEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const lastStart = new Date(year, month - 2, 1);
  const lastEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

  const pipeline = (start, end) => [
    { $match: { user: toObjectId(req.user._id), date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ];

  const [thisMonth, lastMonth, budgets, income] = await Promise.all([
    Expense.aggregate(pipeline(thisStart, thisEnd)),
    Expense.aggregate(pipeline(lastStart, lastEnd)),
    Budget.find({ user: req.user._id, month, year }),
    Income.aggregate([
      { $match: { user: toObjectId(req.user._id), date: { $gte: thisStart, $lte: thisEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const thisMap = Object.fromEntries(thisMonth.map((c) => [c._id, c.total]));
  const lastMap = Object.fromEntries(lastMonth.map((c) => [c._id, c.total]));

  const insights = [];

  // 1) Month-over-month category deltas
  for (const cat of Object.keys(thisMap)) {
    const curr = thisMap[cat];
    const prev = lastMap[cat] || 0;
    if (prev > 0) {
      const pct = Math.round(((curr - prev) / prev) * 100);
      if (Math.abs(pct) >= 15) {
        insights.push({
          icon: pct > 0 ? '📈' : '📉',
          tone: pct > 0 ? 'warning' : 'positive',
          message:
            pct > 0
              ? `You spent ${pct}% more on ${cat} compared to last month.`
              : `Great — ${cat} spending decreased by ${Math.abs(pct)}% this month.`,
        });
      }
    } else if (curr > 0) {
      insights.push({
        icon: '🆕',
        tone: 'neutral',
        message: `${cat} is a new spending category this month (₹${curr}).`,
      });
    }
  }

  // 2) Budget warnings
  for (const b of budgets) {
    const spent = thisMap[b.category] || 0;
    const pct = b.monthlyLimit ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    if (pct >= 100) {
      insights.push({
        icon: '🚨',
        tone: 'danger',
        message: `You've exceeded your ${b.category} budget by ${pct - 100}%.`,
      });
    } else if (pct >= 80) {
      insights.push({
        icon: '⚠️',
        tone: 'warning',
        message: `You've used ${pct}% of your ${b.category} budget — slow down.`,
      });
    }
  }

  // 3) Savings rate
  const totalIncome = income[0]?.total || 0;
  const totalSpent = Object.values(thisMap).reduce((a, b) => a + b, 0);
  if (totalIncome > 0) {
    const savingsRate = Math.round(((totalIncome - totalSpent) / totalIncome) * 100);
    if (savingsRate >= 20) {
      insights.push({
        icon: '🌱',
        tone: 'positive',
        message: `You're saving ${savingsRate}% of your income this month — keep it up!`,
      });
    } else if (savingsRate < 0) {
      insights.push({
        icon: '⚠️',
        tone: 'danger',
        message: `You spent more than you earned this month (${Math.abs(savingsRate)}% over).`,
      });
    }
  }

  // Always return at least one default insight
  if (insights.length === 0) {
    insights.push({
      icon: '✨',
      tone: 'neutral',
      message: 'Your spending looks balanced this month. Keep tracking to spot patterns.',
    });
  }

  res.json({ success: true, insights });
});

module.exports = { getInsights };
