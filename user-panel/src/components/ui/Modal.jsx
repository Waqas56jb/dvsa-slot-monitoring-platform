import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, TriangleAlert, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLockBodyScroll } from '@/hooks';
import { Button, IconButton } from './Button';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

/**
 * Accessible modal dialog: focus trap, Escape to close, focus restore,
 * scroll lock. Slides up as a sheet on mobile.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', hideClose, initialFocusRef, className }) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);
  const lastFocused = useRef(null);
  // Keep the latest callbacks without re-running the focus effect every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const initialFocus = useRef(initialFocusRef);
  initialFocus.current = initialFocusRef;
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    lastFocused.current = document.activeElement;
    const t = setTimeout(() => {
      const target = initialFocus.current?.current || panelRef.current?.querySelector(FOCUSABLE) || panelRef.current;
      target?.focus();
    }, 30);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)];
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      lastFocused.current?.focus?.();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-night/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-float outline-none sm:rounded-3xl',
              widths[size],
              className,
            )}
          >
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-lg font-semibold text-ink">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descId} className="mt-1 text-sm text-muted">
                      {description}
                    </p>
                  )}
                </div>
                {!hideClose && <IconButton icon={X} label="Close dialog" size="sm" onClick={onClose} className="-mr-2 -mt-1" />}
              </div>
            )}
            <div className="scrollbar-thin overflow-y-auto px-6 py-4">{children}</div>
            {footer && <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-muted/50 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Confirmation dialog for destructive / important actions.
 * `onConfirm` may return a promise — the button shows a loading state.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  icon,
}) {
  const Icon = icon || (tone === 'danger' ? Trash2 : TriangleAlert);
  const cancelRef = useRef(null);
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} size="sm" hideClose initialFocusRef={cancelRef}>
      <div className="flex flex-col items-center pt-4 text-center">
        <span className={cn('flex size-12 items-center justify-center rounded-2xl', tone === 'danger' ? 'bg-danger-soft text-danger-ink' : 'bg-warning-soft text-warning-ink')}>
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row">
          <Button ref={cancelRef} variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} fullWidth onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
