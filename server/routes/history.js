const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getHistory, exportHistory } = require('../controllers/historyController');

const router = Router();

router.get('/', authenticate, getHistory);
router.get('/export', authenticate, exportHistory);

module.exports = router;
