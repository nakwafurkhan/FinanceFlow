/**
 * utils/generateToken.js
 * --------------------------------------------
 * Creates a signed JWT used to authenticate the user across requests.
 *
 * Why JWT?
 *   - Stateless: the server doesn't need to remember sessions in memory
 *     or a DB. The token itself carries identity + signature.
 *   - Works perfectly with SPA / mobile clients (just send a header).
 */

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
