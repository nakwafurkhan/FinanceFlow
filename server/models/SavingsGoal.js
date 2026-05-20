/**
 * models/SavingsGoal.js
 * --------------------------------------------------------------
 * "I want to save ₹50,000 for a Macbook by Dec 2026."
 *
 * progress = (savedAmount / targetAmount) * 100  (computed virtually).
 */

const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    targetAmount: { type: Number, required: true, min: 1 },
    savedAmount: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date, required: true },
    icon: { type: String, default: '🎯' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Virtual field — never stored, always computed at read time
savingsGoalSchema.virtual('progressPercent').get(function () {
  if (!this.targetAmount) return 0;
  return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

// Compound index for the typical list query: "all my goals, newest first"
savingsGoalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
