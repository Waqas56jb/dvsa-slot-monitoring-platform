import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, BellRing, CalendarCheck2, CalendarRange, Clock, Eye, MapPin, Radar } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { CopyId, EntityLink } from '@/components/common/Misc'
import { EmptyState } from '@/components/common/States'
import { DataTable } from '@/components/tables/DataTable'
import { byNewest, useClientPage } from '@/pages/admin/users/detailShared'
import { formatDate, formatDateTime, formatDayDate, formatRelative, formatShortDate } from '@/utils/format'

/** Linked account owner. */
export function LearnerUserCard({ user }) {
  return (
    <Card title="Account owner" actions={user && <Button variant="ghost" size="sm" iconRight={ArrowUpRight} to={`/admin/users/${user.id}`}>View user</Button>}>
      {user ? (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <Link to={`/admin/users/${user.id}`} className="block truncate text-sm font-medium text-ink hover:text-brand-600 dark:hover:text-brand-300">{user.name}</Link>
            <p className="truncate text-[13px] text-ink-3">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={user.status} size="sm" />
              <span className="font-mono text-[11px] text-ink-4">{user.id}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-3">This learner isn’t linked to a user account.</p>
      )}
    </Card>
  )
}

function Pref({ icon: Icon, label, children }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle text-ink-3">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink-3">{label}</p>
        <div className="mt-1 text-sm text-ink">{children}</div>
      </div>
    </div>
  )
}

/** Centre / date / time preferences plus the jobs running against them. */
export function MonitoringConfigCard({ learner }) {
  const jobs = useMemo(() => byNewest(learner.monitoring || [], 'createdAt'), [learner.monitoring])
  const hasDates = learner.earliestDate || learner.latestDate
  const hasTimes = learner.timeFrom || learner.timeTo
  return (
    <Card title="Monitoring configuration" description="Preferences used to match newly detected slots." icon={Radar}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Pref icon={MapPin} label={`Preferred test centres (${learner.centres.length})`}>
          {learner.centres.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {learner.centres.map((c) => (
                <li key={c.id} className="min-w-0">
                  <Link
                    to={`/admin/test-centres/${c.id}`}
                    title={c.name}
                    className="inline-flex max-w-full items-center gap-1 truncate rounded-md border border-line bg-surface px-2 py-0.5 text-[13px] text-ink-2 transition-colors hover:border-line-strong hover:bg-subtle hover:text-ink"
                  >
                    <span className="truncate">{c.shortName || c.name}</span>
                    {c.city && <span className="shrink-0 text-xs text-ink-4">{c.city}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <span className="text-ink-3">No centres selected</span>}
        </Pref>
        <div className="grid gap-5">
          <Pref icon={CalendarRange} label="Preferred dates">
            {hasDates ? <span className="tabular">{formatDate(learner.earliestDate)} – {formatDate(learner.latestDate)}</span> : <span className="text-ink-3">Any date</span>}
          </Pref>
          <Pref icon={Clock} label="Preferred times">
            {hasTimes ? <span className="tabular">{learner.timeFrom || '—'} – {learner.timeTo || '—'}</span> : <span className="text-ink-3">Any time</span>}
          </Pref>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2.5 text-xs font-medium text-ink-3">Monitoring jobs</p>
        {jobs.length ? (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <CopyId value={j.id} to={`/admin/monitoring/${j.id}`} />
                  <span className="truncate text-xs text-ink-3 tabular">{formatShortDate(j.dateFrom)} – {formatDate(j.dateTo)} · {j.timeFrom}–{j.timeTo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-3 tabular">{j.slotsFound ?? 0} slots</span>
                  <StatusBadge status={j.status} size="sm" pulse={j.status === 'Running'} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[13px] text-ink-3">No monitoring jobs have been created for this learner.</p>
        )}
      </div>
    </Card>
  )
}

export function LearnerSlotsTable({ slots }) {
  const navigate = useNavigate()
  const rows = useMemo(() => byNewest(slots, 'detectedAt'), [slots])
  const paging = useClientPage(rows, 8)
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <CalendarCheck2 className="h-4 w-4 text-ink-3" aria-hidden />
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Detected slots</h2>
        <span className="rounded-full bg-subtle px-1.5 py-px text-[11px] text-ink-3 tabular">{rows.length}</span>
      </div>
      <DataTable
        caption="Slots detected for this learner"
        columnToggle={false}
        dense
        {...paging}
        onRowClick={(s) => navigate(`/admin/slots/${s.id}`)}
        rowActions={(s) => [{ label: 'View slot', icon: Eye, to: `/admin/slots/${s.id}` }]}
        emptyIcon={CalendarCheck2}
        emptyTitle="No slots detected yet"
        emptyDescription="Slots matching this learner’s preferences will appear here as they’re detected."
        columns={[
          { key: 'id', header: 'Slot', mobile: 'primary', cell: (s) => <CopyId value={s.id} to={`/admin/slots/${s.id}`} /> },
          { key: 'centre', header: 'Test centre', cell: (s) => (s.centre ? <EntityLink to={`/admin/test-centres/${s.centre.id}`}>{s.centre.shortName}</EntityLink> : '—') },
          { key: 'test', header: 'Test date', cell: (s) => <span className="whitespace-nowrap tabular">{formatDayDate(s.testDate)} · {s.testTime}</span> },
          { key: 'detectedAt', header: 'Detected', cell: (s) => <time dateTime={s.detectedAt} title={formatDateTime(s.detectedAt)} className="whitespace-nowrap text-ink-3">{formatRelative(s.detectedAt)}</time> },
          { key: 'alertStatus', header: 'Alert', cell: (s) => <StatusBadge status={s.alertStatus} size="sm" /> },
          { key: 'status', header: 'Status', mobile: 'badge', cell: (s) => <StatusBadge status={s.status} /> },
        ]}
      />
    </div>
  )
}

export function LearnerNotificationsCard({ notifications }) {
  const items = useMemo(() => byNewest(notifications, 'createdAt'), [notifications])
  const shown = items.slice(0, 8)
  return (
    <Card title="Notifications" description={items.length ? `${items.length} alert${items.length === 1 ? '' : 's'} for this learner’s slots` : undefined} icon={BellRing} padding="none">
      {shown.length ? (
        <ul className="divide-y divide-line">
          {shown.map((n) => (
            <li key={n.id} className="px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-[13px] leading-5 text-ink-2">{n.message}</p>
                <StatusBadge status={n.status} size="sm" className="shrink-0" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-4">
                <Badge size="sm">{n.channel}</Badge>
                <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="tabular">{formatRelative(n.createdAt)}</time>
                {n.error && <span className="text-danger">{n.error}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState compact icon={BellRing} title="No notifications" description="Alerts sent for this learner’s slots will appear here." />
      )}
      {items.length > shown.length && (
        <p className="border-t border-line px-4 py-2.5 text-xs text-ink-3 sm:px-5">Showing the latest {shown.length} of {items.length}.</p>
      )}
    </Card>
  )
}
