import { useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { DateRangeFilter } from '@/components/common/DateRangeFilter'
import { ErrorState } from '@/components/common/States'
import { PermissionGate } from '@/routes/guards'
import { KpiGrid } from './KpiGrid'
import { PlatformActivityCard } from './PlatformActivityCard'
import { SlotDetectionCard } from './SlotDetectionCard'
import { MonitoringStatusCard } from './MonitoringStatusCard'
import { LiveActivityCard } from './LiveActivityCard'
import { RecentSlotsTable } from './RecentSlotsTable'
import { RecentUsersTable } from './RecentUsersTable'
import { QuickActions, SystemStatusCard } from './SidePanels'
import { useAsync } from '@/hooks/useAsync'
import { useRealtime } from '@/hooks/useUtils'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { analyticsService } from '@/services/analyticsService'
import { systemService } from '@/services/systemService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { downloadCSV, exportStamp } from '@/utils/csv'
import { formatDateTime } from '@/utils/format'

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening' }

export default function DashboardPage() {
  const { admin, can } = useAdminAuth()
  const toast = useToast()
  const [range, setRange] = useState('7d')
  const [refreshKey, setRefreshKey] = useState(0)
  const rangeKey = typeof range === 'string' ? range : '30d'
  const dash = useAsync(() => analyticsService.getDashboard({ range: rangeKey }), [rangeKey, refreshKey])
  const health = useAsync(() => systemService.getSystemHealth(), [refreshKey])

  // Live KPI nudges from the realtime stream
  useRealtime('stats', (delta) => {
    dash.setData((d) => {
      if (!d) return d
      const kpis = { ...d.kpis }
      for (const [k, inc] of Object.entries(delta)) if (kpis[k]) kpis[k] = { ...kpis[k], value: kpis[k].value + inc }
      return { ...d, kpis }
    })
  })

  const refresh = async () => {
    setRefreshKey((k) => k + 1)
    toast.info('Dashboard refreshed.')
  }

  const exportDashboard = () => {
    if (!dash.data) return
    const rows = Object.values(dash.data.kpis).map((k) => ({ metric: k.label, value: k.value, unit: k.unit || '', change: k.delta }))
    rows.push(...Object.entries(dash.data.monitoringStatus).map(([s, v]) => ({ metric: `Monitoring jobs — ${s}`, value: v, unit: '', change: '' })))
    downloadCSV(`slotpilot-dashboard-${exportStamp()}`, rows, [
      { label: 'Metric', key: 'metric' }, { label: 'Value', key: 'value' }, { label: 'Unit', key: 'unit' }, { label: 'Change %', key: 'change' },
    ])
    toast.success('Export generated.')
  }

  if (dash.error && !dash.data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="card"><ErrorState message="Unable to load dashboard data. Please try again." onRetry={dash.reload} /></div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        documentTitle="Dashboard"
        description={<>{greeting()}, {admin?.name?.split(' ')[0]}. Monitor platform activity, slot detection and user operations.</>}
        actions={
          <>
            <DateRangeFilter value={range} onChange={setRange} />
            <Button icon={RefreshCw} onClick={refresh} loading={dash.loading && !!dash.data} aria-label="Refresh dashboard">
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <PermissionGate permission={P.EXPORT}>
              <Button icon={Download} onClick={exportDashboard} disabled={!dash.data}>Export</Button>
            </PermissionGate>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Mobile-first priority: system status leads on small screens */}
        {can(P.SYSTEM_VIEW) && <SystemStatusCard health={health.data} loading={health.loading} className="lg:hidden" />}

        <KpiGrid kpis={dash.data?.kpis} loading={dash.loading && !dash.data} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2"><PlatformActivityCard /></div>
          <MonitoringStatusCard counts={dash.data?.monitoringStatus} loading={dash.loading && !dash.data} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="order-2 min-w-0 xl:order-1 xl:col-span-2"><SlotDetectionCard pipeline={dash.data?.pipeline} loading={dash.loading && !dash.data} /></div>
          <LiveActivityCard className="order-1 xl:order-2" />
        </div>

        {can(P.SLOTS_VIEW) && <RecentSlotsTable />}

        <div className="grid gap-6 xl:grid-cols-3">
          {can(P.USERS_VIEW) && <div className="min-w-0 xl:col-span-2"><RecentUsersTable /></div>}
          <div className="flex min-w-0 flex-col gap-6">
            {can(P.SYSTEM_VIEW) && <SystemStatusCard health={health.data} loading={health.loading} className="hidden lg:block" />}
            <QuickActions />
          </div>
        </div>

        <p className="text-center text-xs text-ink-4">Figures are platform-wide. Times shown in UK time · Updated {formatDateTime(new Date())}</p>
      </div>
    </>
  )
}
