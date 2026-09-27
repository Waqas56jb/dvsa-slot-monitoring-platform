import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Ban, Eye, Pencil, RotateCcw, Users } from 'lucide-react'
import { DataTable } from '@/components/tables/DataTable'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { Identity } from '@/components/common/Avatar'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { UserFormModal } from '@/pages/admin/users/UserFormModal'
import { useAsync } from '@/hooks/useAsync'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { userService } from '@/services/userService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate } from '@/utils/format'

export function RecentUsersTable() {
  const navigate = useNavigate()
  const can = usePermission()
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const [editing, setEditing] = useState(null)
  const { data, loading, error, reload, setData } = useAsync(() => userService.getUsers({ sort: 'createdAt', order: 'desc', page: 1, pageSize: 6 }), [])
  const rows = data?.data || []
  const patch = (id, p) => setData((d) => ({ ...d, data: d.data.map((u) => (u.id === id ? { ...u, ...p } : u)) }))

  const setStatus = (u, suspend) => confirm({
    title: suspend ? 'Suspend this user?' : 'Reactivate this user?',
    description: suspend ? `${u.name} will be signed out and their monitoring paused.` : `${u.name} will regain access to their account.`,
    confirmLabel: suspend ? 'Suspend user' : 'Reactivate',
    tone: suspend ? 'danger' : 'brand',
    requireReason: suspend,
    onConfirm: async (reason) => {
      if (suspend) await userService.suspendUser(u.id, { reason })
      else await userService.reactivateUser(u.id)
      patch(u.id, { status: suspend ? 'Suspended' : 'Active' })
      toast.success(suspend ? 'User suspended successfully.' : 'User reactivated.')
    },
  })

  const columns = [
    { key: 'name', header: 'User', mobile: 'primary', cell: (u) => <Identity name={u.name} subtitle={u.email} /> },
    { key: 'learnersCount', header: 'Learners', align: 'right', cell: (u) => <span className="tabular">{u.learnersCount}</span> },
    { key: 'activeMonitoring', header: 'Monitoring', align: 'right', cell: (u) => <span className="tabular">{u.activeMonitoring}</span> },
    { key: 'plan', header: 'Subscription', cell: (u) => (u.plan ? <Badge tone={u.plan === 'Premium' ? 'brand' : 'neutral'}>{u.plan}</Badge> : <span className="text-ink-4">None</span>) },
    { key: 'status', header: 'Status', mobile: 'badge', cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'createdAt', header: 'Joined', cell: (u) => <span className="whitespace-nowrap text-ink-3">{formatDate(u.createdAt)}</span> },
  ]

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Recent Users</h2>
          <p className="text-[13px] text-ink-3">Latest sign-ups across the platform</p>
        </div>
        <Link to="/admin/users" className="shrink-0 text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-300">View all users</Link>
      </div>
      <DataTable
        caption="Recent users"
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        columnToggle={false}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        emptyIcon={Users}
        emptyTitle="No users yet"
        rowActions={(u) => {
          const suspended = u.status === 'Suspended' || u.status === 'Disabled'
          return [
            { label: 'View', icon: Eye, to: `/admin/users/${u.id}` },
            { label: 'Edit', icon: Pencil, onSelect: () => setEditing(u), hidden: !can(P.USERS_EDIT) },
            { type: 'separator', hidden: !can(P.USERS_SUSPEND) },
            suspended
              ? { label: 'Reactivate', icon: RotateCcw, onSelect: () => setStatus(u, false), hidden: !can(P.USERS_SUSPEND) }
              : { label: 'Suspend', icon: Ban, danger: true, onSelect: () => setStatus(u, true), hidden: !can(P.USERS_SUSPEND) },
          ]
        }}
      />
      <UserFormModal open={!!editing} user={editing} onClose={() => setEditing(null)} onSaved={(u) => patch(u.id, u)} />
      {confirmElement}
    </div>
  )
}
