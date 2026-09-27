import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Download, Eye, LifeBuoy, MessageSquare, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge, TONE_STYLES } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { PriorityLabel, Assignee, OPEN_STATUSES } from './TicketBits'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useExport } from '@/hooks/useExport'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { supportService } from '@/services/supportService'
import { adminService } from '@/services/adminService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES, toneFor } from '@/constants/status'
import { cn } from '@/utils/cn'
import { formatDate, formatDateTime, formatNumber, formatRelative, pluralize } from '@/utils/format'

const FILTER_KEYS = ['status', 'priority', 'category', 'assignee']

const EXPORT_COLUMNS = [
  { label: 'Ticket ID', key: 'id' }, { label: 'Subject', key: 'subject' }, { label: 'User', value: (t) => t.user?.name },
  { label: 'User email', value: (t) => t.user?.email }, { label: 'Category', key: 'category' }, { label: 'Priority', key: 'priority' },
  { label: 'Status', key: 'status' }, { label: 'Assigned to', value: (t) => t.assignee?.name || 'Unassigned' },
  { label: 'Messages', key: 'messageCount' }, { label: 'Created', key: 'createdAt' }, { label: 'Updated', key: 'updatedAt' },
]

export default function SupportPage() {
  const navigate = useNavigate()
  const { admin, can } = useAdminAuth()
  const toast = useToast()
  const { exporting, runExport } = useExport()
  const meId = admin?.id
  const counts = useAsync(() => supportService.getCounts(), [])
  const admins = useAsync(() => adminService.getAdmins({ pageSize: 50, sort: 'name', order: 'asc' }), [])

  // "me" is a UI alias — the service only ever receives a concrete admin id.
  const resolveQuery = useCallback((q) => {
    const { assignee, ...rest } = q.filters || {}
    const filters = assignee ? { ...rest, assignee: assignee === 'me' ? meId : assignee } : rest
    return { ...q, filters }
  }, [meId])
  const fetchTickets = useCallback((q) => supportService.getTickets(resolveQuery(q)), [resolveQuery])

  const list = useListQuery(fetchTickets, { filterKeys: FILTER_KEYS, arrayKeys: ['status', 'priority', 'category'], defaultSort: 'updatedAt' })

  const assigneeOptions = useMemo(() => [
    { value: 'me', label: 'Assigned to me' },
    { value: 'unassigned', label: 'Unassigned' },
    ...(admins.data?.data || []).filter((a) => a.status === 'Active' && a.id !== meId).map((a) => ({ value: a.id, label: a.name })),
  ], [admins.data, meId])
  const assigneeLabel = (v) => assigneeOptions.find((o) => o.value === v)?.label ?? v

  const update = useCallback(async (t, patch, done) => {
    try {
      const res = await supportService.updateTicket(t.id, patch)
      list.patchRow(t.id, { status: res.status, assigneeId: res.assigneeId, assignee: res.assignee })
      counts.reload({ silent: true })
      toast.success(done)
    } catch (e) {
      toast.error(e.message || 'Unable to update ticket. Please try again.')
    }
  }, [list, counts, toast])

  const statusFilter = list.filters.status || []
  const toggleStatus = (s) => list.setFilter('status', statusFilter.length === 1 && statusFilter[0] === s ? null : [s])

  const columns = [
    {
      key: 'id', header: 'Ticket', sortable: true, hideable: false, mobile: 'hidden',
      cell: (t) => <span className="font-mono text-[12.5px] whitespace-nowrap text-ink-2">{t.id}</span>,
    },
    {
      key: 'subject', header: 'Subject', sortable: true, mobile: 'primary', hideable: false,
      cell: (t) => {
        const awaiting = t.lastFrom === 'user' && OPEN_STATUSES.includes(t.status)
        return (
          <div className="min-w-0 max-w-[340px]">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              {awaiting && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" title="Awaiting reply" aria-label="Awaiting reply" />}
              <span className="truncate">{t.subject}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-3">
              <span className="font-mono text-[11px] md:hidden">{t.id}</span>
              <span className="md:hidden" aria-hidden>·</span>
              {t.category}
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 tabular"><MessageSquare className="h-3 w-3" aria-hidden />{pluralize(t.messageCount, 'message')}</span>
            </p>
          </div>
        )
      },
    },
    {
      key: 'userName', header: 'User', sortable: true,
      cell: (t) => (t.user ? <Identity name={t.user.name} subtitle={t.user.email} size="xs" className="max-w-[220px]" /> : <span className="text-ink-4">Deleted user</span>),
    },
    { key: 'category', header: 'Category', sortable: true, defaultHidden: true, cell: (t) => <span className="text-ink-2">{t.category}</span> },
    { key: 'priority', sortKey: 'priorityRank', header: 'Priority', sortable: true, cell: (t) => <PriorityLabel priority={t.priority} /> },
    { key: 'status', sortKey: 'statusRank', header: 'Status', sortable: true, mobile: 'badge', cell: (t) => <StatusBadge status={t.status} /> },
    { key: 'assignee', header: 'Assigned to', cell: (t) => <Assignee assignee={t.assignee} meId={meId} /> },
    { key: 'createdAt', header: 'Created', sortable: true, defaultHidden: false, cell: (t) => <span className="whitespace-nowrap text-ink-3" title={formatDateTime(t.createdAt)}>{formatDate(t.createdAt)}</span> },
    { key: 'updatedAt', header: 'Updated', sortable: true, cell: (t) => <time dateTime={t.updatedAt} title={formatDateTime(t.updatedAt)} className="whitespace-nowrap text-ink-3">{formatRelative(t.updatedAt)}</time> },
  ]

  const rowActions = (t) => [
    { label: 'View ticket', icon: Eye, to: `/admin/support/${t.id}` },
    { label: 'Assign to me', icon: UserPlus, onSelect: () => update(t, { assigneeId: meId }, 'Ticket assigned to you.'), hidden: !can(P.SUPPORT_REPLY) || t.assigneeId === meId },
    { label: 'Mark as resolved', icon: CheckCircle2, onSelect: () => update(t, { status: 'Resolved' }, 'Ticket marked as resolved.'), hidden: !can(P.SUPPORT_REPLY) || !OPEN_STATUSES.includes(t.status) },
  ]

  const chips = buildChips(list, {
    status: { label: 'Status' },
    priority: { label: 'Priority' },
    category: { label: 'Category' },
    assignee: { label: 'Assignee', format: assigneeLabel },
  })

  const exportRows = () => runExport({ name: 'support-tickets', columns: EXPORT_COLUMNS, fetch: () => supportService.exportTickets(resolveQuery(list.query)) })

  const openTotal = OPEN_STATUSES.reduce((a, s) => a + (counts.data?.[s] || 0), 0)

  return (
    <>
      <PageHeader
        title="Support"
        description={counts.data ? `${formatNumber(openTotal)} open ${openTotal === 1 ? 'ticket needs' : 'tickets need'} attention.` : 'Customer tickets, conversations and assignments.'}
        documentTitle="Support"
        actions={
          <>
            <Button icon={UserPlus} onClick={() => list.setFilter('assignee', list.filters.assignee === 'me' ? null : 'me')} aria-pressed={list.filters.assignee === 'me'} variant={list.filters.assignee === 'me' ? 'subtle' : 'secondary'}>
              My tickets
            </Button>
            <PermissionGate permission={P.EXPORT}>
              <Button icon={Download} onClick={exportRows} loading={exporting}>Export</Button>
            </PermissionGate>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Filter by ticket status">
        {TICKET_STATUSES.map((s) => {
          const active = statusFilter.length === 1 && statusFilter[0] === s
          const tone = TONE_STYLES[toneFor(s)] || TONE_STYLES.neutral
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => toggleStatus(s)}
              className={cn(
                'card flex min-w-0 flex-col items-start px-4 py-3 text-left transition-[border-color,box-shadow,background-color] duration-150',
                active ? 'border-brand-500 ring-1 ring-brand-500' : 'hover:border-line-strong',
              )}
            >
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink-3">
                <span className={cn('h-2 w-2 rounded-full', tone.dot)} aria-hidden />
                {s}
              </span>
              {counts.loading && !counts.data ? (
                <Skeleton className="mt-2 h-6 w-10" />
              ) : (
                <span className="mt-1 text-[22px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular">{counts.error ? '—' : formatNumber(counts.data?.[s] || 0)}</span>
              )}
            </button>
          )
        })}
      </div>

      <DataTable
        caption="Support tickets"
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
        onRowClick={(t) => navigate(`/admin/support/${t.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={LifeBuoy}
        emptyTitle="No support tickets"
        emptyDescription="Tickets appear here when users contact support from the app."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search ticket ID, subject, user…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Status" options={TICKET_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Priority" options={[...TICKET_PRIORITIES].reverse()} value={list.filters.priority} onChange={(v) => list.setFilter('priority', v)} />
                <FilterDropdown label="Category" options={TICKET_CATEGORIES} value={list.filters.category} onChange={(v) => list.setFilter('category', v)} />
                <FilterDropdown label="Assignee" multiple={false} options={assigneeOptions} value={list.filters.assignee} onChange={(v) => list.setFilter('assignee', v)} />
              </>
            }
          />
        }
      />
    </>
  )
}
