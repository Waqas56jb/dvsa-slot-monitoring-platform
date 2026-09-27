import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, CalendarCheck2, CreditCard, Eye, GraduationCap, History, Radar } from 'lucide-react'
import { DataTable } from '@/components/tables/DataTable'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/States'
import { ActivityFeed } from '@/components/common/ActivityTimeline'
import { CentreList, ReferenceCell } from '@/pages/admin/learners/learnerUi'
import { byNewest, useClientPage } from './detailShared'
import { formatCurrency, formatDate, formatDateTime, formatDayDate, formatRelative, formatShortDate } from '@/utils/format'

const Stamp = ({ at, relative = false }) => (
  <time dateTime={at} title={formatDateTime(at)} className="whitespace-nowrap text-ink-3">{relative ? formatRelative(at) : formatDateTime(at)}</time>
)

/** Shared table chrome for related records (no toolbar, client-side paging). */
function RecordTable({ rows, caption, ...props }) {
  const paging = useClientPage(rows)
  return <DataTable caption={caption} columnToggle={false} dense {...props} {...paging} />
}

export function UserLearnersTab({ learners }) {
  const navigate = useNavigate()
  const rows = useMemo(() => byNewest(learners, 'createdAt'), [learners])
  return (
    <RecordTable
      caption="Learners on this account"
      rows={rows}
      onRowClick={(l) => navigate(`/admin/learners/${l.id}`)}
      rowActions={(l) => [{ label: 'View learner', icon: Eye, to: `/admin/learners/${l.id}` }]}
      emptyIcon={GraduationCap}
      emptyTitle="No learners yet"
      emptyDescription="This user hasn’t added a learner to their account."
      columns={[
        { key: 'name', header: 'Learner', mobile: 'primary', cell: (l) => <Identity name={l.name} subtitle={`${l.relationship} · ${l.testType}`} /> },
        { key: 'reference', header: 'Licence / reference', cell: (l) => <ReferenceCell masked={l.licenceMasked} status={l.referenceStatus} /> },
        { key: 'monitoringCount', header: 'Monitoring', align: 'right', cell: (l) => <span className="tabular">{l.monitoringCount ?? 0}</span> },
        { key: 'slotsFound', header: 'Slots found', align: 'right', cell: (l) => <span className="tabular">{l.slotsFound ?? 0}</span> },
        { key: 'status', header: 'Status', mobile: 'badge', cell: (l) => <StatusBadge status={l.status} /> },
        { key: 'createdAt', header: 'Added', cell: (l) => <span className="whitespace-nowrap text-ink-3">{formatDate(l.createdAt)}</span> },
      ]}
    />
  )
}

export function UserMonitoringTab({ jobs }) {
  const navigate = useNavigate()
  const rows = useMemo(() => byNewest(jobs, 'createdAt'), [jobs])
  return (
    <RecordTable
      caption="Monitoring jobs for this user"
      rows={rows}
      onRowClick={(j) => navigate(`/admin/monitoring/${j.id}`)}
      rowActions={(j) => [{ label: 'View monitoring job', icon: Eye, to: `/admin/monitoring/${j.id}` }]}
      emptyIcon={Radar}
      emptyTitle="No monitoring jobs"
      emptyDescription="Monitoring jobs appear once the user sets preferences for a learner."
      columns={[
        { key: 'id', header: 'Job', mobile: 'primary', cell: (j) => <CopyId value={j.id} to={`/admin/monitoring/${j.id}`} /> },
        { key: 'learner', header: 'Learner', cell: (j) => (j.learner ? <EntityLink to={`/admin/learners/${j.learner.id}`}>{j.learner.name}</EntityLink> : '—') },
        { key: 'centres', header: 'Centres', cell: (j) => <CentreList centres={j.centres} /> },
        { key: 'range', header: 'Date range', cell: (j) => <span className="whitespace-nowrap tabular">{formatShortDate(j.dateFrom)} – {formatDate(j.dateTo)}</span> },
        { key: 'status', header: 'Status', mobile: 'badge', cell: (j) => <StatusBadge status={j.status} pulse={j.status === 'Running'} /> },
        { key: 'slotsFound', header: 'Slots found', align: 'right', cell: (j) => <span className="tabular">{j.slotsFound ?? 0}</span> },
      ]}
    />
  )
}

export function UserSlotsTab({ slots }) {
  const navigate = useNavigate()
  const rows = useMemo(() => byNewest(slots, 'detectedAt'), [slots])
  return (
    <RecordTable
      caption="Slots detected for this user"
      rows={rows}
      onRowClick={(s) => navigate(`/admin/slots/${s.id}`)}
      rowActions={(s) => [{ label: 'View slot', icon: Eye, to: `/admin/slots/${s.id}` }]}
      emptyIcon={CalendarCheck2}
      emptyTitle="No slots detected"
      emptyDescription="Slots matching this user’s monitoring preferences will appear here."
      columns={[
        { key: 'id', header: 'Slot', mobile: 'primary', cell: (s) => <CopyId value={s.id} to={`/admin/slots/${s.id}`} /> },
        { key: 'centre', header: 'Test centre', cell: (s) => (s.centre ? <EntityLink to={`/admin/test-centres/${s.centre.id}`}>{s.centre.shortName}</EntityLink> : '—') },
        { key: 'test', header: 'Test date', cell: (s) => <span className="whitespace-nowrap tabular">{formatDayDate(s.testDate)} · {s.testTime}</span> },
        { key: 'learner', header: 'Learner', cell: (s) => s.learner?.name || '—' },
        { key: 'detectedAt', header: 'Detected', cell: (s) => <Stamp at={s.detectedAt} relative /> },
        { key: 'status', header: 'Status', mobile: 'badge', cell: (s) => <StatusBadge status={s.status} /> },
      ]}
    />
  )
}

export function UserNotificationsTab({ notifications }) {
  const rows = useMemo(() => byNewest(notifications, 'createdAt'), [notifications])
  return (
    <RecordTable
      caption="Notifications sent to this user"
      rows={rows}
      emptyIcon={BellRing}
      emptyTitle="No notifications"
      emptyDescription="Alerts and account emails sent to this user will appear here."
      columns={[
        {
          key: 'message', header: 'Message', mobile: 'primary',
          cell: (n) => (
            <span className="block min-w-0 max-w-md">
              <span className="block truncate font-medium text-ink">{n.type}</span>
              <span className="block truncate text-xs text-ink-3" title={n.message}>{n.message}</span>
            </span>
          ),
        },
        { key: 'channel', header: 'Channel', cell: (n) => <Badge>{n.channel}</Badge> },
        { key: 'status', header: 'Status', mobile: 'badge', cell: (n) => <StatusBadge status={n.status} /> },
        { key: 'createdAt', header: 'Created', cell: (n) => <Stamp at={n.createdAt} /> },
      ]}
    />
  )
}

export function UserPaymentsTab({ payments }) {
  const navigate = useNavigate()
  const rows = useMemo(() => byNewest(payments, 'date'), [payments])
  return (
    <RecordTable
      caption="Payments by this user"
      rows={rows}
      onRowClick={(p) => navigate(`/admin/payments/${p.id}`)}
      rowActions={(p) => [{ label: 'View payment', icon: Eye, to: `/admin/payments/${p.id}` }]}
      emptyIcon={CreditCard}
      emptyTitle="No payments"
      emptyDescription="Subscription payments for this user will appear here."
      columns={[
        { key: 'id', header: 'Transaction', mobile: 'primary', cell: (p) => <CopyId value={p.id} to={`/admin/payments/${p.id}`} /> },
        { key: 'plan', header: 'Plan', cell: (p) => p.plan || '—' },
        { key: 'amount', header: 'Amount', align: 'right', cell: (p) => <span className="font-medium text-ink tabular">{formatCurrency(p.amount, p.currency)}</span> },
        { key: 'method', header: 'Method', cell: (p) => <span className="whitespace-nowrap">{p.method || '—'}</span> },
        { key: 'status', header: 'Status', mobile: 'badge', cell: (p) => <StatusBadge status={p.status} /> },
        { key: 'date', header: 'Date', cell: (p) => <Stamp at={p.date} /> },
      ]}
    />
  )
}

export function UserActivityTab({ activity }) {
  const items = useMemo(() => byNewest(activity, 'timestamp'), [activity])
  return (
    <Card title="Activity" description="Recent events involving this account, newest first." icon={History}>
      {items.length ? (
        <ActivityFeed items={items} />
      ) : (
        <EmptyState compact icon={History} title="No activity yet" description="Sign-ins, monitoring changes and alerts for this user will appear here." />
      )}
    </Card>
  )
}
