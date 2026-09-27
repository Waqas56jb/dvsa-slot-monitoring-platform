/**
 * Frontend role/permission model. This only shapes the UI — the backend
 * (Express middleware + Supabase RLS) is the source of truth and must
 * enforce every one of these checks independently.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPERATIONS_ADMIN: 'operations_admin',
  SUPPORT_ADMIN: 'support_admin',
  ANALYST: 'analyst',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.OPERATIONS_ADMIN]: 'Operations Admin',
  [ROLES.SUPPORT_ADMIN]: 'Support Admin',
  [ROLES.ANALYST]: 'Analyst',
}

export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: 'Full access, including admin accounts and platform settings.',
  [ROLES.OPERATIONS_ADMIN]: 'Runs day-to-day operations: users, monitoring, centres and slots.',
  [ROLES.SUPPORT_ADMIN]: 'Handles customers: users, tickets and notifications. Read-only elsewhere.',
  [ROLES.ANALYST]: 'Read-only access to analytics, reports and operational data.',
}

export const PERMISSIONS = {
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_DELETE: 'users.delete',
  LEARNERS_VIEW: 'learners.view',
  LEARNERS_EDIT: 'learners.edit',
  LEARNERS_REVEAL: 'learners.reveal_reference',
  MONITORING_VIEW: 'monitoring.view',
  MONITORING_PAUSE: 'monitoring.pause',
  MONITORING_STOP: 'monitoring.stop',
  MONITORING_EDIT: 'monitoring.edit',
  CENTRES_VIEW: 'centres.view',
  CENTRES_MANAGE: 'centres.manage',
  SLOTS_VIEW: 'slots.view',
  SLOTS_MANAGE: 'slots.manage',
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_REFUND: 'payments.refund',
  SUPPORT_VIEW: 'support.view',
  SUPPORT_REPLY: 'support.reply',
  ANALYTICS_VIEW: 'analytics.view',
  SYSTEM_VIEW: 'system.view',
  ACTIVITY_VIEW: 'activity.view',
  AUDIT_VIEW: 'audit.view',
  ADMINS_VIEW: 'admins.view',
  ADMINS_MANAGE: 'admins.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  EXPORT: 'data.export',
}

const P = PERMISSIONS
const ALL = Object.values(P)
const READ_ONLY = [
  P.USERS_VIEW, P.LEARNERS_VIEW, P.MONITORING_VIEW, P.CENTRES_VIEW, P.SLOTS_VIEW,
  P.NOTIFICATIONS_VIEW, P.SUBSCRIPTIONS_VIEW, P.PAYMENTS_VIEW, P.SUPPORT_VIEW,
  P.ANALYTICS_VIEW, P.SYSTEM_VIEW, P.ACTIVITY_VIEW,
]

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ALL,
  [ROLES.OPERATIONS_ADMIN]: [
    ...READ_ONLY, P.USERS_EDIT, P.USERS_SUSPEND, P.LEARNERS_EDIT, P.LEARNERS_REVEAL, P.MONITORING_PAUSE,
    P.MONITORING_STOP, P.MONITORING_EDIT, P.CENTRES_MANAGE, P.SLOTS_MANAGE,
    P.NOTIFICATIONS_MANAGE, P.SUBSCRIPTIONS_MANAGE, P.SUPPORT_REPLY, P.AUDIT_VIEW,
    P.SETTINGS_VIEW, P.EXPORT,
  ],
  [ROLES.SUPPORT_ADMIN]: [
    ...READ_ONLY, P.USERS_EDIT, P.USERS_SUSPEND, P.SUPPORT_REPLY, P.NOTIFICATIONS_MANAGE,
    P.MONITORING_PAUSE,
  ],
  [ROLES.ANALYST]: [...READ_ONLY, P.AUDIT_VIEW, P.EXPORT],
}

/** Grouping used by the permission matrix UI. */
export const PERMISSION_GROUPS = [
  { key: 'users', label: 'Users', perms: [['View', P.USERS_VIEW], ['Edit', P.USERS_EDIT], ['Suspend', P.USERS_SUSPEND], ['Delete', P.USERS_DELETE]] },
  { key: 'learners', label: 'Learners', perms: [['View', P.LEARNERS_VIEW], ['Edit', P.LEARNERS_EDIT], ['Reveal ref.', P.LEARNERS_REVEAL]] },
  { key: 'monitoring', label: 'Monitoring', perms: [['View', P.MONITORING_VIEW], ['Pause', P.MONITORING_PAUSE], ['Stop', P.MONITORING_STOP], ['Edit', P.MONITORING_EDIT]] },
  { key: 'centres', label: 'Test centres', perms: [['View', P.CENTRES_VIEW], ['Manage', P.CENTRES_MANAGE]] },
  { key: 'slots', label: 'Slots', perms: [['View', P.SLOTS_VIEW], ['Manage', P.SLOTS_MANAGE]] },
  { key: 'notifications', label: 'Notifications', perms: [['View', P.NOTIFICATIONS_VIEW], ['Manage', P.NOTIFICATIONS_MANAGE]] },
  { key: 'subscriptions', label: 'Subscriptions', perms: [['View', P.SUBSCRIPTIONS_VIEW], ['Manage', P.SUBSCRIPTIONS_MANAGE]] },
  { key: 'payments', label: 'Payments', perms: [['View', P.PAYMENTS_VIEW], ['Refund', P.PAYMENTS_REFUND]] },
  { key: 'support', label: 'Support', perms: [['View', P.SUPPORT_VIEW], ['Reply', P.SUPPORT_REPLY]] },
  { key: 'analytics', label: 'Analytics', perms: [['View', P.ANALYTICS_VIEW], ['Export', P.EXPORT]] },
  { key: 'system', label: 'System health', perms: [['View', P.SYSTEM_VIEW]] },
  { key: 'activity', label: 'Activity & audit', perms: [['Activity', P.ACTIVITY_VIEW], ['Audit logs', P.AUDIT_VIEW]] },
  { key: 'settings', label: 'Settings', perms: [['View', P.SETTINGS_VIEW], ['Manage', P.SETTINGS_MANAGE]] },
  { key: 'admins', label: 'Admin management', perms: [['View', P.ADMINS_VIEW], ['Manage', P.ADMINS_MANAGE]] },
]

export function roleHas(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission)
}
