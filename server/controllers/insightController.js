/**
 * controllers/insightController.js
 * --------------------------------------------
 * "Smart Insights" — rule-based natural-language tips like
 *   "You spent 40% more on Food this month."
 *
 * The generation logic lives in utils/insights.js so it can be shared
 * with the combined /api/analytics/summary endpoint (single source of
 * truth, no duplication).
 */

const asyncHandler = require('express-async-handler');
const { computeInsights } = require('../utils/insights');

// @desc   Rule-based insights for a month
// @route  GET /api/analytics/insights?month=5&year=2026
// @access Private
const getInsights = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const insights = await computeInsights(req.user._id, month, year);
  res.json({ success: true, insights });
});

module.exports = { getInsights };
