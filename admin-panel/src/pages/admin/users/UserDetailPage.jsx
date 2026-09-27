import { useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Ban, History, KeyRound, Pencil, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { Tabs } from '@/components/common/Tabs'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { PermissionGate } from '@/routes/guards'
import { useAsync } from '@/hooks/useAsync'
import { useDisclosure } from '@/hooks/useUtils'
import { useToast } from '@/context/NotificationContext'
import { userService } from '@/services/userService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatDate } from '@/utils/format'
import { UserFormModal } from './UserFormModal'
import { UserOverviewTab } from './UserOverviewTab'
import { UserNotesTab } from './UserNotesTab'
import { UserActivityTab, UserLearnersTab, UserMonitoringTab, UserNotificationsTab, UserPaymentsTab, UserSlotsTab } from './UserRecordTabs'
import { DetailError } from './detailShared'

const TAB_KEYS = ['overview', 'learners', 'monitoring', 'slots', 'notifications', 'payments', 'activity', 'notes']

export default function UserDetailPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const edit = useDisclosure()
  const { data: user, loading, error, reload, setData } = useAsync(() => userService.getUserById(id), [id])

  const tab = TAB_KEYS.includes(params.get('tab')) ? params.get('tab') : 'overview'
  const setTab = useCallback((t) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (t === 'overview') next.delete('tab')
      else next.set('tab', t)
      return next
    }, { replace: true })
  }, [setParams])

  if (loading && !user) return <SkeletonDetail />
  if (error || !user) {
    return (
      <>
        <PageHeader title="User" back={{ to: '/admin/users', label: 'Users' }} />
        <DetailError error={error} entity="User" onRetry={reload} backTo="/admin/users" backLabel="Back to users" />
      </>
    )
  }

  const suspended = user.status === 'Suspended' || user.status === 'Disabled'

  const suspend = () => confirm({
    title: 'Suspend this user?',
    description: `${user.name} will be signed out and all of their monitoring will pause until reactivated.`,
    confirmLabel: 'Suspend user',
    requireReason: true,
    onConfirm: async (reason) => {
      await userService.suspendUser(user.id, { reason })
      setData((d) => ({ ...d, status: 'Suspended' }))
      toast.success('User suspended successfully.')
    },
  })

  const reactivate = () => confirm({
    title: 'Reactivate this user?',
    description: `${user.name} will regain access. Paused monitoring stays paused until they resume it.`,
    confirmLabel: 'Reactivate',
    tone: 'brand',
    onConfirm: async () => {
      await userService.reactivateUser(user.id)
      setData((d) => ({ ...d, status: 'Active' }))
      toast.success('User reactivated.')
    },
  })

  const resetPassword = () => confirm({
    title: 'Send a password reset email?',
    description: `A secure reset link will be emailed to ${user.email}. Their current password keeps working until they set a new one.`,
    confirmLabel: 'Send reset email',
    tone: 'brand',
    onConfirm: async () => {
      const res = await userService.sendPasswordReset(user.id)
      toast.success(`Password reset email sent to ${res?.email || user.email}.`)
    },
  })

  const notes = user.notes || []
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'learners', label: 'Learners', count: user.learners.length },
    { value: 'monitoring', label: 'Monitoring', count: user.monitoring.length },
    { value: 'slots', label: 'Slots', count: user.slots.length },
    { value: 'notifications', label: 'Notifications', count: user.notifications.length },
    { value: 'payments', label: 'Payments', count: user.payments.length },
    { value: 'activity', label: 'Activity', count: user.activity.length },
    { value: 'notes', label: 'Notes', count: notes.length },
  ]
  const activeLabel = tabs.find((t) => t.value === tab)?.label

  return (
    <>
      <PageHeader
        title={user.name}
        documentTitle={`${user.name} · Users`}
        back={{ to: '/admin/users', label: 'Users' }}
        leading={
          <span className="shrink-0">
            <span className="sm:hidden"><Avatar name={user.name} size="lg" /></span>
            <span className="hidden sm:block"><Avatar name={user.name} size="xl" /></span>
          </span>
        }
        meta={
          <>
            <StatusBadge status={user.status} />
            {user.plan && <Badge tone={user.plan === 'Premium' ? 'brand' : 'neutral'}>{user.plan}</Badge>}
          </>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <a href={`mailto:${user.email}`} className="truncate hover:text-ink hover:underline">{user.email}</a>
            <span aria-hidden className="text-ink-4">·</span>
            <span>Joined {formatDate(user.createdAt)}</span>
          </span>
        }
        actions={
          <>
            <Button variant="ghost" icon={History} onClick={() => setTab('activity')}>View activity</Button>
            <PermissionGate permission={P.USERS_EDIT} mode="disable">
              <Button icon={KeyRound} onClick={resetPassword}>Reset password</Button>
            </PermissionGate>
            <PermissionGate permission={P.USERS_EDIT}>
              <Button icon={Pencil} onClick={edit.open}>Edit</Button>
            </PermissionGate>
            <PermissionGate permission={P.USERS_SUSPEND}>
              {suspended
                ? <Button variant="primary" icon={RotateCcw} onClick={reactivate}>Reactivate</Button>
                : <Button variant="danger" icon={Ban} onClick={suspend}>Suspend</Button>}
            </PermissionGate>
          </>
        }
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-6" />

      <div role="tabpanel" aria-label={activeLabel} className="min-w-0">
        {tab === 'overview' && <UserOverviewTab user={user} />}
        {tab === 'learners' && <UserLearnersTab learners={user.learners} />}
        {tab === 'monitoring' && <UserMonitoringTab jobs={user.monitoring} />}
        {tab === 'slots' && <UserSlotsTab slots={user.slots} />}
        {tab === 'notifications' && <UserNotificationsTab notifications={user.notifications} />}
        {tab === 'payments' && <UserPaymentsTab payments={user.payments} />}
        {tab === 'activity' && <UserActivityTab activity={user.activity} />}
        {tab === 'notes' && <UserNotesTab userId={user.id} notes={notes} onAdded={(note) => setData((d) => ({ ...d, notes: [note, ...(d.notes || [])] }))} />}
      </div>

      <UserFormModal open={edit.isOpen} user={user} onClose={edit.close} onSaved={(saved) => setData((d) => ({ ...d, ...saved }))} />
      {confirmElement}
    </>
  )
}
