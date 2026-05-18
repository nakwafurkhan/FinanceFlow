/**
 * middleware/errorMiddleware.js
 * --------------------------------------------
 * Centralized error handler — converts thrown errors into clean JSON
 * responses. Without this, Express returns ugly HTML stack traces.
 *
 * Pair with express-async-handler so we never need try/catch in every
 * controller — uncaught promise rejections automatically land here.
 */

// 404 — for unknown routes
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found — ${req.originalUrl}`));
};

// Generic error handler — must take 4 args so Express recognizes it
const errorHandler = (err, req, res, next) => {
  // Sometimes errors come with statusCode 200 (default) — coerce to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose duplicate key (e.g. email already in use)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
