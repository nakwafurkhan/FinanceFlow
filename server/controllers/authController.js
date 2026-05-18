/**
 * controllers/authController.js
 * --------------------------------------------
 * Handles registration, login, and "get my profile".
 *
 * Why bcrypt? It is a slow, salted hash. Slow is GOOD for passwords —
 * it makes brute-force attacks computationally expensive.
 *
 * Why JWT? Stateless authentication; no server-side session storage.
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Password hashing happens automatically in the User pre('save') hook
  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      currency: user.currency,
    },
    token: generateToken(user._id),
  });
});

// @desc   Login an existing user
// @route  POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // We selected the password field manually because the schema has select:false
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      currency: user.currency,
    },
    token: generateToken(user._id),
  });
});

// @desc   Get the currently logged-in user's profile
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc   Update user profile (name, currency, avatarColor)
// @route  PUT /api/auth/me
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name = req.body.name || user.name;
  user.currency = req.body.currency || user.currency;
  user.avatarColor = req.body.avatarColor || user.avatarColor;
  const updated = await user.save();
  res.json({ success: true, user: updated });
});

module.exports = { registerUser, loginUser, getMe, updateProfile };
