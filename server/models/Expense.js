/**
 * models/Expense.js
 * --------------------------------------------
 * Each document is one financial transaction (something the user spent).
 *
 * Indexes:
 *   - { user: 1, date: -1 } speeds up "my recent expenses" queries.
 *   - { user: 1, category: 1 } speeds up category filtering & aggregation.
 */

const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      default: 'Other',
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'NetBanking', 'Other'],
      default: 'UPI',
    },
  },
  { timestamps: true }
);

// Compound indexes — make filtering & aggregation O(log n) instead of O(n)
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
