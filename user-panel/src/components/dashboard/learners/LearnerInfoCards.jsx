import { UserRound, CalendarRange, MapPin, BellRing, Monitor, Volume2, Mail, Check, X, Pencil } from 'lucide-react';
import { Button, Card, CardHeader } from '@/components/ui';
import { formatDate, formatLongDate, formatDateRange, formatTimeString } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

/** Label / value rows used across the details cards. */
export function DetailList({ items }) {
  return (
    <dl className="divide-y divide-line">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <dt className="shrink-0 text-sm text-muted">{it.label}</dt>
          <dd className="min-w-0 break-words text-sm font-medium text-ink sm:text-right">{it.value || <span className="font-normal text-subtle">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProfileCard({ learner }) {
  return (
    <Card as="section" aria-labelledby="card-profile">
      <CardHeader icon={UserRound} title={<span id="card-profile">Profile</span>} />
      <DetailList
        items={[
          { label: 'Email', value: <a href={`mailto:${learner.email}`} className="text-brand hover:underline">{learner.email}</a> },
          { label: 'Phone', value: learner.phone ? <a href={`tel:${learner.phone.replace(/\s/g, '')}`} className="hover:text-brand">{learner.phone}</a> : null },
          { label: 'Added', value: formatLongDate(learner.createdAt) },
          { label: 'Reference', value: <span className="font-normal text-muted">{learner.referenceNote}</span> },
          ...(learner.notes ? [{ label: 'Notes', value: <span className="font-normal text-ink-soft">{learner.notes}</span> }] : []),
        ]}
      />
    </Card>
  );
}

export function PreferencesCard({ learner }) {
  return (
    <Card as="section" aria-labelledby="card-prefs">
      <CardHeader
        icon={CalendarRange}
        title={<span id="card-prefs">Test preferences</span>}
        action={
          <Button variant="ghost" size="sm" leftIcon={Pencil} to={paths.editLearner(learner.id)} aria-label="Edit test preferences">
            Edit
          </Button>
        }
      />
      <DetailList
        items={[
          { label: 'Preferred date', value: formatDate(learner.preferredDate) },
          { label: 'Date range', value: formatDateRange(learner.dateFrom, learner.dateTo) },
          { label: 'Time window', value: learner.timeFrom ? `${formatTimeString(learner.timeFrom)} – ${formatTimeString(learner.timeTo)}` : null },
          { label: 'Weekends', value: learner.excludeWeekends ? 'Excluded' : 'Included' },
        ]}
      />
    </Card>
  );
}

export function CentresCard({ learner }) {
  return (
    <Card as="section" aria-labelledby="card-centres">
      <CardHeader
        icon={MapPin}
        title={<span id="card-centres">Selected centres</span>}
        description={`${learner.centres.length} ${learner.centres.length === 1 ? 'centre' : 'centres'} being watched`}
      />
      {learner.centres.length ? (
        <ul className="flex flex-wrap gap-2">
          {learner.centres.map((c) => (
            <li key={c.id} className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface-muted/60 py-2 pl-2.5 pr-3.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-surface text-brand ring-1 ring-line">
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-ink">{c.name}</span>
                <span className="block text-xs text-muted">
                  {c.area} · {c.postcode}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No centres selected yet. Edit this learner to choose where to watch.</p>
      )}
    </Card>
  );
}

const CHANNELS = [
  { key: 'browser', label: 'Browser alerts', icon: Monitor },
  { key: 'sound', label: 'Sound alerts', icon: Volume2 },
  { key: 'email', label: 'Email alerts', icon: Mail },
];

export function NotificationsCard({ learner }) {
  const n = learner.notifications || {};
  return (
    <Card as="section" aria-labelledby="card-notify">
      <CardHeader icon={BellRing} title={<span id="card-notify">Notifications</span>} description="Alert channels for this learner." />
      <ul className="grid gap-2 sm:grid-cols-3">
        {CHANNELS.map((c) => {
          const on = Boolean(n[c.key]);
          return (
            <li key={c.key} className={cn('flex items-center gap-3 rounded-2xl border px-3.5 py-3', on ? 'border-success/30 bg-success-soft/40' : 'border-line bg-surface-muted/50')}>
              <c.icon className={cn('size-4 shrink-0', on ? 'text-success-ink' : 'text-subtle')} aria-hidden="true" />
              <span className="min-w-0 flex-1 text-sm font-medium text-ink">{c.label}</span>
              {on ? <Check className="size-4 text-success-ink" aria-label="On" /> : <X className="size-4 text-subtle" aria-label="Off" />}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
