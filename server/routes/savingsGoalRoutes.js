const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  updateGoal,
  contributeToGoal,
  deleteGoal,
} = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
router.post('/:id/contribute', contributeToGoal);

module.exports = router;
