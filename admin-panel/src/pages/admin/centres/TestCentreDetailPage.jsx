import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarClock, Pencil, Power, PowerOff, Radar } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DescriptionList, MetricStrip } from '@/components/common/DescriptionList'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState, EmptyState } from '@/components/common/States'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { AreaChartCard, BarChartCard } from '@/components/charts/Charts'
import { DataTable } from '@/components/tables/DataTable'
import { MockMap } from '@/components/monitoring/MockMap'
import { AvailabilityMeter } from '@/components/monitoring/AvailabilityMeter'
import { formatFrequency } from '@/components/monitoring/format'
import { CentreFormModal } from './CentreFormModal'
import { useCentreStatus } from './useCentreStatus'
import { useAsync } from '@/hooks/useAsync'
import { useNow } from '@/hooks/useUtils'
import { usePermission } from '@/context/AdminAuthContext'
import { centreService } from '@/services/centreService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate, formatDateTime, formatDayDate, formatNumber, formatRelative, pluralize } from '@/utils/format'

export default function TestCentreDetailPage() {
  const { id } = useParams()
  const can = usePermission()
  const canManage = can(P.CENTRES_MANAGE)
  const now = useNow(10000)
  const { data: c, loading, error, reload, setData } = useAsync(() => centreService.getCentreById(id), [id])
  const [editing, setEditing] = useState(false)
  const merge = (updated) => setData((d) => ({ ...d, ...updated }))
  const status = useCentreStatus(merge)

  if (loading && !c) return <SkeletonDetail />
  if (error || !c) {
    const missing = error?.status === 404
    return (
      <div className="card">
        <ErrorState
          title={missing ? 'Test centre not found' : 'Unable to load test centre.'}
          message={missing ? `We couldn’t find a test centre with ID ${id}.` : 'Unable to load this test centre. Please try again.'}
          onRetry={missing ? undefined : reload}
          showBack
        />
      </div>
    )
  }

  const active = c.status === 'Active'
  const detections30d = c.detectionSeries?.reduce((a, p) => a + p.value, 0) ?? 0

  return (
    <>
      <PageHeader
        back={{ to: '/admin/test-centres', label: 'Test Centres' }}
        title={c.name}
        meta={<StatusBadge status={c.status} />}
        description={`${c.code} · ${c.city}, ${c.region}`}
        actions={
          canManage && (
            <>
              <Button icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>
              {active
                ? <Button variant="danger-ghost" icon={PowerOff} onClick={() => status.deactivate(c)}>Deactivate</Button>
                : <Button variant="primary" icon={Power} onClick={() => status.activate(c)}>Activate</Button>}
            </>
          )
        }
      />

      {!active && (
        <div role="status" className="mb-6 rounded-card border border-line bg-subtle px-4 py-3 text-[13px] text-ink-2">
          This centre is inactive — it isn’t being checked and users can’t add it to new monitoring jobs.
        </div>
      )}

      <div className="space-y-6">
        <MetricStrip
          className="bg-surface"
          items={[
            { label: 'Running jobs', value: formatNumber(c.monitoringJobs) },
            { label: 'Slots detected (7d)', value: formatNumber(c.slotsDetected7d), hint: `${formatNumber(c.slotsDetected)} all time` },
            { label: 'Demand score', value: `${c.demandScore}/100` },
            { label: 'Average wait', value: c.avgWaitWeeks ? `${c.avgWaitWeeks} weeks` : '—' },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <Card title="Location" className="lg:col-span-3" padding="none">
            <div className="p-3 sm:p-4">
              <MockMap lat={c.coordinates?.lat} lng={c.coordinates?.lng} label={c.shortName} />
            </div>
          </Card>
          <Card title="Centre details" className="lg:col-span-2">
            <DescriptionList
              columns={1}
              dense
              items={[
                { label: 'Address', value: c.address },
                { label: 'City / region', value: `${c.city} · ${c.region}` },
                { label: 'Centre code', value: <CopyId value={c.code} /> },
                { label: 'Coordinates', value: c.coordinates ? `${c.coordinates.lat.toFixed(4)}, ${c.coordinates.lng.toFixed(4)}` : '—', mono: true },
                { label: 'Check interval', value: formatFrequency(c.checkInterval) },
                { label: 'Availability', value: <AvailabilityMeter level={c.availability} /> },
                { label: 'Last checked', value: c.lastChecked ? <span title={formatDateTime(c.lastChecked)}>{formatRelative(c.lastChecked, now)}</span> : 'Never' },
                c.notes && { label: 'Notes', value: <span className="whitespace-pre-line text-ink-2">{c.notes}</span> },
              ]}
            />
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <AreaChartCard
            className="lg:col-span-3"
            title="Detections"
            description={`${formatNumber(detections30d)} slots detected in the last 30 days`}
            data={c.detectionSeries}
            series={[{ key: 'value', label: 'Slots detected' }]}
            height={240}
          />
          <BarChartCard
            className="lg:col-span-2"
            title="Detections by hour"
            description="When new availability tends to appear"
            data={c.hourly}
            xKey="hour"
            xType="category"
            series={[{ key: 'value', label: 'Slots detected' }]}
            height={240}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card title="Monitoring activity" description={`${pluralize(c.jobs?.length || 0, 'running job')} include this centre`} icon={Radar} className="lg:col-span-2" padding="none">
            {c.jobs?.length ? (
              <ul className="divide-y divide-line">
                {c.jobs.map((j) => (
                  <li key={j.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <EntityLink to={`/admin/monitoring/${j.id}`} mono className="font-medium">{j.id}</EntityLink>
                      <p className="truncate text-xs text-ink-3">{j.learner?.name || '—'} · {j.user?.name || '—'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-ink-2">{formatFrequency(j.frequency)}</p>
                      <p className="text-xs text-ink-4 tabular">{j.lastChecked ? formatRelative(j.lastChecked, now) : 'Not checked'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={Radar} title="No running jobs" description={active ? 'No active monitoring currently includes this centre.' : 'Monitoring is stopped while the centre is inactive.'} />
            )}
          </Card>

          <div className="min-w-0 lg:col-span-3">
            <RecentSlots slots={c.recentSlots || []} canViewSlots={can(P.SLOTS_VIEW)} />
          </div>
        </div>

        <p className="text-xs text-ink-4">Added {formatDate(c.createdAt)} · last updated {formatRelative(c.updatedAt, now)}</p>
      </div>

      <CentreFormModal open={editing} centre={c} onClose={() => setEditing(false)} onSaved={merge} />
      {status.confirmElement}
    </>
  )
}

function RecentSlots({ slots, canViewSlots }) {
  const columns = [
    { key: 'id', header: 'Slot', mobile: 'primary', hideable: false, cell: (s) => <CopyId value={s.id} to={canViewSlots ? `/admin/slots/${s.id}` : undefined} /> },
    { key: 'testDate', header: 'Test date', cell: (s) => <span className="whitespace-nowrap text-ink-2 tabular">{formatDayDate(s.testDate)} · <span className="font-mono text-[12.5px]">{s.testTime}</span></span> },
    { key: 'learner', header: 'Learner', cell: (s) => <span className="whitespace-nowrap text-ink-2">{s.learner?.name || '—'}</span> },
    { key: 'detectedAt', header: 'Detected', cell: (s) => <time dateTime={s.detectedAt} title={formatDateTime(s.detectedAt)} className="whitespace-nowrap text-ink-3">{formatRelative(s.detectedAt)}</time> },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (s) => <StatusBadge status={s.status} /> },
  ]
  return (
    <DataTable
      caption="Recent slots at this centre"
      toolbar={<h2 className="py-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">Recent slots</h2>}
      columnToggle={false}
      columns={columns}
      rows={slots}
      emptyIcon={CalendarClock}
      emptyTitle="No slots detected yet"
      emptyDescription="Availability detected at this centre will appear here."
    />
  )
}
