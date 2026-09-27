import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Ban, Eye, Mail, Plus, RotateCcw, ShieldCheck, ShieldHalf, UserCog, LifeBuoy, ChartLine } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { DataTable } from '@/components/tables/DataTable'
import { FilterBar, buildChips } from '@/components/tables/FilterBar'
import { FilterDropdown } from '@/components/tables/FilterDropdown'
import { PermissionGate } from '@/routes/guards'
import { useListQuery } from '@/hooks/useListQuery'
import { useAsync } from '@/hooks/useAsync'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminService } from '@/services/adminService'
import { PERMISSIONS as P, ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/constants/permissions'
import { formatDate, formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'
import { CreateAdminModal } from './CreateAdminModal'
import { ChangeRoleModal } from './ChangeRoleModal'
import { ADMIN_STATUSES, ROLE_ORDER, RoleBadge, TwoFactorIndicator, useAdminStatusActions } from './adminShared'

const FILTER_KEYS = ['role', 'status']
const ROLE_FILTER_OPTIONS = ROLE_ORDER.map((r) => ({ value: r, label: ROLE_LABELS[r] }))
const ROLE_ICONS = { [ROLES.SUPER_ADMIN]: ShieldCheck, [ROLES.OPERATIONS_ADMIN]: ShieldHalf, [ROLES.SUPPORT_ADMIN]: LifeBuoy, [ROLES.ANALYST]: ChartLine }

export default function AdminsPage() {
  const navigate = useNavigate()
  const { admin: me, can } = useAdminAuth()
  const canManage = can(P.ADMINS_MANAGE)
  const [params, setParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const [roleTarget, setRoleTarget] = useState(null)

  const list = useListQuery(adminService.getAdmins, { filterKeys: FILTER_KEYS, arrayKeys: FILTER_KEYS, defaultSort: 'createdAt' })
  const stats = useAsync(() => adminService.getAdminStats(), [])

  // Command palette deep link: /admin/admins?new=1
  useEffect(() => {
    if (params.get('new') !== '1') return
    if (canManage) setCreateOpen(true)
    setParams((prev) => { const next = new URLSearchParams(prev); next.delete('new'); return next }, { replace: true })
  }, [params, setParams, canManage])

  const refresh = useCallback(() => { stats.reload({ silent: true }) }, [stats])
  const onUpdated = useCallback((a) => { list.patchRow(a.id, a); refresh() }, [list, refresh])
  const { suspend, reactivate, resendInvite, confirmElement } = useAdminStatusActions({ onUpdated })

  const isSelf = (a) => a.id === me?.id

  const columns = [
    {
      key: 'name', header: 'Admin', sortable: true, mobile: 'primary', hideable: false,
      cell: (a) => (
        <span className="flex min-w-0 items-center gap-2">
          <Identity name={a.name} subtitle={a.title || 'No job title'} />
          {isSelf(a) && <Badge size="sm" tone="brand">You</Badge>}
        </span>
      ),
    },
    { key: 'email', header: 'Email', sortable: true, cell: (a) => <span className="text-ink-2">{a.email}</span> },
    { key: 'role', header: 'Role', sortable: true, sortKey: 'roleLabel', cell: (a) => <RoleBadge role={a.role} /> },
    { key: 'status', header: 'Status', sortable: true, mobile: 'badge', cell: (a) => <StatusBadge status={a.status} /> },
    { key: 'twoFactor', header: '2FA', sortable: true, cell: (a) => <TwoFactorIndicator enabled={a.twoFactor} compact /> },
    { key: 'lastLogin', header: 'Last login', sortable: true, cell: (a) => <span className="whitespace-nowrap text-ink-3">{a.lastLogin ? formatRelative(a.lastLogin) : 'Never'}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (a) => <span className="whitespace-nowrap text-ink-3">{formatDate(a.createdAt)}</span> },
  ]

  const rowActions = (a) => {
    const self = isSelf(a)
    return [
      { label: 'View admin', icon: Eye, to: `/admin/admins/${a.id}` },
      ...(canManage ? [
        { type: 'separator' },
        self && { type: 'label', label: 'This is your account' },
        { label: 'Change role', icon: UserCog, onSelect: () => setRoleTarget(a), disabled: self },
        a.status === 'Invited' && { label: 'Resend invite', icon: Mail, onSelect: () => resendInvite(a), disabled: self },
        a.status === 'Suspended'
          ? { label: 'Reactivate', icon: RotateCcw, onSelect: () => reactivate(a), disabled: self }
          : { label: 'Suspend', icon: Ban, onSelect: () => suspend(a), danger: true, disabled: self },
      ] : []),
    ].filter(Boolean)
  }

  const chips = buildChips(list, {
    role: { label: 'Role', format: (v) => ROLE_LABELS[v] || v },
    status: { label: 'Status' },
  })

  const toggleRoleFilter = (role) => {
    const current = list.filters.role || []
    list.setFilter('role', current.length === 1 && current[0] === role ? null : [role])
  }

  return (
    <>
      <PageHeader
        title="Admins"
        description="Internal admin accounts, their roles and what they can access."
        actions={
          <PermissionGate permission={P.ADMINS_MANAGE}>
            <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>Create admin</Button>
          </PermissionGate>
        }
      />

      <div className="space-y-6">
        <RoleSummary stats={stats} activeRoles={list.filters.role || []} onSelect={toggleRoleFilter} />

        <DataTable
          caption="Admin accounts"
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
          onRowClick={(a) => navigate(`/admin/admins/${a.id}`)}
          rowActions={rowActions}
          filtered={list.activeFilterCount > 0}
          onResetFilters={list.resetFilters}
          emptyIcon={ShieldCheck}
          emptyTitle="No admins yet"
          emptyDescription="Invite teammates to help run the platform."
          toolbar={
            <FilterBar
              search={list.searchInput}
              onSearch={list.setSearchInput}
              searchPlaceholder="Search name, email, title…"
              chips={chips}
              onReset={list.resetFilters}
              filters={
                <>
                  <FilterDropdown label="Role" options={ROLE_FILTER_OPTIONS} value={list.filters.role} onChange={(v) => list.setFilter('role', v)} />
                  <FilterDropdown label="Status" options={ADMIN_STATUSES} value={list.filters.status} onChange={(v) => list.setFilter('status', v)} />
                </>
              }
            />
          }
        />
      </div>

      <CreateAdminModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { list.reload({ silent: true }); refresh() }} />
      <ChangeRoleModal open={!!roleTarget} admin={roleTarget} onClose={() => setRoleTarget(null)} onChanged={onUpdated} />
      {confirmElement}
    </>
  )
}

function RoleSummary({ stats, activeRoles, onSelect }) {
  if (stats.error) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ROLE_ORDER.map((role) => {
        const s = stats.data?.byRole?.[role]
        const Icon = ROLE_ICONS[role]
        const active = activeRoles.length === 1 && activeRoles[0] === role
        return (
          <button
            key={role}
            type="button"
            onClick={() => onSelect(role)}
            aria-pressed={active}
            className={cn(
              'card group flex min-w-0 flex-col p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
              active ? 'border-brand-500 ring-1 ring-brand-500' : 'hover:border-line-strong',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-3 group-hover:text-ink-2"><Icon className="h-4 w-4" aria-hidden /></span>
                <span className="truncate">{ROLE_LABELS[role]}</span>
              </span>
              {stats.loading && !s ? <Skeleton className="h-6 w-8" /> : <span className="text-xl font-semibold tracking-tight text-ink tabular">{s?.total ?? 0}</span>}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-ink-3">{ROLE_DESCRIPTIONS[role]}</p>
            {s && (s.invited > 0 || s.suspended > 0) && (
              <p className="mt-auto pt-2.5 text-xs text-ink-4">
                {[s.active && `${s.active} active`, s.invited && `${s.invited} invited`, s.suspended && `${s.suspended} suspended`].filter(Boolean).join(' · ')}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
