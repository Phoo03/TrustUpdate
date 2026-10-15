/**
 * @module controllers/statsController
 */
const { getDashboardStats } = require('../services/trustHistoryService');

const getStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const stats = await getDashboardStats(days);
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getStats };
