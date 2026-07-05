const express = require('express');
const router = express.Router();
const {
  getSummary,
  getDashboardStats,
  getCategoryBreakdown,
  getDailyTrend,
  getMonthlyTrend,
} = require('../controllers/analyticsController');
const { getInsights } = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Combined single-request payload for the dashboard (preferred).
router.get('/summary', getSummary);

// Individual endpoints — still used by the Analytics page.
router.get('/dashboard', getDashboardStats);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/daily-trend', getDailyTrend);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/insights', getInsights);

module.exports = router;
