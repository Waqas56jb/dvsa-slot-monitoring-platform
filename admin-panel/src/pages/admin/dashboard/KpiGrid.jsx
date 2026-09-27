import { Users, Radar, CalendarCheck2, BellRing, GraduationCap, MapPin, TrendingUp, ShieldCheck } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard'
import { cn } from '@/utils/cn'

// Order on desktop follows the spec; on mobile, operational KPIs float to the top.
const CARDS = [
  { key: 'totalUsers', icon: Users, to: '/admin/users', deltaLabel: 'this month', mobileOrder: 'order-5' },
  { key: 'activeMonitoring', icon: Radar, to: '/admin/monitoring?status=Running', deltaLabel: 'vs last week', mobileOrder: 'order-1' },
  { key: 'slotsToday', icon: CalendarCheck2, to: '/admin/slots', deltaLabel: 'vs yesterday', mobileOrder: 'order-2' },
  { key: 'alertsToday', icon: BellRing, to: '/admin/notifications', deltaLabel: 'vs yesterday', mobileOrder: 'order-3' },
  { key: 'activeLearners', icon: GraduationCap, to: '/admin/learners', deltaLabel: 'this month', mobileOrder: 'order-6' },
  { key: 'activeCentres', icon: MapPin, to: '/admin/test-centres', deltaLabel: 'this month', mobileOrder: 'order-7' },
  { key: 'conversionRate', icon: TrendingUp, deltaLabel: 'pts this month', mobileOrder: 'order-8' },
  { key: 'uptime', icon: ShieldCheck, to: '/admin/system-health', deltaLabel: 'pts vs last 30d', mobileOrder: 'order-4' },
]

export function KpiGrid({ kpis, loading }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((c, i) => {
        const k = kpis?.[c.key]
        return (
          <div key={c.key} className={cn('min-w-0 sm:order-none', c.mobileOrder)}>
            <StatCard
              index={i}
              loading={loading || !k}
              label={k?.label}
              value={k?.value}
              unit={k?.unit}
              delta={k?.delta}
              deltaLabel={c.deltaLabel}
              hint={k?.hint}
              icon={c.icon}
              spark={k?.spark}
              to={c.to}
            />
          </div>
        )
      })}
    </div>
  )
}
