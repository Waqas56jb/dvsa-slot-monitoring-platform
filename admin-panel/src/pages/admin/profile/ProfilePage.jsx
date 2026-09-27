import { useState } from 'react'
import { KeyRound, LogOut, Monitor, MonitorSmartphone, Moon, Pencil, Smartphone, Sun } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/StatusBadge'
import { DescriptionList } from '@/components/common/DescriptionList'
import { SegmentedControl } from '@/components/common/Tabs'
import { Skeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/common/States'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { useAsync } from '@/hooks/useAsync'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/NotificationContext'
import { authService } from '@/services/authService'
import { ROLE_DESCRIPTIONS } from '@/constants/permissions'
import { formatDate, formatDateTime, formatRelative } from '@/utils/format'
import { RoleBadge, TwoFactorIndicator } from '@/pages/admin/admins/adminShared'
import { EditProfileModal } from './EditProfileModal'
import { ChangePasswordModal } from './ChangePasswordModal'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function ProfilePage() {
  const { admin } = useAdminAuth()
  const { theme, resolved, setTheme } = useTheme()
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  if (!admin) return null

  return (
    <>
      <PageHeader title="Profile" description="Your personal details, security and preferences." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1" bodyClassName="flex flex-col items-center text-center">
          <Avatar name={admin.name} size="xl" />
          <h2 className="mt-4 text-lg font-semibold tracking-[-0.01em] break-words text-ink">{admin.name}</h2>
          <p className="text-[13px] text-ink-3">{admin.title || 'No job title'}</p>
          <div className="mt-3"><RoleBadge role={admin.role} /></div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-3">{ROLE_DESCRIPTIONS[admin.role]}</p>
          <Button className="mt-5 w-full" icon={Pencil} onClick={() => setEditOpen(true)}>Edit profile</Button>
        </Card>

        <Card title="Account details" className="lg:col-span-2" actions={<Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditOpen(true)}>Edit</Button>}>
          <DescriptionList
            items={[
              { label: 'Full name', value: admin.name },
              { label: 'Email', value: <span className="break-all">{admin.email}</span> },
              { label: 'Job title', value: admin.title || <span className="text-ink-4">Not set</span> },
              { label: 'Phone', value: admin.phone ? <span className="tabular">{admin.phone}</span> : <span className="text-ink-4">Not set</span> },
              { label: 'Role', value: <RoleBadge role={admin.role} /> },
              { label: 'Admin since', value: formatDate(admin.createdAt) },
              { label: 'Previous sign-in', value: admin.lastLogin ? <span title={formatDateTime(admin.lastLogin)}>{formatRelative(admin.lastLogin)}</span> : 'This is your first sign-in' },
              { label: 'Two-factor authentication', value: <TwoFactorIndicator enabled={admin.twoFactor} /> },
            ]}
          />
        </Card>

        <Card title="Security" className="lg:col-span-2" padding="none">
          <ul className="divide-y divide-line">
            <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Password</p>
                <p className="mt-0.5 text-[13px] text-ink-3">Use at least 12 characters with a mix of letters, numbers and symbols.</p>
              </div>
              <Button icon={KeyRound} onClick={() => setPasswordOpen(true)}>Change password</Button>
            </li>
            <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Two-factor authentication</p>
                <p className="mt-0.5 text-[13px] text-ink-3">
                  {admin.twoFactor ? 'Your account is protected with an authenticator app.' : 'Add a second step at sign-in. Contact a Super Admin to set it up.'}
                </p>
              </div>
              <Badge tone={admin.twoFactor ? 'success' : 'warning'} dot>{admin.twoFactor ? 'Enabled' : 'Not enabled'}</Badge>
            </li>
          </ul>
        </Card>

        <Card title="Appearance" description="Applies to this browser only.">
          <SegmentedControl
            label="Theme"
            size="md"
            className="w-full [&>button]:flex-1"
            value={theme}
            onChange={setTheme}
            options={THEMES.map((t) => ({ value: t.value, label: <span className="inline-flex items-center justify-center gap-1.5"><t.icon className="h-3.5 w-3.5" aria-hidden />{t.label}</span> }))}
          />
          <p className="mt-3 text-xs text-ink-4">{theme === 'system' ? `Following your system setting (currently ${resolved}).` : `Always use ${theme} mode.`}</p>
        </Card>

        <SessionsCard className="lg:col-span-3" />
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  )
}

function SessionsCard({ className }) {
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const { data: sessions, loading, error, reload, setData } = useAsync(() => authService.getSessions(), [])
  const others = (sessions || []).filter((s) => !s.current)

  const logoutOthers = () => confirm({
    title: 'Sign out of all other sessions?',
    description: `This signs you out on ${others.length} other ${others.length === 1 ? 'device' : 'devices'}. Your current session stays signed in.`,
    confirmLabel: 'Sign out others',
    tone: 'warning',
    onConfirm: async () => {
      const res = await authService.logoutAllSessions()
      setData((list) => (list || []).filter((s) => s.current))
      toast.success(res?.revoked ? `Signed out of ${res.revoked} other ${res.revoked === 1 ? 'session' : 'sessions'}.` : 'Other sessions signed out.')
    },
  })

  const revoke = (s) => confirm({
    title: 'Sign out this session?',
    description: `${s.device} in ${s.location} will be signed out.`,
    confirmLabel: 'Sign out',
    tone: 'warning',
    onConfirm: async () => {
      await authService.revokeSession(s.id)
      setData((list) => (list || []).filter((x) => x.id !== s.id))
      toast.success('Session signed out.')
    },
  })

  return (
    <Card
      title="Active sessions"
      description="Devices currently signed in to your admin account."
      className={className}
      padding="none"
      actions={others.length > 0 && <Button size="sm" variant="danger-ghost" icon={LogOut} onClick={logoutOthers}>Log out all other sessions</Button>}
    >
      {error ? (
        <ErrorState compact message="Unable to load your sessions. Please try again." onRetry={reload} />
      ) : loading && !sessions ? (
        <ul className="divide-y divide-line" aria-busy="true" aria-label="Loading sessions">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-4 sm:px-5"><Skeleton className="h-9 w-9 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-56" /></div></li>
          ))}
        </ul>
      ) : !sessions?.length ? (
        <EmptyState compact icon={MonitorSmartphone} title="No active sessions" description="Sessions appear here when you sign in." />
      ) : (
        <ul className="divide-y divide-line">
          {sessions.map((s) => {
            const Icon = /iphone|android|mobile/i.test(s.device) ? Smartphone : Monitor
            return (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-3"><Icon className="h-4 w-4" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                    {s.device}
                    {s.current && <Badge tone="success" size="sm" dot>This device</Badge>}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-ink-3">
                    {[s.location, s.ip].filter(Boolean).join(' · ')}
                    <span className="text-ink-4"> · {s.current ? 'Active now' : `Last active ${formatRelative(s.lastSeen)}`}</span>
                  </p>
                </div>
                {!s.current && <Button size="sm" variant="ghost" onClick={() => revoke(s)} aria-label={`Sign out ${s.device}`}>Sign out</Button>}
              </li>
            )
          })}
        </ul>
      )}
      {confirmElement}
    </Card>
  )
}
