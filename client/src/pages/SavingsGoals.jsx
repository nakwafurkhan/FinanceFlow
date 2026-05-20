import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { savingsApi } from '../api/endpoints';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import useConfirm from '../hooks/useConfirm';

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(null);
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    icon: '🎯',
  });
  const [contribution, setContribution] = useState('');
  const [askConfirm, ConfirmEl] = useConfirm();

  const load = async () => {
    const res = await savingsApi.list();
    setGoals(res.data.goals);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await savingsApi.create({
      ...form,
      targetAmount: Number(form.targetAmount),
    });
    toast.success('Goal created');
    setOpen(false);
    setForm({ title: '', targetAmount: '', targetDate: '', icon: '🎯' });
    load();
  };

  const contribute = async (e) => {
    e.preventDefault();
    await savingsApi.contribute(contributeOpen._id, Number(contribution));
    toast.success('Saved!');
    setContributeOpen(null);
    setContribution('');
    load();
  };

  const remove = async (g) => {
    const ok = await askConfirm({
      title: `Delete "${g.title}"?`,
      message: 'Your progress on this goal will be lost. This cannot be undone.',
      confirmLabel: 'Delete goal',
      destructive: true,
    });
    if (!ok) return;
    await savingsApi.remove(g._id);
    toast.success('Goal deleted');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Savings Goals</h2>
          <p className="text-sm text-ink-500">{goals.length} active goals</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} />
          New goal
        </button>
      </div>

      {goals.length === 0 ? (
        <GlassCard className="grid place-items-center !p-12 text-center">
          <div className="mb-2 text-3xl">🎯</div>
          <h3 className="font-semibold">No goals yet</h3>
          <p className="text-sm text-ink-500">Set a savings target and track progress.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g, i) => {
            const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
            return (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card !p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{g.icon}</div>
                  <button
                    onClick={() => remove(g)}
                    className="text-coral-400 hover:text-coral-500 transition-colors"
                    aria-label="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="mt-2 font-semibold">{g.title}</h3>
                <p className="text-xs text-ink-500">By {formatDate(g.targetDate)}</p>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-ink-500">{pct}%</span>
                    <span className="font-medium">
                      {formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200/60 dark:bg-ink-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-gradient-brand"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setContributeOpen(g)}
                  className="btn-ghost mt-4 w-full"
                >
                  Add savings
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New savings goal">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              required
              placeholder="e.g. MacBook Air"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Target ₹</label>
              <input
                type="number"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className="input"
                required
                min="1"
              />
            </div>
            <div>
              <label className="label mb-1.5 block">Target date</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Icon (emoji)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="input"
              maxLength={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create goal
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!contributeOpen}
        onClose={() => setContributeOpen(null)}
        title={`Add savings to ${contributeOpen?.title || ''}`}
      >
        <form onSubmit={contribute} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Amount</label>
            <input
              type="number"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="input"
              required
              min="1"
              placeholder="500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setContributeOpen(null)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add
            </button>
          </div>
        </form>
      </Modal>

      {ConfirmEl}
    </div>
  );
}
