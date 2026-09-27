import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info }
const TONES = { success: 'text-success-dot', warning: 'text-warning-dot', error: 'text-danger-dot', info: 'text-brand-500' }

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              role={t.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-3.5 pr-2.5 shadow-pop"
            >
              <Icon className={cn('mt-px h-[18px] w-[18px] shrink-0', TONES[t.type])} aria-hidden />
              <div className="min-w-0 flex-1">
                {t.title && <p className="text-sm font-semibold text-ink">{t.title}</p>}
                <p className={cn('text-sm text-ink-2', t.title && 'mt-0.5 text-[13px] text-ink-3')}>{t.message}</p>
                {t.action && (
                  <button type="button" onClick={() => { t.action.onClick(); onDismiss(t.id) }} className="mt-1.5 text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">
                    {t.action.label}
                  </button>
                )}
              </div>
              <button type="button" onClick={() => onDismiss(t.id)} className="rounded-md p-1 text-ink-4 hover:bg-subtle hover:text-ink" aria-label="Dismiss notification">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
