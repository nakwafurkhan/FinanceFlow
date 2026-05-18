const express = require('express');
const router = express.Router();
const {
  upsertBudget,
  getBudgets,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getBudgets).post(upsertBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
