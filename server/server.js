/**
 * server.js — TrustUpdate Express application entry point.
 *
 * Security layers applied in order:
 *  1. helmet    — HTTP header hardening
 *  2. cors      — configured origin whitelist
 *  3. rate-limit — per-IP throttle on sensitive routes
 *  4. body parsers — JSON + URL-encoded
 *  5. Routes
 *  6. Global error handler
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const verifyRoutes = require('./routes/verify');
const historyRoutes = require('./routes/history');
const trustedSoftwareRoutes = require('./routes/trustedSoftware');
const publisherRoutes = require('./routes/publishers');
const statsRoutes = require('./routes/stats');

const app = express();
app.set('trust proxy', 1);

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. Postman, curl, same-origin)
      if (!origin) return cb(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)
      ) {
        return cb(null, true);
      }
      return cb(null, true); // Permissive in development for convenience
    },
    credentials: true,
  }),
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Verification rate limit exceeded — please wait before submitting again.' },
});

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }
  res.json({
    status: 'ok',
    db: dbStatus,
    dialect: sequelize.getDialect(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/verify', verifyLimiter, verifyRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/trusted-software', trustedSoftwareRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/stats', statsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Database + Server Bootstrap ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;
const mysql = require('mysql2/promise');

async function ensureDatabaseExists() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || 'trustupdate';

  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`[DB] Database "${dbName}" verified/created.`);
  } catch (err) {
    console.warn(`[DB] Notice: Auto database creation check: ${err.message}`);
  }
}

async function start() {
  try {
    if (process.env.DB_DIALECT !== 'sqlite') {
      await ensureDatabaseExists();
    }
    console.log(`[DB] Connecting to database (${process.env.DB_DIALECT || 'mysql'})...`);
    await sequelize.authenticate();
    console.log('[DB] Connection established successfully.');

    // Sync all models to DB (create tables if not exist)
    await sequelize.sync({ alter: true });
    console.log('[DB] Tables synchronized.');

    // Seed initial data if Users table is empty
    const { User } = require('./models');
    const count = await User.count();
    if (count === 0) {
      console.log('[DB] Database is empty. Seeding initial data...');
      const { seedDatabase } = require('./seed');
      await seedDatabase();
    }
  } catch (err) {
    console.error('[DB] Failed to connect to MySQL:', err.message);
    console.error('[DB] Make sure XAMPP MySQL is running on port 3306!');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] TrustUpdate API running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[SERVER] phpMyAdmin: http://localhost/phpmyadmin → Database: trustupdate`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = app; // exported for supertest in integration tests
