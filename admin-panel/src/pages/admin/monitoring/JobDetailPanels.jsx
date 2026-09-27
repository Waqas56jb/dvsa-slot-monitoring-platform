import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BellRing, CalendarClock, CalendarRange, Clock3, GraduationCap, History, MapPin, UserRound } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { DescriptionList, MetricStrip } from '@/components/common/DescriptionList'
import { CopyId, MaskedValue, EntityLink } from '@/components/common/Misc'
import { ActivityTimeline } from '@/components/common/ActivityTimeline'
import { Tabs } from '@/components/common/Tabs'
import { DataTable } from '@/components/tables/DataTable'
import { formatCountdown, formatFrequency, daysBetween, minutesBetween } from '@/components/monitoring/format'
import { useNow } from '@/hooks/useUtils'
import { usePermission } from '@/context/AdminAuthContext'
import { learnerService } from '@/services/learnerService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate, formatDateTime, formatDayDate, formatNumber, formatRelative, pluralize } from '@/utils/format'

/** Live stats: last check (relative), next check countdown, counters. */
export function StatsCard({ job }) {
  const now = useNow(1000)
  const running = job.status === 'Running'
  // If the scheduled time has passed but the backend hasn't reported yet, show "Due now".
  const next = running ? formatCountdown(job.nextCheck, now) : 'Not scheduled'
  return (
    <Card title="Monitoring stats" description="Reported by the monitoring backend. Times update live.">
      <MetricStrip
        items={[
          { label: 'Last check', value: job.lastChecked ? formatRelative(job.lastChecked, now) : 'Never', hint: job.lastChecked ? formatDateTime(job.lastChecked) : undefined },
          { label: 'Next check', value: next, hint: running ? formatFrequency(job.frequency) : job.status },
          { label: 'Checks performed', value: formatNumber(job.checksCount) },
          { label: 'Slots detected', value: formatNumber(job.slotsFound), hint: pluralize(job.alertsSent, 'alert') + ' sent' },
        ]}
      />
      <DescriptionList
        className="mt-5"
        columns={3}
        items={[
          { label: 'Status', value: <StatusBadge status={job.status} pulse={running} /> },
          { label: 'Check frequency', value: formatFrequency(job.frequency) },
          { label: 'Alert count', value: <span className="tabular">{formatNumber(job.alertsSent)}</span> },
          {
            label: 'Alert channels',
            value: job.channels?.length ? <span className="flex flex-wrap gap-1.5">{job.channels.map((c) => <Badge key={c}>{c}</Badge>)}</span> : 'None',
          },
          { label: 'Created', value: formatDateTime(job.createdAt) },
          { label: 'Last updated', value: job.updatedAt ? formatRelative(job.updatedAt, now) : '—' },
        ]}
      />
    </Card>
  )
}

/** Date + time preferences. */
export function PreferencesCard({ job }) {
  const days = daysBetween(job.dateFrom, job.dateTo)
  const mins = minutesBetween(job.timeFrom, job.timeTo)
  const hours = mins != null ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : null
  return (
    <Card title="Preferences" description="What this job is looking for.">
      <div className="grid gap-5 sm:grid-cols-2">
        <PrefBlock icon={CalendarRange} title="Date preferences">
          <p className="text-sm font-medium text-ink tabular">{formatDate(job.dateFrom)} – {formatDate(job.dateTo)}</p>
          <p className="mt-1 text-[13px] text-ink-3">{days ? `${days}-day window` : '—'}{job.weekdaysOnly ? ' · Weekdays only' : ' · Any day'}</p>
        </PrefBlock>
        <PrefBlock icon={Clock3} title="Time preferences">
          <p className="font-mono text-sm font-medium text-ink">{job.timeFrom}–{job.timeTo}</p>
          <p className="mt-1 text-[13px] text-ink-3">{hours ? `${hours} daily window` : '—'}</p>
        </PrefBlock>
      </div>
    </Card>
  )
}

function PrefBlock({ icon: Icon, title, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-subtle/60 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-3"><Icon className="h-3.5 w-3.5" aria-hidden />{title}</p>
      {children}
    </div>
  )
}

export function UserCard({ user }) {
  const can = usePermission()
  return (
    <Card title="User" icon={UserRound} actions={user && can(P.USERS_VIEW) && <Link to={`/admin/users/${user.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link>}>
      {user ? (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-[13px] text-ink-3">{user.email}</p>
          </div>
          <StatusBadge status={user.status} size="sm" />
        </div>
      ) : <p className="text-sm text-ink-3">User account no longer exists.</p>}
    </Card>
  )
}

export function LearnerCard({ learner }) {
  const can = usePermission()
  return (
    <Card title="Learner" icon={GraduationCap} actions={learner && can(P.LEARNERS_VIEW) && <Link to={`/admin/learners/${learner.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link>}>
      {learner ? (
        <DescriptionList
          columns={1}
          dense
          items={[
            { label: 'Name', value: learner.name },
            {
              label: 'Licence reference',
              value: <MaskedValue masked={learner.licenceMasked} canReveal={can(P.LEARNERS_REVEAL)} onReveal={() => learnerService.revealReference(learner.id)} />,
            },
            { label: 'Reference status', value: <StatusBadge status={learner.referenceStatus} tone={learner.referenceStatus === 'Verified' ? 'success' : learner.referenceStatus === 'Unverified' ? 'neutral' : 'warning'} /> },
          ]}
        />
      ) : <p className="text-sm text-ink-3">Learner record no longer exists.</p>}
    </Card>
  )
}

export function CentresCard({ centres = [] }) {
  const can = usePermission()
  return (
    <Card title="Test centres" icon={MapPin} description={pluralize(centres.length, 'centre')} padding="none">
      {centres.length ? (
        <ul className="divide-y divide-line">
          {centres.map((c) => (
            <li key={c.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
              <div className="min-w-0">
                {can(P.CENTRES_VIEW) ? <EntityLink to={`/admin/test-centres/${c.id}`} className="block truncate text-sm font-medium">{c.shortName}</EntityLink> : <span className="block truncate text-sm font-medium text-ink">{c.shortName}</span>}
                <span className="block truncate text-xs text-ink-3">{c.city}</span>
              </div>
              <span className="shrink-0 font-mono text-[12px] text-ink-3">{c.code}</span>
            </li>
          ))}
        </ul>
      ) : <p className="px-5 py-6 text-center text-sm text-ink-3">No centres selected.</p>}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Tabs: detected slots · alerts · activity                            */
/* ------------------------------------------------------------------ */

function usePaged(rows, initial = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initial)
  const data = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize])
  return { data, page, pageSize, total: rows.length, onPageChange: setPage, onPageSizeChange: (n) => { setPageSize(n); setPage(1) } }
}

export function JobActivityTabs({ job }) {
  const [tab, setTab] = useState('slots')
  const tabs = [
    { value: 'slots', label: 'Detected slots', icon: CalendarClock, count: job.slots?.length ?? 0 },
    { value: 'alerts', label: 'Alerts', icon: BellRing, count: job.alerts?.length ?? 0 },
    { value: 'activity', label: 'Job activity', icon: History },
  ]
  return (
    <section aria-label="Job results" className="min-w-0">
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <div className="mt-4" role="tabpanel">
        {tab === 'slots' && <SlotsTable slots={job.slots || []} />}
        {tab === 'alerts' && <AlertsTable alerts={job.alerts || []} />}
        {tab === 'activity' && <ActivityPanel job={job} />}
      </div>
    </section>
  )
}

function SlotsTable({ slots }) {
  const can = usePermission()
  const paged = usePaged(slots)
  const columns = [
    { key: 'id', header: 'Slot', mobile: 'primary', hideable: false, cell: (s) => <CopyId value={s.id} to={can(P.SLOTS_VIEW) ? `/admin/slots/${s.id}` : undefined} /> },
    { key: 'centre', header: 'Centre', cell: (s) => <span className="whitespace-nowrap text-ink-2">{s.centre?.shortName || '—'}</span> },
    { key: 'testDate', header: 'Test date', cell: (s) => <span className="whitespace-nowrap text-ink-2 tabular">{formatDayDate(s.testDate)} · <span className="font-mono text-[12.5px]">{s.testTime}</span></span> },
    { key: 'detectedAt', header: 'Detected', cell: (s) => <time dateTime={s.detectedAt} title={formatDateTime(s.detectedAt)} className="whitespace-nowrap text-ink-3">{formatRelative(s.detectedAt)}</time> },
    { key: 'alertStatus', header: 'Alert', cell: (s) => <StatusBadge status={s.alertStatus} size="sm" /> },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (s) => <StatusBadge status={s.status} /> },
  ]
  return (
    <DataTable
      caption="Detected slots for this job"
      columns={columns}
      rows={paged.data}
      total={paged.total}
      page={paged.page}
      pageSize={paged.pageSize}
      onPageChange={paged.onPageChange}
      onPageSizeChange={paged.onPageSizeChange}
      columnToggle={false}
      emptyIcon={CalendarClock}
      emptyTitle="No slots detected yet"
      emptyDescription="Matching availability reported for this job will appear here."
    />
  )
}

function AlertsTable({ alerts }) {
  const paged = usePaged(alerts)
  const columns = [
    { key: 'id', header: 'Alert', mobile: 'primary', hideable: false, cell: (n) => <span className="font-mono text-[12.5px] text-ink-2">{n.id}</span> },
    { key: 'channel', header: 'Channel', cell: (n) => <Badge>{n.channel}</Badge> },
    { key: 'message', header: 'Message', cell: (n) => <span className="block max-w-[320px] truncate text-ink-2" title={n.message}>{n.message}</span> },
    { key: 'createdAt', header: 'Sent', cell: (n) => <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="whitespace-nowrap text-ink-3">{formatRelative(n.createdAt)}</time> },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (n) => <span title={n.error || undefined}><StatusBadge status={n.status} /></span> },
  ]
  return (
    <DataTable
      caption="Alerts sent for this job"
      columns={columns}
      rows={paged.data}
      total={paged.total}
      page={paged.page}
      pageSize={paged.pageSize}
      onPageChange={paged.onPageChange}
      onPageSizeChange={paged.onPageSizeChange}
      columnToggle={false}
      emptyIcon={BellRing}
      emptyTitle="No alerts sent"
      emptyDescription="Alerts are sent when a detected slot matches this job’s preferences."
    />
  )
}

const ACTIVITY_TONE = { Failed: 'danger', Warning: 'warning' }

function ActivityPanel({ job }) {
  const events = useMemo(() => {
    const list = (job.activity || []).map((a) => ({
      title: a.event,
      description: [a.description, a.actor?.name && `by ${a.actor.name}`].filter(Boolean).join(' · '),
      at: a.timestamp,
      tone: ACTIVITY_TONE[a.status] || (a.category === 'Admin' ? 'brand' : 'neutral'),
    }))
    if (!list.some((e) => /created/i.test(e.title))) list.push({ title: 'Monitoring job created', description: `${pluralize(job.centreIds?.length || 0, 'centre')} · ${formatFrequency(job.frequency).toLowerCase()}`, at: job.createdAt, tone: 'success' })
    return list.sort((a, b) => new Date(b.at) - new Date(a.at))
  }, [job])
  return (
    <Card>
      <ActivityTimeline events={events} emptyLabel="No activity recorded for this job yet." />
    </Card>
  )
}
