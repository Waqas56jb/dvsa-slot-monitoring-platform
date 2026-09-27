import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ToastViewport } from '@/components/feedback/Toast';
import { createId } from '@/utils/id';

const ToastContext = createContext(null);

/**
 * toast.success('Saved') · toast.error('Failed', { description }) ·
 * toast.info(...) · toast.warning(...)
 * Options: { description, duration, action: { label, onClick } }
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (variant, title, opts = {}) => {
      const id = createId('tst');
      const duration = opts.duration ?? (variant === 'error' ? 6000 : 4000);
      setToasts((list) => [...list.slice(-3), { id, variant, title, ...opts }]);
      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (t, o) => show('success', t, o),
      error: (t, o) => show('error', t, o),
      info: (t, o) => show('info', t, o),
      warning: (t, o) => show('warning', t, o),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
