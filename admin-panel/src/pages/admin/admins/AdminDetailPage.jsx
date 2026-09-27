import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Ban, History, KeyRound, Mail, RotateCcw, ScrollText, ShieldAlert, UserCog } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge, Badge } from '@/components/common/StatusBadge'
import { DescriptionList } from '@/components/common/DescriptionList'
import { Tabs } from '@/components/common/Tabs'
import { Tooltip } from '@/components/common/Tooltip'
import { SkeletonDetail } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/States'
import { DataTable } from '@/components/tables/DataTable'
import { useAsync } from '@/hooks/useAsync'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminService } from '@/services/adminService'
import { PERMISSIONS as P, ROLE_DESCRIPTIONS } from '@/constants/permissions'
import { formatDate, formatDateTime, formatRelative } from '@/utils/format'
import { ChangeRoleModal } from './ChangeRoleModal'
import { PermissionMatrix } from './PermissionMatrix'
import { RoleBadge, TwoFactorIndicator, useAdminStatusActions, grantedCount, ALL_MATRIX_PERMS, SELF_ACTION_HINT } from './adminShared'

const LOGIN_COLUMNS = [
  { key: 'at', header: 'Time', mobile: 'primary', cell: (l) => <span className="whitespace-nowrap"><span className="text-ink">{formatDateTime(l.at)}</span><span className="block text-xs text-ink-4">{formatRelative(l.at)}</span></span> },
  { key: 'device', header: 'Device', cell: (l) => <span className="whitespace-nowrap text-ink-2">{l.device}</span> },
  { key: 'location', header: 'Location', cell: (l) => <span className="whitespace-nowrap text-ink-3">{l.location}</span> },
  { key: 'ip', header: 'IP address', cell: (l) => <span className="font-mono text-[12.5px] text-ink-2">{l.ip}</span> },
  { key: 'result', header: 'Result', mobile: 'badge', cell: (l) => <StatusBadge status={l.result} /> },
]

const ACTION_COLUMNS = [
  { key: 'action', header: 'Action', mobile: 'primary', cell: (a) => <span className="font-medium text-ink">{a.action}</span> },
  { key: 'resource', header: 'Resource', cell: (a) => <span className="text-ink-2">{a.resource}</span> },
  { key: 'resourceId', header: 'Resource ID', cell: (a) => <span className="font-mono text-[12.5px] break-all text-ink-2">{a.resourceId}</span> },
  { key: 'timestamp', header: 'Time', cell: (a) => <span className="whitespace-nowrap text-ink-3" title={formatDateTime(a.timestamp)}>{formatRelative(a.timestamp)}</span> },
  { key: 'result', header: 'Result', mobile: 'badge', cell: (a) => <StatusBadge status={a.result} /> },
]

export default function AdminDetailPage() {
  const { id } = useParams()
  const { admin: me, can } = useAdminAuth()
  const { data: admin, loading, error, reload, setData } = useAsync(() => adminService.getAdminById(id), [id])
  const [tab, setTab] = useState('permissions')
  const [roleOpen, setRoleOpen] = useState(false)

  const onUpdated = useCallback((a) => setData((d) => ({ ...d, ...a })), [setData])
  const { suspend, reactivate, resendInvite, confirmElement } = useAdminStatusActions({ onUpdated })

  if (loading && !admin) return <SkeletonDetail />
  if (error) {
    const missing = error.status === 404
    return (
      <div className="card">
        <ErrorState
          title={missing ? 'Admin not found' : 'Unable to load admin.'}
          message={missing ? 'This admin account doesn’t exist or has been removed.' : 'Unable to load this admin. Please try again.'}
          onRetry={missing ? undefined : reload}
          showBack
        />
      </div>
    )
  }
  if (!admin) return null

  const self = admin.id === me?.id
  const canManage = can(P.ADMINS_MANAGE)
  const selfWrap = (node) => (self ? <Tooltip content={SELF_ACTION_HINT}><span className="inline-flex">{node}</span></Tooltip> : node)

  const actions = canManage && (
    <>
      {admin.status === 'Invited' && selfWrap(<Button icon={Mail} onClick={() => resendInvite(admin)} disabled={self}>Resend invite</Button>)}
      {selfWrap(<Button icon={UserCog} onClick={() => setRoleOpen(true)} disabled={self}>Change role</Button>)}
      {admin.status === 'Suspended'
        ? selfWrap(<Button variant="primary" icon={RotateCcw} onClick={() => reactivate(admin)} disabled={self}>Reactivate</Button>)
        : selfWrap(<Button variant="danger-ghost" icon={Ban} onClick={() => suspend(admin)} disabled={self}>Suspend</Button>)}
    </>
  )

  const logins = admin.loginHistory || []
  const performed = admin.actions || []
  const failedLogins = logins.filter((l) => l.result !== 'Success').length

  return (
    <>
      <PageHeader
        back={{ to: '/admin/admins', label: 'Admins' }}
        leading={<Avatar name={admin.name} size="lg" />}
        title={admin.name}
        meta={<><RoleBadge role={admin.role} /><StatusBadge status={admin.status} />{self && <Badge tone="brand" size="sm">You</Badge>}</>}
        description={[admin.title, admin.email].filter(Boolean).join(' · ')}
        actions={actions}
      />

      <div className="space-y-6">
        {admin.status === 'Suspended' && (
          <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger" role="status">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>This account is suspended. They can’t sign in until a Super Admin reactivates it.</p>
          </div>
        )}
        {admin.status === 'Invited' && (
          <div className="flex items-start gap-3 rounded-lg border border-info/20 bg-info-soft px-4 py-3 text-sm text-info" role="status">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>Invitation pending since {formatDate(admin.createdAt)}. They haven’t signed in yet.</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Profile" className="lg:col-span-2">
            <DescriptionList
              items={[
                { label: 'Full name', value: admin.name },
                { label: 'Job title', value: admin.title || <span className="text-ink-4">Not set</span> },
                { label: 'Email', value: admin.email },
                { label: 'Phone', value: admin.phone ? <span className="tabular">{admin.phone}</span> : <span className="text-ink-4">Not set</span> },
                { label: 'Admin ID', value: admin.id, mono: true },
                { label: 'Created', value: formatDate(admin.createdAt) },
                { label: 'Last login', value: admin.lastLogin ? <span title={formatDateTime(admin.lastLogin)}>{formatRelative(admin.lastLogin)}</span> : 'Never' },
                { label: 'Two-factor authentication', value: <TwoFactorIndicator enabled={admin.twoFactor} /> },
              ]}
            />
          </Card>

          <Card title="Access">
            <div className="space-y-4">
              <div>
                <RoleBadge role={admin.role} />
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">{ROLE_DESCRIPTIONS[admin.role]}</p>
              </div>
              <div className="rounded-lg border border-line p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-ink-3">Permissions granted</span>
                  <span className="text-sm font-semibold text-ink tabular">{grantedCount(admin.role)}<span className="font-normal text-ink-4"> / {ALL_MATRIX_PERMS.length}</span></span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(grantedCount(admin.role) / ALL_MATRIX_PERMS.length) * 100}%` }} />
                </div>
              </div>
              {!admin.twoFactor && admin.status !== 'Invited' && (
                <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-[13px] text-warning">
                  <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Two-factor authentication isn’t enabled on this account.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Tabs
            className="mb-4"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'permissions', label: 'Permissions' },
              { value: 'logins', label: 'Login activity', count: logins.length },
              { value: 'actions', label: 'Actions performed', count: performed.length },
            ]}
          />

          {tab === 'permissions' && <PermissionMatrix role={admin.role} />}

          {tab === 'logins' && (
            <div className="space-y-3">
              {failedLogins > 0 && <p className="text-[13px] text-ink-3">{failedLogins} unsuccessful sign-in {failedLogins === 1 ? 'attempt' : 'attempts'} in the last 60 days.</p>}
              <DataTable
                caption="Login activity"
                columns={LOGIN_COLUMNS}
                rows={logins}
                columnToggle={false}
                emptyIcon={History}
                emptyTitle="No sign-ins yet"
                emptyDescription={admin.status === 'Invited' ? 'This admin hasn’t accepted their invitation.' : 'No sign-ins recorded in the last 60 days.'}
              />
            </div>
          )}

          {tab === 'actions' && (
            <DataTable
              caption="Actions performed by this admin"
              columns={ACTION_COLUMNS}
              rows={performed}
              columnToggle={false}
              emptyIcon={ScrollText}
              emptyTitle="No recorded actions"
              emptyDescription="Changes this admin makes will appear here."
              toolbar={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] text-ink-3">Most recent {performed.length} audit entries.</p>
                  {can(P.AUDIT_VIEW) && <Button size="sm" variant="secondary" icon={ScrollText} to={`/admin/audit-logs?search=${encodeURIComponent(admin.name)}`}>View in Audit Logs</Button>}
                </div>
              }
            />
          )}
        </div>
      </div>

      <ChangeRoleModal open={roleOpen} admin={admin} onClose={() => setRoleOpen(false)} onChanged={onUpdated} />
      {confirmElement}
    </>
  )
}
