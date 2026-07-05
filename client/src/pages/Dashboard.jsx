import { useEffect, useMemo, useState, useCallback, lazy, Suspense, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../api/endpoints';
import { formatCurrency, formatDate, monthName } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';
import GlassCard from '../components/GlassCard';
import SmartInsight from '../components/SmartInsight';
import BudgetAlert from '../components/BudgetAlert';
import { SkeletonCard, SkeletonChart } from '../components/SkeletonLoader';
import AnimatedNumber from '../components/AnimatedNumber';
import AiInsights from '../components/AiInsights';
import { useAuth } from '../context/AuthContext';

// Recharts chunk is ~200 KB. Lazy-load the chart components so the
// dashboard skeleton + stat cards render immediately.
const PieChartComponent = lazy(() => import('../components/PieChartComponent'));
const LineChartComponent = lazy(() => import('../components/LineChartComponent'));

const ChartFallback = ({ height = 280 }) => (
  <div
    className="skeleton rounded-2xl"
    style={{ height: `${height}px` }}
    aria-label="Loading chart"
  />
);

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

const STATUS_ORDER = ['exceeded', 'warning', 'safe'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recent, setRecent] = useState([]);
  const [period, setPeriod] = useState(null); // { month, year, isCurrentMonth }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // ONE request for the whole dashboard — the server resolves the
      // active month (current, or the most recent month with data) and
      // returns stats, charts, budgets, recent txns, and insights together.
      const { data } = await analyticsApi.summary();
      setStats(data.stats);
      setPieData(data.categoryBreakdown || []);
      setLineData(data.dailyTrend || []);
      setInsights(data.insights || []);
      setBudgets(data.budgets || []);
      setRecent(data.recent || []);
      setPeriod({
        month: data.month,
        year: data.year,
        isCurrentMonth: data.isCurrentMonth,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortedBudgets = useMemo(
    () =>
      budgets
        .slice()
        .sort(
          (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
        )
        .slice(0, 4),
    [budgets]
  );

  // ---- Loading ----
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
        <p className="text-center text-xs text-ink-400">
          Loading your dashboard… the free-tier server may take up to ~30s to
          wake on the first request.
        </p>
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral-100 text-coral-600 dark:bg-coral-900/40 dark:text-coral-300">
            <AlertTriangle size={28} />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Couldn't load your data</h3>
          <p className="mt-1 text-sm text-ink-500">
            The server may still be waking up. Give it a moment and try again.
          </p>
          <button onClick={load} className="btn-primary mx-auto mt-4">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Empty (account has no expenses at all) ----
  const isEmpty = (stats?.transactionCount || 0) === 0 && recent.length === 0;
  if (isEmpty) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Hello {user?.name?.split(' ')[0]} 👋
        </h2>
        <GlassCard className="grid place-items-center !p-12 text-center">
          <div className="mb-3 text-4xl">💸</div>
          <h3 className="text-lg font-semibold">No transactions yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Add your first expense and your dashboard — stats, charts, budgets,
            and AI insights — will come to life.
          </p>
          <Link to="/app/expenses" className="btn-primary mt-5">
            <PlusCircle size={16} /> Add your first expense
          </Link>
        </GlassCard>
      </div>
    );
  }

  const positive = (stats?.netCashflow || 0) >= 0;
  const showingPast = period && !period.isCurrentMonth;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-baseline justify-between gap-2"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Hello {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-ink-500">
            {showingPast
              ? 'Here’s your most recent activity.'
              : 'Here’s your money snapshot for this month.'}
          </p>
        </div>
        {period && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              showingPast
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-iris-50 text-iris-600 dark:bg-iris-950/40 dark:text-iris-300'
            }`}
            title={
              showingPast
                ? 'No activity in the current month yet — showing your latest active month.'
                : undefined
            }
          >
            {monthName(period.month)} {period.year}
          </span>
        )}
      </motion.div>

      {/* Stat cards */}
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
          sub={showingPast ? `${monthName(period.month)}` : 'This month'}
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

      {/* Charts row */}
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

      {/* AI panel — insights + chat, grounded in the user's own data */}
      <AiInsights />

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
