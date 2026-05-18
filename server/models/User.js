/**
 * models/User.js
 * --------------------------------------------
 * Mongoose schema for application users.
 *
 * Notes for viva:
 *   - We hash the password BEFORE saving (pre-save hook). Passwords are
 *     never stored in plain text.
 *   - We expose a matchPassword() instance method so login controllers
 *     stay clean.
 *   - timestamps: true adds createdAt and updatedAt automatically.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index for fast lookup + dedup
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password by default on queries
    },
    avatarColor: {
      type: String,
      default: '#6366F1', // indigo accent used in the UI avatar bubble
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook — hash password whenever it is new or modified.
 * Using bcrypt with a salt round of 10 (industry standard for web apps).
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare a plain-text password against the stored hash.
 * Returns true / false.
 */
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
