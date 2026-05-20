import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

/**
 * BudgetCard
 * --------------------------------------------------------------
 * One card per category. Shows spent/limit, a progress bar with
 * a tone (green/amber/red) based on the budget's status.
 *
 * Memoised because the parent Budgets page renders many of these
 * in a grid; we don't want re-rendering one to trigger re-render
 * of all the others.
 */
function BudgetCard({ budget, onDelete }) {
  const tone = {
    safe: 'bg-mint-500',
    warning: 'bg-amber-500',
    exceeded: 'bg-coral-500',
  }[budget.status];

  return (
    <motion.div whileHover={{ y: -2 }} className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl text-sm font-semibold text-white"
            style={{ background: CATEGORY_COLORS[budget.category] }}
          >
            {budget.category[0]}
          </div>
          <div>
            <div className="font-semibold">{budget.category}</div>
            <div className="text-xs text-ink-500">
              {formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete?.(budget)}
          className="text-coral-400 hover:text-coral-500 transition-colors"
          aria-label={`Delete ${budget.category} budget`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-ink-500">{budget.percentUsed}% used</span>
          <span className="font-medium">
            {formatCurrency(Math.max(0, budget.remaining))} left
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200/60 dark:bg-ink-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, budget.percentUsed)}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${tone}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default memo(BudgetCard);
