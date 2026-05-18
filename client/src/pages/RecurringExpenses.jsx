import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { recurringApi } from '../api/endpoints';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import { CATEGORIES, CATEGORY_COLORS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

export default function RecurringExpenses() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Bills',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0],
  });

  const load = async () => {
    const res = await recurringApi.list();
    setItems(res.data.recurring);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await recurringApi.create({ ...form, amount: Number(form.amount) });
    toast.success('Subscription added');
    setOpen(false);
    setForm({ ...form, title: '', amount: '' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this subscription?')) return;
    await recurringApi.remove(id);
    toast.success('Deleted');
    load();
  };

  const monthlyTotal = items
    .filter((i) => i.frequency === 'monthly')
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Recurring</h2>
          <p className="text-sm text-ink-500">
            {items.length} subscriptions · {formatCurrency(monthlyTotal)} / month
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} />
          Add subscription
        </button>
      </div>

      {items.length === 0 ? (
        <GlassCard className="grid place-items-center !p-12 text-center">
          <div className="mb-2 text-3xl">🔁</div>
          <h3 className="font-semibold">No recurring expenses</h3>
          <p className="text-sm text-ink-500">Add Netflix, rent, gym, etc.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {items.map((it, i) => (
            <motion.div
              key={it._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card flex items-center gap-4 !p-4"
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-2xl text-sm font-semibold text-white"
                style={{ background: CATEGORY_COLORS[it.category] }}
              >
                {it.title[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{it.title}</div>
                <div className="text-xs text-ink-500">
                  {it.category} · {it.frequency} · Next: {formatDate(it.nextDueDate)}
                </div>
              </div>
              <div className="text-lg font-bold">{formatCurrency(it.amount)}</div>
              <button
                onClick={() => remove(it._id)}
                className="text-red-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add recurring expense">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              required
              placeholder="Netflix, Rent…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input"
                required
                min="0"
              />
            </div>
            <div>
              <label className="label mb-1.5 block">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="input"
              >
                {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Next due</label>
              <input
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
