import {
  LayoutDashboard, Users, GraduationCap, Radar, MapPin, CalendarClock, Bell, Layers, CreditCard,
  LifeBuoy, BarChart3, Activity, ScrollText, History, ShieldCheck, Settings,
} from 'lucide-react'
import { PERMISSIONS as P } from './permissions'

export const NAV_GROUPS = [
  { label: 'Overview', items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }] },
  {
    label: 'Operations',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users, permission: P.USERS_VIEW },
      { label: 'Learners', to: '/admin/learners', icon: GraduationCap, permission: P.LEARNERS_VIEW },
      { label: 'Monitoring', to: '/admin/monitoring', icon: Radar, permission: P.MONITORING_VIEW, badgeKey: 'monitoringFailed' },
      { label: 'Test Centres', to: '/admin/test-centres', icon: MapPin, permission: P.CENTRES_VIEW },
      { label: 'Slots', to: '/admin/slots', icon: CalendarClock, permission: P.SLOTS_VIEW },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell, permission: P.NOTIFICATIONS_VIEW },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Subscriptions', to: '/admin/subscriptions', icon: Layers, permission: P.SUBSCRIPTIONS_VIEW },
      { label: 'Payments', to: '/admin/payments', icon: CreditCard, permission: P.PAYMENTS_VIEW },
    ],
  },
  { label: 'Support', items: [{ label: 'Support Tickets', to: '/admin/support', icon: LifeBuoy, permission: P.SUPPORT_VIEW, badgeKey: 'openTickets' }] },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3, permission: P.ANALYTICS_VIEW },
      { label: 'System Health', to: '/admin/system-health', icon: Activity, permission: P.SYSTEM_VIEW },
      { label: 'Activity', to: '/admin/activity', icon: History, permission: P.ACTIVITY_VIEW },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText, permission: P.AUDIT_VIEW },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Admins', to: '/admin/admins', icon: ShieldCheck, permission: P.ADMINS_VIEW },
      { label: 'Settings', to: '/admin/settings', icon: Settings, permission: P.SETTINGS_VIEW },
    ],
  },
]

/** Human labels for URL segments, used by breadcrumbs. */
export const SEGMENT_LABELS = {
  dashboard: 'Dashboard', users: 'Users', learners: 'Learners', monitoring: 'Monitoring',
  'test-centres': 'Test Centres', slots: 'Slots', notifications: 'Notifications', subscriptions: 'Subscriptions',
  payments: 'Payments', support: 'Support', analytics: 'Analytics', 'system-health': 'System Health',
  activity: 'Activity', 'audit-logs': 'Audit Logs', admins: 'Admins', settings: 'Settings', profile: 'Profile',
}
