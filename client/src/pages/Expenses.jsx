import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseApi, exportApi } from '../api/endpoints';
import { CATEGORIES } from '../utils/constants';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import GlassCard from '../components/GlassCard';
import useConfirm from '../hooks/useConfirm';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [askConfirm, ConfirmEl] = useConfirm();

  const load = async () => {
    const res = await expenseApi.list(filters);
    setExpenses(res.data.expenses);
    setPagination({
      page: res.data.page,
      totalPages: res.data.totalPages,
      total: res.data.total,
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.page, filters.limit]);

  const onAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const onEdit = (e) => {
    setEditing(e);
    setModalOpen(true);
  };
  const onDelete = async (e) => {
    const ok = await askConfirm({
      title: 'Delete expense?',
      message: `"${e.description || e.category}" will be permanently removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await expenseApi.remove(e._id);
    toast.success('Expense deleted');
    load();
  };
  const onSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    load();
  };

  const onExport = async (type) => {
    try {
      await exportApi[type]();
      toast.success(`${type.toUpperCase()} downloaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">Expenses</h2>
          <p className="text-sm text-ink-500">
            {pagination.total} transaction{pagination.total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onExport('csv')} className="btn-ghost">
            Export CSV
          </button>
          <button type="button" onClick={() => onExport('pdf')} className="btn-ghost">
            Export PDF
          </button>
          <button onClick={onAdd} className="btn-primary">
            <Plus size={16} />
            Add expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="!p-4">
        <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label className="label mb-1.5 block">Search</label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                type="text"
                placeholder="Description…"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="min-w-[140px]">
            <label className="label mb-1.5 block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="input"
            >
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="min-w-[100px]">
            <label className="label mb-1.5 block">Min ₹</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              className="input"
              placeholder="0"
            />
          </div>
          <div className="min-w-[100px]">
            <label className="label mb-1.5 block">Max ₹</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              className="input"
              placeholder="∞"
            />
          </div>
          <button type="submit" className="btn-primary">
            <Filter size={16} />
            Apply
          </button>
        </form>
      </GlassCard>

      {/* Table */}
      <ExpenseTable expenses={expenses} onEdit={onEdit} onDelete={onDelete} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
            className="btn-ghost"
          >
            Previous
          </button>
          <span className="text-sm text-ink-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
            className="btn-ghost"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit expense' : 'Add expense'}
      >
        <ExpenseForm
          initial={editing}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {ConfirmEl}
    </div>
  );
}
