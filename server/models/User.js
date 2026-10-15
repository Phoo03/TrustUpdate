/**
 * @module models/User
 * @description Sequelize model for authenticated users.
 * Stores only a bcrypt password hash — never the plaintext password.
 */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          notEmpty: true,
        },
      },
      /** bcrypt hash of the user's password. Never store plaintext. */
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'viewer'),
        defaultValue: 'viewer',
        allowNull: false,
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
    },
  );

  /**
   * Set a new plaintext password — will be hashed before save.
   * @param {string} plain
   */
  User.prototype.setPassword = function setPassword(plain) {
    this._plainPassword = plain;
  };

  /**
   * Hash password before creating / updating if _plainPassword is set.
   */
  const hashIfNeeded = async (instance) => {
    if (instance._plainPassword) {
      instance.passwordHash = await bcrypt.hash(instance._plainPassword, SALT_ROUNDS);
      instance._plainPassword = null;
    }
  };

  User.addHook('beforeValidate', hashIfNeeded);
  User.addHook('beforeSave', hashIfNeeded);

  /**
   * Compare a candidate plaintext password against the stored hash.
   * @param {string} candidate
   * @returns {Promise<boolean>}
   */
  User.prototype.verifyPassword = async function verifyPassword(candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
  };

  return User;
};
