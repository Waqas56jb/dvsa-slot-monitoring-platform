import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppWindow, BellRing, CalendarDays, Clock, LayoutDashboard, MapPin, Settings2, Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui';
import { cn } from '@/utils/cn';
import { EASE, Reveal } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

const methods = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard alert', description: 'A highlighted card in your SlotPilot dashboard.' },
  { key: 'browser', icon: AppWindow, label: 'Browser notification', description: 'A system notification, even in another tab.' },
  { key: 'sound', icon: Volume2, label: 'Sound alert', description: 'A short beep so you notice straight away.' },
];

function SoundBars({ active }) {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0.5, 1, 0.7, 0.9, 0.4].map((h, i) => (
        <motion.span
          key={i}
          className={cn('w-[3px] rounded-full', active ? 'bg-brand' : 'bg-line-strong')}
          style={{ height: `${h * 100}%` }}
          animate={active ? { scaleY: [0.4, 1, 0.55, 0.9, 0.4] } : { scaleY: 0.35 }}
          transition={active ? { duration: 1.1, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' } : { duration: 0.2 }}
        />
      ))}
    </span>
  );
}

function AlertPreview({ prefs }) {
  const none = !prefs.dashboard && !prefs.browser && !prefs.sound;
  return (
    <div className="relative mx-auto w-full max-w-md space-y-4" aria-live="polite">
      <AnimatePresence initial={false}>
        {prefs.browser && (
          <motion.div
            key="browser"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-2xl border border-line bg-surface/95 p-4 shadow-float backdrop-blur"
          >
            <div className="flex items-center gap-2 text-[11px] text-subtle">
              <AppWindow className="size-3.5" aria-hidden="true" /> Browser notification · SlotPilot
              <span className="ml-auto tabular-nums">10:24</span>
            </div>
            <div className="mt-2.5 flex items-start gap-3">
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
                <BellRing className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Slot Found</p>
                <p className="text-[13px] text-muted">Your preferred test slot has been detected.</p>
              </div>
              {prefs.sound && <SoundBars active />}
            </div>
          </motion.div>
        )}

        {prefs.dashboard && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card"
          >
            <div className="flex items-center gap-2 border-b border-line bg-success-soft/60 px-5 py-3">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              <p className="text-sm font-semibold text-success-ink">Slot Found</p>
              <span className="ml-auto text-xs tabular-nums text-success-ink/80">Detected 10:24:08</span>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted">Your preferred test slot has been detected.</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                {[
                  ['Centre', 'Croydon', MapPin],
                  ['Date', '18 Oct 2026', CalendarDays],
                  ['Time', '10:24 AM', Clock],
                ].map(([k, v, Icon]) => (
                  <div key={k} className="flex items-center gap-2 sm:block">
                    <dt className="flex items-center gap-1 text-xs text-subtle">
                      <Icon className="size-3.5" aria-hidden="true" /> {k}
                    </dt>
                    <dd className="font-semibold text-ink sm:mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-2.5 text-xs text-muted">
                {prefs.sound ? <Volume2 className="size-4 text-brand" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
                {prefs.sound ? 'Sound alert played' : 'Sound alert off'}
                <span className="ml-auto">
                  <SoundBars active={prefs.sound} />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {none && (
        <p className="rounded-3xl border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
          All alert methods are off. Turn one on to see how an alert looks.
        </p>
      )}
    </div>
  );
}

export function AlertsShowcase({ tone = 'canvas' }) {
  const [prefs, setPrefs] = useState({ dashboard: true, browser: true, sound: true });

  return (
    <Section id="alerts" tone={tone}>
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Instant alerts"
            title="Get alerted the way that works for you."
            description="When a match is found, SlotPilot tells you straight away — on screen, in your browser and with a sound, if you want one."
          />
          <Reveal delay={0.1} className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface px-5 shadow-soft">
            {methods.map((m) => (
              <Switch
                key={m.key}
                className="py-4"
                icon={m.icon}
                label={m.label}
                description={m.description}
                checked={prefs[m.key]}
                onChange={(v) => setPrefs((p) => ({ ...p, [m.key]: v }))}
              />
            ))}
          </Reveal>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Settings2 className="size-4 shrink-0" aria-hidden="true" />
            Alert preferences are fully configurable in Settings. Try the toggles above.
          </p>
        </div>

        <Reveal delay={0.15} className="relative min-w-0">
          <div className="pointer-events-none absolute inset-0 -m-6 rounded-[2.5rem] bg-dots mask-radial opacity-70" aria-hidden="true" />
          <div className="relative">
            <AlertPreview prefs={prefs} />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
