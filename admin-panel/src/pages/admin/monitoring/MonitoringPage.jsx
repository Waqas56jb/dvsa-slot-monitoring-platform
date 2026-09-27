import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Eye, Pause, Play, Radar, Square, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CopyId } from '@/components/common/Misc'
import { Tooltip } from '@/components/common/Tooltip'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { StatusTiles } from './StatusTiles'
import { useJobActions } from './useJobActions'
import { formatFrequency } from '@/components/monitoring/format'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useExport } from '@/hooks/useExport'
import { useNow } from '@/hooks/useUtils'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { monitoringService } from '@/services/monitoringService'
import { centreService } from '@/services/centreService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { MONITORING_STATUSES } from '@/constants/status'
import { formatDate, formatDateTime, formatNumber, formatRelative, formatShortDate } from '@/utils/format'

const FILTER_KEYS = ['status', 'centre', 'created', 'window']
const CREATED = [{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]
const WINDOW = [
  { value: 'current', label: 'Includes today' },
  { value: 'next30', label: 'Starts within 30 days' },
  { value: 'ending7', label: 'Ends within 7 days' },
  { value: 'ended', label: 'Already ended' },
]
const labelOf = (opts) => (v) => opts.find((o) => o.value === v)?.label ?? v

const EXPORT_COLUMNS = [
  { label: 'Monitoring ID', key: 'id' },
  { label: 'User', value: (j) => j.user?.name }, { label: 'User email', value: (j) => j.user?.email },
  { label: 'Learner', value: (j) => j.learner?.name },
  { label: 'Centres', value: (j) => j.centres.map((c) => c.shortName).join('; ') },
  { label: 'Date from', key: 'dateFrom' }, { label: 'Date to', key: 'dateTo' },
  { label: 'Time from', key: 'timeFrom' }, { label: 'Time to', key: 'timeTo' },
  { label: 'Weekdays only', value: (j) => (j.weekdaysOnly ? 'Yes' : 'No') },
  { label: 'Frequency (s)', key: 'frequency' }, { label: 'Status', key: 'status' },
  { label: 'Last checked', key: 'lastChecked' }, { label: 'Checks', key: 'checksCount' },
  { label: 'Slots found', key: 'slotsFound' }, { label: 'Alerts sent', key: 'alertsSent' },
  { label: 'Channels', value: (j) => j.channels.join('; ') }, { label: 'Created', key: 'createdAt' },
]

function CentresCell({ centres = [] }) {
  if (!centres.length) return <span className="text-ink-4">—</span>
  const shown = centres.slice(0, 2)
  const rest = centres.slice(2)
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate text-ink-2">{shown.map((c) => c.shortName).join(', ')}</span>
      {rest.length > 0 && (
        <Tooltip content={rest.map((c) => c.shortName).join(', ')}>
          <span tabIndex={0} className="shrink-0 cursor-default rounded-full bg-subtle px-1.5 text-[11px] font-medium text-ink-3 tabular ring-1 ring-line ring-inset">+{rest.length}</span>
        </Tooltip>
      )}
    </span>
  )
}

export default function MonitoringPage() {
  const navigate = useNavigate()
  const can = usePermission()
  const toast = useToast()
  const now = useNow(5000)
  const { exporting, runExport } = useExport()
  const [selected, setSelected] = useState([])

  const list = useListQuery(monitoringService.getJobs, { filterKeys: FILTER_KEYS, arrayKeys: ['status', 'centre'], defaultSort: 'createdAt' })
  const counts = useAsync(() => monitoringService.getStatusCounts(), [])
  const centres = useAsync(() => centreService.getAllCentres(), [])
  const centreOptions = useMemo(() => (centres.data || []).map((c) => ({ value: c.id, label: c.shortName })), [centres.data])

  const reloadCounts = counts.reload
  const onUpdated = (job) => {
    list.patchRow(job.id, { status: job.status, nextCheck: job.nextCheck, failureReason: job.failureReason, updatedAt: job.updatedAt })
    reloadCounts({ silent: true })
  }
  const actions = useJobActions(onUpdated)

  const bulk = (action, ids, clear) => {
    const verb = action === 'pause' ? 'paused' : 'resumed'
    const run = async (reason) => {
      const { updated, skipped } = await monitoringService.bulkAction(ids, action, { reason })
      updated.forEach((j) => list.patchRow(j.id, { status: j.status, nextCheck: j.nextCheck, failureReason: j.failureReason }))
      clear()
      reloadCounts({ silent: true })
      if (!updated.length) toast.warning(`No jobs ${verb} — none of the selected jobs can be ${verb}.`)
      else toast.success(`${formatNumber(updated.length)} monitoring job${updated.length === 1 ? '' : 's'} ${verb}.${skipped.length ? ` ${skipped.length} skipped (status didn’t allow it).` : ''}`)
    }
    if (action === 'pause') {
      actions.confirm({
        title: `Pause ${ids.length} monitoring job${ids.length === 1 ? '' : 's'}?`,
        description: 'Only running or failed jobs are paused; others are skipped. This is recorded in the audit log.',
        confirmLabel: 'Pause jobs',
        tone: 'warning',
        requireReason: true,
        onConfirm: run,
      })
    } else {
      run().catch((err) => toast.error(err?.message || 'Unable to resume jobs.'))
    }
  }

  const exportRows = (ids) => runExport({
    name: 'monitoring',
    columns: EXPORT_COLUMNS,
    fetch: async () => {
      const rows = await monitoringService.exportJobs(list.query)
      return ids ? rows.filter((r) => ids.includes(r.id)) : rows
    },
  })

  const setStatus = (s) => list.setFilter('status', s ? [s] : null)

  const columns = [
    { key: 'id', header: 'Monitoring ID', sortable: true, mobile: 'primary', hideable: false, cell: (j) => <CopyId value={j.id} to={`/admin/monitoring/${j.id}`} /> },
    {
      key: 'user', header: 'User', sortable: true, sortKey: 'userName',
      cell: (j) => (
        <span className="block min-w-0 max-w-[200px]">
          <span className="block truncate font-medium text-ink">{j.user?.name || 'Unknown user'}</span>
          <span className="block truncate text-xs text-ink-3">{j.user?.email}</span>
        </span>
      ),
    },
    { key: 'learner', header: 'Learner', sortable: true, sortKey: 'learnerName', cell: (j) => <span className="whitespace-nowrap text-ink-2">{j.learner?.name || '—'}</span> },
    { key: 'centres', header: 'Centres', cell: (j) => <span className="block max-w-[220px]"><CentresCell centres={j.centres} /></span> },
    {
      key: 'dateFrom', header: 'Date range', sortable: true,
      cell: (j) => <span className="whitespace-nowrap text-ink-2 tabular">{formatShortDate(j.dateFrom)} – {formatDate(j.dateTo)}</span>,
    },
    {
      key: 'timeFrom', header: 'Time range',
      cell: (j) => <span className="whitespace-nowrap font-mono text-[12.5px] text-ink-2">{j.timeFrom}–{j.timeTo}</span>,
    },
    { key: 'frequency', header: 'Frequency', sortable: true, cell: (j) => <span className="whitespace-nowrap text-ink-2">{formatFrequency(j.frequency)}</span> },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (j) => <StatusBadge status={j.status} pulse={j.status === 'Running'} /> },
    {
      key: 'lastChecked', header: 'Last checked', sortable: true,
      cell: (j) => <time dateTime={j.lastChecked} title={formatDateTime(j.lastChecked)} className="whitespace-nowrap text-ink-3 tabular">{j.lastChecked ? formatRelative(j.lastChecked, now) : 'Never'}</time>,
    },
    { key: 'slotsFound', header: 'Slots found', sortable: true, align: 'right', cell: (j) => <span className="tabular">{formatNumber(j.slotsFound)}</span> },
    { key: 'alertsSent', header: 'Alerts', sortable: true, align: 'right', cell: (j) => <span className="tabular">{formatNumber(j.alertsSent)}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (j) => <span className="whitespace-nowrap text-ink-3">{formatDate(j.createdAt)}</span> },
  ]

  const rowActions = (j) => [
    { label: 'View job', icon: Eye, to: `/admin/monitoring/${j.id}` },
    { label: 'View user', icon: UserRound, to: `/admin/users/${j.userId}`, hidden: !can(P.USERS_VIEW) },
    { type: 'separator' },
    { label: 'Pause', icon: Pause, onSelect: () => actions.pause(j), hidden: !actions.canPause(j) },
    { label: 'Resume', icon: Play, onSelect: () => actions.resume(j), hidden: !actions.canResume(j) },
    { label: 'Stop', icon: Square, onSelect: () => actions.stop(j), danger: true, hidden: !actions.canStop(j) },
  ]

  const centreName = (id) => centreOptions.find((o) => o.value === id)?.label ?? id
  const chips = buildChips(list, {
    status: { label: 'Status' },
    centre: { label: 'Centre', format: centreName },
    created: { label: 'Created', format: labelOf(CREATED) },
    window: { label: 'Test window', format: labelOf(WINDOW) },
  })

  const canBulkState = can(P.MONITORING_PAUSE)

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Monitoring jobs across all users — status, check activity and results."
        actions={
          <PermissionGate permission={P.EXPORT}>
            <Button icon={Download} onClick={() => exportRows()} loading={exporting}>Export</Button>
          </PermissionGate>
        }
      />

      <StatusTiles counts={counts.data} loading={counts.loading && !counts.data} error={counts.error} selected={list.filters.status || []} onSelect={setStatus} />

      <DataTable
        caption="Monitoring jobs"
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
        selectable={canBulkState || can(P.EXPORT)}
        selectedIds={selected}
        onSelectionChange={setSelected}
        bulkActions={(ids, clear) => (
          <>
            {canBulkState && <Button size="sm" icon={Pause} onClick={() => bulk('pause', ids, clear)}>Pause</Button>}
            {canBulkState && <Button size="sm" icon={Play} onClick={() => bulk('resume', ids, clear)}>Resume</Button>}
            {can(P.EXPORT) && <Button size="sm" icon={Download} onClick={() => exportRows(ids)}>Export</Button>}
          </>
        )}
        onRowClick={(j) => navigate(`/admin/monitoring/${j.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={Radar}
        emptyTitle="No monitoring jobs yet"
        emptyDescription="Jobs appear here as soon as a user starts monitoring for a learner."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search ID, user, email or learner…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Status" options={MONITORING_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Centre" options={centreOptions} value={list.filters.centre} onChange={(v) => list.setFilter('centre', v)} searchable width={260} />
                <FilterDropdown label="Created" multiple={false} options={CREATED} value={list.filters.created} onChange={(v) => list.setFilter('created', v)} />
                <FilterDropdown label="Test window" multiple={false} options={WINDOW} value={list.filters.window} onChange={(v) => list.setFilter('window', v)} />
              </>
            }
          />
        }
      />

      {actions.confirmElement}
    </>
  )
}
