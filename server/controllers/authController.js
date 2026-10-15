/**
 * @module controllers/authController
 * @description Handles user login and registration.
 * Passwords are never stored or logged in plaintext.
 */
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const user = User.build({ username, role: role || 'viewer' });
    user.setPassword(password);
    await user.save();

    return res.status(201).json({
      message: 'User registered successfully.',
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await user.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );

    return res.json({
      token,
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/auth/me
 */
const me = (req, res) => res.json({ user: req.user });

module.exports = { register, login, me };
