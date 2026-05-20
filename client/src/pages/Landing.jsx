/**
 * pages/Landing.jsx
 * --------------------------------------------------------------
 * The public homepage at /. Built for first impressions:
 *
 *   - Sticky glass nav with logo + sign-in CTA
 *   - Hero with animated gradient-mesh background + dual CTA
 *   - Demo-credentials callout (one-click try-the-app)
 *   - Features grid (8 cards, hover-lift)
 *   - Visual showcase (dashboard / analytics / mobile)
 *   - Tech stack strip
 *   - AI Coming Soon teaser (sparkle animation)
 *   - Footer
 *
 * All scroll-triggered animations use Framer Motion's `whileInView`
 * with `viewport={{ once: true, margin: '-100px' }}` so motion fires
 * once just before the section enters view.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  PieChart,
  LineChart,
  Target,
  Repeat,
  Download,
  Moon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Github,
  Copy,
  Smartphone,
  Zap,
  Lock,
} from 'lucide-react';
import Logo from '../components/Logo';

// ----------------------------------------------------------
// Motion presets
// ----------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// ----------------------------------------------------------
// Features list (matches README + signed-in app capabilities)
// ----------------------------------------------------------
const features = [
  {
    icon: Wallet,
    title: 'Expense management',
    desc: 'Full CRUD with category, date, payment method. Filters, search, server-side pagination.',
    accent: 'iris',
  },
  {
    icon: Target,
    title: 'Monthly budgets',
    desc: 'Set a target per category. Track spent vs remaining with safe / warning / exceeded states.',
    accent: 'mint',
  },
  {
    icon: PieChart,
    title: 'Smart analytics',
    desc: 'Three chart types powered by MongoDB aggregation pipelines — pie, bar, and area.',
    accent: 'violet',
  },
  {
    icon: LineChart,
    title: 'Income tracking',
    desc: 'Log salary, freelance, refunds. See net cashflow at a glance on your dashboard.',
    accent: 'mint',
  },
  {
    icon: Target,
    title: 'Savings goals',
    desc: 'Visual progress bars and contribution tracking for the things you are saving toward.',
    accent: 'iris',
  },
  {
    icon: Repeat,
    title: 'Recurring expenses',
    desc: 'Netflix, rent, subscriptions. Set it once, see it every month.',
    accent: 'amber',
  },
  {
    icon: Download,
    title: 'CSV + PDF export',
    desc: 'Take your data with you. Polished PDF reports for tax season or budget reviews.',
    accent: 'violet',
  },
  {
    icon: Moon,
    title: 'Dark mode + PWA',
    desc: 'System-aware dark mode. Installable on iOS, Android, macOS, and Windows.',
    accent: 'iris',
  },
];

// ----------------------------------------------------------
// Tech stack pills
// ----------------------------------------------------------
const techStack = [
  'React 18',
  'Vite 5',
  'Tailwind CSS',
  'Framer Motion',
  'Recharts',
  'Node.js',
  'Express',
  'MongoDB Atlas',
  'Mongoose',
  'JWT',
  'bcrypt',
  'PWA',
];

// ----------------------------------------------------------
// Page
// ----------------------------------------------------------
export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-50 overflow-x-hidden">
      {/* ============================================================
          NAV
         ============================================================ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo withName size={32} />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-ink-700 dark:text-ink-200 hover:text-iris-600 dark:hover:text-iris-300 transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full bg-gradient-brand text-white shadow-glow hover:shadow-glow-lg transition-shadow"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO
         ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Animated gradient mesh */}
        <div
          className="absolute inset-0 bg-gradient-mesh animate-gradient-shift"
          style={{ backgroundSize: '200% 200%' }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-brand-soft border border-iris-200 dark:border-iris-800/50 text-iris-700 dark:text-iris-300 text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                AI-powered insights coming soon
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              Personal finance,
              <br />
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                made beautiful.
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-ink-600 dark:text-ink-300 max-w-2xl mx-auto leading-relaxed"
            >
              Track expenses, set monthly budgets, and visualise your money with
              an Apple-inspired dashboard. Built end-to-end on the MERN stack
              and installable as a PWA.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-brand text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Try the live demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 font-semibold hover:bg-white dark:hover:bg-ink-800 transition"
              >
                Create free account
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-sm text-ink-500 dark:text-ink-400"
            >
              No credit card. Demo data preloaded. Works offline.
            </motion.p>
          </motion.div>

          {/* Hero showcase — gradient-bordered card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 lg:mt-20 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl bg-gradient-brand p-[1.5px] shadow-glow-lg">
              <div className="rounded-3xl bg-white dark:bg-ink-900 overflow-hidden">
                {/* Replace with a real dashboard screenshot when available */}
                <div className="aspect-[16/9] bg-gradient-to-br from-ink-50 via-white to-iris-50/30 dark:from-ink-900 dark:via-ink-900 dark:to-iris-950/30 flex items-center justify-center">
                  <div className="text-center px-8">
                    <Logo size={56} />
                    <p className="mt-4 text-ink-500 dark:text-ink-400 text-sm">
                      Your dashboard screenshot will appear here
                    </p>
                    <p className="text-ink-400 dark:text-ink-500 text-xs mt-1">
                      Drop it at client/public/screenshots/dashboard.png
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative glow blobs */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-iris-400/30 blur-3xl -z-10" />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-violet-400/30 blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          DEMO CREDENTIALS CALLOUT
         ============================================================ */}
      <section className="py-12 px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-iris-50 via-white to-violet-50 dark:from-iris-950/40 dark:via-ink-900 dark:to-violet-950/40 p-6 lg:p-8 border border-iris-200/60 dark:border-iris-800/40 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold">Try it instantly — no signup needed</h3>
                <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                  The seeded demo account has a full month of sample expenses, budgets, and income loaded.
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <CredentialRow label="Email" value="demo@financeflow.app" />
                  <CredentialRow label="Password" value="demo1234" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          FEATURES GRID
         ============================================================ */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-iris-600 dark:text-iris-400 text-sm font-semibold uppercase tracking-wider"
            >
              Everything you need
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              Built for the way you actually <span className="bg-gradient-brand bg-clip-text text-transparent">spend</span>.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-ink-600 dark:text-ink-300"
            >
              Eight focused features. No bloat, no upsells.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group p-6 rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 hover:border-iris-200 dark:hover:border-iris-800 hover:shadow-glow transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${accentClass(f.accent)}`}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          VISUAL SHOWCASE
         ============================================================ */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-gradient-to-b from-white via-iris-50/30 to-white dark:from-ink-950 dark:via-iris-950/20 dark:to-ink-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              Beautiful on every screen.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-ink-600 dark:text-ink-300"
            >
              Pixel-perfect light and dark themes. Installable as a PWA.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {[
              { title: 'Dashboard', icon: LineChart, path: '/screenshots/dashboard.png' },
              { title: 'Analytics', icon: PieChart, path: '/screenshots/analytics.png' },
              { title: 'Mobile / PWA', icon: Smartphone, path: '/screenshots/mobile.png' },
            ].map((s) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="rounded-2xl bg-white dark:bg-ink-900 p-1 shadow-soft hover:shadow-glow transition-shadow"
              >
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-ink-50 to-iris-50/40 dark:from-ink-800 dark:to-iris-950/40 flex items-center justify-center">
                  <s.icon className="w-12 h-12 text-iris-500/60" />
                </div>
                <p className="text-center py-3 font-medium">{s.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          AI COMING SOON
         ============================================================ */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl bg-gradient-brand p-8 lg:p-12 overflow-hidden shadow-glow-lg">
            {/* Floating sparkles */}
            <Sparkles className="absolute top-8 right-8 w-6 h-6 text-white/40 animate-sparkle" />
            <Sparkles
              className="absolute bottom-12 left-12 w-4 h-4 text-white/40 animate-sparkle"
              style={{ animationDelay: '0.5s' }}
            />
            <Sparkles
              className="absolute top-1/2 right-1/3 w-5 h-5 text-white/40 animate-sparkle"
              style={{ animationDelay: '1s' }}
            />

            <motion.div variants={fadeUp} className="relative text-white">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Coming soon
              </span>
              <h2 className="mt-4 text-3xl lg:text-5xl font-bold tracking-tight">
                AI that understands your money.
              </h2>
              <p className="mt-4 text-white/90 text-lg max-w-2xl">
                A conversational assistant powered by OpenAI that explains your
                spending patterns, flags unusual transactions, and answers
                questions like &ldquo;how much do I usually spend on coffee in
                December?&rdquo;
              </p>
              <p className="mt-2 text-white/70 text-sm">
                Already on the roadmap. Want early access? Sign up — we&apos;ll let
                you know.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          TECH STACK
         ============================================================ */}
      <section className="py-20 lg:py-24 px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight">
            Built with technology you trust.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-ink-600 dark:text-ink-300">
            Modern, battle-tested, and open-source.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap justify-center gap-2.5"
          >
            {techStack.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 text-sm font-medium text-ink-700 dark:text-ink-300"
              >
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================
          FINAL CTA
         ============================================================ */}
      <section className="py-20 lg:py-32 px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp}>
            <Logo size={56} />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-6 text-3xl lg:text-5xl font-bold tracking-tight"
          >
            Take control of your money today.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-ink-600 dark:text-ink-300">
            Free forever. Open-source. No tracking, no ads.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
          >
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-brand text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition-all"
            >
              Try live demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/nakwafurkhan/FinanceFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-semibold hover:opacity-90 transition"
            >
              <Github className="w-4 h-4" />
              Star on GitHub
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================
          FOOTER
         ============================================================ */}
      <footer className="border-t border-ink-100 dark:border-ink-800 py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo withName size={28} />
          <div className="flex items-center gap-6 text-sm text-ink-500 dark:text-ink-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              MIT licensed
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              JWT + bcrypt
            </span>
            <a
              href="https://github.com/nakwafurkhan/FinanceFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-iris-600 dark:hover:text-iris-300 transition"
            >
              <Github className="w-4 h-4" />
              Source
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-400 dark:text-ink-500">
          Built with care by{' '}
          <a
            href="https://github.com/nakwafurkhan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-iris-600 dark:hover:text-iris-300 underline-offset-2 hover:underline"
          >
            Nakwa Furkhan
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------
function accentClass(accent) {
  const map = {
    iris: 'bg-gradient-brand shadow-glow',
    mint: 'bg-gradient-mint shadow-glow-mint',
    violet: 'bg-gradient-to-br from-violet-500 to-violet-700 shadow-glow-violet',
    amber: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-soft',
  };
  return map[accent] || map.iris;
}

function CredentialRow({ label, value }) {
  const copy = () => {
    navigator.clipboard?.writeText(value);
  };
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-white/80 dark:bg-ink-900/80 border border-ink-100 dark:border-ink-800 font-mono text-sm">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-sans font-semibold text-ink-500 dark:text-ink-400">
          {label}
        </div>
        <div className="truncate text-ink-900 dark:text-ink-100">{value}</div>
      </div>
      <button
        onClick={copy}
        className="flex-shrink-0 p-1.5 rounded-md hover:bg-iris-50 dark:hover:bg-iris-950/40 text-ink-500 dark:text-ink-400 hover:text-iris-600 dark:hover:text-iris-300 transition"
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}
