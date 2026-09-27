import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { useNavCounts } from '@/components/layout/useNavCounts';
import { SlotAlertStack } from '@/components/dashboard';
import { LoadingState } from '@/components/ui';
import { MonitoringProvider } from '@/context/MonitoringContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLockBodyScroll, useMediaQuery } from '@/hooks';
import { storage } from '@/utils/storage';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

const TITLES = [
  [paths.newLearner, 'Add Learner'],
  [paths.learners, 'Learners'],
  [paths.slots, 'Slots'],
  [paths.newMonitoring, 'New Monitoring'],
  [paths.monitoring, 'Monitoring'],
  [paths.notifications, 'Notifications'],
  [paths.history, 'History'],
  [paths.profile, 'Profile'],
  [paths.settings, 'Settings'],
  [paths.help, 'Help Centre'],
  [paths.dashboard, 'Dashboard'],
];

function titleFor(pathname) {
  return TITLES.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1] || 'Dashboard';
}

function Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
  const counts = useNavCounts();
  const isXl = useMediaQuery('(min-width: 1280px)');
  const [collapsed, setCollapsed] = useState(() => storage.get('sidebarCollapsed', true));
  const [drawerOpen, setDrawerOpen] = useState(false);
  useLockBodyScroll(drawerOpen);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const toggleCollapse = () => {
    setCollapsed((v) => {
      storage.set('sidebarCollapsed', !v);
      return !v;
    });
  };

  const handleLogout = useCallback(async () => {
    await logout();
    toast.success('You have been signed out', { description: 'See you soon.' });
    navigate(paths.login, { replace: true });
  }, [logout, toast, navigate]);

  const railCollapsed = !isXl && collapsed;

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:shadow-float">
        Skip to content
      </a>

      {/* Desktop / tablet sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-line transition-[width] duration-300 md:block',
          railCollapsed ? 'w-20' : 'w-72',
        )}
      >
        <Sidebar collapsed={railCollapsed} onToggleCollapse={isXl ? undefined : toggleCollapse} counts={counts} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div className="absolute inset-0 bg-night/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute inset-y-0 left-0 w-[86%] max-w-xs border-r border-line shadow-float"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              onKeyDown={(e) => e.key === 'Escape' && setDrawerOpen(false)}
            >
              <Sidebar counts={counts} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className={cn('flex min-h-dvh flex-col transition-[padding] duration-300', railCollapsed ? 'md:pl-20' : 'md:pl-72')}>
        <Topbar title={titleFor(pathname)} onOpenMenu={() => setDrawerOpen(true)} unread={counts.unreadNotifications} onLogout={handleLogout} />
        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            {/* Enter-only page transition (exit animations would render the next route's outlet). */}
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Suspense fallback={<LoadingState fullPage />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </div>
        </main>
      </div>

      <MobileTabBar counts={counts} onMore={() => setDrawerOpen(true)} />
      <SlotAlertStack />
    </div>
  );
}

/** Authenticated app shell with live monitoring context. */
export default function DashboardLayout() {
  return (
    <MonitoringProvider>
      <Shell />
    </MonitoringProvider>
  );
}
