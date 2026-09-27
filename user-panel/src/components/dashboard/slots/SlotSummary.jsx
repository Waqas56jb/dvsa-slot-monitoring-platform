import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, UserRound, Radar, ScanSearch, ChevronRight } from 'lucide-react';
import { Card, Avatar, Skeleton } from '@/components/ui';
import { SessionStatusBadge } from '@/components/dashboard/StatusBadges';
import { formatLongDate, formatTimeString, formatDateTime, formatRelative, toDate } from '@/utils/format';
import { paths } from '@/routes/paths';

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-4">
      <Icon className="mt-0.5 size-[18px] shrink-0 text-subtle" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-ink">{children}</dd>
      </div>
    </div>
  );
}

/** Key facts about a detected slot. */
export function SlotSummary({ slot }) {
  const d = toDate(slot.date);
  return (
    <Card as="section" aria-labelledby="slot-summary-title" padded={false} className="overflow-hidden">
      <div className="flex flex-col gap-5 border-b border-line bg-surface-muted/60 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-surface text-center shadow-soft ring-1 ring-line">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
          <span className="font-display text-3xl font-bold leading-none text-ink">{d.getDate()}</span>
          <span className="mt-0.5 text-[11px] text-muted">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
        </div>
        <div className="min-w-0">
          <h2 id="slot-summary-title" className="text-xl font-semibold text-ink sm:text-2xl">
            {formatLongDate(slot.date)}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-lg font-medium text-ink-soft">
            <Clock3 className="size-[18px] text-subtle" aria-hidden="true" />
            {formatTimeString(slot.time)}
          </p>
        </div>
      </div>

      <dl className="grid px-5 sm:grid-cols-2 sm:gap-x-8 sm:px-6 [&>div]:border-b [&>div]:border-line/70 [&>div:last-child]:border-b-0 sm:[&>div:nth-last-child(2)]:border-b-0">
        <Fact icon={UserRound} label="Learner">
          {slot.learner ? (
            <Link to={paths.learner(slot.learner.id)} className="inline-flex items-center gap-2 hover:text-brand">
              <Avatar name={slot.learner.fullName} size="xs" />
              {slot.learner.fullName}
            </Link>
          ) : (
            <span className="text-muted">Learner removed</span>
          )}
        </Fact>
        <Fact icon={MapPin} label="Test centre">
          {slot.centre?.name || 'Unknown centre'}
          {slot.centre && (
            <span className="block text-xs font-normal text-muted">
              {slot.centre.area} · {slot.centre.postcode}
            </span>
          )}
        </Fact>
        <Fact icon={CalendarDays} label="Date">
          {formatLongDate(slot.date)}
        </Fact>
        <Fact icon={Clock3} label="Time">
          {formatTimeString(slot.time)}
        </Fact>
        <Fact icon={ScanSearch} label="Detected at">
          {formatDateTime(slot.detectedAt)}
          <span className="block text-xs font-normal text-muted">{formatRelative(slot.detectedAt)}</span>
        </Fact>
        <Fact icon={Radar} label="Monitoring session">
          {slot.session ? (
            <Link to={paths.monitoring} className="group inline-flex max-w-full items-center gap-2 hover:text-brand">
              <span className="truncate">{slot.session.name}</span>
              <SessionStatusBadge status={slot.session.status} size="sm" />
              <ChevronRight className="size-3.5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="text-muted">Session no longer exists</span>
          )}
        </Fact>
      </dl>
    </Card>
  );
}

export function SlotDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading slot">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-8 w-72 max-w-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
        <Skeleton className="h-72 rounded-3xl lg:col-span-5" />
      </div>
    </div>
  );
}
