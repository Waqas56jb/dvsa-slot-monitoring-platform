import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedAdminRoute, PublicOnlyRoute, RequirePermission } from './guards'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageLoader } from '@/components/common/Spinner'
import { PERMISSIONS as P } from '@/constants/permissions'

// Every page is code-split.
const page = (loader) => lazy(loader)
const LoginPage = page(() => import('@/pages/admin/auth/LoginPage'))
const ForgotPasswordPage = page(() => import('@/pages/admin/auth/ForgotPasswordPage'))
const ResetPasswordPage = page(() => import('@/pages/admin/auth/ResetPasswordPage'))
const DashboardPage = page(() => import('@/pages/admin/dashboard/DashboardPage'))
const UsersPage = page(() => import('@/pages/admin/users/UsersPage'))
const UserDetailPage = page(() => import('@/pages/admin/users/UserDetailPage'))
const LearnersPage = page(() => import('@/pages/admin/learners/LearnersPage'))
const LearnerDetailPage = page(() => import('@/pages/admin/learners/LearnerDetailPage'))
const MonitoringPage = page(() => import('@/pages/admin/monitoring/MonitoringPage'))
const MonitoringDetailPage = page(() => import('@/pages/admin/monitoring/MonitoringDetailPage'))
const TestCentresPage = page(() => import('@/pages/admin/centres/TestCentresPage'))
const TestCentreDetailPage = page(() => import('@/pages/admin/centres/TestCentreDetailPage'))
const SlotsPage = page(() => import('@/pages/admin/slots/SlotsPage'))
const SlotDetailPage = page(() => import('@/pages/admin/slots/SlotDetailPage'))
const NotificationsPage = page(() => import('@/pages/admin/notifications/NotificationsPage'))
const SubscriptionsPage = page(() => import('@/pages/admin/subscriptions/SubscriptionsPage'))
const SubscriptionDetailPage = page(() => import('@/pages/admin/subscriptions/SubscriptionDetailPage'))
const PaymentsPage = page(() => import('@/pages/admin/payments/PaymentsPage'))
const PaymentDetailPage = page(() => import('@/pages/admin/payments/PaymentDetailPage'))
const SupportPage = page(() => import('@/pages/admin/support/SupportPage'))
const SupportTicketPage = page(() => import('@/pages/admin/support/SupportTicketPage'))
const AnalyticsPage = page(() => import('@/pages/admin/analytics/AnalyticsPage'))
const SystemHealthPage = page(() => import('@/pages/admin/system-health/SystemHealthPage'))
const ActivityPage = page(() => import('@/pages/admin/activity/ActivityPage'))
const AuditLogsPage = page(() => import('@/pages/admin/audit-logs/AuditLogsPage'))
const AdminsPage = page(() => import('@/pages/admin/admins/AdminsPage'))
const AdminDetailPage = page(() => import('@/pages/admin/admins/AdminDetailPage'))
const SettingsPage = page(() => import('@/pages/admin/settings/SettingsPage'))
const ProfilePage = page(() => import('@/pages/admin/profile/ProfilePage'))
const NotFoundPage = page(() => import('@/pages/admin/errors/NotFoundPage'))

/** [path, Component, permission?] — permission mirrors the sidebar entry. */
const ADMIN_ROUTES = [
  ['dashboard', DashboardPage],
  ['users', UsersPage, P.USERS_VIEW],
  ['users/:id', UserDetailPage, P.USERS_VIEW],
  ['learners', LearnersPage, P.LEARNERS_VIEW],
  ['learners/:id', LearnerDetailPage, P.LEARNERS_VIEW],
  ['monitoring', MonitoringPage, P.MONITORING_VIEW],
  ['monitoring/:id', MonitoringDetailPage, P.MONITORING_VIEW],
  ['test-centres', TestCentresPage, P.CENTRES_VIEW],
  ['test-centres/:id', TestCentreDetailPage, P.CENTRES_VIEW],
  ['slots', SlotsPage, P.SLOTS_VIEW],
  ['slots/:id', SlotDetailPage, P.SLOTS_VIEW],
  ['notifications', NotificationsPage, P.NOTIFICATIONS_VIEW],
  ['subscriptions', SubscriptionsPage, P.SUBSCRIPTIONS_VIEW],
  ['subscriptions/:id', SubscriptionDetailPage, P.SUBSCRIPTIONS_VIEW],
  ['payments', PaymentsPage, P.PAYMENTS_VIEW],
  ['payments/:id', PaymentDetailPage, P.PAYMENTS_VIEW],
  ['support', SupportPage, P.SUPPORT_VIEW],
  ['support/:id', SupportTicketPage, P.SUPPORT_VIEW],
  ['analytics', AnalyticsPage, P.ANALYTICS_VIEW],
  ['system-health', SystemHealthPage, P.SYSTEM_VIEW],
  ['activity', ActivityPage, P.ACTIVITY_VIEW],
  ['audit-logs', AuditLogsPage, P.AUDIT_VIEW],
  ['admins', AdminsPage, P.ADMINS_VIEW],
  ['admins/:id', AdminDetailPage, P.ADMINS_VIEW],
  ['settings', SettingsPage, P.SETTINGS_VIEW],
  ['profile', ProfilePage],
]

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        {/* Reset is reachable while signed in too (link from email). */}
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            {ADMIN_ROUTES.map(([path, Component, permission]) => (
              <Route key={path} path={path} element={permission ? <RequirePermission permission={permission}><Component /></RequirePermission> : <Component />} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
