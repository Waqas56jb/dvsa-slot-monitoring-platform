import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CalendarDays, MapPin, X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useMonitoring } from '@/context/MonitoringContext';
import { formatDate, formatTimeString, formatClock } from '@/utils/format';
import { paths } from '@/routes/paths';

const AUTO_DISMISS_MS = 20000;

function SlotAlert({ slot, onDismiss }) {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => onDismiss(slot.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [slot.id, onDismiss]);

  return (
    <motion.div
      layout
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-success/30 bg-surface shadow-float"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success via-emerald-400 to-brand" aria-hidden="true" />
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-success/50"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
        aria-hidden="true"
      />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success-ink">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-success/20" aria-hidden="true" />
            <BellRing className="relative size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink">New Slot Found</p>
              <Volume2 className="size-3.5 text-subtle" aria-label="Sound alert" />
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm font-medium text-ink-soft">
              <MapPin className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
              {slot.centre?.name} Test Centre
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
              {formatDate(slot.date)} · {formatTimeString(slot.time)}
            </p>
            {slot.learner && <p className="mt-1 text-xs text-subtle">For {slot.learner.fullName} · detected {formatClock(slot.detectedAt)}</p>}
          </div>
          <button type="button" onClick={() => onDismiss(slot.id)} className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle hover:bg-surface-muted hover:text-ink" aria-label="Dismiss alert">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3.5 flex gap-2">
          <Button
            size="sm"
            variant="success"
            fullWidth
            onClick={() => {
              onDismiss(slot.id);
              navigate(paths.slot(slot.id));
            }}
          >
            View
          </Button>
          <Button size="sm" variant="secondary" fullWidth onClick={() => onDismiss(slot.id)}>
            Dismiss
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/** Top-right real-time slot alerts, fed by MonitoringContext. */
export function SlotAlertStack() {
  const { alerts, dismissAlert } = useMonitoring();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[85] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[380px] sm:px-0">
      <AnimatePresence initial={false}>
        {alerts.map((slot) => (
          <SlotAlert key={slot.id} slot={slot} onDismiss={dismissAlert} />
        ))}
      </AnimatePresence>
    </div>
  );
}
