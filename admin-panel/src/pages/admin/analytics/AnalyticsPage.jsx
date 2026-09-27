import { useSearchParams } from 'react-router-dom'
import { BellRing, CalendarCheck2, Download, PoundSterling, Radar, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatCard } from '@/components/common/StatCard'
import { SegmentedControl } from '@/components/common/Tabs'
import { ErrorState } from '@/components/common/States'
import { Spinner } from '@/components/common/Spinner'
import { PermissionGate } from '@/routes/guards'
import { UserGrowthSection, MonitoringSection, SlotSection, NotificationSection, RevenueSection, UsageSection } from './AnalyticsSections'
import { useAsync } from '@/hooks/useAsync'
import { useExport } from '@/hooks/useExport'
import { analyticsService } from '@/services/analyticsService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatCurrency } from '@/utils/format'

const RANGES = [{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }]
const DAYS = { '7d': 7, '30d': 30, '90d': 90 }
const isoDay = (t) => new Date(t).toISOString().slice(0, 10)

/** Daily series visible for the selected range, merged into one CSV row per day. */
const EXPORT_COLUMNS = [
  { label: 'Date', key: 'date' },
  { label: 'Registrations', key: 'registrations' }, { label: 'Active users', key: 'active' }, { label: 'Returning users', key: 'returning' },
  { label: 'Jobs created', key: 'created' }, { label: 'Active jobs', key: 'activeJobs' }, { label: 'Jobs completed', key: 'completed' }, { label: 'Jobs failed', key: 'failedJobs' },
  { label: 'Slots discovered', key: 'discovered' }, { label: 'Slots matched', key: 'matched' }, { label: 'Slot alerts', key: 'alerts' }, { label: 'User booking actions', key: 'bookingActions' },
  { label: 'Notifications sent', key: 'sent' }, { label: 'Notifications delivered', key: 'delivered' }, { label: 'Notifications failed', key: 'failedNotifications' }, { label: 'Notifications read', key: 'read' },
]

function mergeDaily(data) {
  const byDay = new Map()
  const put = (rows, map) => rows?.forEach((r) => {
    const d = isoDay(r.t)
    const row = byDay.get(d) || { date: d }
    for (const [from, to] of Object.entries(map)) row[to] = r[from]
    byDay.set(d, row)
  })
  put(data.userGrowth, { registrations: 'registrations', active: 'active', returning: 'returning' })
  put(data.monitoring, { created: 'created', active: 'activeJobs', completed: 'completed', failed: 'failedJobs' })
  put(data.slots, { discovered: 'discovered', matched: 'matched', alerts: 'alerts', bookingActions: 'bookingActions' })
  put(data.notifications, { sent: 'sent', delivered: 'delivered', failed: 'failedNotifications', read: 'read' })
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export default function AnalyticsPage() {
  const [params, setParams] = useSearchParams()
  const range = DAYS[params.get('range')] ? params.get('range') : '30d'
  const days = DAYS[range]
  const setRange = (r) => setParams((prev) => { const n = new URLSearchParams(prev); if (r === '30d') n.delete('range'); else n.set('range', r); return n }, { replace: true })
  const { data, loading, error, reload } = useAsync(() => analyticsService.getAnalytics({ range }), [range])
  const { exporting, runExport } = useExport()
  const initial = loading && !data
  const k = data?.kpis
  const deltaLabel = `vs previous ${days} days`

  const exportCsv = () => runExport({ name: `analytics-${range}`, columns: EXPORT_COLUMNS, fetch: async () => mergeDaily(data) })

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Platform growth, monitoring performance, alert delivery and revenue."
        actions={
          <>
            {loading && data && <Spinner label="Updating analytics" />}
            <SegmentedControl label="Date range" size="md" options={RANGES} value={range} onChange={setRange} />
            <PermissionGate permission={P.EXPORT}>
              <Button icon={Download} onClick={exportCsv} loading={exporting} disabled={!data}>Export</Button>
            </PermissionGate>
          </>
        }
      />

      {error && !data ? (
        <div className="card">
          <ErrorState title="Unable to load analytics." message="Unable to load analytics. Please try again." onRetry={reload} />
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6" aria-label="Key metrics">
            <StatCard index={0} loading={initial} label="New registrations" icon={UserPlus} value={k?.registrations.value} delta={k?.registrations.delta} deltaLabel={deltaLabel} spark={k?.registrations.spark} hint="Accounts created in the selected range." />
            <StatCard index={1} loading={initial} label="Avg. daily active users" icon={Users} value={k?.activeUsers.value} delta={k?.activeUsers.delta} deltaLabel={deltaLabel} spark={k?.activeUsers.spark} hint="Mean of daily unique signed-in users." />
            <StatCard index={2} loading={initial} label="Monitoring jobs created" icon={Radar} value={k?.jobsCreated.value} delta={k?.jobsCreated.delta} deltaLabel={deltaLabel} spark={k?.jobsCreated.spark} />
            <StatCard index={3} loading={initial} label="Slots discovered" icon={CalendarCheck2} value={k?.slotsDiscovered.value} delta={k?.slotsDiscovered.delta} deltaLabel={deltaLabel} spark={k?.slotsDiscovered.spark} hint="Unique availability observations reported by the monitoring engine." />
            <StatCard index={4} loading={initial} label="Alerts sent" icon={BellRing} value={k?.alertsSent.value} delta={k?.alertsSent.delta} deltaLabel={deltaLabel} spark={k?.alertsSent.spark} hint="Notifications dispatched across all channels." />
            <StatCard index={5} loading={initial} label="Gross revenue (last month)" icon={PoundSterling} value={k?.grossRevenue.value} format={(v) => formatCurrency(v).replace(/\.00$/, '')} delta={k?.grossRevenue.delta} deltaLabel="vs prior month" spark={k?.grossRevenue.spark} />
          </div>

          <UserGrowthSection data={data} loading={initial} days={days} />
          <MonitoringSection data={data} loading={initial} days={days} />
          <SlotSection data={data} loading={initial} days={days} />
          <NotificationSection data={data} loading={initial} days={days} />
          <RevenueSection data={data} loading={initial} />
          <UsageSection data={data} loading={initial} />
        </div>
      )}
    </>
  )
}
