/**
 * controllers/expenseController.js
 * --------------------------------------------
 * CRUD + filtering + pagination for the user's expenses.
 *
 * Every query is scoped by `user: req.user._id` so users cannot see
 * each other's data even if they crafted a URL with someone else's ID.
 */

const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');

// @desc   Create a new expense
// @route  POST /api/expenses
// @access Private
const createExpense = asyncHandler(async (req, res) => {
  const { amount, category, description, date, paymentMethod } = req.body;

  if (amount === undefined || amount === null) {
    res.status(400);
    throw new Error('Amount is required');
  }

  const expense = await Expense.create({
    user: req.user._id,
    amount,
    category,
    description,
    date: date || new Date(),
    paymentMethod,
  });

  res.status(201).json({ success: true, expense });
});

// @desc   List expenses with optional filters & pagination
// @route  GET /api/expenses
// @access Private
const getExpenses = asyncHandler(async (req, res) => {
  const {
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    page = 1,
    limit = 20,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  const filter = { user: req.user._id };

  if (category && category !== 'All') filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }
  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));

  const [items, total] = await Promise.all([
    Expense.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Expense.countDocuments(filter),
  ]);

  res.json({
    success: true,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    expenses: items,
  });
});

// @desc   Get one expense by id
// @route  GET /api/expenses/:id
// @access Private
const getExpenseById = asyncHandler(async (req, res) => {
  const exp = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!exp) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json({ success: true, expense: exp });
});

// @desc   Update an expense
// @route  PUT /api/expenses/:id
// @access Private
const updateExpense = asyncHandler(async (req, res) => {
  const exp = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!exp) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json({ success: true, expense: exp });
});

// @desc   Delete an expense
// @route  DELETE /api/expenses/:id
// @access Private
const deleteExpense = asyncHandler(async (req, res) => {
  const exp = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!exp) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json({ success: true, message: 'Expense deleted' });
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
