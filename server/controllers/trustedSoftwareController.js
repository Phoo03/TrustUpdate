/**
 * @module controllers/trustedSoftwareController
 * @description CRUD for the Trusted Software registry. Admin-only mutations.
 */
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { TrustedSoftware } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, trustStatus, search } = req.query;

    const where = {};
    if (trustStatus) where.trustStatus = trustStatus;
    if (search) where.softwareName = { [Op.like]: `%${search}%` };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count: total, rows: data } = await TrustedSoftware.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
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

const getById = async (req, res, next) => {
  try {
    const doc = await TrustedSoftware.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Record not found.' });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const doc = await TrustedSoftware.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const doc = await TrustedSoftware.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Record not found.' });
    await doc.update(req.body);
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const doc = await TrustedSoftware.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Record not found.' });
    await doc.destroy();
    return res.json({ message: 'Trusted software record deleted.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
