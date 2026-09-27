import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const icons = {
  success: { icon: CircleCheck, cls: 'text-success' },
  error: { icon: CircleAlert, cls: 'text-danger' },
  info: { icon: Info, cls: 'text-brand' },
  warning: { icon: TriangleAlert, cls: 'text-warning' },
};

/** Bottom-right stack of toasts (bottom-centre on mobile, above the tab bar). */
export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end lg:bottom-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { icon: Icon, cls } = icons[t.variant] || icons.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              role={t.variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-float"
            >
              <Icon className={cn('mt-0.5 size-5 shrink-0', cls)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    className="mt-2 text-sm font-semibold text-brand hover:text-brand-hover"
                    onClick={() => {
                      t.action.onClick();
                      onDismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button type="button" onClick={() => onDismiss(t.id)} className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle hover:bg-surface-muted hover:text-ink" aria-label="Dismiss notification">
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
