const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/trustedSoftwareController');

const router = Router();

const validationRules = [
  body('softwareName').trim().notEmpty().withMessage('Software name is required.'),
  body('publisher').trim().notEmpty().withMessage('Publisher is required.'),
  body('latestApprovedVersion').trim().notEmpty().withMessage('Latest approved version is required.'),
  body('referenceHash').optional().isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Reference hash must be 64-char hex.'),
  body('trustStatus').optional().isIn(['TRUSTED', 'UNDER_REVIEW', 'FLAGGED', 'NOT_REGISTERED']),
];

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticate, requireRole('admin'), validationRules, create);
router.put('/:id', authenticate, requireRole('admin'), validationRules, update);
router.delete('/:id', authenticate, requireRole('admin'), remove);

module.exports = router;
