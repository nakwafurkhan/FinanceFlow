/**
 * pages/Landing.jsx
 * --------------------------------------------------------------
 * The public homepage at "/". Rebuilt from the "Lumen" editorial sketch,
 * mapped onto FinanceFlow's own stack:
 *   - React + Framer Motion (reveal-on-scroll, count-ups, path draws) instead
 *     of the sketch's raw IntersectionObserver + CSS keyframes.
 *   - Our Tailwind design tokens (iris / violet / mint / coral / amber / ink)
 *     and utility classes (glass-card, btn-primary, btn-ghost) — no hardcoded
 *     one-off palettes.
 *   - Our <Logo/> component + lucide-react icons.
 *   - Real product content (₹ currency, live demo creds, the AI feature).
 *
 * The one added global token is the "Instrument Serif" accent font (added to
 * index.html + tailwind fontFamily.serif) — the project had no serif face and
 * the italic-serif accent is central to this design's hierarchy.
 *
 * Fully responsive, dark-mode aware, and reduced-motion safe.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Check,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Github,
  ShoppingBag,
  Database,
  Server,
  Code2,
  Cpu,
} from 'lucide-react';
import Logo from '../components/Logo';
import AmbientOrbs from '../components/AmbientOrbs';

/* ----------------------------------------------------------------
   Small motion helpers (framer-motion — already a project dependency)
   ---------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1];

function Reveal({ children, delay = 0, className = '', y = 28 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Count-up number that fires when scrolled into view; respects reduced motion.
function Counter({ to, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setVal(to);
      return undefined;
    }
    let raf;
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to]);

  const shown = decimals
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString('en-IN');

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ----------------------------------------------------------------
   Hero dashboard mockup (glass panel)
   ---------------------------------------------------------------- */
const BAR_HEIGHTS = [40, 65, 50, 85, 72, 90, 58];

function HeroMockup() {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      {/* spinning ring caption */}
      {!reduce && (
        <motion.div
          className="absolute -right-4 -top-8 hidden h-20 w-20 opacity-70 sm:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <path
                id="ff-ring"
                d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              />
            </defs>
            <text
              fontSize="9"
              className="fill-ink-500 dark:fill-ink-400"
              letterSpacing="2.5"
            >
              <textPath href="#ff-ring">
                MERN · PWA · AI · MERN · PWA · AI ·
              </textPath>
            </text>
          </svg>
        </motion.div>
      )}

      <motion.div
        className="glass-card p-5"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
      >
        {/* top bar */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-500">This month · balance</div>
            <div className="text-2xl font-semibold tracking-tight">
              ₹<Counter to={34764} />
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-coral-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-mint-500" />
          </div>
        </div>

        {/* bar chart */}
        <div className="mb-3 rounded-2xl border border-ink-200/50 bg-white/70 p-4 dark:border-white/5 dark:bg-ink-900/40">
          <div className="flex h-32 items-end justify-between gap-1.5">
            {BAR_HEIGHTS.map((h, i) => (
              <motion.div
                key={i}
                className={`w-full rounded-t ${
                  i === 3
                    ? 'bg-gradient-to-t from-mint-600 to-mint-300'
                    : 'bg-gradient-to-t from-iris-600 to-iris-400'
                }`}
                style={{ transformOrigin: 'bottom' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, height: `${h}%` }}
                transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.05 }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium text-ink-400">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>

        {/* budget ring + categories */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-200/50 bg-white/70 p-4 dark:border-white/5 dark:bg-ink-900/40">
            <div className="relative">
              <svg width="84" height="84" viewBox="0 0 100 100" className="-rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  className="stroke-ink-200 dark:stroke-ink-700"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  className="stroke-iris-500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  whileInView={{ strokeDashoffset: 62.8 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold">75%</div>
                <div className="text-[10px] text-ink-500">of ₹8,000</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-ink-500">Food budget</div>
          </div>

          <div className="space-y-2.5 rounded-2xl border border-ink-200/50 bg-white/70 p-4 dark:border-white/5 dark:bg-ink-900/40">
            <div className="label mb-1">Top categories</div>
            {[
              ['Bills', 'bg-iris-500', '10,359'],
              ['Travel', 'bg-violet-500', '5,222'],
              ['Shopping', 'bg-amber-500', '2,992'],
              ['Food', 'bg-mint-500', '707'],
            ].map(([name, dot, amt]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {name}
                </div>
                <span className="font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ₹{amt}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* transaction row */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-ink-200/50 bg-white/70 p-3 dark:border-white/5 dark:bg-ink-900/40">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-coral-500/15 text-coral-500">
            <ShoppingBag size={16} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium">Groceries</div>
            <div className="text-[10px] text-ink-500">Today · 2:14 PM</div>
          </div>
          <div className="text-sm font-semibold text-coral-500">−₹4,500</div>
        </div>
      </motion.div>

      {/* floating chip */}
      <motion.div
        className="glass-card absolute -left-6 bottom-16 hidden items-center gap-3 !rounded-2xl px-4 py-3 sm:flex"
        animate={reduce ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="grid h-8 w-8 place-items-center rounded-full bg-mint-500/20 text-mint-600">
          <Check size={14} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[10px] text-ink-500">Saving 60% this month</div>
          <div className="text-xs font-semibold">On track</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Data
   ---------------------------------------------------------------- */
const FEATURES = [
  {
    icon: TrendingUp,
    tint: 'bg-mint-500/15 text-mint-600',
    title: 'Expense tracking, effortless',
    body: 'Log transactions in seconds — categorised, searchable, filterable, and paginated so it stays fast even with thousands of entries.',
    tags: ['Filters & search', 'CSV + PDF export'],
  },
  {
    icon: PieChart,
    tint: 'bg-coral-500/15 text-coral-600',
    title: 'Monthly budgets that flex',
    body: 'Set a cap per category and see safe / warning / exceeded states at a glance, with gentle nudges before you overspend — not after.',
    tags: ['Smart alerts', 'Per-category'],
  },
  {
    icon: Sparkles,
    tint: 'bg-iris-500/15 text-iris-600',
    title: 'AI that understands your money',
    body: 'Ask “where is most of my money going?” and get answers grounded in your real data, plus auto-generated insight cards on the dashboard.',
    tags: ['Grounded, not guessed', 'Chat + insights'],
  },
];

const CHECKLIST = [
  ['Analytics dashboard', 'Pie, bar, and area charts that update as you spend.'],
  ['Recurring & savings', 'Track subscriptions and watch savings-goal rings fill.'],
  ['Dark mode + PWA', 'System-aware theming, installable on any device.'],
];

const STACK = [
  { letter: 'M', name: 'MongoDB', sub: 'Document store', icon: Database },
  { letter: 'E', name: 'Express', sub: 'REST API layer', icon: Server },
  { letter: 'R', name: 'React', sub: 'UI runtime', icon: Code2 },
  { letter: 'N', name: 'Node.js', sub: 'Server runtime', icon: Cpu },
];

const MARQUEE = [
  'Track expenses',
  'Set budgets',
  'Visualise money',
  'AI insights',
  'MongoDB',
  'Express',
  'React',
  'Node',
  'Installable PWA',
];

/* ----------------------------------------------------------------
   Page
   ---------------------------------------------------------------- */
export default function Landing() {
  const reduce = useReducedMotion();

  return (
    <div className="relative overflow-x-hidden">
      <AmbientOrbs intense />

      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-5">
        <nav className="glass-card mx-auto flex max-w-7xl items-center justify-between !rounded-full px-4 py-2.5 md:px-6">
          <Link to="/" className="flex items-center">
            <Logo withName size={30} />
          </Link>
          <div className="hidden items-center gap-8 text-sm text-ink-600 dark:text-ink-300 md:flex">
            <a href="#features" className="transition-colors hover:text-ink-900 dark:hover:text-white">Features</a>
            <a href="#dashboard" className="transition-colors hover:text-ink-900 dark:hover:text-white">Dashboard</a>
            <a href="#stack" className="transition-colors hover:text-ink-900 dark:hover:text-white">Built with</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm text-ink-600 transition hover:bg-ink-200/60 dark:text-ink-300 dark:hover:bg-ink-800/60 sm:inline-block"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 flex min-h-screen flex-col justify-center px-6 pb-20 pt-32 md:px-10">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="mb-7 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-500" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-500">
                New · AI-powered insights
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-[44px] font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                Personal finance,
                <br />
                made{' '}
                <span className="font-serif italic font-normal text-ink-400">
                  beautiful.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                Track expenses, set monthly budgets, and understand your money on
                an Apple-inspired dashboard — now with an{' '}
                <span className="font-medium text-ink-900 dark:text-white">
                  AI assistant
                </span>{' '}
                that answers questions about your spending. Built end-to-end on
                the MERN stack and installable as a PWA.
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/register" className="btn-primary !px-6 !py-3.5">
                  Start tracking free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="btn-ghost border border-ink-300/60 !px-6 !py-3.5 dark:border-ink-700"
                >
                  <Play size={14} />
                  Try the live demo
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-12 flex items-center gap-8 text-sm text-ink-500">
                <div>
                  <div className="text-2xl font-semibold text-ink-900 dark:text-white">
                    <Counter to={8} />
                  </div>
                  <div className="mt-1">Spending categories</div>
                </div>
                <div className="h-10 w-px bg-ink-900/10 dark:bg-white/10" />
                <div>
                  <div className="text-2xl font-semibold text-ink-900 dark:text-white">
                    <Counter to={3} />
                  </div>
                  <div className="mt-1">Chart types</div>
                </div>
                <div className="h-10 w-px bg-ink-900/10 dark:bg-white/10" />
                <div>
                  <div className="text-2xl font-semibold text-ink-900 dark:text-white">
                    <Counter to={100} suffix="%" />
                  </div>
                  <div className="mt-1">Free &amp; open source</div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative z-10 overflow-hidden border-y border-ink-900/10 bg-white/40 py-8 dark:border-white/10 dark:bg-ink-900/30">
        <motion.div
          className="flex gap-16 whitespace-nowrap font-serif text-2xl italic text-ink-400"
          animate={reduce ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i} className="flex items-center gap-16">
              {word}
              <span aria-hidden>·</span>
            </span>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 px-6 py-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-3xl">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-500">
              Why FinanceFlow
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Built for the way you{' '}
              <span className="font-serif italic font-normal text-ink-400">actually</span>{' '}
              spend.
            </h2>
            <p className="mt-5 text-lg text-ink-600 dark:text-ink-300">
              A finance dashboard that feels like a native app — because it can be
              one. Install it, open it, and your money is right there.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="glass-card glass-card-hover h-full p-7">
                  <div className={`mb-6 grid h-12 w-12 place-items-center rounded-2xl ${f.tint}`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {f.body}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-1.5 text-xs">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-ink-900/5 px-2 py-1 dark:bg-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE */}
      <section id="dashboard" className="relative z-10 px-6 py-28 md:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-500">
                The dashboard
              </div>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Your money,{' '}
                <span className="font-serif italic font-normal text-ink-400">
                  at a glance.
                </span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                Every screen is designed to disappear. Big numbers where they
                matter, soft transitions where they don't. It's finance that
                doesn't feel like finance.
              </p>
            </Reveal>

            <ul className="mt-8 space-y-4">
              {CHECKLIST.map(([title, sub], i) => (
                <Reveal key={title} delay={0.1 + i * 0.1}>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-gradient-brand text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <div>
                      <div className="font-medium">{title}</div>
                      <div className="text-sm text-ink-600 dark:text-ink-400">{sub}</div>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.15}>
              <div className="relative">
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-iris-500/20 to-violet-500/20 blur-2xl" />
                <div className="glass-card relative p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-ink-500">Net saved this year</div>
                      <div className="text-4xl font-semibold tracking-tight">
                        ₹<Counter to={148200} />
                      </div>
                      <div className="mt-1 text-xs font-medium text-mint-600">
                        ↑ 18% vs last year
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-full bg-gradient-brand px-3 py-1.5 text-white">1Y</span>
                      <span className="rounded-full px-3 py-1.5 text-ink-500">6M</span>
                      <span className="rounded-full px-3 py-1.5 text-ink-500">1M</span>
                    </div>
                  </div>

                  {/* animated line chart */}
                  <svg viewBox="0 0 400 160" className="h-40 w-full">
                    <defs>
                      <linearGradient id="ff-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0,120 C40,100 60,60 100,70 C140,80 160,40 200,50 C240,60 260,30 300,35 C340,40 360,20 400,25 L400,160 L0,160 Z"
                      fill="url(#ff-fill)"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                    <motion.path
                      d="M0,120 C40,100 60,60 100,70 C140,80 160,40 200,50 C240,60 260,30 300,35 C340,40 360,20 400,25"
                      fill="none"
                      className="stroke-iris-500"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, ease: EASE, delay: 0.4 }}
                    />
                  </svg>

                  <div className="mt-6 grid grid-cols-4 gap-3">
                    {[
                      ['Income', '₹55,000'],
                      ['Spent', '₹20,236'],
                      ['Saved', '₹34,764', 'text-mint-600'],
                      ['Budgets', '8'],
                    ].map(([label, value, cls]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-ink-200/50 bg-white/60 p-3 dark:border-white/5 dark:bg-ink-900/40"
                      >
                        <div className="text-[10px] text-ink-500">{label}</div>
                        <div className={`mt-1 text-base font-semibold ${cls || ''}`}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="relative z-10 px-6 py-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-500">
              Engineered to last
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Built end-to-end on the{' '}
              <span className="font-serif italic font-normal">MERN</span> stack.
            </h2>
            <p className="mt-5 text-lg text-ink-600 dark:text-ink-300">
              A modern codebase from database to UI — installable as a PWA, with a
              provider-agnostic AI layer running on Llama 3.3 70B via Groq.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STACK.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.1}>
                <div className="glass-card glass-card-hover p-7 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                    <s.icon size={20} />
                  </div>
                  <div className="text-3xl font-semibold tracking-tight">{s.letter}</div>
                  <div className="mt-1 text-sm font-medium">{s.name}</div>
                  <div className="mt-1 text-xs text-ink-500">{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [Smartphone, 'Installable PWA', 'Add to home screen, open like an app'],
              [ShieldCheck, 'JWT + bcrypt auth', 'Passwords hashed, sessions signed'],
              [Sparkles, 'AI insights', 'Grounded answers about your spending'],
            ].map(([Icon, title, sub], i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="glass-card flex items-center gap-4 !rounded-2xl p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs text-ink-500">{sub}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10 px-6 py-28 md:px-10">
        <Reveal className="mx-auto max-w-5xl">
          <div className="glass-card relative overflow-hidden !rounded-[40px] p-10 text-center md:p-16">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-mint-500/40 to-transparent blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-iris-500/40 to-transparent blur-2xl" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-500">
                <span className="h-px w-8 bg-ink-400" />
                Free forever
                <span className="h-px w-8 bg-ink-400" />
              </div>
              <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Start making your money
                <br />
                <span className="font-serif italic font-normal">make sense.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-ink-600 dark:text-ink-300">
                Create a free account, or jump straight into the live demo — no
                signup, real seeded data, working AI assistant.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/register" className="btn-primary !px-6 !py-3.5">
                  Create free account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="btn-ghost border border-ink-300/60 !px-6 !py-3.5 dark:border-ink-700"
                >
                  Try the demo
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Check size={12} strokeWidth={2.5} /> No card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={12} strokeWidth={2.5} /> demo@financeflow.app / demo1234
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <Check size={12} strokeWidth={2.5} /> Installable PWA
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-ink-900/10 px-6 py-12 dark:border-white/10 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo withName size={26} />
            <span className="ml-2 text-xs text-ink-400">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-ink-500">
            <Link to="/login" className="transition hover:text-ink-900 dark:hover:text-white">
              Sign in
            </Link>
            <a
              href="https://github.com/nakwafurkhan/FinanceFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition hover:text-ink-900 dark:hover:text-white"
            >
              <Github size={14} /> GitHub
            </a>
          </div>
          <div className="text-xs text-ink-400">
            Built by{' '}
            <a
              href="https://github.com/nakwafurkhan"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-iris-600 hover:underline dark:text-iris-400"
            >
              Nakwa Furkhan
            </a>{' '}
            · MERN + PWA
          </div>
        </div>
      </footer>
    </div>
  );
}
