/**
 * @module controllers/historyController
 * @description Verification history — filterable, sortable, paginated list + CSV/JSON export.
 */
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { VerificationRecord } = require('../models');
const { recordsToCSV } = require('../services/trustHistoryService');

/**
 * GET /api/history
 */
const getHistory = async (req, res, next) => {
  try {
    const {
      result,
      softwareName,
      publisher,
      submittedBy,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (result) where.result = result;
    if (softwareName) where.softwareName = { [Op.like]: `%${softwareName}%` };
    if (publisher) where.publisher = { [Op.like]: `%${publisher}%` };
    if (submittedBy) where.submittedBy = submittedBy;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count: total, rows: data } = await VerificationRecord.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      offset,
      limit: limitNum,
    });

    return res.json({
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/history/export?format=csv|json
 */
const exportHistory = async (req, res, next) => {
  try {
    const { format = 'json', result, softwareName } = req.query;

    const where = {};
    if (result) where.result = result;
    if (softwareName) where.softwareName = { [Op.like]: `%${softwareName}%` };

    const records = await VerificationRecord.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 10000,
    });

    const plain = records.map((r) => r.toJSON());

    if (format === 'csv') {
      const csv = recordsToCSV(plain);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="trustupdate_audit_log.csv"');
      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="trustupdate_audit_log.json"');
    return res.json(plain);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getHistory, exportHistory };
