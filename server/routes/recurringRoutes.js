const express = require('express');
const router = express.Router();
const {
  createRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring,
} = require('../controllers/recurringExpenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getRecurring).post(createRecurring);
router.route('/:id').put(updateRecurring).delete(deleteRecurring);

module.exports = router;
