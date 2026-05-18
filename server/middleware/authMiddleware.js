/**
 * middleware/authMiddleware.js
 * --------------------------------------------
 * Verifies the JWT on protected routes.
 *
 * Flow:
 *   1. Read "Authorization: Bearer <token>" header.
 *   2. Verify signature with JWT_SECRET.
 *   3. Load the user from DB and attach to req.user so controllers
 *      can use it (req.user._id, req.user.email, etc.).
 *   4. If anything fails → 401 Unauthorized.
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user (without password) to the request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized — user no longer exists');
      }
      return next();
    } catch (err) {
      res.status(401);
      throw new Error('Not authorized — token invalid or expired');
    }
  }

  res.status(401);
  throw new Error('Not authorized — no token provided');
});

module.exports = { protect };
