/**
 * models/Income.js
 * --------------------------------------------
 * Tracks money coming IN (salary, freelance, refunds, gifts, etc.).
 * Used in dashboard "net cashflow" calculations and savings progress.
 */

const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 'Other'],
      default: 'Salary',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

incomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
