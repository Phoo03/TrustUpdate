/**
 * @module models/VerificationRecord
 * @description Sequelize model — write-once audit log for every verification run.
 *
 * IMPORTANT: This table is append-only. A beforeUpdate hook blocks
 * any update to an existing row to preserve immutability of the audit trail.
 * Use VerificationRecord.create({...}) only.
 *
 * Evidence items (sub-documents in Mongo) are stored as a JSON column.
 */
const { DataTypes } = require('sequelize');

const RESULT_VALUES = ['VERIFIED', 'SUSPICIOUS', 'UNTRUSTED', 'UNKNOWN'];

module.exports = (sequelize) => {
  const VerificationRecord = sequelize.define(
    'VerificationRecord',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      softwareName: {
        type: DataTypes.STRING(190),
        allowNull: false,
        validate: { notEmpty: true },
      },
      claimedVersion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      publisher: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      /** SHA-256 hex hash of the uploaded file */
      fileHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      /** Final aggregated verdict from the Decision Engine */
      result: {
        type: DataTypes.ENUM(...RESULT_VALUES),
        allowNull: false,
      },
      /**
       * Ordered array of evidence items — stored as JSON string for MariaDB 10.1 compatibility.
       * Each item: { check, component, result, detail }
       */
      evidence: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        get() {
          const rawValue = this.getDataValue('evidence');
          if (!rawValue) return [];
          if (typeof rawValue === 'object') return rawValue;
          try {
            return JSON.parse(rawValue);
          } catch {
            return [];
          }
        },
        set(value) {
          this.setDataValue('evidence', typeof value === 'string' ? value : JSON.stringify(value));
        },
      },
      /** Plain-language recommendation from the Decision Engine */
      recommendation: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      /** Username of the submitter (null for anonymous) */
      submittedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      /** Audit timestamp (matches Mongoose 'timestamp' field name for compatibility) */
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'VerificationRecords',
      timestamps: true, // Sequelize adds createdAt + updatedAt
      indexes: [
        { fields: ['timestamp'] },
        { fields: ['result'] },
        { fields: ['softwareName'] },
        { fields: ['submittedBy'] },
      ],
    },
  );

  /**
   * Immutability guard — block any update to an existing audit record.
   */
  VerificationRecord.addHook('beforeUpdate', () => {
    throw new Error('VerificationRecord is immutable — audit records cannot be modified.');
  });

  return VerificationRecord;
};
