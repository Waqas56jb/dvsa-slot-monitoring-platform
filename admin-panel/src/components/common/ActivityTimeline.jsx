import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Radar, CalendarCheck2, BellRing, CreditCard, Server, ShieldCheck, CircleDot, AlertTriangle, XCircle,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDateTime, formatRelative } from '@/utils/format'
import { TONE_STYLES } from './StatusBadge'
import { useNow } from '@/hooks/useUtils'

const CATEGORY_ICONS = { User: UserPlus, Monitoring: Radar, Slot: CalendarCheck2, Notification: BellRing, Payment: CreditCard, System: Server, Admin: ShieldCheck }
const STATUS_TONE = { Success: 'success', Warning: 'warning', Failed: 'danger' }

/**
 * One row of the platform activity stream.
 * item: { id, category, event, description, actor, entity: { label, href }, status, timestamp }
 */
export function ActivityItem({ item, compact = false, now }) {
  const Icon = item.status === 'Failed' ? XCircle : item.status === 'Warning' ? AlertTriangle : CATEGORY_ICONS[item.category] || CircleDot
  const tone = STATUS_TONE[item.status] || 'neutral'
  const iconCls = tone === 'success' ? 'bg-subtle text-ink-2' : cn(TONE_STYLES[tone].pill, 'ring-0')
  return (
    <div className="flex min-w-0 gap-3">
      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line', iconCls)}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[13px] font-medium text-ink">{item.event}</p>
          <time dateTime={item.timestamp} title={formatDateTime(item.timestamp)} className="shrink-0 text-xs text-ink-4 tabular">{formatRelative(item.timestamp, now)}</time>
        </div>
        {!compact && item.description && <p className="mt-0.5 truncate text-xs text-ink-3">{item.description}</p>}
        {item.entity?.label && (
          <p className="mt-0.5 truncate text-xs">
            {item.entity.href ? (
              <Link to={item.entity.href} className="font-mono text-[11px] text-brand-600 hover:underline dark:text-brand-300">{item.entity.label}</Link>
            ) : (
              <span className="font-mono text-[11px] text-ink-3">{item.entity.label}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

/** Animated feed of ActivityItems (new items slide in at the top). */
export function ActivityFeed({ items, compact, className }) {
  const now = useNow(10000)
  return (
    <ul className={cn('space-y-4', className)}>
      <AnimatePresence initial={false}>
        {items.map((it) => (
          <motion.li key={it.id} layout initial={{ opacity: 0, y: -8, backgroundColor: 'var(--color-brand-50)' }} animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: 0.5 }} className="-mx-2 rounded-lg px-2 py-0.5">
            <ActivityItem item={it} compact={compact} now={now} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

/**
 * Vertical lifecycle timeline for detail pages.
 * events: [{ title, description?, at, tone?: 'success'|'danger'|'warning'|'info'|'brand'|'neutral', href? }]
 */
export function ActivityTimeline({ events, className, emptyLabel = 'No activity yet.' }) {
  if (!events?.length) return <p className="py-6 text-center text-sm text-ink-3">{emptyLabel}</p>
  return (
    <ol className={cn('relative', className)}>
      {events.map((e, i) => {
        const t = TONE_STYLES[e.tone || 'neutral']
        const last = i === events.length - 1
        return (
          <li key={`${e.title}-${e.at}-${i}`} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!last && <span className="absolute top-4 left-[7px] h-full w-px bg-line" aria-hidden />}
            <span className={cn('relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] border-surface ring-1 ring-line', t.dot)} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium text-ink">{e.href ? <Link to={e.href} className="hover:text-brand-600 dark:hover:text-brand-300">{e.title}</Link> : e.title}</p>
                <time dateTime={e.at} className="text-xs text-ink-4 tabular">{formatDateTime(e.at)}</time>
              </div>
              {e.description && <p className="mt-0.5 text-[13px] text-ink-3">{e.description}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
