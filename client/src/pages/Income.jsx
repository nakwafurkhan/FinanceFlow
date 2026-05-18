import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { incomeApi } from '../api/endpoints';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';

const SOURCES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 'Other'];

export default function Income() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    source: 'Salary',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const load = async () => {
    const res = await incomeApi.list();
    setItems(res.data.incomes);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    await incomeApi.create({ ...form, amount: Number(form.amount) });
    toast.success('Income added');
    setOpen(false);
    setForm({ ...form, amount: '', description: '' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this income entry?')) return;
    await incomeApi.remove(id);
    toast.success('Deleted');
    load();
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Income</h2>
          <p className="text-sm text-ink-500">
            {items.length} entries · {formatCurrency(total)} tracked
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} />
          Add income
        </button>
      </div>

      <div className="grid gap-3">
        {items.length === 0 ? (
          <GlassCard className="grid place-items-center !p-12 text-center">
            <div className="mb-2 text-3xl">💰</div>
            <h3 className="font-semibold">No income tracked yet</h3>
            <p className="text-sm text-ink-500">Add your salary, freelance work, etc.</p>
          </GlassCard>
        ) : (
          items.map((it, i) => (
            <motion.div
              key={it._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card flex items-center gap-4 !p-4"
            >
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                ₹
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{it.source}</div>
                <div className="truncate text-xs text-ink-500">
                  {it.description || '—'} · {formatDate(it.date)}
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-600">
                +{formatCurrency(it.amount)}
              </div>
              <button
                onClick={() => remove(it._id)}
                className="text-red-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add income">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="input"
              >
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
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
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="e.g. October salary"
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add income
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
