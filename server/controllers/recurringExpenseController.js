/**
 * controllers/recurringExpenseController.js
 * --------------------------------------------
 * Bonus feature — subscriptions / bills that repeat (Netflix, rent, etc.).
 */

const asyncHandler = require('express-async-handler');
const RecurringExpense = require('../models/RecurringExpense');

const createRecurring = asyncHandler(async (req, res) => {
  const rec = await RecurringExpense.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, recurring: rec });
});

const getRecurring = asyncHandler(async (req, res) => {
  const recs = await RecurringExpense.find({ user: req.user._id }).sort({
    nextDueDate: 1,
  });
  res.json({ success: true, recurring: recs });
});

const updateRecurring = asyncHandler(async (req, res) => {
  const rec = await RecurringExpense.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!rec) {
    res.status(404);
    throw new Error('Recurring expense not found');
  }
  res.json({ success: true, recurring: rec });
});

const deleteRecurring = asyncHandler(async (req, res) => {
  const rec = await RecurringExpense.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!rec) {
    res.status(404);
    throw new Error('Recurring expense not found');
  }
  res.json({ success: true, message: 'Recurring expense deleted' });
});

module.exports = { createRecurring, getRecurring, updateRecurring, deleteRecurring };
