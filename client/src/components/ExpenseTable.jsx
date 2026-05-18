import { Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (!expenses.length) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-ink-200 p-12 text-center dark:border-ink-800">
        <div className="mb-2 text-3xl">💸</div>
        <h3 className="font-semibold">No expenses yet</h3>
        <p className="text-sm text-ink-500">Tap "Add expense" to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-ink-900/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200/60 text-left text-xs uppercase tracking-wider text-ink-500 dark:border-ink-800">
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Description</th>
            <th className="px-5 py-3 font-medium">Method</th>
            <th className="px-5 py-3 text-right font-medium">Amount</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, idx) => (
            <motion.tr
              key={e._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.015 }}
              className="border-b border-ink-200/40 transition-colors last:border-b-0 hover:bg-ink-50/60 dark:border-ink-800/50 dark:hover:bg-ink-800/30"
            >
              <td className="px-5 py-3 whitespace-nowrap text-ink-600 dark:text-ink-300">
                {formatDate(e.date)}
              </td>
              <td className="px-5 py-3">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: `${CATEGORY_COLORS[e.category]}1a`,
                    color: CATEGORY_COLORS[e.category],
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: CATEGORY_COLORS[e.category] }}
                  />
                  {e.category}
                </span>
              </td>
              <td className="px-5 py-3 max-w-xs truncate text-ink-700 dark:text-ink-200">
                {e.description || '—'}
              </td>
              <td className="px-5 py-3 text-xs text-ink-500">{e.paymentMethod}</td>
              <td className="px-5 py-3 text-right font-semibold">
                {formatCurrency(e.amount)}
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(e)}
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-200/60 dark:hover:bg-ink-700/60"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(e)}
                    className="grid h-8 w-8 place-items-center rounded-full text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
