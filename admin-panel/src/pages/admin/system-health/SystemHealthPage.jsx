import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/StatusBadge'
import { SegmentedControl } from '@/components/common/Tabs'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState, EmptyState } from '@/components/common/States'
import { ServiceStatusRow } from '@/components/monitoring/ServiceStatusRow'
import { WorkerCard, heartbeatAgo, HEARTBEAT_STALE_SECONDS } from '@/components/monitoring/WorkerCard'
import { useAsync } from '@/hooks/useAsync'
import { useInterval, useNow, useRealtime } from '@/hooks/useUtils'
import { useLiveMode } from '@/context/RealtimeContext'
import { systemService } from '@/services/systemService'
import { cn } from '@/utils/cn'
import { formatDateTime, formatDuration, formatNumber, formatTimeSeconds } from '@/utils/format'

const REFRESH_MS = 30000

const OVERALL = {
  Operational: { icon: CheckCircle2, title: 'All systems operational', tone: 'bg-success-soft text-success', ring: 'border-success-dot/30' },
  Degraded: { icon: AlertTriangle, title: 'Degraded performance', tone: 'bg-warning-soft text-warning', ring: 'border-warning-dot/40' },
  Down: { icon: XCircle, title: 'Service disruption', tone: 'bg-danger-soft text-danger', ring: 'border-danger-dot/40' },
}

const WORKER_FILTERS = [{ value: 'all', label: 'All' }, { value: 'attention', label: 'Needs attention' }]

/** Engine summary recomputed from the latest heartbeat so tiles stay in step with the worker grid. */
function summarise(workers, base) {
  const up = workers.filter((w) => w.status === 'Online' || w.status === 'Degraded')
  const capacity = workers.reduce((a, w) => a + (w.status === 'Offline' ? 0 : w.capacity), 0)
  const jobsRunning = workers.reduce((a, w) => a + w.jobs, 0)
  return {
    ...base,
    activeWorkers: up.length,
    totalWorkers: workers.length,
    jobsRunning,
    capacityPct: capacity ? Math.round((jobsRunning / capacity) * 100) : 0,
    avgResponseMs: up.length ? Math.round(up.reduce((a, w) => a + (w.avgResponseMs || 0), 0) / up.length) : null,
    lastHeartbeat: workers.map((w) => w.lastHeartbeat).filter(Boolean).sort().slice(-1)[0],
  }
}

function Section({ id, title, description, children }) {
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4">
      <div className="border-b border-line pb-2.5">
        <h2 id={`${id}-title`} className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Tile({ label, value, sub, warn, children }) {
  return (
    <div className="card min-w-0 px-4 py-3">
      <p className="truncate text-xs font-medium text-ink-3">{label}</p>
      <p className={cn('mt-1 truncate text-xl font-semibold tracking-[-0.02em] tabular', warn ? 'text-warning' : 'text-ink')}>{value}</p>
      {sub && <p className="mt-0.5 truncate text-xs text-ink-4">{sub}</p>}
      {children}
    </div>
  )
}

export default function SystemHealthPage() {
  const { data, error, reload } = useAsync(() => systemService.getSystemHealth(), [])
  const [liveWorkers, setLiveWorkers] = useState(null)
  const [heartbeatAt, setHeartbeatAt] = useState(null)
  const [workerFilter, setWorkerFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const { live } = useLiveMode()
  const now = useNow(1000)

  useInterval(() => reload({ silent: true }), REFRESH_MS)
  useRealtime('heartbeat', ({ at, workers }) => { setLiveWorkers(workers); setHeartbeatAt(at) })

  const refresh = async () => { setRefreshing(true); await reload({ silent: true }); setRefreshing(false) }
  const workers = useMemo(() => liveWorkers || data?.workers || [], [liveWorkers, data])
  const engine = useMemo(() => (data ? summarise(workers, data.engine) : null), [workers, data])
  const visibleWorkers = workerFilter === 'all' ? workers : workers.filter((w) => w.status !== 'Online' || (now - new Date(w.lastHeartbeat).getTime()) / 1000 > HEARTBEAT_STALE_SECONDS)
  const attentionCount = workers.filter((w) => w.status !== 'Online').length

  if (error && !data) {
    return (
      <>
        <PageHeader title="System health" description="Backend-reported status of platform services and the monitoring engine." />
        <div className="card"><ErrorState title="Unable to load system health." message="Unable to load system health. Please try again." onRetry={reload} /></div>
      </>
    )
  }

  const overall = OVERALL[data?.overall] || OVERALL.Operational
  const OverallIcon = overall.icon
  const affected = data?.services.filter((s) => s.status !== 'Operational') || []
  const operationalCount = (data?.services.length || 0) - affected.length
  const updatedAt = heartbeatAt && data && heartbeatAt > new Date(data.checkedAt).getTime() ? heartbeatAt : data?.checkedAt

  return (
    <>
      <PageHeader
        title="System health"
        description="Backend-reported status of platform services and the monitoring engine. Read-only."
        actions={<Button icon={RefreshCw} onClick={refresh} loading={refreshing} disabled={!data}>Refresh</Button>}
      />

      <div className="space-y-10">
        {/* Overall status */}
        {!data ? (
          <div className="card flex items-center gap-4 p-5"><Skeleton className="h-12 w-12 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-56" /><Skeleton className="h-3 w-72" /></div></div>
        ) : (
          <section className={cn('card flex flex-col gap-4 p-5 sm:flex-row sm:items-center', overall.ring)} aria-live="polite" aria-label="Overall platform status">
            <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', overall.tone)}>
              <OverallIcon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">{overall.title}</h2>
                <Badge tone={data.overall === 'Operational' ? 'success' : data.overall === 'Down' ? 'danger' : 'warning'} dot>{data.overall}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-3">
                {affected.length
                  ? <>{affected.map((s) => `${s.name} (${s.status.toLowerCase()})`).join(', ')}. {operationalCount} of {data.services.length} services operational.</>
                  : `All ${data.services.length} services are reporting normally.`}
              </p>
            </div>
            <div className="shrink-0 text-left text-xs text-ink-3 sm:text-right">
              <p className="flex items-center gap-1.5 sm:justify-end">
                <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'animate-pulse bg-success-dot' : 'bg-neutral-dot')} aria-hidden />
                {live ? 'Live' : 'Live updates paused'}
              </p>
              <p className="mt-0.5 tabular" title={formatDateTime(updatedAt)}>Last updated {formatTimeSeconds(updatedAt)}</p>
            </div>
          </section>
        )}

        {/* Services */}
        <Section id="services" title="Services" description="Current status, 30-day history and 24-hour latency for each core service.">
          <div className="grid gap-4 lg:grid-cols-2">
            {!data
              ? Array.from({ length: 8 }, (_, i) => <div key={i} className="card space-y-3 p-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-8 w-full" /><Skeleton className="h-7 w-full" /></div>)
              : data.services.map((s) => <ServiceStatusRow key={s.id} service={s} now={now} />)}
          </div>
        </Section>

        {/* Monitoring engine */}
        <Section id="engine" title="Monitoring engine" description="Worker fleet state as reported by heartbeats. Figures are read-only.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {!engine ? Array.from({ length: 7 }, (_, i) => <div key={i} className="card space-y-2 px-4 py-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-6 w-14" /></div>) : (
              <>
                <Tile label="Active workers" value={<>{engine.activeWorkers}<span className="text-base font-medium text-ink-4">/{engine.totalWorkers}</span></>} sub={`${engine.totalWorkers - engine.activeWorkers} not processing`} warn={engine.activeWorkers < engine.totalWorkers} />
                <Tile label="Worker capacity" value={`${engine.capacityPct}%`} sub="of online capacity in use" warn={engine.capacityPct >= 85}>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Worker capacity in use" aria-valuenow={engine.capacityPct} aria-valuemin={0} aria-valuemax={100}>
                    <div className={cn('h-full rounded-full transition-[width] duration-700', engine.capacityPct >= 85 ? 'bg-warning-dot' : 'bg-brand-500')} style={{ width: `${Math.min(100, engine.capacityPct)}%` }} />
                  </div>
                </Tile>
                <Tile label="Jobs running" value={formatNumber(engine.jobsRunning)} sub={`${formatNumber(engine.checksPerMinute)} checks / min`} />
                <Tile label="Jobs queued" value={formatNumber(engine.queued)} sub="Awaiting a worker" />
                <Tile label="Failed jobs (24h)" value={formatNumber(engine.failedJobs24h)} warn={engine.failedJobs24h > 0} sub="Reported by workers" />
                <Tile label="Avg response time" value={formatDuration(engine.avgResponseMs)} warn={engine.avgResponseMs > 2000} sub="Upstream, online workers" />
                <Tile label="Last heartbeat" value={heartbeatAgo(engine.lastHeartbeat, now)} sub={formatTimeSeconds(engine.lastHeartbeat)} />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h3 className="text-sm font-semibold text-ink">Workers <span className="font-normal text-ink-4 tabular">({workers.length})</span></h3>
            <SegmentedControl label="Filter workers" options={WORKER_FILTERS.map((f) => (f.value === 'attention' ? { ...f, label: `Needs attention (${attentionCount})` } : f))} value={workerFilter} onChange={setWorkerFilter} />
          </div>
          {!data ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 6 }, (_, i) => <div key={i} className="card h-52 p-4"><Skeleton className="h-4 w-28" /><Skeleton className="mt-4 h-16 w-full" /></div>)}</div>
          ) : visibleWorkers.length === 0 ? (
            <div className="card"><EmptyState compact icon={CheckCircle2} title="No workers need attention" description="Every worker is online and sending heartbeats." /></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleWorkers.map((w) => <WorkerCard key={w.id} worker={w} now={now} />)}
            </div>
          )}
        </Section>
      </div>
    </>
  )
}
