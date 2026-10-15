const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/publisherController');

const router = Router();

const rules = [
  body('name').trim().notEmpty().withMessage('Publisher name is required.'),
  body('verifiedIdentity').trim().notEmpty().withMessage('Verified identity is required.'),
  body('trusted').optional().isBoolean(),
];

router.get('/', authenticate, getAll);
router.post('/', authenticate, requireRole('admin'), rules, create);
router.put('/:id', authenticate, requireRole('admin'), rules, update);
router.delete('/:id', authenticate, requireRole('admin'), remove);

module.exports = router;
