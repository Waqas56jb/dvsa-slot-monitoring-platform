import { memo } from 'react'
import { Cpu, MapPin, MemoryStick, Tag } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/utils/cn'
import { formatDateTime, formatDuration, formatNumber, formatRelative } from '@/utils/format'

/** Heartbeats older than this (for a worker the backend still reports as up) are flagged as stale. */
export const HEARTBEAT_STALE_SECONDS = 30

/** "4 sec ago" under a minute, relative time beyond that. */
export function heartbeatAgo(ts, now = Date.now()) {
  if (!ts) return '—'
  const s = Math.max(0, Math.round((now - new Date(ts).getTime()) / 1000))
  return s < 60 ? `${s} sec ago` : formatRelative(ts, now)
}

function Meter({ icon: Icon, label, value }) {
  const pct = Math.max(0, Math.min(100, value || 0))
  const color = pct >= 90 ? 'bg-danger-dot' : pct >= 75 ? 'bg-warning-dot' : 'bg-brand-500'
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 text-ink-3"><Icon className="h-3 w-3" aria-hidden />{label}</span>
        <span className="font-medium text-ink-2 tabular">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${label} usage`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn('h-full rounded-full transition-[width] duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/**
 * One monitoring worker, exactly as reported by its heartbeat.
 * worker: { id, name, status, jobs, capacity, cpu, memory, avgResponseMs, lastHeartbeat, region, version, uptimeHours }
 * `now` is passed from the parent so every card ticks from the same clock.
 */
export const WorkerCard = memo(function WorkerCard({ worker: w, now }) {
  const offline = w.status === 'Offline'
  const ageS = w.lastHeartbeat ? (now - new Date(w.lastHeartbeat).getTime()) / 1000 : Infinity
  const stale = !offline && ageS > HEARTBEAT_STALE_SECONDS
  const load = w.capacity ? Math.round((w.jobs / w.capacity) * 100) : 0
  return (
    <article className={cn('card flex min-w-0 flex-col p-4', offline && 'bg-subtle/60')} aria-label={`${w.name}, ${w.status}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{w.name}</h3>
          <p className="mt-0.5 truncate font-mono text-[11px] text-ink-4">{w.id}</p>
        </div>
        <StatusBadge status={w.status} pulse={w.status === 'Online' && !stale} />
      </header>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        <div className="min-w-0">
          <dt className="text-xs text-ink-4">Jobs</dt>
          <dd className="mt-0.5 text-ink tabular">
            <span className="font-semibold">{formatNumber(w.jobs)}</span>
            <span className="text-ink-4"> / {formatNumber(w.capacity)}</span>
            {!offline && <span className="ml-1.5 text-xs text-ink-3">({load}%)</span>}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-4">Last heartbeat</dt>
          <dd className={cn('mt-0.5 truncate tabular', offline || stale ? 'font-medium text-danger' : 'text-ink')}>
            <time dateTime={w.lastHeartbeat} title={formatDateTime(w.lastHeartbeat)}>{heartbeatAgo(w.lastHeartbeat, now)}</time>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-4">Avg response</dt>
          <dd className={cn('mt-0.5 tabular', w.avgResponseMs > 3000 ? 'font-medium text-warning' : 'text-ink')}>{formatDuration(w.avgResponseMs)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-ink-4">Uptime</dt>
          <dd className="mt-0.5 text-ink tabular">{offline ? '—' : w.uptimeHours >= 48 ? `${Math.floor(w.uptimeHours / 24)} days` : `${w.uptimeHours} h`}</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Meter icon={Cpu} label="CPU" value={w.cpu} />
        <Meter icon={MemoryStick} label="Memory" value={w.memory} />
      </div>

      {stale && <p className="mt-3 rounded-md bg-warning-soft px-2.5 py-1.5 text-xs font-medium text-warning">No heartbeat for over {HEARTBEAT_STALE_SECONDS} seconds.</p>}

      <div className="flex-1" aria-hidden />
      <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-ink-3">
        <span className="flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 shrink-0" aria-hidden /><span className="truncate">{w.region}</span></span>
        <span className="flex items-center gap-1 font-mono text-[11px]"><Tag className="h-3 w-3 shrink-0" aria-hidden />{w.version}</span>
      </footer>
    </article>
  )
})
