import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarRange, Clock3, MapPin } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { paths } from '@/routes/paths';
import { formatDateRange, formatTimeString, pluralise } from '@/utils/format';

const ease = [0.16, 1, 0.3, 1];

/** Radar-style pulse with a drawn check mark. */
function RadarCheck() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto flex size-40 items-center justify-center" aria-hidden="true">
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-success/40"
            initial={{ scale: 0.45, opacity: 0.8 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 2.4, delay: 0.6 + i * 0.8, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      <motion.span
        className="absolute inset-6 rounded-full bg-success-soft"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      />
      <motion.span
        className="relative flex size-20 items-center justify-center rounded-full bg-success text-white shadow-float"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
      >
        <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }} />
        </svg>
      </motion.span>
    </div>
  );
}

const item = (delay) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
});

export function CompletionCelebration({ learnerName, centreCount, dateFrom, dateTo, timeFrom, timeTo }) {
  const facts = [
    { icon: MapPin, text: pluralise(centreCount, 'centre') },
    { icon: CalendarRange, text: formatDateRange(dateFrom, dateTo) },
    { icon: Clock3, text: `${formatTimeString(timeFrom)} – ${formatTimeString(timeTo)}` },
  ];

  return (
    <div className="text-center" role="status" aria-live="polite">
      <RadarCheck />
      <motion.div {...item(0.5)} className="mt-6 flex justify-center">
        <Badge tone="success" dot pulse>
          Monitoring active
        </Badge>
      </motion.div>
      <motion.h1 {...item(0.6)} className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
        Monitoring is live for {learnerName}
      </motion.h1>
      <motion.p {...item(0.7)} className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        We&apos;ll alert you the moment a matching slot appears. You then book it yourself on the official GOV.UK service — SlotPilot never books on your behalf.
      </motion.p>

      <motion.ul {...item(0.8)} className="mx-auto mt-7 flex max-w-lg flex-wrap justify-center gap-2" aria-label="Monitoring summary">
        {facts.map(({ icon: Icon, text }) => (
          <li key={text} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft shadow-soft">
            <Icon className="size-4 text-brand" aria-hidden="true" />
            {text}
          </li>
        ))}
      </motion.ul>

      <motion.div {...item(0.9)} className="mt-9 flex flex-col items-center gap-3">
        <Button to={paths.dashboard} size="xl" rightIcon={ArrowRight} className="w-full sm:w-auto">
          Go to dashboard
        </Button>
        <p className="text-xs text-subtle">Monitoring in this preview is a frontend simulation.</p>
      </motion.div>
    </div>
  );
}
