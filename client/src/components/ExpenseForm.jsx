import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { expenseApi } from '../api/endpoints';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

export default function ExpenseForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        amount: initial.amount,
        category: initial.category,
        description: initial.description || '',
        date: new Date(initial.date).toISOString().split('T')[0],
        paymentMethod: initial.paymentMethod || 'UPI',
      });
    }
  }, [initial]);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      if (initial) {
        await expenseApi.update(initial._id, { ...form, amount: Number(form.amount) });
        toast.success('Expense updated');
      } else {
        await expenseApi.create({ ...form, amount: Number(form.amount) });
        toast.success('Expense added');
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1.5 block">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handle}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label mb-1.5 block">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handle}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1.5 block">Category</label>
          <select name="category" value={form.category} onChange={handle} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label mb-1.5 block">Payment</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handle}
            className="input"
          >
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label mb-1.5 block">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handle}
          placeholder="What was this expense for?"
          className="input"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
