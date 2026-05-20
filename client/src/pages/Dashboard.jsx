import { useEffect, useMemo, useState, lazy, Suspense, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { analyticsApi, expenseApi, budgetApi } from '../api/endpoints';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';
import GlassCard from '../components/GlassCard';
import SmartInsight from '../components/SmartInsight';
import BudgetAlert from '../components/BudgetAlert';
import { SkeletonCard, SkeletonChart } from '../components/SkeletonLoader';
import AnimatedNumber from '../components/AnimatedNumber';
import { useAuth } from '../context/AuthContext';

// Recharts chunk is ~200 KB. Lazy-load the chart components so the
// dashboard skeleton + stat cards render immediately, then charts pop
// in once their JS arrives. The user perceives faster first paint.
const PieChartComponent = lazy(() => import('../components/PieChartComponent'));
const LineChartComponent = lazy(() => import('../components/LineChartComponent'));

const ChartFallback = ({ height = 280 }) => (
  <div
    className="skeleton rounded-2xl"
    style={{ height: `${height}px` }}
    aria-label="Loading chart"
  />
);

// ----------------------------------------------------------
// StatCard — memoised so changing one card's value doesn't
// re-render the other three.
// ----------------------------------------------------------
const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  formatter,
  accent,
  sub,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard className="!p-5">
        <div className="flex items-center justify-between">
          <span className="label">{label}</span>
          <div
            className="grid h-9 w-9 place-items-center rounded-2xl text-white shadow-soft"
            style={{ background: accent }}
          >
            <Icon size={16} />
          </div>
        </div>
        <div className="stat-number mt-3">
          {typeof value === 'number' && formatter ? (
            <AnimatedNumber value={value} formatter={formatter} />
          ) : (
            value
          )}
        </div>
        {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
      </GlassCard>
    </motion.div>
  );
});

// Pre-defined ordering for budget status — captured outside the
// component so the sort comparator is referentially stable.
const STATUS_ORDER = ['exceeded', 'warning', 'safe'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, c, l, i, b, e] = await Promise.all([
          analyticsApi.dashboard(),
          analyticsApi.categoryBreakdown(),
          analyticsApi.dailyTrend(),
          analyticsApi.insights(),
          budgetApi.list(),
          expenseApi.list({ limit: 5 }),
        ]);
        setStats(d.data.stats);
        setPieData(c.data.data);
        setLineData(l.data.data);
        setInsights(i.data.insights);
        setBudgets(b.data.budgets);
        setRecent(e.data.expenses);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Memo so the budgets array is only re-sorted when budgets actually
  // change (not on every render the dashboard does for unrelated state).
  const sortedBudgets = useMemo(
    () =>
      budgets
        .slice()
        .sort(
          (a, b) =>
            STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
        )
        .slice(0, 4),
    [budgets]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  const positive = (stats?.netCashflow || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-baseline justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Hello {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-ink-500">
            Here's your money snapshot for this month.
          </p>
        </div>
      </motion.div>

      {/* Stat cards — each animates in with stagger, numbers count up */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CreditCard}
          label="Total spent"
          value={stats?.totalSpent || 0}
          formatter={formatCurrency}
          sub={`${stats?.transactionCount || 0} transactions`}
          accent="#6366F1"
          delay={0.05}
        />
        <StatCard
          icon={Wallet}
          label="Total income"
          value={stats?.totalIncome || 0}
          formatter={formatCurrency}
          sub="This month"
          accent="#10B981"
          delay={0.1}
        />
        <StatCard
          icon={positive ? TrendingUp : TrendingDown}
          label="Net cashflow"
          value={stats?.netCashflow || 0}
          formatter={formatCurrency}
          sub={positive ? 'Saving money' : 'Spending more than earned'}
          accent={positive ? '#10B981' : '#F43F5E'}
          delay={0.15}
        />
        <StatCard
          icon={Sparkles}
          label="Top category"
          value={stats?.highestCategory?.name || '—'}
          sub={
            stats?.highestCategory
              ? formatCurrency(stats.highestCategory.amount)
              : 'No data yet'
          }
          accent="#F59E0B"
          delay={0.2}
        />
      </div>

      {/* Charts row — lazy-loaded so the rest of the dashboard renders
          immediately. Skeleton placeholders hold the layout in place. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Spending trend</h3>
              <p className="text-xs text-ink-500">Daily totals this month</p>
            </div>
          </div>
          <Suspense fallback={<ChartFallback height={280} />}>
            <LineChartComponent data={lineData} />
          </Suspense>
        </GlassCard>

        <GlassCard>
          <div className="mb-3">
            <h3 className="font-semibold">By category</h3>
            <p className="text-xs text-ink-500">Where your money went</p>
          </div>
          <Suspense fallback={<ChartFallback height={280} />}>
            <PieChartComponent data={pieData} />
          </Suspense>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {pieData.slice(0, 6).map((p) => (
              <div key={p.category} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[p.category] }}
                />
                <span className="text-ink-600 dark:text-ink-300">{p.category}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Insights + budgets + recent */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-iris-500" />
            <h3 className="font-semibold">Smart insights</h3>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 4).map((ins, i) => (
              <SmartInsight key={i} insight={ins} index={i} />
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 font-semibold">Budget status</h3>
          <div className="space-y-2.5">
            {sortedBudgets.length ? (
              sortedBudgets.map((b) => <BudgetAlert key={b._id} budget={b} />)
            ) : (
              <p className="text-sm text-ink-500">
                Set up monthly budgets to track spending.
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 font-semibold">Recent transactions</h3>
          <div className="space-y-1">
            {recent.length ? (
              recent.map((e, i) => (
                <motion.div
                  key={e._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-ink-100/50 dark:hover:bg-ink-800/30"
                >
                  <div
                    className="grid h-9 w-9 place-items-center rounded-2xl text-xs font-semibold text-white"
                    style={{ background: CATEGORY_COLORS[e.category] }}
                  >
                    {e.category[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {e.description || e.category}
                    </div>
                    <div className="text-xs text-ink-500">{formatDate(e.date)}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(e.amount)}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-ink-500">No transactions yet.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
