import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { AccessRestricted } from '@/components/common/States'
import { PageLoader } from '@/components/common/Spinner'
import { Tooltip } from '@/components/common/Tooltip'
import { ROLES } from '@/constants/permissions'
import { cloneElement, isValidElement } from 'react'

const ADMIN_ROLES = Object.values(ROLES)

/**
 * Gate for all authenticated /admin/* routes.
 * Unauthenticated → /admin/login (remembering where they were going).
 * Authenticated but not an admin role (e.g. a platform user token) → access restricted.
 */
export function ProtectedAdminRoute() {
  const { isAuthenticated, loading, admin } = useAdminAuth()
  const location = useLocation()
  if (loading) return <PageLoader label="Checking your session…" />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  if (!ADMIN_ROLES.includes(admin?.role)) return <div className="p-8"><AccessRestricted /></div>
  return <Outlet />
}

/** Redirects signed-in admins away from login/forgot/reset pages. */
export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAdminAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}

/** Route-level permission check. Renders the Access restricted screen rather than silently redirecting. */
export function RequirePermission({ permission, children }) {
  const { can } = useAdminAuth()
  if (!can(permission)) return <AccessRestricted />
  return children
}

/**
 * Component-level permission gate.
 *
 * mode="hide"     → render nothing (or `fallback`) when not permitted
 * mode="disable"  → render the child disabled with an explanatory tooltip
 * mode="restrict" → render the full Access restricted panel
 *
 * <PermissionGate permission={P.USERS_SUSPEND} mode="disable"><Button>Suspend</Button></PermissionGate>
 */
export function PermissionGate({ permission, mode = 'hide', fallback = null, children }) {
  const { can } = useAdminAuth()
  if (can(permission)) return children
  if (mode === 'restrict') return <AccessRestricted compact />
  if (mode === 'disable' && isValidElement(children)) {
    return (
      <Tooltip content="You don't have permission for this action">
        <span className="inline-flex">{cloneElement(children, { disabled: true, 'aria-disabled': true, onClick: undefined })}</span>
      </Tooltip>
    )
  }
  return fallback
}
