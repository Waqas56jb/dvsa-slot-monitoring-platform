import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, Check, ExternalLink, Fingerprint, Lock, MonitorSmartphone, SlidersHorizontal, Users } from 'lucide-react';
import { SmartImage } from '@/components/ui';
import { img } from '@/data/images';
import { heroDetections, testimonials } from '@/data/landing';
import { cn } from '@/utils/cn';
import { EASE, LandingHeading } from './shared';

function Tile({ className, children, delay = 0, dark = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      whileHover={{ y: -4 }}
      className={cn('group relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-7', dark ? 'border-white/10 bg-[#0b1220] text-white' : 'border-line bg-surface shadow-soft', className)}
    >
      {children}
    </motion.div>
  );
}

function TileTitle({ icon: Icon, title, body, dark }) {
  return (
    <div className="relative">
      <span className={cn('flex size-11 items-center justify-center rounded-2xl', dark ? 'bg-white/10 text-[#a9b9ff] ring-1 ring-white/10' : 'bg-brand-soft text-brand-ink')}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className={cn('mt-5 font-display text-xl font-bold tracking-tight', dark ? 'text-white' : 'text-ink')}>{title}</h3>
      <p className={cn('mt-2 text-[15px] leading-relaxed', dark ? 'text-white/60' : 'text-muted')}>{body}</p>
    </div>
  );
}

/** Cycling stack of alert notifications. */
function AlertStack() {
  const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN((v) => v + 1), 2400); return () => clearInterval(t); }, []);
  const visible = [0, 1, 2].map((k) => heroDetections[(n + k) % heroDetections.length]);
  return (
    <ul className="relative h-[200px]">
      <AnimatePresence initial={false}>
        {visible.map((d, k) => (
          <motion.li
            key={`${d.centre}-${n + k}`}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1 - k * 0.28, y: k * 64, scale: 1 - k * 0.04 }}
            exit={{ opacity: 0, y: 200, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            style={{ zIndex: 3 - k }}
            className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-2xl bg-white/90 p-3.5 text-night shadow-xl backdrop-blur-xl"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#3b5bfd] text-white"><BellRing className="size-4" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold">Slot found · {d.centre}</span>
              <span className="block truncate text-[12px] text-night/60">{d.date} at {d.time} · {d.learner}</span>
            </span>
            <span className="text-[11px] text-night/40">now</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function FeatureBento() {
  return (
    <section aria-labelledby="features-title" className="relative bg-canvas py-24 sm:py-32">
      <div className="container-page">
        <LandingHeading
          id="features-title"
          eyebrow="Features"
          title="Everything you need. Nothing you don’t."
          description="Thoughtfully designed tools that do one job brilliantly — getting the right slot in front of you, fast."
        />

        <div className="mt-16 grid auto-rows-auto gap-5 md:grid-cols-6 lg:gap-6">
          {/* Instant alerts — hero tile */}
          <Tile dark className="p-0 md:col-span-6 lg:col-span-4 lg:row-span-2 sm:p-0">
            <SmartImage image="handsOnWheel" width={1400} sizes="(min-width: 1024px) 66vw, 100vw" className="absolute inset-0" imgClassName="opacity-70 transition-transform duration-[1600ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/85 to-[#070b14]/30" aria-hidden="true" />
            <div className="relative grid h-full gap-8 p-6 sm:p-9 md:grid-cols-2 md:items-center">
              <div>
                <TileTitle dark icon={BellRing} title="Alerts in under two seconds" body="The moment a slot matches, you’re notified in the dashboard, by browser push, email or SMS — with a direct link to book on GOV.UK." />
                <ul className="mt-6 space-y-2.5 text-[14px] text-white/75">
                  {['Push, email & SMS', 'Sound alerts on desktop', 'Quiet hours you control'].map((p) => (
                    <li key={p} className="flex items-center gap-2"><Check className="size-4 text-emerald-300" aria-hidden="true" />{p}</li>
                  ))}
                </ul>
              </div>
              <AlertStack />
            </div>
          </Tile>

          {/* Smart filters */}
          <Tile className="md:col-span-3 lg:col-span-2" delay={0.1}>
            <TileTitle icon={SlidersHorizontal} title="Filters that think like you" body="Centres, date range, time windows, no-weekends and deadlines — per learner." />
            <div className="mt-6 flex flex-wrap gap-2">
              {['Wood Green', 'Before 12:00', 'Weekdays', 'Oct – Nov', 'Mill Hill'].map((c, i) => (
                <motion.span key={c} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300 }}
                  className={cn('rounded-full px-3 py-1.5 text-[13px] font-semibold', i % 2 ? 'bg-surface-muted text-ink-soft' : 'bg-brand text-white')}>
                  {c}
                </motion.span>
              ))}
            </div>
          </Tile>

          {/* Multi-learner */}
          <Tile className="md:col-span-3 lg:col-span-2" delay={0.15}>
            <TileTitle icon={Users} title="Every learner, one place" body="Separate preferences, status and history for each pupil you teach." />
            <div className="mt-6 flex items-center">
              <div className="flex -space-x-3">
                {testimonials.slice(0, 6).map((t) => <img key={t.name} src={img(t.image, 96, 70)} alt="" loading="lazy" className="size-11 rounded-full object-cover ring-4 ring-surface transition-transform duration-300 group-hover:translate-x-1" />)}
              </div>
              <span className="ml-3 rounded-full bg-surface-muted px-3 py-1 text-[13px] font-semibold text-ink-soft">+9</span>
            </div>
          </Tile>

          {/* Every device */}
          <Tile className="p-0 md:col-span-3 sm:p-0" delay={0.1}>
            <div className="grid h-full sm:grid-cols-[1.1fr_1fr]">
              <div className="p-6 sm:p-7">
                <TileTitle icon={MonitorSmartphone} title="Beautiful on every device" body="iPhone, Android, tablet or desktop — install it to your home screen and go." />
              </div>
              <SmartImage image="phoneApps" width={800} sizes="(min-width: 768px) 25vw, 100vw" className="min-h-[220px]" imgClassName="transition-transform duration-[1400ms] group-hover:scale-110" />
            </div>
          </Tile>

          {/* Privacy */}
          <Tile dark className="md:col-span-3" delay={0.15}>
            <div className="absolute -right-10 -top-10 size-48 rounded-full bg-[#34d399]/15 blur-3xl" aria-hidden="true" />
            <TileTitle dark icon={Lock} title="Private by design" body="Licence details are encrypted and masked. We never store DVSA credentials, never bypass security, and never book for you." />
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10">
              <Fingerprint className="size-5 text-emerald-300" aria-hidden="true" />
              <span className="font-mono text-[13px] tracking-widest text-white/80">ROBER••••••••7AB</span>
              <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">Encrypted</span>
            </div>
          </Tile>

          {/* Official booking */}
          <Tile className="md:col-span-6" delay={0.1}>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">You always book on the official service.</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">SlotPilot is a monitoring and alert tool. It isn’t affiliated with the DVSA, and every booking is completed by you on GOV.UK — exactly as it should be.</p>
              </div>
              <a href="https://www.gov.uk/book-driving-test" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-canvas transition-transform hover:-translate-y-0.5">
                gov.uk/book-driving-test <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
