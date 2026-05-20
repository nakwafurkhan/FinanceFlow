/**
 * components/ConfirmModal.jsx
 * --------------------------------------------------------------
 * A focused confirmation dialog — replaces the browser's
 * `window.confirm()` everywhere. Wraps the generic <Modal>.
 *
 * Two visual variants:
 *   - default     (iris gradient confirm button)
 *   - destructive (coral gradient confirm button, red icon)
 *
 * Includes a loading state for async confirm handlers so the user
 * doesn't double-click during the API round-trip.
 */

import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm?.();
      onClose?.();
    } catch {
      // Errors are surfaced by the caller (toast.error). Leave the modal
      // open so the user can retry or cancel.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title="" size="sm">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 grid h-12 w-12 place-items-center rounded-2xl ${
            destructive
              ? 'bg-coral-100 text-coral-600 dark:bg-coral-900/40 dark:text-coral-300'
              : 'bg-iris-100 text-iris-600 dark:bg-iris-900/40 dark:text-iris-300'
          }`}
        >
          {destructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-ghost"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white shadow-soft transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            destructive
              ? 'bg-gradient-coral shadow-glow-coral hover:shadow-glow-coral hover:scale-[1.02]'
              : 'bg-gradient-brand shadow-glow hover:shadow-glow-lg hover:scale-[1.02]'
          }`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
