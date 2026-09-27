import { useParams } from 'react-router-dom'
import { BellOff, ChevronDown, ExternalLink, Radar, User } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { DescriptionList } from '@/components/common/DescriptionList'
import { ActivityTimeline } from '@/components/common/ActivityTimeline'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState, EmptyState } from '@/components/common/States'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { DataTable } from '@/components/tables/DataTable'
import { useAsync } from '@/hooks/useAsync'
import { useNow } from '@/hooks/useUtils'
import { slotService } from '@/services/slotService'
import { formatDateTime, formatDayDate, formatDuration, formatRelative } from '@/utils/format'
import { useSlotStatusAction } from './slotStatus'
import { SlotLifecycle } from './SlotLifecycle'
import { ChannelLabel } from '../notifications/ChannelLabel'

const BACK = { to: '/admin/slots', label: 'Slots' }

export default function SlotDetailPage() {
  const { id } = useParams()
  const now = useNow(15000)
  const { data: slot, error, loading, reload, setData } = useAsync(() => slotService.getSlotById(id), [id])
  const { menuItems, confirmElement } = useSlotStatusAction()

  if (loading && !slot) return <><PageHeader title="Slot" back={BACK} /><SkeletonDetail /></>
  if (error || !slot) {
    const nf = error?.status === 404
    return (
      <>
        <PageHeader title="Slot" back={BACK} />
        <div className="card">
          <ErrorState
            title={nf ? 'Slot not found' : 'Unable to load slot'}
            message={nf ? `No slot with ID ${id} exists, or it has been removed.` : 'Unable to load this slot. Please try again.'}
            onRetry={nf ? undefined : reload}
            showBack
          />
        </div>
      </>
    )
  }

  const onUpdated = (updated) => {
    setData((s) => ({ ...s, status: updated.status, updatedAt: updated.updatedAt }))
    reload({ silent: true })
  }
  const markItems = menuItems(slot, onUpdated)

  const alertColumns = [
    { key: 'id', header: 'Notification', mobile: 'primary', cell: (a) => <CopyId value={a.id} to={`/admin/notifications?search=${encodeURIComponent(a.id)}`} /> },
    { key: 'channel', header: 'Channel', cell: (a) => <ChannelLabel channel={a.channel} /> },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (a) => <StatusBadge status={a.status} /> },
    { key: 'deliveredAt', header: 'Delivered', cell: (a) => <span className="whitespace-nowrap text-ink-3 tabular">{a.deliveredAt ? formatDateTime(a.deliveredAt) : '—'}</span> },
    { key: 'error', header: 'Error', cell: (a) => (a.error ? <span className="block max-w-[260px] truncate text-danger" title={a.error}>{a.error}</span> : <span className="text-ink-4">—</span>) },
  ]

  return (
    <>
      <PageHeader
        back={BACK}
        title={slot.id}
        documentTitle={`Slot ${slot.id}`}
        meta={<StatusBadge status={slot.status} />}
        description={`${slot.centre?.name ?? 'Unknown centre'} · ${formatDayDate(slot.testDate)} at ${slot.testTime}`}
        actions={
          <>
            {slot.userId && <Button icon={User} to={`/admin/users/${slot.userId}`}>View user</Button>}
            {slot.monitoringId && <Button icon={Radar} to={`/admin/monitoring/${slot.monitoringId}`}>View monitoring</Button>}
            {markItems.length > 0 && (
              <DropdownMenu items={markItems} trigger={<Button variant="primary" iconRight={ChevronDown}>Mark status</Button>} />
            )}
          </>
        }
      />

      <div className="space-y-6">
        <Card title="Lifecycle" description="Detection and alerting are automated. Booking is always completed by the user on the official service.">
          <SlotLifecycle slot={slot} />
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Card title="Slot information">
              <DescriptionList
                items={[
                  { label: 'Test centre', value: slot.centre ? <EntityLink to={`/admin/test-centres/${slot.centre.id}`} className="font-medium">{slot.centre.name}</EntityLink> : '—' },
                  { label: 'Status', value: <StatusBadge status={slot.status} /> },
                  { label: 'Test date', value: formatDayDate(slot.testDate) },
                  { label: 'Test time', value: <span className="font-mono text-[13px]">{slot.testTime}</span> },
                  { label: 'Detected', value: <span title={formatDateTime(slot.detectedAt)}>{formatDateTime(slot.detectedAt)} <span className="text-ink-4">· {formatRelative(slot.detectedAt, now)}</span></span> },
                  { label: 'Detection latency', value: <span className="tabular">{formatDuration(slot.latencyMs)}</span> },
                  { label: 'Source status', value: <Badge tone={slot.sourceStatus === 'Listed' ? 'success' : 'neutral'} dot>{slot.sourceStatus || 'Unknown'}</Badge> },
                  { label: 'Alert status', value: <StatusBadge status={slot.alertStatus} /> },
                  { label: 'User', value: slot.user ? <EntityLink to={`/admin/users/${slot.user.id}`}>{slot.user.name}</EntityLink> : '—' },
                  { label: 'Learner', value: slot.learner ? <span><EntityLink to={`/admin/learners/${slot.learner.id}`}>{slot.learner.name}</EntityLink> <span className="font-mono text-xs text-ink-4">{slot.learner.licenceMasked}</span></span> : '—' },
                  { label: 'Last updated', value: formatDateTime(slot.updatedAt) },
                ]}
              />
            </Card>

            <Card title="Matched monitoring jobs" description="Jobs whose preferences this slot satisfied." padding="none">
              {slot.matchedJobs?.length ? (
                <ul className="divide-y divide-line">
                  {slot.matchedJobs.map((j) => (
                    <li key={j.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <EntityLink to={`/admin/monitoring/${j.id}`} mono className="font-medium">{j.id}</EntityLink>
                          {j.id === slot.monitoringId && <Badge size="sm" tone="brand">Primary</Badge>}
                          <StatusBadge status={j.status} size="sm" />
                        </div>
                        <p className="mt-1 truncate text-[13px] text-ink-3">
                          {j.user ? <EntityLink to={`/admin/users/${j.user.id}`} className="text-ink-2">{j.user.name}</EntityLink> : 'Unknown user'}
                          {j.learner && <> · learner <EntityLink to={`/admin/learners/${j.learner.id}`} className="text-ink-2">{j.learner.name}</EntityLink></>}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        {j.channels?.map((c) => <ChannelLabel key={c} channel={c} compact />)}
                        <Button size="xs" variant="ghost" icon={ExternalLink} to={`/admin/monitoring/${j.id}`} aria-label={`Open ${j.id}`} iconOnly />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={Radar} title="No matched jobs" description="The matching jobs may have been deleted." />
              )}
            </Card>

            <DataTable
              caption="Alerts sent for this slot"
              columns={alertColumns}
              rows={slot.alerts || []}
              columnToggle={false}
              emptyIcon={BellOff}
              emptyTitle="No alerts sent"
              emptyDescription={slot.status === 'New' ? 'Alerts are created once matching completes.' : 'No user notifications were created for this slot.'}
              toolbar={<div><h2 className="text-[15px] font-semibold text-ink">Alerts</h2><p className="mt-0.5 text-[13px] text-ink-3">Notifications sent to the user about this slot.</p></div>}
            />
          </div>

          <div className="min-w-0 space-y-6">
            <Card title="Activity">
              <ActivityTimeline events={slot.timeline} emptyLabel="No activity recorded for this slot." />
            </Card>
          </div>
        </div>
      </div>
      {confirmElement}
    </>
  )
}
