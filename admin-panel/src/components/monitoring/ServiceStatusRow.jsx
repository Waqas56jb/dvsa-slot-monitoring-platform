import { memo } from 'react'
import { MiniTrend } from '@/components/charts/MiniTrend'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Tooltip } from '@/components/common/Tooltip'
import { cn } from '@/utils/cn'
import { formatDateTime, formatDuration, formatPercent, formatRelative, formatShortDate } from '@/utils/format'

const DAY_MS = 86400000
const STRIP = { Operational: 'bg-success-dot', Degraded: 'bg-warning-dot', Down: 'bg-danger-dot' }
const TREND_COLOR = { Operational: 'series1', Degraded: 'warning', Down: 'danger' }

/** 30 daily buckets, oldest → newest, coloured by the worst status that day. */
export function StatusStrip({ history = [], now = Date.now(), className }) {
  const incidents = history.filter((h) => h !== 'Operational').length
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex h-7 items-stretch gap-[2px]" role="img" aria-label={`Last ${history.length} days: ${incidents ? `${incidents} day${incidents > 1 ? 's' : ''} with incidents` : 'no incidents'}`}>
        {history.map((s, i) => {
          const day = now - (history.length - 1 - i) * DAY_MS
          return (
            <Tooltip key={i} content={`${formatShortDate(day)} · ${s}`} delay={80}>
              <span className={cn('min-w-0 flex-1 rounded-[2px] transition-opacity hover:opacity-70', STRIP[s] || 'bg-muted', s === 'Operational' && 'opacity-80')} />
            </Tooltip>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink-4">
        <span>{history.length} days ago</span>
        <span>{incidents ? `${incidents} incident day${incidents > 1 ? 's' : ''}` : 'No incidents'}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

function Metric({ label, value, warn }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-ink-4">{label}</dt>
      <dd className={cn('mt-0.5 truncate text-[13px] font-medium tabular', warn ? 'text-warning' : 'text-ink')}>{value}</dd>
    </div>
  )
}

/**
 * One infrastructure service, as reported by the health endpoint.
 * service: { id, name, description, status, responseMs, uptime, errorRate, lastCheck, history[], latency[{t,value}] }
 */
export const ServiceStatusRow = memo(function ServiceStatusRow({ service: s, now }) {
  const degraded = s.status !== 'Operational'
  return (
    <article className={cn('card min-w-0 p-4', s.status === 'Down' && 'border-danger-dot/40', s.status === 'Degraded' && 'border-warning-dot/40')} aria-label={`${s.name}: ${s.status}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{s.name}</h3>
          <p className="truncate text-xs text-ink-3">{s.description}</p>
        </div>
        <StatusBadge status={s.status} />
      </header>

      <div className="mt-3 flex items-end gap-4">
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
          <Metric label="Response" value={formatDuration(s.responseMs)} warn={degraded && s.responseMs > 1000} />
          <Metric label="Uptime (30d)" value={formatPercent(s.uptime, 2)} warn={s.uptime < 99.9} />
          <Metric label="Error rate" value={formatPercent(s.errorRate, 2)} warn={s.errorRate >= 1} />
          <Metric label="Last check" value={<time dateTime={s.lastCheck} title={formatDateTime(s.lastCheck)}>{formatRelative(s.lastCheck, now)}</time>} />
        </dl>
        {s.latency?.length > 1 && (
          <div className="hidden shrink-0 sm:block" title="Response time, last 24 hours">
            <MiniTrend data={s.latency} color={TREND_COLOR[s.status] || 'series1'} className="h-9 w-24" />
            <p className="mt-0.5 text-right text-[10px] text-ink-4">24h latency</p>
          </div>
        )}
      </div>

      <StatusStrip history={s.history} now={now} className="mt-4" />
    </article>
  )
})
