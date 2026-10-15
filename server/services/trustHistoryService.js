/**
 * @module services/trustHistoryService
 * @description Component 4 — Trust Management & Verification History.
 *
 * Provides:
 *  - Prior record lookup: has this software+version been verified before?
 *  - Trusted software registry CRUD helpers.
 *  - Audit log write (write-once via VerificationRecord.create).
 *  - Export and dashboard aggregation helpers.
 */
const { Op, fn, col, literal } = require('sequelize');
const { TrustedSoftware, VerificationRecord, sequelize } = require('../models');

// ─── Prior Record Check ───────────────────────────────────────────────────────

/**
 * Look up whether a software+publisher+version combination has been
 * successfully verified before (result === 'VERIFIED').
 */
const checkPriorRecord = async ({ softwareName, claimedVersion, publisher }) => {
  // Look for the most recent VERIFIED record for this exact combination
  const prior = await VerificationRecord.findOne({
    where: {
      softwareName: { [Op.like]: softwareName.trim() },
      claimedVersion: claimedVersion.trim(),
      publisher: { [Op.like]: publisher.trim() },
      result: 'VERIFIED',
    },
    order: [['timestamp', 'DESC']],
  });

  if (prior) {
    return {
      check: 'Trust Management History',
      component: 'Component 4',
      result: 'PRIOR_RECORD',
      detail:
        `A previously VERIFIED record exists for "${softwareName}" v${claimedVersion} ` +
        `(verified on ${new Date(prior.timestamp).toUTCString()}).`,
    };
  }

  // Also check if the software itself is in the trusted registry
  const registryEntry = await TrustedSoftware.findOne({
    where: {
      softwareName: { [Op.like]: softwareName.trim() },
    },
  });

  if (!registryEntry) {
    return {
      check: 'Trust Management History',
      component: 'Component 4',
      result: 'NO_PRIOR_RECORD',
      detail:
        `No prior verification record found for "${softwareName}" v${claimedVersion}. ` +
        'This is the first time this combination has been submitted.',
    };
  }

  return {
    check: 'Trust Management History',
    component: 'Component 4',
    result: 'NO_PRIOR_RECORD',
    detail:
      `"${softwareName}" is in the trusted software registry (status: ${registryEntry.trustStatus}), ` +
      `but version ${claimedVersion} has not been previously verified as VERIFIED.`,
  };
};

// ─── Audit Log ────────────────────────────────────────────────────────────────

/**
 * Persist a verification result to the write-once audit log.
 * @param {object} record - Fields matching the VerificationRecord schema.
 */
const saveVerificationRecord = async (record) => {
  return VerificationRecord.create({
    ...record,
    timestamp: new Date(),
  });
};

// ─── Trusted Software Registry Helpers ───────────────────────────────────────

const findTrustedSoftware = (softwareName) =>
  TrustedSoftware.findOne({
    where: { softwareName: { [Op.like]: softwareName.trim() } },
  });

const listTrustedSoftware = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const { count: total, rows: data } = await TrustedSoftware.findAndCountAll({
    order: [['updatedAt', 'DESC']],
    offset,
    limit,
  });
  return { data, total };
};

// ─── Dashboard Aggregation ────────────────────────────────────────────────────

const getDashboardStats = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Verdict counts
  const countRows = await VerificationRecord.findAll({
    attributes: ['result', [fn('COUNT', col('id')), 'count']],
    where: { timestamp: { [Op.gte]: since } },
    group: ['result'],
    raw: true,
  });

  // Daily time series
  const timeSeriesRows = await VerificationRecord.findAll({
    attributes: [
      [fn('DATE', col('timestamp')), 'date'],
      'result',
      [fn('COUNT', col('id')), 'count'],
    ],
    where: { timestamp: { [Op.gte]: since } },
    group: [fn('DATE', col('timestamp')), 'result'],
    order: [[fn('DATE', col('timestamp')), 'ASC']],
    raw: true,
  });

  const total = await VerificationRecord.count();

  // Normalise counts
  const verdicts = { VERIFIED: 0, SUSPICIOUS: 0, UNTRUSTED: 0, UNKNOWN: 0 };
  countRows.forEach(({ result, count }) => {
    if (result in verdicts) verdicts[result] = parseInt(count, 10);
  });

  // Map timeSeries to match old Mongo format: { _id: { date, result }, count }
  const timeSeries = timeSeriesRows.map((r) => ({
    _id: { date: r.date, result: r.result },
    count: parseInt(r.count, 10),
  }));

  return { verdicts, timeSeries, total, days };
};

// ─── Export Helpers ───────────────────────────────────────────────────────────

const recordsToCSV = (records) => {
  const headers = ['timestamp', 'softwareName', 'claimedVersion', 'publisher', 'result', 'fileHash', 'submittedBy', 'recommendation'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = records.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
};

module.exports = {
  checkPriorRecord,
  saveVerificationRecord,
  findTrustedSoftware,
  listTrustedSoftware,
  getDashboardStats,
  recordsToCSV,
};
