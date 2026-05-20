import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { analyticsApi } from '../api/endpoints';
import GlassCard from '../components/GlassCard';
import PieChartComponent from '../components/PieChartComponent';
import BarChartComponent from '../components/BarChartComponent';
import LineChartComponent from '../components/LineChartComponent';
import SmartInsight from '../components/SmartInsight';
import { SkeletonChart } from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';

// Small section header used across the analytics page
const SectionTitle = ({ icon: Icon, accent, title, subtitle }) => (
  <div className="mb-4 flex items-center gap-2.5">
    <div
      className="grid h-8 w-8 place-items-center rounded-xl text-white shadow-soft"
      style={{ background: accent }}
    >
      <Icon size={14} />
    </div>
    <div>
      <h3 className="font-semibold leading-tight">{title}</h3>
      {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
    </div>
  </div>
);

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
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Analytics</h2>
        <p className="text-sm text-ink-500">
          Deep dive into your spending patterns
        </p>
      </motion.div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassCard>
            <SectionTitle
              icon={PieChart}
              accent="#6366F1"
              title="Category breakdown"
              subtitle="Where your money went this month"
            />
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <SectionTitle
              icon={BarChart3}
              accent="#8B5CF6"
              title="Monthly comparison"
              subtitle="Last 6 months"
            />
            <BarChartComponent data={bar} height={300} />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <SectionTitle
              icon={TrendingUp}
              accent="#10B981"
              title="Daily spending trend"
              subtitle="This month"
            />
            <LineChartComponent data={line} height={320} />
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <SectionTitle
            icon={Sparkles}
            accent="#F59E0B"
            title="Insights & observations"
            subtitle="Auto-generated from your data"
          />
          <div className="grid gap-2.5 md:grid-cols-2">
            {insights.map((ins, i) => (
              <SmartInsight key={i} insight={ins} index={i} />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
