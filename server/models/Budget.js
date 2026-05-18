/**
 * models/Budget.js
 * --------------------------------------------
 * A monthly category budget. Example: "Food, ₹5000 for May 2026".
 *
 * Unique constraint:
 *   - (user, category, month, year) must be unique. A user cannot have
 *     two budgets for "Food, May 2026".
 */

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Food',
        'Travel',
        'Shopping',
        'Bills',
        'Entertainment',
        'Health',
        'Education',
        'Other',
      ],
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      // 1 = Jan, 12 = Dec
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
