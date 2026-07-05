import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AmbientOrbs from '../components/AmbientOrbs';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: 'demo@financeflow.app', password: 'demo1234' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back 👋');
      // Phase 3 routing: signed-in home is /app/dashboard
      nav('/app/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <AmbientOrbs />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card relative z-10 w-full max-w-md p-8 md:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-brand text-white shadow-glow">
            <span className="text-2xl font-bold">F</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{' '}
            <span className="font-serif font-normal italic text-ink-400">back.</span>
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Sign in to FinanceFlow to continue
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-iris-600 hover:underline">
            Create one
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-ink-400">
          Demo: demo@financeflow.app / demo1234
        </p>
      </motion.div>

      {/* Author credit */}
      <a
        href="https://github.com/nakwafurkhan"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 text-xs text-ink-400 transition hover:text-iris-600 dark:hover:text-iris-300"
      >
        Built by @nakwafurkhan
      </a>
    </div>
  );
}
