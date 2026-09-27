import { useState } from 'react'
import { ArrowUp, Download, Eye, Lock, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Badge, StatusBadge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { EntityLink } from '@/components/common/Misc'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { AuditLogDrawer, resourceHref } from './AuditLogDrawer'
import { useLiveList } from '@/pages/admin/activity/useLiveList'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useExport } from '@/hooks/useExport'
import { activityService } from '@/services/activityService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDateTime, formatRelative } from '@/utils/format'

const FILTER_KEYS = ['date', 'adminName', 'action', 'resource', 'result']
const DATE_RANGES = [{ value: '24h', label: 'Last 24 hours' }, { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' }]
const RESULTS = ['Success', 'Denied', 'Failed']
const labelOf = (opts) => (v) => opts.find((o) => o.value === v)?.label ?? v

const formatChanges = (c) => Object.entries(c || {}).map(([k, [a, b] = []]) => `${k}: ${a ?? '∅'} → ${b ?? '∅'}`).join('; ')
const EXPORT_COLUMNS = [
  { label: 'Log ID', key: 'id' }, { label: 'Timestamp', key: 'timestamp' }, { label: 'Admin', key: 'adminName' }, { label: 'Admin ID', key: 'adminId' },
  { label: 'Role', key: 'adminRole' }, { label: 'Action', key: 'action' }, { label: 'Resource', key: 'resource' }, { label: 'Resource ID', key: 'resourceId' },
  { label: 'Result', key: 'result' }, { label: 'Changes', value: (l) => formatChanges(l.changes) }, { label: 'IP address', key: 'ip' }, { label: 'User agent', key: 'userAgent' },
]

export default function AuditLogsPage() {
  const { exporting, runExport } = useExport()
  const [drawer, setDrawer] = useState({ open: false, log: null })
  const facets = useAsync(() => activityService.getAuditFacets(), [])
  const list = useListQuery(activityService.getAuditLogs, { filterKeys: FILTER_KEYS, arrayKeys: ['adminName', 'action', 'resource', 'result'], defaultSort: 'timestamp' })
  const { fresh, pending, showPending } = useLiveList(list, 'audit')
  const f = facets.data

  const openLog = (log) => setDrawer({ open: true, log })

  const columns = [
    {
      key: 'id', header: 'Log ID', sortable: true, mobile: 'hidden',
      cell: (l) => <span className="font-mono text-[12.5px] whitespace-nowrap text-ink-2">{l.id}</span>,
    },
    {
      key: 'adminName', header: 'Admin', sortable: true,
      cell: (l) => <Identity name={l.adminName} subtitle={l.adminRole} size="xs" className="max-w-[200px]" />,
    },
    {
      key: 'action', header: 'Action', sortable: true, mobile: 'primary', hideable: false,
      cell: (l) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="flex items-center gap-2 font-medium text-ink">
            <span className="truncate">{l.action}</span>
            {fresh.has(l.id) && <Badge tone="brand" size="sm">New</Badge>}
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-3 md:hidden">{l.adminName} · {formatRelative(l.timestamp)}</p>
        </div>
      ),
    },
    { key: 'resource', header: 'Resource', sortable: true, cell: (l) => <span className="whitespace-nowrap text-ink-2">{l.resource}</span> },
    {
      key: 'resourceId', header: 'Resource ID',
      cell: (l) => {
        const href = resourceHref(l)
        return href
          ? <EntityLink to={href} mono className="block max-w-[180px] truncate">{l.resourceId}</EntityLink>
          : <span className="block max-w-[180px] truncate font-mono text-[12.5px] text-ink-3">{l.resourceId}</span>
      },
    },
    { key: 'timestamp', header: 'Timestamp', sortable: true, cell: (l) => <time dateTime={l.timestamp} className="whitespace-nowrap text-ink-2 tabular">{formatDateTime(l.timestamp)}</time> },
    { key: 'ip', header: 'IP address', defaultHidden: true, cell: (l) => <span className="font-mono text-[12.5px] text-ink-3">{l.ip}</span> },
    { key: 'result', header: 'Result', sortable: true, mobile: 'badge', cell: (l) => <StatusBadge status={l.result} /> },
  ]

  const chips = buildChips(list, {
    date: { label: 'Date', format: labelOf(DATE_RANGES) },
    adminName: { label: 'Admin' },
    action: { label: 'Action' },
    resource: { label: 'Resource' },
    result: { label: 'Result' },
  })

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="Security record of every admin action, including denied and failed attempts."
        actions={
          <PermissionGate permission={P.EXPORT}>
            <Button icon={Download} loading={exporting} onClick={() => runExport({ name: 'audit-log', columns: EXPORT_COLUMNS, fetch: () => activityService.exportAuditLogs(list.query) })}>Export</Button>
          </PermissionGate>
        }
      />

      <p className="mb-4 flex items-start gap-2 text-[13px] text-ink-3">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-4" aria-hidden />
        Audit entries are immutable and retained for compliance. Exports are themselves recorded in this log.
      </p>

      {pending > 0 && (
        <div className="mb-4 flex justify-center">
          <Button size="sm" variant="subtle" icon={ArrowUp} onClick={showPending} aria-live="polite">
            {pending} new entr{pending > 1 ? 'ies' : 'y'} — show latest
          </Button>
        </div>
      )}

      <DataTable
        caption="Admin audit log"
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
        onRowClick={openLog}
        rowActions={(l) => [{ label: 'View details', icon: Eye, onSelect: () => openLog(l) }]}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={ScrollText}
        emptyTitle="No audit entries yet"
        emptyDescription="Admin actions are recorded here automatically."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search log ID, admin, action, resource ID, IP…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Date" multiple={false} options={DATE_RANGES} value={list.filters.date} onChange={(v) => list.setFilter('date', v)} />
                <FilterDropdown label="Admin" options={f?.admins || []} value={list.filters.adminName} onChange={(v) => list.setFilter('adminName', v)} />
                <FilterDropdown label="Action" options={f?.actions || []} value={list.filters.action} onChange={(v) => list.setFilter('action', v)} width={264} />
                <FilterDropdown label="Resource" options={f?.resources || []} value={list.filters.resource} onChange={(v) => list.setFilter('resource', v)} />
                <FilterDropdown label="Result" options={f?.results || RESULTS} value={list.filters.result} onChange={(v) => list.setFilter('result', v)} />
              </>
            }
          />
        }
      />

      <AuditLogDrawer open={drawer.open} log={drawer.log} onClose={() => setDrawer((d) => ({ ...d, open: false }))} />
    </>
  )
}
