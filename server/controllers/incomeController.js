/**
 * controllers/incomeController.js
 * --------------------------------------------
 * Bonus feature — manage income entries to compute net cashflow.
 */

const asyncHandler = require('express-async-handler');
const Income = require('../models/Income');

const createIncome = asyncHandler(async (req, res) => {
  const { source, amount, description, date } = req.body;
  if (amount === undefined) {
    res.status(400);
    throw new Error('Amount is required');
  }
  const income = await Income.create({
    user: req.user._id,
    source,
    amount,
    description,
    date: date || new Date(),
  });
  res.status(201).json({ success: true, income });
});

const getIncomes = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const filter = { user: req.user._id };
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }
  const incomes = await Income.find(filter).sort({ date: -1 });
  res.json({ success: true, incomes });
});

const updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!income) {
    res.status(404);
    throw new Error('Income not found');
  }
  res.json({ success: true, income });
});

const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!income) {
    res.status(404);
    throw new Error('Income not found');
  }
  res.json({ success: true, message: 'Income deleted' });
});

module.exports = { createIncome, getIncomes, updateIncome, deleteIncome };
