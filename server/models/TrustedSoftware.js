/**
 * @module models/TrustedSoftware
 * @description Sequelize model for the trusted software registry.
 * Each row represents one known-good software title and its
 * approved version, reference hash, and current trust status.
 * Used by Component 2 (integrity) and Component 4 (trust history).
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TrustedSoftware = sequelize.define(
    'TrustedSoftware',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      /** Canonical software name, e.g. "Mozilla Firefox" */
      softwareName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      /** Name of the publisher */
      publisher: {
        type: DataTypes.STRING(90),
        allowNull: false,
        validate: { notEmpty: true },
      },
      /** Latest known-good version string, e.g. "127.0.1" */
      latestApprovedVersion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      /**
       * SHA-256 reference hash of the approved binary.
       * Hex-encoded, 64 characters.
       */
      referenceHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: null,
      },
      /** Current trust status of this software entry */
      trustStatus: {
        type: DataTypes.ENUM('TRUSTED', 'UNDER_REVIEW', 'FLAGGED', 'NOT_REGISTERED'),
        defaultValue: 'NOT_REGISTERED',
        allowNull: false,
      },
    },
    {
      tableName: 'TrustedSoftwares',
      timestamps: true,
      indexes: [
        { fields: ['softwareName', 'publisher'] },
        { fields: ['softwareName'] },
      ],
    },
  );

  return TrustedSoftware;
};
