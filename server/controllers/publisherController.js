/**
 * @module controllers/publisherController
 */
const { validationResult } = require('express-validator');
const { Publisher } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const publishers = await Publisher.findAll({ order: [['name', 'ASC']] });
    return res.json(publishers);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const doc = await Publisher.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const doc = await Publisher.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Publisher not found.' });
    await doc.update(req.body);
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const doc = await Publisher.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Publisher not found.' });
    await doc.destroy();
    return res.json({ message: 'Publisher deleted.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAll, create, update, remove };
