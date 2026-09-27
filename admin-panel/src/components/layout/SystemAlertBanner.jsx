import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TriangleAlert, X } from 'lucide-react'

/** Top-of-page banner driven by backend system status. */
export function SystemAlertBanner({ banner, onDismiss }) {
  return (
    <AnimatePresence initial={false}>
      {banner?.active && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div role="status" className="flex items-start gap-3 border-b border-warning-dot/25 bg-warning-soft px-4 py-2.5 text-[13px] sm:items-center sm:px-6">
            <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-warning sm:mt-0" aria-hidden />
            <p className="min-w-0 flex-1 text-ink-2">
              <span className="font-semibold text-warning">{banner.message}</span>
              {banner.detail && <span className="hidden text-ink-3 md:inline"> {banner.detail}</span>}
            </p>
            <Link to="/admin/system-health" className="shrink-0 font-medium whitespace-nowrap text-warning underline-offset-2 hover:underline">View System Health</Link>
            <button type="button" onClick={onDismiss} className="-my-1 shrink-0 rounded-md p-1 text-ink-3 hover:bg-warning-dot/15 hover:text-ink" aria-label="Dismiss alert">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
