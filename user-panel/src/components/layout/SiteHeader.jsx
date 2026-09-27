import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button, IconButton } from '@/components/ui';
import { marketingNav } from '@/config/navigation';
import { useScrolled, useLockBodyScroll } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

/** Sticky marketing header: blurred/transparent at top, solid on scroll. */
export function SiteHeader() {
  const scrolled = useScrolled(12);
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  useLockBodyScroll(open);

  useEffect(() => setOpen(false), [location.pathname]);

  const linkCls = ({ isActive }) =>
    cn('relative rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-ink' : 'text-muted hover:text-ink');

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300',
        scrolled || open
          ? 'border-b border-line bg-surface/95 shadow-[0_1px_0_rgb(15_23_42/0.02),0_8px_24px_-16px_rgb(15_23_42/0.18)] backdrop-blur-md'
          : 'border-b border-transparent bg-canvas/60 backdrop-blur-md',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkCls}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand lg:-bottom-[17px]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Button to={paths.dashboard} leftIcon={LayoutDashboard}>
              Open Dashboard
            </Button>
          ) : (
            <>
              <Button to={paths.login} variant="ghost">
                Login
              </Button>
              <Button to={paths.register} rightIcon={ArrowRight}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <IconButton
          icon={open ? X : Menu}
          label={open ? 'Close menu' : 'Open menu'}
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100dvh - 64px)' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-surface lg:hidden"
          >
            <nav aria-label="Mobile" className="container-page flex h-full flex-col py-6">
              <ul className="flex flex-col gap-1">
                {marketingNav.map((item, i) => (
                  <motion.li key={item.to} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn('flex min-h-12 items-center rounded-xl px-4 text-lg font-semibold', isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink hover:bg-surface-muted')
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto grid gap-2 pb-6">
                {isAuthenticated ? (
                  <Button to={paths.dashboard} size="lg" fullWidth leftIcon={LayoutDashboard}>
                    Open Dashboard
                  </Button>
                ) : (
                  <>
                    <Button to={paths.register} size="lg" fullWidth rightIcon={ArrowRight}>
                      Get Started
                    </Button>
                    <Button to={paths.login} size="lg" variant="secondary" fullWidth>
                      Login
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
