/**
 * @module models/Publisher
 * @description Sequelize model for known/trusted software publishers.
 * Used by Component 3 (authenticityService) to verify signing identity.
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Publisher = sequelize.define(
    'Publisher',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      /** Display name of the publisher organisation or individual */
      name: {
        type: DataTypes.STRING(190),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      /** Canonical verified identity string */
      verifiedIdentity: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      /**
       * Reference to the publisher's public key or certificate.
       * PEM string or human-readable cert reference.
       */
      publicKeyOrCertRef: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      /** Whether this publisher is currently trusted */
      trusted: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'Publishers',
      timestamps: true,
    },
  );

  return Publisher;
};
