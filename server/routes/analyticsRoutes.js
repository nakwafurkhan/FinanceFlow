const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCategoryBreakdown,
  getDailyTrend,
  getMonthlyTrend,
} = require('../controllers/analyticsController');
const { getInsights } = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/daily-trend', getDailyTrend);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/insights', getInsights);

module.exports = router;
