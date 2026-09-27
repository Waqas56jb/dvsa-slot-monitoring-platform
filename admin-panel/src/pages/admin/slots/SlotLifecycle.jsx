import { BellRing, CalendarCheck2, CircleSlash, Filter, MousePointerClick, Radar } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDateTime, formatTime, pluralize } from '@/utils/format'

const STATE_STYLES = {
  done: { ring: 'border-success/30 bg-success-soft text-success', label: 'text-success', line: 'bg-success-dot/50' },
  active: { ring: 'border-brand-200 bg-brand-50 text-brand-600 dark:text-brand-300', label: 'text-brand-600 dark:text-brand-300', line: 'bg-line' },
  failed: { ring: 'border-danger/30 bg-danger-soft text-danger', label: 'text-danger', line: 'bg-line' },
  ended: { ring: 'border-line bg-subtle text-ink-3', label: 'text-ink-3', line: 'bg-line' },
  pending: { ring: 'border-dashed border-line-strong bg-surface text-ink-4', label: 'text-ink-4', line: 'bg-line' },
}

/** Derives the four lifecycle stages from a slot + its alerts. */
function stagesFor(slot) {
  const alerts = slot.alerts || []
  const matchedAt = slot.timeline?.find((e) => e.title === 'Filter matched')?.at
  const delivered = alerts.find((a) => a.deliveredAt)
  const alertFailed = slot.alertStatus === 'Failed' || (alerts.length > 0 && alerts.every((a) => a.status === 'Failed'))
  const alerted = ['Sent', 'Delivered', 'Read'].includes(slot.alertStatus) || !!delivered

  let action
  if (slot.status === 'Booked') action = { state: 'done', icon: CalendarCheck2, title: 'Booking confirmed', detail: 'Confirmed by backend' }
  else if (slot.status === 'Viewed' || slot.alertStatus === 'Read' || alerts.some((a) => a.status === 'Read')) action = { state: 'done', icon: MousePointerClick, title: 'User viewed alert', detail: 'No booking confirmed' }
  else if (['Expired', 'Unavailable'].includes(slot.status)) action = { state: 'ended', icon: CircleSlash, title: `Slot ${slot.status.toLowerCase()}`, detail: slot.sourceStatus || 'No user action recorded' }
  else action = { state: alerted ? 'active' : 'pending', icon: MousePointerClick, title: 'User action', detail: alerted ? 'Awaiting user' : 'Not yet alerted' }

  return [
    { key: 'detected', state: 'done', icon: Radar, title: 'Slot detected', detail: formatTime(slot.detectedAt), at: slot.detectedAt },
    {
      key: 'matched', state: slot.status === 'New' ? 'active' : 'done', icon: Filter, title: 'Matched',
      detail: slot.status === 'New' ? 'Matching preferences…' : pluralize(slot.matchedJobs?.length || slot.matchedJobIds?.length || 1, 'job'), at: matchedAt,
    },
    {
      key: 'alerted', icon: BellRing, title: 'User alerted',
      state: alertFailed ? 'failed' : alerted ? 'done' : slot.status === 'New' ? 'pending' : 'active',
      detail: alertFailed ? 'Delivery failed' : alerted ? (delivered ? `${delivered.channel} · ${formatTime(delivered.deliveredAt)}` : slot.alertStatus) : 'Queued',
      at: delivered?.deliveredAt,
    },
    { key: 'action', ...action },
  ]
}

/**
 * Four-stage lifecycle: Slot detected → Matched → User alerted → User action.
 * Stage 4 only reads "Booking confirmed" when the backend has confirmed it.
 */
export function SlotLifecycle({ slot }) {
  const stages = stagesFor(slot)
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0" aria-label="Slot lifecycle">
      {stages.map((s, i) => {
        const st = STATE_STYLES[s.state]
        const Icon = s.icon
        const last = i === stages.length - 1
        return (
          <li key={s.key} className="relative flex min-w-0 items-start gap-3 lg:flex-col lg:items-stretch lg:pr-4">
            <div className="flex items-center lg:w-full">
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border', st.ring)}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {!last && <span className={cn('ml-3 hidden h-px flex-1 lg:block', st.line)} aria-hidden />}
            </div>
            <div className="min-w-0 lg:mt-3">
              <p className="text-[11px] font-semibold tracking-wide text-ink-4 uppercase">Step {i + 1}</p>
              <p className="mt-0.5 truncate text-sm font-medium text-ink">{s.title}</p>
              <p className={cn('mt-0.5 truncate text-xs', st.label)} title={s.at ? formatDateTime(s.at) : undefined}>{s.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
