import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, Download, Eye, Pencil, Plus, RotateCcw, Trash2, UserCheck, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { PermissionGate } from '@/routes/guards'
import { UserFormModal } from './UserFormModal'
import { useListQuery } from '@/hooks/useListQuery'
import { useExport } from '@/hooks/useExport'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { userService } from '@/services/userService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { USER_STATUSES, SUBSCRIPTION_PLANS } from '@/constants/status'
import { formatDate, formatRelative } from '@/utils/format'

const FILTER_KEYS = ['status', 'plan', 'joined', 'monitoring', 'learners']
const JOINED = [{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]
const MONITORING = [{ value: 'active', label: 'Has active monitoring' }, { value: 'none', label: 'No active monitoring' }]
const LEARNERS = [{ value: '0', label: 'No learners' }, { value: '1', label: '1 learner' }, { value: '2+', label: '2 or more' }]
const labelOf = (opts) => (v) => opts.find((o) => o.value === v)?.label ?? v

const EXPORT_COLUMNS = [
  { label: 'User ID', key: 'id' }, { label: 'Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' },
  { label: 'Status', key: 'status' }, { label: 'Plan', value: (u) => u.plan || 'None' }, { label: 'Learners', key: 'learnersCount' },
  { label: 'Monitoring jobs', key: 'monitoringCount' }, { label: 'Created', key: 'createdAt' }, { label: 'Last active', key: 'lastActive' },
]

export default function UsersPage() {
  const navigate = useNavigate()
  const can = usePermission()
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const { exporting, runExport } = useExport()
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({ open: false, user: null })

  const list = useListQuery(userService.getUsers, { filterKeys: FILTER_KEYS, arrayKeys: ['status', 'plan'], defaultSort: 'createdAt' })

  const suspend = useCallback((u) => confirm({
    title: 'Suspend this user?',
    description: `${u.name} will be signed out and all of their monitoring will pause until reactivated.`,
    confirmLabel: 'Suspend user',
    requireReason: true,
    onConfirm: async (reason) => {
      await userService.suspendUser(u.id, { reason })
      list.patchRow(u.id, { status: 'Suspended' })
      toast.success('User suspended successfully.')
    },
  }), [confirm, list, toast])

  const reactivate = useCallback((u) => confirm({
    title: 'Reactivate this user?',
    description: `${u.name} will regain access. Paused monitoring stays paused until they resume it.`,
    confirmLabel: 'Reactivate',
    tone: 'brand',
    onConfirm: async () => {
      await userService.reactivateUser(u.id)
      list.patchRow(u.id, { status: 'Active' })
      toast.success('User reactivated.')
    },
  }), [confirm, list, toast])

  const bulk = (action, ids, clear) => {
    const copy = {
      suspend: { title: `Suspend ${ids.length} users?`, label: 'Suspend users', done: 'Users suspended.' },
      activate: { title: `Activate ${ids.length} users?`, label: 'Activate users', done: 'Users activated.', tone: 'brand' },
      delete: { title: `Delete ${ids.length} users?`, label: 'Delete permanently', done: 'Users deleted.', type: 'DELETE', description: 'This permanently removes the accounts, learners and monitoring history. This cannot be undone.' },
    }[action]
    confirm({
      title: copy.title,
      description: copy.description || 'This will be recorded in the audit log.',
      confirmLabel: copy.label,
      tone: copy.tone || 'danger',
      typeToConfirm: copy.type,
      onConfirm: async () => {
        await userService.bulkUpdate(ids, action)
        clear()
        await list.reload({ silent: true })
        toast.success(copy.done)
      },
    })
  }

  const exportRows = (ids) => runExport({
    name: 'users',
    columns: EXPORT_COLUMNS,
    fetch: async () => {
      const rows = await userService.exportUsers(list.query)
      return ids ? rows.filter((r) => ids.includes(r.id)) : rows
    },
  })

  const columns = [
    {
      key: 'name', header: 'User', sortable: true, mobile: 'primary', hideable: false,
      cell: (u) => <Identity name={u.name} subtitle={u.id} />,
    },
    { key: 'email', header: 'Email', sortable: true, cell: (u) => <span className="text-ink-2">{u.email}</span> },
    { key: 'phone', header: 'Phone', defaultHidden: true, cell: (u) => <span className="tabular">{u.phone || '—'}</span> },
    { key: 'learnersCount', header: 'Learners', sortable: true, align: 'right', cell: (u) => <span className="tabular">{u.learnersCount}</span> },
    {
      key: 'activeMonitoring', header: 'Monitoring', sortable: true, align: 'right',
      cell: (u) => <span className="tabular"><span className="font-medium text-ink">{u.activeMonitoring}</span><span className="text-ink-4"> / {u.monitoringCount}</span></span>,
    },
    { key: 'plan', header: 'Subscription', sortable: true, cell: (u) => (u.plan ? <Badge tone={u.plan === 'Premium' ? 'brand' : 'neutral'}>{u.plan}</Badge> : <span className="text-ink-4">None</span>) },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'lastActive', header: 'Last active', sortable: true, cell: (u) => <span className="whitespace-nowrap text-ink-3">{u.lastActive ? formatRelative(u.lastActive) : 'Never'}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (u) => <span className="whitespace-nowrap text-ink-3">{formatDate(u.createdAt)}</span> },
  ]

  const rowActions = (u) => [
    { label: 'View user', icon: Eye, to: `/admin/users/${u.id}` },
    { label: 'Edit', icon: Pencil, onSelect: () => setForm({ open: true, user: u }), hidden: !can(P.USERS_EDIT) },
    { type: 'separator' },
    u.status === 'Suspended' || u.status === 'Disabled'
      ? { label: 'Reactivate', icon: RotateCcw, onSelect: () => reactivate(u), hidden: !can(P.USERS_SUSPEND) }
      : { label: 'Suspend', icon: Ban, onSelect: () => suspend(u), danger: true, hidden: !can(P.USERS_SUSPEND) },
  ]

  const chips = buildChips(list, {
    status: { label: 'Status' },
    plan: { label: 'Plan' },
    joined: { label: 'Joined', format: labelOf(JOINED) },
    monitoring: { label: 'Monitoring', format: labelOf(MONITORING) },
    learners: { label: 'Learners', format: labelOf(LEARNERS) },
  })

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage registered platform users and their activity."
        actions={
          <>
            <PermissionGate permission={P.EXPORT}>
              <Button icon={Download} onClick={() => exportRows()} loading={exporting}>Export</Button>
            </PermissionGate>
            <PermissionGate permission={P.USERS_EDIT}>
              <Button variant="primary" icon={Plus} onClick={() => setForm({ open: true, user: null })}>Add user</Button>
            </PermissionGate>
          </>
        }
      />

      <DataTable
        caption="Platform users"
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
        selectable={can(P.USERS_SUSPEND) || can(P.EXPORT)}
        selectedIds={selected}
        onSelectionChange={setSelected}
        bulkActions={(ids, clear) => (
          <>
            {can(P.USERS_SUSPEND) && <Button size="sm" icon={Ban} onClick={() => bulk('suspend', ids, clear)}>Suspend</Button>}
            {can(P.USERS_SUSPEND) && <Button size="sm" icon={UserCheck} onClick={() => bulk('activate', ids, clear)}>Activate</Button>}
            {can(P.EXPORT) && <Button size="sm" icon={Download} onClick={() => exportRows(ids)}>Export</Button>}
            {can(P.USERS_DELETE) && <Button size="sm" variant="danger-ghost" icon={Trash2} onClick={() => bulk('delete', ids, clear)}>Delete</Button>}
          </>
        )}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        rowActions={rowActions}
        filtered={list.activeFilterCount > 0}
        onResetFilters={list.resetFilters}
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyDescription="Users appear here as soon as they register."
        toolbar={
          <FilterBar
            search={list.searchInput}
            onSearch={list.setSearchInput}
            searchPlaceholder="Search name, email, phone…"
            chips={chips}
            onReset={list.resetFilters}
            filters={
              <>
                <FilterDropdown label="Status" options={USER_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                <FilterDropdown label="Plan" options={[...SUBSCRIPTION_PLANS, 'None']} value={list.filters.plan} onChange={(v) => list.setFilter('plan', v)} />
                <FilterDropdown label="Joined" multiple={false} options={JOINED} value={list.filters.joined} onChange={(v) => list.setFilter('joined', v)} />
                <FilterDropdown label="Monitoring" multiple={false} options={MONITORING} value={list.filters.monitoring} onChange={(v) => list.setFilter('monitoring', v)} />
                <FilterDropdown label="Learners" multiple={false} options={LEARNERS} value={list.filters.learners} onChange={(v) => list.setFilter('learners', v)} />
              </>
            }
          />
        }
      />

      <UserFormModal open={form.open} user={form.user} onClose={() => setForm({ open: false, user: null })} onSaved={() => list.reload({ silent: true })} />
      {confirmElement}
    </>
  )
}
