/**
 * controllers/budgetController.js
 * --------------------------------------------
 * Manage monthly category budgets + compute "remaining vs spent".
 *
 * The status field is the headline output:
 *   - safe     → spent < 80% of limit
 *   - warning  → 80–100%
 *   - exceeded → > 100%
 *
 * We compute "spent" with a $match + $group aggregation — the same
 * approach we'd use at scale on millions of rows.
 */

const asyncHandler = require('express-async-handler');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { toObjectId } = require('../utils/aggregations');

// @desc   Create or update a monthly budget (upsert)
// @route  POST /api/budgets
// @access Private
const upsertBudget = asyncHandler(async (req, res) => {
  const { category, monthlyLimit, month, year } = req.body;
  if (!category || monthlyLimit === undefined || !month || !year) {
    res.status(400);
    throw new Error('category, monthlyLimit, month, and year are required');
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category, month, year },
    { user: req.user._id, category, monthlyLimit, month, year },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, budget });
});

// @desc   Get all budgets with spending status for a month
// @route  GET /api/budgets?month=5&year=2026
// @access Private
const getBudgets = asyncHandler(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();

  const budgets = await Budget.find({ user: req.user._id, month, year });

  // Aggregate this user's spent-per-category for the same month
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const spentByCategory = await Expense.aggregate([
    {
      $match: {
        user: toObjectId(req.user._id),
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);

  const spentMap = Object.fromEntries(
    spentByCategory.map((s) => [s._id, s.spent])
  );

  const enriched = budgets.map((b) => {
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

  res.json({ success: true, month, year, budgets: enriched });
});

// @desc   Delete a budget
// @route  DELETE /api/budgets/:id
// @access Private
const deleteBudget = asyncHandler(async (req, res) => {
  const b = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!b) {
    res.status(404);
    throw new Error('Budget not found');
  }
  res.json({ success: true, message: 'Budget deleted' });
});

module.exports = { upsertBudget, getBudgets, deleteBudget };
