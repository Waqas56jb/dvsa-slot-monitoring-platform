import { useCallback } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { Badge } from '@/components/common/StatusBadge'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { useToast } from '@/context/NotificationContext'
import { adminService } from '@/services/adminService'
import { PERMISSIONS as P, PERMISSION_GROUPS, ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from '@/constants/permissions'
import { cn } from '@/utils/cn'

export const ADMIN_STATUSES = ['Active', 'Invited', 'Suspended']
export const ROLE_ORDER = [ROLES.SUPER_ADMIN, ROLES.OPERATIONS_ADMIN, ROLES.SUPPORT_ADMIN, ROLES.ANALYST]
export const ROLE_OPTIONS = ROLE_ORDER.map((r) => ({ value: r, label: ROLE_LABELS[r], description: ROLE_DESCRIPTIONS[r] }))
export const ROLE_TONES = {
  [ROLES.SUPER_ADMIN]: 'brand',
  [ROLES.OPERATIONS_ADMIN]: 'info',
  [ROLES.SUPPORT_ADMIN]: 'neutral',
  [ROLES.ANALYST]: 'neutral',
}

/**
 * Permission rows for the matrix. PERMISSION_GROUPS plus the permissions it
 * doesn't cover yet (subscriptions, activity, audit, system health) so the
 * matrix accounts for every permission a role grants.
 */
export const MATRIX_GROUPS = (() => {
  const extra = {
    subscriptions: { key: 'subscriptions', label: 'Subscriptions', perms: [['View', P.SUBSCRIPTIONS_VIEW], ['Manage', P.SUBSCRIPTIONS_MANAGE]] },
    activity: { key: 'activity', label: 'Activity feed', perms: [['View', P.ACTIVITY_VIEW]] },
    audit: { key: 'audit', label: 'Audit logs', perms: [['View', P.AUDIT_VIEW]] },
    system: { key: 'system', label: 'System health', perms: [['View', P.SYSTEM_VIEW]] },
  }
  const covered = new Set(PERMISSION_GROUPS.flatMap((g) => g.perms.map(([, p]) => p)))
  const out = []
  for (const g of PERMISSION_GROUPS) {
    out.push(g)
    if (g.key === 'notifications' && !covered.has(P.SUBSCRIPTIONS_VIEW)) out.push(extra.subscriptions)
  }
  if (!covered.has(P.ACTIVITY_VIEW)) out.push(extra.activity)
  if (!covered.has(P.AUDIT_VIEW)) out.push(extra.audit)
  if (!covered.has(P.SYSTEM_VIEW)) out.push(extra.system)
  return out
})()

export const ALL_MATRIX_PERMS = MATRIX_GROUPS.flatMap((g) => g.perms.map(([, p]) => p))

const PERM_LABELS = Object.fromEntries(MATRIX_GROUPS.flatMap((g) => g.perms.map(([action, p]) => [p, { group: g.label, action }])))
export const permLabel = (p) => PERM_LABELS[p] || { group: p.split('.')[0], action: p.split('.')[1] || p }

/** Permissions gained / lost when moving from one role to another. */
export function roleDiff(from, to) {
  const a = new Set(ROLE_PERMISSIONS[from] || [])
  const b = new Set(ROLE_PERMISSIONS[to] || [])
  return {
    gained: ALL_MATRIX_PERMS.filter((p) => b.has(p) && !a.has(p)),
    lost: ALL_MATRIX_PERMS.filter((p) => a.has(p) && !b.has(p)),
  }
}

export const grantedCount = (role) => ALL_MATRIX_PERMS.filter((p) => (ROLE_PERMISSIONS[role] || []).includes(p)).length

export function RoleBadge({ role, size }) {
  return <Badge tone={ROLE_TONES[role] || 'neutral'} size={size}>{ROLE_LABELS[role] || role}</Badge>
}

export function TwoFactorIndicator({ enabled, compact = false }) {
  const Icon = enabled ? ShieldCheck : ShieldOff
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap', enabled ? 'text-success' : 'text-ink-3')}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {compact ? (enabled ? 'On' : 'Off') : enabled ? 'Enabled' : 'Not enabled'}
      {compact && <span className="sr-only">{enabled ? 'Two-factor authentication on' : 'Two-factor authentication off'}</span>}
    </span>
  )
}

/**
 * Suspend / reactivate / resend-invite flows shared by the list and detail pages.
 * `onUpdated(admin)` receives the updated record from the service.
 */
export function useAdminStatusActions({ onUpdated }) {
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()

  const suspend = useCallback((a) => confirm({
    title: `Suspend ${a.name}?`,
    description: 'They will be signed out immediately and cannot sign in to the admin panel until reactivated.',
    confirmLabel: 'Suspend admin',
    requireReason: true,
    onConfirm: async (reason) => {
      const updated = await adminService.setStatus(a.id, 'Suspended', { reason })
      onUpdated?.(updated)
      toast.success('Admin suspended.')
    },
  }), [confirm, onUpdated, toast])

  const reactivate = useCallback((a) => confirm({
    title: `Reactivate ${a.name}?`,
    description: `They will regain ${ROLE_LABELS[a.role]} access straight away.`,
    confirmLabel: 'Reactivate',
    tone: 'brand',
    onConfirm: async () => {
      const updated = await adminService.setStatus(a.id, 'Active')
      onUpdated?.(updated)
      toast.success(updated.status === 'Invited' ? 'Admin reactivated. They still need to accept their invitation.' : 'Admin reactivated.')
    },
  }), [confirm, onUpdated, toast])

  const resendInvite = useCallback(async (a) => {
    try {
      await adminService.resendInvite(a.id)
      toast.success(`Invitation resent to ${a.email}.`)
    } catch (err) {
      toast.error(err.message || 'Unable to resend the invitation. Please try again.')
    }
  }, [toast])

  return { suspend, reactivate, resendInvite, confirmElement }
}

export const SELF_ACTION_HINT = 'You can’t change your own role or status. Ask another Super Admin.'
