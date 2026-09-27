import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowUp, Download, Server, ShieldCheck, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { Tabs } from '@/components/common/Tabs'
import { Toggle } from '@/components/forms/Fields'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { useLiveList } from './useLiveList'
import { useListQuery } from '@/hooks/useListQuery'
import { useExport } from '@/hooks/useExport'
import { activityService } from '@/services/activityService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { ACTIVITY_CATEGORIES } from '@/constants/status'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format'

const FILTER_KEYS = ['category', 'status', 'date', 'actorType']
const STATUSES = ['Success', 'Warning', 'Failed']
const DATE_RANGES = [{ value: '24h', label: 'Last 24 hours' }, { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' }]
const ACTOR_TYPES = [{ value: 'system', label: 'System' }, { value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]
const labelOf = (opts) => (v) => opts.find((o) => o.value === v)?.label ?? v

const ACTOR_ICONS = { system: Server, user: UserRound, admin: ShieldCheck }

const EXPORT_COLUMNS = [
  { label: 'Event ID', key: 'id' }, { label: 'Timestamp', key: 'timestamp' }, { label: 'Category', key: 'category' },
  { label: 'Event', key: 'event' }, { label: 'Description', key: 'description' }, { label: 'Actor type', value: (a) => a.actor?.type },
  { label: 'Actor', value: (a) => a.actor?.name }, { label: 'Entity', value: (a) => a.entity?.label }, { label: 'IP address', value: (a) => a.ip || '' },
  { label: 'Status', key: 'status' },
]

function Actor({ actor }) {
  const Icon = ACTOR_ICONS[actor?.type] || Server
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line', actor?.type === 'admin' ? 'bg-brand-50 text-brand-700 dark:text-brand-300' : 'bg-subtle text-ink-3')} title={actor?.type}>
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] text-ink">{actor?.name || 'Unknown'}</span>
        <span className="sr-only">({actor?.type})</span>
      </span>
    </span>
  )
}

export default function ActivityPage() {
  const [live, setLive] = useState(true)
  const { exporting, runExport } = useExport()
  const list = useListQuery(activityService.getActivity, { filterKeys: FILTER_KEYS, arrayKeys: ['status', 'actorType'], defaultSort: 'timestamp' })
  const { fresh, pending, showPending } = useLiveList(list, 'activity', { enabled: live })

  const columns = [
    {
      key: 'timestamp', header: 'Timestamp', sortable: true,
      cell: (a) => (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <time dateTime={a.timestamp} className="text-ink-2 tabular">{formatDateTime(a.timestamp)}</time>
          {fresh.has(a.id) && <Badge tone="brand" size="sm">New</Badge>}
        </span>
      ),
    },
    { key: 'actorName', header: 'Actor', sortable: true, cell: (a) => <Actor actor={a.actor} /> },
    {
      key: 'event', header: 'Event', sortable: true, mobile: 'primary', hideable: false,
      cell: (a) => (
        <div className="min-w-0 max-w-[360px]">
          <p className="truncate font-medium text-ink">{a.event}</p>
          <p className="mt-0.5 truncate text-xs text-ink-3"><span className="text-ink-4">{a.category}</span>{a.description && <> · {a.description}</>}</p>
        </div>
      ),
    },
    {
      key: 'entityLabel', header: 'Entity',
      cell: (a) => (a.entity?.href
        ? <Link to={a.entity.href} onClick={(e) => e.stopPropagation()} className="block max-w-[200px] truncate font-mono text-[12.5px] text-brand-600 hover:underline dark:text-brand-300">{a.entity.label}</Link>
        : <span className="font-mono text-[12.5px] text-ink-3">{a.entity?.label || '—'}</span>),
    },
    { key: 'ip', header: 'IP address', cell: (a) => <span className={cn('font-mono text-[12.5px]', a.ip ? 'text-ink-2' : 'text-ink-4')}>{a.ip || '—'}</span> },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (a) => <StatusBadge status={a.status} /> },
  ]

  const chips = buildChips(list, {
    status: { label: 'Status' },
    date: { label: 'Date', format: labelOf(DATE_RANGES) },
    actorType: { label: 'Actor', format: labelOf(ACTOR_TYPES) },
  })

  const tabs = [{ value: 'all', label: 'All' }, ...ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))]

  return (
    <>
      <PageHeader
        title="Activity"
        description="Operational event stream across users, monitoring, slots, alerts, payments and the platform."
        actions={
          <>
            <div className="flex h-9 items-center gap-2.5 rounded-lg border border-line bg-surface px-3">
              <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'animate-pulse bg-success-dot' : 'bg-neutral-dot')} aria-hidden />
              <label htmlFor="activity-live" className="text-[13px] font-medium text-ink-2">Live</label>
              <Toggle id="activity-live" size="sm" checked={live} onChange={setLive} />
            </div>
            <PermissionGate permission={P.EXPORT}>
              <Button icon={Download} loading={exporting} onClick={() => runExport({ name: 'activity', columns: EXPORT_COLUMNS, fetch: () => activityService.exportActivity(list.query) })}>Export</Button>
            </PermissionGate>
          </>
        }
      />

      <Tabs className="mb-4" tabs={tabs} value={list.filters.category || 'all'} onChange={(v) => list.setFilter('category', v === 'all' ? null : v)} />

      {pending > 0 && (
        <div className="mb-4 flex justify-center">
          <Button size="sm" variant="subtle" icon={ArrowUp} onClick={showPending} aria-live="polite">
            {pending} new event{pending > 1 ? 's' : ''} — show latest
          </Button>
        </div>
      )}

      <DataTable
        caption="Platform activity"
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        sort={list.sort}
        onSort={list.setSort}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={Activity}
        emptyTitle="No activity yet"
        emptyDescription="Platform events will stream in here as they happen."
        toolbar={
          <FilterBar
              search={list.searchInput}
              onSearch={list.setSearchInput}
              searchPlaceholder="Search events, actors, IDs…"
              chips={chips}
              onReset={list.resetFilters}
              filters={
                <>
                  <FilterDropdown label="Status" options={STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                  <FilterDropdown label="Date" multiple={false} options={DATE_RANGES} value={list.filters.date} onChange={(v) => list.setFilter('date', v)} />
                  <FilterDropdown label="Actor" options={ACTOR_TYPES} value={list.filters.actorType} onChange={(v) => list.setFilter('actorType', v)} />
                </>
              }
            />
        }
      />
    </>
  )
}
