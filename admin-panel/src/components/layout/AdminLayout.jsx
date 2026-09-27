import { Suspense, useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { CommandPalette } from './CommandPalette'
import { SystemAlertBanner } from './SystemAlertBanner'
import { SessionExpiryWarning } from './SessionExpiryWarning'
import { Drawer } from '@/components/common/Drawer'
import { PageLoader } from '@/components/common/Spinner'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useHotkey, useLocalStorage, useIsDesktop, useRealtime } from '@/hooks/useUtils'
import { systemService } from '@/services/systemService'
import { monitoringService } from '@/services/monitoringService'
import { supportService } from '@/services/supportService'
import { STORAGE_KEYS } from '@/constants/config'
import { cn } from '@/utils/cn'

/** App shell for every authenticated /admin/* route. */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEYS.sidebar, false)
  const [navOpen, setNavOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [banner, setBanner] = useState(null)
  const [systemStatus, setSystemStatus] = useState('Operational')
  const [badges, setBadges] = useState({})
  const { logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useIsDesktop()

  useHotkey('mod+k', () => setPaletteOpen((o) => !o))
  useEffect(() => { setNavOpen(false) }, [location.pathname])
  useEffect(() => { if (isDesktop) setNavOpen(false) }, [isDesktop])

  // Shell-level data: system banner, status indicator, nav badges.
  useEffect(() => {
    let dismissed = null
    try { dismissed = sessionStorage.getItem(STORAGE_KEYS.dismissedBanner) } catch { /* ignore */ }
    systemService.getBanner().then((b) => setBanner(dismissed === b.message ? null : b)).catch(() => {})
    systemService.getSystemHealth().then((h) => setSystemStatus(h.overall)).catch(() => {})
    Promise.all([monitoringService.getStatusCounts(), supportService.getCounts()])
      .then(([m, s]) => setBadges({ monitoringFailed: m.Failed || 0, openTickets: s.Open || 0 }))
      .catch(() => {})
  }, [])
  useRealtime('system', (s) => { if (s.overall) setSystemStatus(s.overall) })

  const dismissBanner = () => {
    try { sessionStorage.setItem(STORAGE_KEYS.dismissedBanner, banner?.message) } catch { /* ignore */ }
    setBanner(null)
  }

  const requestLogout = useCallback(() => { setPaletteOpen(false); setLogoutOpen(true) }, [])
  const doLogout = async () => { await logout(); navigate('/admin/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="sr-only z-[100] rounded-md bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 ease-out lg:block', collapsed ? 'w-[72px]' : 'w-[248px]')}>
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} onLogout={requestLogout} badges={badges} />
      </aside>

      {/* Mobile drawer */}
      <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" width="w-[280px] max-w-[85vw]" label="Navigation">
        <AdminSidebar mobile onNavigate={() => setNavOpen(false)} onLogout={requestLogout} badges={badges} />
      </Drawer>

      <div className={cn('flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ease-out', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[248px]')}>
        <SystemAlertBanner banner={banner} onDismiss={dismissBanner} />
        <AdminHeader onOpenNav={() => setNavOpen(true)} onOpenSearch={() => setPaletteOpen(true)} onLogout={requestLogout} systemStatus={systemStatus} />
        <main id="main" className="mx-auto w-full max-w-[1600px] min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onLogout={requestLogout} />
      <SessionExpiryWarning />
      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={doLogout}
        title="Log out of SlotPilot Admin?"
        description="You'll need to sign in again to access the admin workspace."
        confirmLabel="Log out"
        tone="brand"
      />
    </div>
  )
}
