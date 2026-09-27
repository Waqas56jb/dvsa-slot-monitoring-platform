import { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BellRing, MapPin, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { SmartImage, LoadingState, MonitoringPulse } from '@/components/ui';
import { paths } from '@/routes/paths';

const points = [
  { icon: MapPin, text: 'Watch several test centres for every learner' },
  { icon: BellRing, text: 'Instant dashboard, browser and sound alerts' },
  { icon: ShieldCheck, text: 'You stay in control of every booking' },
];

/** Split-screen layout for sign-in / sign-up / password pages. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-night lg:block" aria-hidden="true">
        <SmartImage image="handsOnWheel" priority sizes="50vw" className="absolute inset-0" imgClassName="opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/20" />
        <div className="absolute inset-0 bg-grid opacity-[0.07] mask-radial" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo inverted />
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur"
            >
              <MonitoringPulse tone="success" />
              Monitoring active · 24 centres
            </motion.div>
            <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-[44px]">
              Find the right driving test slot before it disappears.
            </h2>
            <ul className="mt-8 space-y-3.5">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[15px] text-white/80">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-4 text-white" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">SlotPilot is an independent monitoring service and is not affiliated with the DVSA.</p>
        </div>
      </aside>

      <main id="main" className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-2 sm:px-8 lg:py-12">
          <div className="w-full max-w-[440px]">
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
        <footer className="px-5 pb-6 text-center text-xs text-subtle sm:px-8">
          © 2026 SlotPilot ·{' '}
          <Link to={paths.privacy} className="hover:text-ink">
            Privacy
          </Link>{' '}
          ·{' '}
          <Link to={paths.terms} className="hover:text-ink">
            Terms
          </Link>
        </footer>
      </main>
    </div>
  );
}
