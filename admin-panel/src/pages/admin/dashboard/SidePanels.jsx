import { Link } from 'react-router-dom'
import { Activity, ArrowUpRight, CalendarClock, LifeBuoy, MapPin, Radar, Server, Users } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePermission } from '@/context/AdminAuthContext'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatRelative } from '@/utils/format'
import { useNow } from '@/hooks/useUtils'
import { cn } from '@/utils/cn'

const ACTIONS = [
  { label: 'View Users', to: '/admin/users', icon: Users, perm: P.USERS_VIEW },
  { label: 'Active Monitoring', to: '/admin/monitoring?status=Running', icon: Radar, perm: P.MONITORING_VIEW },
  { label: 'Latest Slots', to: '/admin/slots', icon: CalendarClock, perm: P.SLOTS_VIEW },
  { label: 'Manage Centres', to: '/admin/test-centres', icon: MapPin, perm: P.CENTRES_VIEW },
  { label: 'Support Tickets', to: '/admin/support', icon: LifeBuoy, perm: P.SUPPORT_VIEW },
  { label: 'System Health', to: '/admin/system-health', icon: Activity, perm: P.SYSTEM_VIEW },
]

export function QuickActions() {
  const can = usePermission()
  return (
    <Card title="Quick Actions" padding="sm">
      <ul className="grid grid-cols-2 gap-2">
        {ACTIONS.filter((a) => can(a.perm)).map(({ label, to, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="group flex h-full items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-subtle hover:text-ink">
              <Icon className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-brand-600 dark:group-hover:text-brand-300" aria-hidden />
              <span className="min-w-0 flex-1 leading-tight">{label}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

const OVERALL = {
  Operational: { title: 'All systems operational', cls: 'bg-success-soft text-success' },
  Degraded: { title: 'Degraded performance', cls: 'bg-warning-soft text-warning' },
  Down: { title: 'Service disruption', cls: 'bg-danger-soft text-danger' },
}

/** Compact health summary — first thing on mobile. */
export function SystemStatusCard({ health, loading, className }) {
  const now = useNow(5000)
  const o = OVERALL[health?.overall] || OVERALL.Operational
  const attention = health?.services.filter((s) => s.status !== 'Operational') || []
  return (
    <Card title="System Status" icon={Server} className={className} actions={<Link to="/admin/system-health" className="text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">Details</Link>}>
      {loading || !health ? <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-4 w-2/3" /></div> : (
        <div className="space-y-4">
          <div className={cn('flex items-center gap-3 rounded-lg px-3.5 py-3', o.cls)}>
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" /></span>
            <span className="text-sm font-semibold">{o.title}</span>
          </div>
          {attention.length > 0 && (
            <ul className="space-y-2">
              {attention.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="truncate text-ink-2">{s.name}</span>
                  <StatusBadge status={s.status} size="sm" />
                </li>
              ))}
            </ul>
          )}
          <dl className="grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
            <div><dt className="text-[11px] text-ink-4">Workers</dt><dd className="mt-0.5 text-sm font-semibold text-ink tabular">{health.engine.activeWorkers}/{health.engine.totalWorkers}</dd></div>
            <div><dt className="text-[11px] text-ink-4">Queued</dt><dd className="mt-0.5 text-sm font-semibold text-ink tabular">{health.engine.queued}</dd></div>
            <div><dt className="text-[11px] text-ink-4">Heartbeat</dt><dd className="mt-0.5 text-sm font-semibold text-ink tabular">{formatRelative(health.engine.lastHeartbeat, now)}</dd></div>
          </dl>
        </div>
      )}
    </Card>
  )
}
