/**
 * LineChartComponent
 * --------------------------------------------
 * Smooth Apple-Health-style spending trend line with soft gradient fill.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatShortDate } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/40 bg-white/90 px-4 py-2 text-xs shadow-glass backdrop-blur dark:border-white/10 dark:bg-ink-900/90">
      <div className="font-semibold">{formatShortDate(label)}</div>
      <div className="text-ink-500">{formatCurrency(payload[0].value)}</div>
    </div>
  );
};

export default function LineChartComponent({ data = [], height = 280 }) {
  if (!data.length) {
    return (
      <div className="grid h-64 place-items-center text-sm text-ink-500">
        No transactions in this period yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#10B981"
          strokeWidth={2.5}
          fill="url(#lineGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
