import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useIsMobile } from '@/hooks/useUtils'

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }
const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal: focus trap, Escape to close, restores focus, scroll lock.
 * Renders as a bottom sheet on mobile.
 *
 * <Modal open onClose title description icon={Icon} tone="danger" size="md" footer={…}>body</Modal>
 */
export function Modal({ open, onClose, title, description, icon: Icon, tone = 'neutral', size = 'md', children, footer, dismissible = true, className, initialFocus }) {
  const panelRef = useRef(null)
  const lastFocus = useRef(null)
  const titleId = useId()
  const descId = useId()
  const mobile = useIsMobile()
  // Keep latest handlers in refs so the effect below only re-runs when `open` changes.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const dismissRef = useRef(dismissible)
  dismissRef.current = dismissible

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = requestAnimationFrame(() => {
      const target = (initialFocus && panelRef.current?.querySelector(initialFocus)) || panelRef.current?.querySelector('[data-autofocus]') || panelRef.current?.querySelector(FOCUSABLE)
      target?.focus()
    })
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissRef.current) { e.stopPropagation(); onCloseRef.current?.() }
      if (e.key === 'Tab' && panelRef.current) {
        const els = [...panelRef.current.querySelectorAll(FOCUSABLE)]
        if (!els.length) return
        const first = els[0], last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(t)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      lastFocus.current?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const iconTone = { danger: 'bg-danger-soft text-danger', warning: 'bg-warning-soft text-warning', success: 'bg-success-soft text-success', brand: 'bg-brand-50 text-brand-600 dark:text-brand-300', neutral: 'bg-subtle text-ink-2' }[tone]

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-overlay backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={dismissible ? onClose : undefined} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            initial={mobile ? { y: '100%' } : { opacity: 0, scale: 0.97, y: 8 }}
            animate={mobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={mobile ? { y: '100%' } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-2xl', SIZES[size], className)}
          >
            {mobile && <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong" aria-hidden />}
            {(title || dismissible) && (
              <div className="flex items-start gap-3.5 px-5 pt-5 pb-1 sm:px-6">
                {Icon && <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconTone)}><Icon className="h-5 w-5" aria-hidden /></span>}
                <div className="min-w-0 flex-1 pt-0.5">
                  {title && <h2 id={titleId} className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
                  {description && <p id={descId} className="mt-1 text-sm leading-relaxed text-ink-3">{description}</p>}
                </div>
                {dismissible && (
                  <button type="button" onClick={onClose} className="-mt-1 -mr-2 rounded-lg p-1.5 text-ink-3 hover:bg-subtle hover:text-ink" aria-label="Close dialog">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
            {footer && <div className="flex flex-col-reverse gap-2 border-t border-line bg-subtle/60 px-5 py-3.5 sm:flex-row sm:justify-end sm:rounded-b-2xl sm:px-6 [&>*]:w-full sm:[&>*]:w-auto">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
