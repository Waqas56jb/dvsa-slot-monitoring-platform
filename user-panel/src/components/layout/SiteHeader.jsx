import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowRight, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui';
import { marketingNav } from '@/config/navigation';
import { useScrolled, useLockBodyScroll } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import { img } from '@/data/images';
import { cn } from '@/utils/cn';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Marketing header.
 * - Over the dark home hero: transparent with light text.
 * - After scrolling: morphs into a floating glass pill.
 * - Mobile: full-screen sheet with staggered links.
 */
export function SiteHeader() {
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  useLockBodyScroll(open);
  useEffect(() => setOpen(false), [pathname]);

  const overHero = pathname === '/' && !scrolled && !open;
  const floating = scrolled && !open;

  return (
    <header className="sticky top-0 z-50 h-16 w-full lg:h-[76px]">
      <div className={cn('mx-auto transition-[max-width,padding] duration-500 ease-out', floating ? 'max-w-6xl px-3 pt-2.5 lg:pt-3' : 'max-w-full px-0 pt-0')}>
        <div
          className={cn(
            'flex items-center justify-between gap-6 transition-all duration-500 ease-out',
            floating
              ? 'h-[52px] rounded-full border border-line bg-surface/80 pl-5 pr-2 shadow-[0_12px_40px_-12px_rgb(15_23_42/0.25)] backdrop-blur-xl lg:h-14'
              : cn('container-page h-16 lg:h-[76px]', !overHero && !open && 'border-b border-line/0'),
            open && 'bg-[#070b14]',
          )}
        >
          <Logo inverted={overHero || open} />

          <nav aria-label="Main" className="hidden items-center lg:flex" onMouseLeave={() => setHovered(null)}>
            {marketingNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onMouseEnter={() => setHovered(item.to)}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-300',
                    overHero ? (isActive ? 'text-white' : 'text-white/65 hover:text-white') : isActive ? 'text-ink' : 'text-muted hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {hovered === item.to && (
                      <motion.span layoutId="nav-hover" transition={{ type: 'spring', stiffness: 400, damping: 34 }} className={cn('absolute inset-0 -z-10 rounded-full', overHero ? 'bg-white/10' : 'bg-surface-muted')} />
                    )}
                    {item.label}
                    {isActive && <span className={cn('absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full', overHero ? 'bg-white' : 'bg-brand')} />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <Button to={paths.dashboard} leftIcon={LayoutDashboard} className={cn(floating && 'rounded-full')}>Open Dashboard</Button>
            ) : (
              <>
                <Link
                  to={paths.login}
                  className={cn('inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors', overHero ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-ink-soft hover:bg-surface-muted hover:text-ink')}
                >
                  Log in
                </Link>
                <Button to={paths.register} rightIcon={ArrowRight} className="rounded-full shadow-[0_10px_30px_-10px_rgba(59,91,253,0.9)]">
                  Get started
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cn('relative flex size-11 items-center justify-center rounded-full transition-colors lg:hidden', overHero || open ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-surface-muted')}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-[#070b14] text-white lg:hidden"
          >
            <div className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-[#3b5bfd]/25 blur-[90px]" aria-hidden="true" />
            <nav aria-label="Mobile" className="container-page relative flex min-h-full flex-col pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-6">
              <ul className="flex flex-col">
                {marketingNav.map((item, i) => (
                  <motion.li key={item.to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }} className="border-b border-white/[0.07]">
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => cn('group flex min-h-[64px] items-center justify-between font-display text-[28px] font-bold tracking-tight', isActive ? 'text-white' : 'text-white/60')}
                    >
                      {item.label}
                      <ArrowUpRight className="size-5 text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6, ease: EASE }} className="relative mt-8 overflow-hidden rounded-3xl">
                <img src={img('towerBridgeDusk', 900, 70)} alt="" className="h-36 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/90 to-[#070b14]/20" aria-hidden="true" />
                <p className="absolute inset-y-0 left-5 flex max-w-[65%] items-center font-display text-lg font-bold leading-snug">Your next test slot could appear in the next minute.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-auto grid gap-2.5 pt-8">
                {isAuthenticated ? (
                  <Button to={paths.dashboard} size="lg" fullWidth leftIcon={LayoutDashboard}>Open Dashboard</Button>
                ) : (
                  <>
                    <Button to={paths.register} size="lg" fullWidth rightIcon={ArrowRight}>Start monitoring free</Button>
                    <Button to={paths.login} size="lg" variant="onDark" fullWidth>Log in</Button>
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
