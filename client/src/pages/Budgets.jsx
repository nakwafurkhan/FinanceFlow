import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgetApi } from '../api/endpoints';
import { CATEGORIES } from '../utils/constants';
import BudgetCard from '../components/BudgetCard';
import Modal from '../components/Modal';
import GlassCard from '../components/GlassCard';
import { monthName } from '../utils/formatters';

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Food', monthlyLimit: '' });

  const load = async () => {
    const res = await budgetApi.list({ month, year });
    setBudgets(res.data.budgets);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.monthlyLimit || Number(form.monthlyLimit) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    await budgetApi.upsert({
      category: form.category,
      monthlyLimit: Number(form.monthlyLimit),
      month,
      year,
    });
    toast.success('Budget saved');
    setOpen(false);
    setForm({ category: 'Food', monthlyLimit: '' });
    load();
  };

  const onDelete = async (b) => {
    if (!confirm(`Delete ${b.category} budget?`)) return;
    await budgetApi.remove(b._id);
    toast.success('Deleted');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Budgets</h2>
          <p className="text-sm text-ink-500">
            {monthName(month)} {year}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="input !py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {monthName(i + 1)}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="input !py-2 !w-28"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus size={16} />
            Add budget
          </button>
        </div>
      </div>

      {budgets.length === 0 ? (
        <GlassCard className="grid place-items-center !p-12 text-center">
          <div className="mb-2 text-3xl">🎯</div>
          <h3 className="font-semibold">No budgets yet</h3>
          <p className="text-sm text-ink-500">
            Add monthly budgets to keep your spending in check.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard key={b._id} budget={b} onDelete={onDelete} />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add or update budget">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Monthly limit (₹)</label>
            <input
              type="number"
              value={form.monthlyLimit}
              onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
              className="input"
              placeholder="5000"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
