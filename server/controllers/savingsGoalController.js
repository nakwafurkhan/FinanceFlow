/**
 * controllers/savingsGoalController.js
 * --------------------------------------------
 * Bonus feature — long-term savings goals (Macbook, Vacation, etc.).
 */

const asyncHandler = require('express-async-handler');
const SavingsGoal = require('../models/SavingsGoal');

const createGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, goal });
});

const getGoals = asyncHandler(async (req, res) => {
  const goals = await SavingsGoal.find({ user: req.user._id }).sort({ targetDate: 1 });
  res.json({ success: true, goals });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!goal) {
    res.status(404);
    throw new Error('Savings goal not found');
  }
  res.json({ success: true, goal });
});

const contributeToGoal = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error('Savings goal not found');
  }
  goal.savedAmount += Number(amount || 0);
  await goal.save();
  res.json({ success: true, goal });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!goal) {
    res.status(404);
    throw new Error('Savings goal not found');
  }
  res.json({ success: true, message: 'Goal deleted' });
});

module.exports = { createGoal, getGoals, updateGoal, contributeToGoal, deleteGoal };
