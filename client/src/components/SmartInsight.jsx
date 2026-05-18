import { motion } from 'framer-motion';
import { clsx } from '../utils/cx';

const toneClass = {
  positive: 'border-emerald-500/30 bg-emerald-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  danger: 'border-red-500/30 bg-red-500/5',
  neutral: 'border-indigo-500/20 bg-indigo-500/5',
};

export default function SmartInsight({ insight, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={clsx(
        'flex items-start gap-3 rounded-2xl border p-4 backdrop-blur',
        toneClass[insight.tone] || toneClass.neutral
      )}
    >
      <div className="text-2xl leading-none">{insight.icon}</div>
      <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
        {insight.message}
      </p>
    </motion.div>
  );
}
