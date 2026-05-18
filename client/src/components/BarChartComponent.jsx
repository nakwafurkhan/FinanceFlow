/**
 * BarChartComponent
 * --------------------------------------------
 * Monthly trend — rounded bars in a soft indigo gradient.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency, monthName } from '../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-2xl border border-white/40 bg-white/90 px-4 py-2 text-xs shadow-glass backdrop-blur dark:border-white/10 dark:bg-ink-900/90">
      <div className="font-semibold">
        {monthName(d.month)} {d.year}
      </div>
      <div className="text-ink-500">{formatCurrency(d.total)}</div>
    </div>
  );
};

export default function BarChartComponent({ data = [], height = 280 }) {
  if (!data.length) {
    return (
      <div className="grid h-64 place-items-center text-sm text-ink-500">
        Not enough months of data yet.
      </div>
    );
  }
  const formatted = data.map((d) => ({
    ...d,
    label: monthName(d.month).slice(0, 3),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formatted} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Bar dataKey="total" radius={[12, 12, 4, 4]}>
          {formatted.map((_, i) => (
            <Cell key={i} fill="url(#barGrad)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
