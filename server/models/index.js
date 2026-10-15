/**
 * @module models/index
 * @description Sequelize instance + all model associations.
 * Import { sequelize, User, Publisher, TrustedSoftware, VerificationRecord } from here.
 */
const { Sequelize } = require('sequelize');

const path = require('path');
const fs = require('fs');

const isTest = process.env.NODE_ENV === 'test';
const isSqlite = process.env.DB_DIALECT === 'sqlite';

let sequelize;

if (isTest) {
  // Use in-memory SQLite for tests — no MySQL required
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else if (isSqlite) {
  // Persistent SQLite database file on disk
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbFile = path.join(dataDir, 'trustupdate.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbFile,
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'trustupdate',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  );
}

// Import models (pass sequelize instance)
const User = require('./User')(sequelize);
const Publisher = require('./Publisher')(sequelize);
const TrustedSoftware = require('./TrustedSoftware')(sequelize);
const VerificationRecord = require('./VerificationRecord')(sequelize);

module.exports = {
  sequelize,
  User,
  Publisher,
  TrustedSoftware,
  VerificationRecord,
};
