import { motion } from 'framer-motion';
import { ArrowRight, CircleCheck, CirclePlay, ShieldCheck } from 'lucide-react';
import { Button, SmartImage } from '@/components/ui';
import { paths } from '@/routes/paths';
import { DashboardPreview } from './DashboardPreview';
import { RoutePattern } from './RoutePattern';
import { EASE } from './Reveal';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

const assurances = ['Set preferences once', 'Alerts in seconds', 'You confirm every booking'];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-14 sm:pt-20 lg:pb-32 lg:pt-24" aria-labelledby="hero-title">
      {/* Background: soft brand glow + route pattern */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_srgb,var(--sp-brand)_12%,transparent),transparent_70%)]" aria-hidden="true" />
      <RoutePattern className="h-[760px]" />

      <div className="container-page relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp(0)} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pl-1 pr-3 text-[13px] font-medium text-ink-soft shadow-soft backdrop-blur">
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-ink">New</span>
              Multi-learner monitoring for UK driving tests
            </span>
          </motion.div>

          <motion.h1
            id="hero-title"
            {...fadeUp(0.06)}
            className="mt-6 text-balance text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl lg:text-7xl"
          >
            Find Your Driving Test Slot{' '}
            <span className="relative whitespace-nowrap bg-gradient-to-r from-brand to-[#6f5bff] bg-clip-text text-transparent">Faster.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.12)} className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
            Monitor your preferred UK test centres, detect suitable availability and get alerted instantly when the right slot appears.
          </motion.p>

          <motion.div {...fadeUp(0.18)} className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button to={paths.register} size="xl" rightIcon={ArrowRight} className="shadow-brand">
              Start Monitoring
            </Button>
            <Button to={paths.howItWorks} size="xl" variant="secondary" leftIcon={CirclePlay}>
              See How It Works
            </Button>
          </motion.div>

          <motion.ul {...fadeUp(0.24)} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            {assurances.map((a) => (
              <li key={a} className="inline-flex items-center gap-1.5">
                <CircleCheck className="size-4 text-success" aria-hidden="true" />
                {a}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Product composition: photo panel with the live dashboard preview on top */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          className="relative mx-auto mt-14 max-w-6xl sm:mt-20"
        >
          <div className="absolute -inset-x-4 -top-6 bottom-10 rounded-[2.25rem] bg-gradient-to-b from-brand/10 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative rounded-[2rem] border border-line bg-surface/60 p-2 shadow-card sm:p-3">
            <div className="absolute inset-2 sm:inset-3">
              <SmartImage
                image="driverWithNavigation"
                priority
                sizes="(min-width: 1280px) 1152px, 100vw"
                className="size-full rounded-[1.6rem]"
                imgClassName="object-[center_60%]"
                overlay={
                  <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/55 to-night/80" aria-hidden="true" />
                }
              />
            </div>
            <div className="relative px-2 pb-24 pt-10 sm:px-8 sm:pb-12 sm:pt-12 lg:px-14 lg:pt-16">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 px-1 text-white/85">
                <p className="inline-flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <ShieldCheck className="size-4" aria-hidden="true" /> Monitoring only — the official booking stays with you
                </p>
                <p className="hidden text-xs text-white/60 sm:block">Sample data shown</p>
              </div>
              <DashboardPreview />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
