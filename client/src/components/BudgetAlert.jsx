import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function BudgetAlert({ budget }) {
  const config = {
    safe: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      label: 'On track',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'Warning',
    },
    exceeded: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Over budget',
    },
  }[budget.status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 rounded-2xl ${config.bg} p-4`}>
      <Icon className={config.color} size={20} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{budget.category}</div>
        <div className="text-xs text-ink-500">
          {formatCurrency(budget.spent)} of {formatCurrency(budget.monthlyLimit)} ·{' '}
          {budget.percentUsed}% used
        </div>
      </div>
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
