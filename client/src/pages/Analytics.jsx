import { useEffect, useState } from 'react';
import { analyticsApi } from '../api/endpoints';
import GlassCard from '../components/GlassCard';
import PieChartComponent from '../components/PieChartComponent';
import BarChartComponent from '../components/BarChartComponent';
import LineChartComponent from '../components/LineChartComponent';
import SmartInsight from '../components/SmartInsight';
import { SkeletonChart } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

export default function Analytics() {
  const [pie, setPie] = useState([]);
  const [bar, setBar] = useState([]);
  const [line, setLine] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, b, l, i] = await Promise.all([
          analyticsApi.categoryBreakdown(),
          analyticsApi.monthlyTrend({ months: 6 }),
          analyticsApi.dailyTrend(),
          analyticsApi.insights(),
        ]);
        setPie(p.data.data);
        setBar(b.data.data);
        setLine(l.data.data);
        setInsights(i.data.insights);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
        <SkeletonChart />
        <SkeletonChart />
      </div>
    );
  }

  const total = pie.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Analytics</h2>
        <p className="text-sm text-ink-500">
          Deep dive into your spending patterns
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 font-semibold">Category breakdown</h3>
          <PieChartComponent data={pie} height={300} />
          <div className="mt-4 space-y-1.5 text-sm">
            {pie.map((p) => {
              const pct = total ? Math.round((p.total / total) * 100) : 0;
              return (
                <div key={p.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: CATEGORY_COLORS[p.category] }}
                    />
                    <span className="text-ink-700 dark:text-ink-200">{p.category}</span>
                  </div>
                  <div className="text-ink-500">
                    {formatCurrency(p.total)} · {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 font-semibold">Monthly comparison</h3>
          <BarChartComponent data={bar} height={300} />
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-3 font-semibold">Daily spending trend (this month)</h3>
          <LineChartComponent data={line} height={320} />
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="mb-3 font-semibold">Insights & observations</h3>
        <div className="grid gap-2.5 md:grid-cols-2">
          {insights.map((ins, i) => (
            <SmartInsight key={i} insight={ins} index={i} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
