/**
 * hooks/useConfirm.jsx
 * --------------------------------------------------------------
 * Promise-based confirmation dialog.
 *
 * Usage:
 *
 *   const [confirm, ConfirmEl] = useConfirm();
 *
 *   const onDelete = async () => {
 *     const ok = await confirm({
 *       title: 'Delete expense?',
 *       message: '"Pizza" will be permanently removed.',
 *       confirmLabel: 'Delete',
 *       destructive: true,
 *     });
 *     if (!ok) return;
 *     await api.remove(id);
 *   };
 *
 *   return (
 *     <div>
 *       ...
 *       {ConfirmEl}
 *     </div>
 *   );
 */

import { useCallback, useRef, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

export default function useConfirm() {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState(opts);
    });
  }, []);

  const handleClose = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  };

  const element = (
    <ConfirmModal
      open={!!state}
      title={state?.title}
      message={state?.message}
      confirmLabel={state?.confirmLabel}
      cancelLabel={state?.cancelLabel}
      destructive={state?.destructive}
      onClose={() => handleClose(false)}
      onConfirm={() => handleClose(true)}
    />
  );

  return [confirm, element];
}
