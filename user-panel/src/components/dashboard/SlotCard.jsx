import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CalendarDays, Clock3, Check, X, Eye, UserRound } from 'lucide-react';
import { Button, Avatar } from '@/components/ui';
import { SlotStatusBadge } from './StatusBadges';
import { OpenBookingButton } from './OfficialBooking';
import { formatDate, formatTimeString, formatRelative, formatWeekday, toDate } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

function MatchChip({ ok, label }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', ok ? 'text-success-ink' : 'text-subtle line-through')}>
      <Check className={cn('size-3.5', !ok && 'opacity-0')} strokeWidth={3} aria-hidden="true" />
      {label}
      <span className="sr-only">{ok ? 'matched' : 'not matched'}</span>
    </span>
  );
}

/**
 * Detected slot card.
 * Actions: View · Open Booking · Dismiss (callbacks supplied by the page).
 */
export function SlotCard({ slot, onDismiss, onView, onActioned, index = 0, className }) {
  const isNew = slot.status === 'new';
  const closed = slot.status === 'expired' || slot.status === 'dismissed';
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border bg-surface p-5 shadow-soft transition-shadow hover:shadow-card',
        isNew ? 'border-success/35' : 'border-line',
        className,
      )}
      aria-label={`Slot at ${slot.centre?.name} on ${formatDate(slot.date)} at ${formatTimeString(slot.time)}`}
    >
      {isNew && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success via-emerald-400 to-brand" aria-hidden="true" />}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-muted">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate text-sm">{slot.centre?.area || 'Test centre'}</span>
          </div>
          <h3 className="mt-1 truncate text-lg font-semibold text-ink">{slot.centre?.name} Test Centre</h3>
        </div>
        <SlotStatusBadge status={slot.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-muted px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <CalendarDays className="size-3.5" aria-hidden="true" /> Date
          </p>
          <p className="mt-1 font-semibold text-ink">{formatDate(slot.date)}</p>
          <p className="text-xs text-muted">{formatWeekday(slot.date).split(',')[0]}</p>
        </div>
        <div className="rounded-2xl bg-surface-muted px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <Clock3 className="size-3.5" aria-hidden="true" /> Time
          </p>
          <p className="mt-1 font-semibold text-ink">{formatTimeString(slot.time)}</p>
          <p className="text-xs text-muted">{slot.matchScore}% match</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {slot.learner ? <Avatar name={slot.learner.fullName} size="xs" /> : <UserRound className="size-4 text-muted" />}
          <p className="truncate text-sm text-ink-soft">
            For <span className="font-medium text-ink">{slot.learner?.fullName || 'Removed learner'}</span>
          </p>
        </div>
        <p className="shrink-0 text-xs text-subtle">{formatRelative(slot.detectedAt)}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3">
        <span className="text-xs text-muted">Matched:</span>
        <MatchChip ok={slot.matched?.centre} label="Centre" />
        <MatchChip ok={slot.matched?.date} label="Date" />
        <MatchChip ok={slot.matched?.time} label="Time" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={Eye}
          to={onView ? undefined : paths.slot(slot.id)}
          onClick={onView ? () => onView(slot) : undefined}
          className="flex-1 sm:flex-none"
        >
          View
        </Button>
        {!closed && <OpenBookingButton slot={slot} label="Open Booking" size="sm" className="flex-1 sm:flex-none" onActioned={onActioned} />}
        {onDismiss && slot.status !== 'dismissed' && (
          <Button variant="ghost" size="sm" leftIcon={X} onClick={() => onDismiss(slot)} className="sm:ml-auto" aria-label={`Dismiss slot at ${slot.centre?.name}`}>
            Dismiss
          </Button>
        )}
      </div>
    </motion.article>
  );
}

/** Compact row for lists (dashboard, learner details). */
export function SlotRow({ slot }) {
  return (
    <Link
      to={paths.slot(slot.id)}
      className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-muted"
    >
      <span className={cn('flex size-10 shrink-0 flex-col items-center justify-center rounded-xl text-center leading-none', slot.status === 'new' ? 'bg-success-soft text-success-ink' : 'bg-surface-muted text-ink-soft')}>
        <span className="text-[10px] font-semibold uppercase">{toDate(slot.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
        <span className="text-sm font-bold">{toDate(slot.date).getDate()}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{slot.centre?.name}</span>
        <span className="block truncate text-xs text-muted">
          {formatTimeString(slot.time)} · {slot.learner?.fullName}
        </span>
      </span>
      <SlotStatusBadge status={slot.status} size="sm" />
    </Link>
  );
}
