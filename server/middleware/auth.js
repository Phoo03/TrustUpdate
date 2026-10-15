/**
 * @module middleware/auth
 * @description JWT authentication and role-based authorisation middleware.
 *
 * Usage:
 *   router.get('/protected', authenticate, handler);
 *   router.delete('/admin-only', authenticate, requireRole('admin'), handler);
 */
const jwt = require('jsonwebtoken');

/**
 * Verify the JWT from the Authorization header (Bearer scheme).
 * Attaches the decoded payload to `req.user` on success.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required — no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, iat, exp }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired — please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token — authentication failed.' });
  }
};

/**
 * Factory: returns middleware that asserts `req.user.role` matches one of
 * the allowed roles.  Must be used AFTER `authenticate`.
 *
 * @param {...string} roles - Allowed role strings (e.g. 'admin').
 * @returns {import('express').RequestHandler}
 */
const requireRole = (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied — requires one of: ${roles.join(', ')}.`,
      });
    }
    return next();
  };

module.exports = { authenticate, requireRole };
