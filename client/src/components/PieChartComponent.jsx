/**
 * PieChartComponent
 * --------------------------------------------
 * Apple-style minimal donut chart. We use Recharts because it ships
 * with built-in animations and tooltips — perfect for viva polish.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-2xl border border-white/40 bg-white/90 px-4 py-2 text-xs shadow-glass backdrop-blur dark:border-white/10 dark:bg-ink-900/90">
      <div className="font-semibold">{d.category}</div>
      <div className="text-ink-500">{formatCurrency(d.total)}</div>
    </div>
  );
};

export default function PieChartComponent({ data = [], height = 280 }) {
  if (!data.length) {
    return (
      <div className="grid h-64 place-items-center text-sm text-ink-500">
        No data yet — add some expenses to see your breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={CATEGORY_COLORS[entry.category] || '#94A3B8'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
