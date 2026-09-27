import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@/services/authService'
import { readSession, writeSession, clearSession, touchSession, sessionToken } from '@/lib/session'
import { setAuthTokenProvider, setUnauthorizedHandler } from '@/lib/apiClient'
import { roleHas, ROLE_LABELS } from '@/constants/permissions'
import { STORAGE_KEYS } from '@/constants/config'

/**
 * Admin authentication state. Mock mode persists a fake session in storage;
 * swapping to Supabase Auth / the Node API only changes authService.
 *
 * Exposes: admin, isAuthenticated, loading, login, logout, getCurrentAdmin,
 * forgotPassword, resetPassword, can(permission), expiresAt, extendSession, updateAdmin.
 */
const AdminAuthContext = createContext(null)
const isRemembered = () => { try { return !!localStorage.getItem(STORAGE_KEYS.session) } catch { return false } }

setAuthTokenProvider(sessionToken)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => readSession()?.admin ?? null)
  const [expiresAt, setExpiresAt] = useState(() => readSession()?.expiresAt ?? null)
  const [loading, setLoading] = useState(() => !!readSession())

  const logout = useCallback(async ({ silent = false, reason } = {}) => {
    try { if (!silent) await authService.logout() } catch { /* ignore network errors on logout */ }
    clearSession()
    setAdmin(null)
    setExpiresAt(null)
    if (reason) sessionStorage.setItem('slotpilot.logoutReason', reason)
  }, [])

  // Validate a persisted session on boot.
  useEffect(() => {
    const s = readSession()
    if (!s) { setLoading(false); return }
    authService.getCurrentAdmin(s)
      .then((fresh) => {
        setAdmin(fresh)
        writeSession({ ...s, admin: fresh }, isRemembered())
      })
      .catch(() => logout({ silent: true, reason: 'Your session is no longer valid. Please sign in again.' }))
      .finally(() => setLoading(false))
  }, [logout])

  useEffect(() => { setUnauthorizedHandler(() => logout({ silent: true, reason: 'Your session expired. Please sign in again.' })) }, [logout])

  const login = useCallback(async ({ email, password, remember }) => {
    const res = await authService.login({ email, password })
    writeSession({ token: res.token, admin: res.admin, expiresAt: res.expiresAt }, remember)
    setAdmin(res.admin)
    setExpiresAt(res.expiresAt)
    return res.admin
  }, [])

  const extendSession = useCallback(async () => {
    const { expiresAt: next } = await authService.refreshSession()
    touchSession(next)
    setExpiresAt(next)
  }, [])

  const getCurrentAdmin = useCallback(() => admin, [admin])
  const updateAdmin = useCallback((patch) => {
    setAdmin((a) => {
      const next = { ...a, ...patch }
      const s = readSession()
      if (s) writeSession({ ...s, admin: next }, isRemembered())
      return next
    })
  }, [])

  const can = useCallback((permission) => (!permission ? true : !!admin && roleHas(admin.role, permission)), [admin])

  const value = useMemo(() => ({
    admin,
    roleLabel: admin ? ROLE_LABELS[admin.role] : null,
    isAuthenticated: !!admin,
    loading,
    expiresAt,
    login,
    logout,
    getCurrentAdmin,
    forgotPassword: authService.forgotPassword,
    resetPassword: authService.resetPassword,
    extendSession,
    updateAdmin,
    can,
  }), [admin, loading, expiresAt, login, logout, getCurrentAdmin, extendSession, updateAdmin, can])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}

/** Convenience: const can = usePermission(); can('users.suspend') */
export const usePermission = () => useAdminAuth().can
