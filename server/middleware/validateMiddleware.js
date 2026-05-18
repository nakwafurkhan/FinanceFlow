/**
 * middleware/validateMiddleware.js
 * --------------------------------------------
 * Lightweight, dependency-free request body validator.
 *
 * In production you'd often use Joi/Zod/express-validator, but for a
 * viva project this keeps the code transparent — students can read and
 * understand exactly what the validation is doing.
 */

const validate = (rules) => (req, res, next) => {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value === undefined) continue;

    if (rule.type === 'number' && isNaN(Number(value))) {
      errors.push(`${field} must be a number`);
    }
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (rule.min !== undefined && Number(value) < rule.min) {
      errors.push(`${field} must be at least ${rule.min}`);
    }
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
    }
  }

  if (errors.length) {
    res.status(400);
    return next(new Error(errors.join('; ')));
  }
  next();
};

module.exports = { validate };
