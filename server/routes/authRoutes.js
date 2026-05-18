/**
 * routes/authRoutes.js
 * --------------------------------------------
 * POST /api/auth/register   → create account
 * POST /api/auth/login      → log in
 * GET  /api/auth/me         → current user profile (protected)
 * PUT  /api/auth/me         → update profile (protected)
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;
