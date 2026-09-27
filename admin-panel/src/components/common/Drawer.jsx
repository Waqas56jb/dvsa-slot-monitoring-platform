import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Side sheet. side="left|right". Used for the mobile nav and mobile filter panels. */
export function Drawer({ open, onClose, side = 'right', title, children, footer, className, width = 'w-[88vw] max-w-sm', label }) {
  const ref = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const last = document.activeElement
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current() }
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => ref.current?.querySelector('a,button,input,select')?.focus())
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); last?.focus?.() }
  }, [open])

  const x = side === 'left' ? '-100%' : '100%'
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div className="absolute inset-0 bg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label || title}
            initial={{ x }}
            animate={{ x: 0 }}
            exit={{ x }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className={cn('absolute inset-y-0 flex flex-col shadow-pop', side === 'left' ? 'left-0' : 'right-0 bg-surface', width, className)}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
                <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-3 hover:bg-subtle" aria-label="Close"><X className="h-4 w-4" /></button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line p-4">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
