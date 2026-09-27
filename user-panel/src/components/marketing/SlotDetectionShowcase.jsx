import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Check, Clock, Eye, MapPin, RotateCcw, Sparkles } from 'lucide-react';
import { Button, Tooltip } from '@/components/ui';
import { paths } from '@/routes/paths';
import { EASE, Reveal } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

const checks = ['Centre is in the learner’s list', 'Inside the preferred date range', 'Within the morning time window'];

function MatchRing({ value = 96 }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-14 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 56 56" className="size-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--sp-surface-sunken)" strokeWidth="5" />
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--sp-success)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[13px] font-bold text-ink">{value}%</span>
    </div>
  );
}

function DetectedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.15 }}
      className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-5 shadow-float sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          New slot detected
        </span>
        <span className="text-xs tabular-nums text-subtle">Just now</span>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-subtle">Centre</p>
          <p className="mt-0.5 flex items-start gap-1.5 font-display text-lg font-bold leading-snug text-ink">
            <MapPin className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span>London Example Centre</span>
          </p>
        </div>
        <MatchRing />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['Date', '18 October 2026', CalendarDays],
          ['Time', '10:24 AM', Clock],
          ['Match', '96%', Sparkles],
        ].map(([k, v, Icon]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface-muted/60 px-3 py-2.5">
            <dt className="flex items-center gap-1 text-[11px] font-medium text-subtle">
              <Icon className="size-3" aria-hidden="true" /> {k}
            </dt>
            <dd className="mt-0.5 text-[13px] font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 space-y-1.5">
        {checks.map((c, i) => (
          <motion.li
            key={c}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.6 + i * 0.12 }}
            className="flex items-center gap-2 text-[13px] text-ink-soft"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-success-soft text-success-ink">
              <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
            </span>
            {c}
          </motion.li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button to={paths.register} variant="secondary" leftIcon={Eye}>
          View Slot
        </Button>
        <Tooltip content="In the app this opens the official booking service — you complete it yourself." className="flex">
          <Button to={`${paths.howItWorks}#control`} rightIcon={ArrowUpRight} fullWidth>
            Open Booking
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
}

export function SlotDetectionShowcase({ tone = 'surface' }) {
  const [replay, setReplay] = useState(0);
  return (
    <Section id="slot-detection" tone={tone}>
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 flex min-w-0 justify-center lg:order-1">
          {/* Radar rings behind the card */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 size-[420px] rounded-full border border-brand/10"
                style={{ transform: `translate(-50%, -50%) scale(${0.6 + i * 0.25})` }}
              />
            ))}
          </div>
          <div className="relative flex w-full flex-col items-center">
            <DetectedCard key={replay} />
            <button
              type="button"
              onClick={() => setReplay((r) => r + 1)}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <RotateCcw className="size-4" aria-hidden="true" /> Replay detection
            </button>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Slot detection"
            title="Know the moment a suitable slot appears."
            description="Every result is checked against the learner’s centres, dates and time window. Only genuine matches reach you — each with a clear match score and everything you need to decide quickly."
          />
          <Reveal delay={0.1} className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Matched to preferences', 'No noise — alerts only for slots that fit.'],
              ['One-tap next step', 'Open the official booking service straight from the alert.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-sm font-semibold text-ink">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
