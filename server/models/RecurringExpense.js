/**
 * models/RecurringExpense.js
 * --------------------------------------------------------------
 * Subscriptions and bills that repeat on a schedule (Netflix, rent, etc.).
 * The frontend uses these to project upcoming costs and add reminders.
 */

const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
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
      default: 'Bills',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
      required: true,
    },
    nextDueDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for the "what subscriptions are due soon" query
recurringSchema.index({ user: 1, nextDueDate: 1 });

module.exports = mongoose.model('RecurringExpense', recurringSchema);
