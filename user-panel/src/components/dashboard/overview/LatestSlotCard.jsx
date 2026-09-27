import { Link } from 'react-router-dom';
import { Check, Eye, SearchX, Sparkles, MapPin, CalendarDays, Clock3, UserRound } from 'lucide-react';
import { Button, Badge, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { OpenBookingButton, BookingControlNote } from '@/components/dashboard/OfficialBooking';
import { slotService } from '@/services';
import { useResource } from '@/hooks';
import { formatDate, formatWeekday, formatTimeString, formatRelative } from '@/utils/format';
import { paths } from '@/routes/paths';

function Field({ icon: Icon, label, children }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-ink">{children}</dd>
    </div>
  );
}

/** Highlights the newest unreviewed matching slot. */
export function LatestSlotCard() {
  const { data: slot, loading, error, reload } = useResource(() => slotService.latestNew(), [], { topics: ['slots'] });

  if (loading && !slot) {
    return (
      <div className="h-full rounded-3xl border border-line bg-surface p-6 shadow-soft" aria-busy="true">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-5 h-7 w-3/4" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
        <Skeleton className="mt-6 h-11 w-full rounded-xl" />
      </div>
    );
  }
  if (error && !slot) return <ErrorState className="h-full" title="Couldn’t load the latest match" error={error} onRetry={reload} />;
  if (!slot) {
    return (
      <EmptyState
        className="h-full"
        compact
        icon={SearchX}
        title="No matching slots found"
        description="We'll show matching availability here when detected."
        action={
          <Button variant="secondary" size="sm" to={paths.slots}>
            View all slots
          </Button>
        }
      />
    );
  }

  const chips = [
    ['Centre', slot.matched?.centre],
    ['Date', slot.matched?.date],
    ['Time', slot.matched?.time],
  ];

  return (
    <section
      aria-labelledby="latest-slot-title"
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-success/35 bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success via-success/70 to-brand" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-success-soft text-success-ink">
            <span className="absolute inset-0 animate-ping rounded-xl bg-success/15" aria-hidden="true" />
            <Sparkles className="relative size-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 id="latest-slot-title" className="text-base font-semibold text-ink">
              New matching slot detected
            </h2>
            <p className="text-xs text-muted">Detected {formatRelative(slot.detectedAt)}</p>
          </div>
        </div>
        <Badge tone="success" variant="outline">
          {slot.matchScore}% match
        </Badge>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl bg-surface-muted p-4">
        <Field icon={UserRound} label="Learner">
          {slot.learner ? (
            <Link to={paths.learner(slot.learner.id)} className="hover:text-brand">
              {slot.learner.fullName}
            </Link>
          ) : (
            'Removed learner'
          )}
        </Field>
        <Field icon={MapPin} label="Test Centre">
          {slot.centre?.name}
        </Field>
        <Field icon={CalendarDays} label="Date">
          {formatDate(slot.date)}
          <span className="block text-xs font-normal text-muted">{formatWeekday(slot.date).split(',')[0]}</span>
        </Field>
        <Field icon={Clock3} label="Time">
          {formatTimeString(slot.time)}
        </Field>
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Matched preferences">
        {chips.map(([label, ok]) => (
          <li key={label}>
            <Badge tone={ok ? 'success' : 'neutral'} icon={ok ? Check : undefined} size="sm">
              {label} {ok ? 'match' : 'differs'}
            </Badge>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <div className="grid gap-2">
          <OpenBookingButton slot={slot} fullWidth />
          <Button variant="secondary" leftIcon={Eye} to={paths.slot(slot.id)} fullWidth>
            View Details
          </Button>
        </div>
        <BookingControlNote compact className="mt-3" />
      </div>
    </section>
  );
}
