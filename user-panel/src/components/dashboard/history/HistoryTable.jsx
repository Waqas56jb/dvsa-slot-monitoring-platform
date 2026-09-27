import { Link } from 'react-router-dom';
import { Sparkles, MapPin, UserRound } from 'lucide-react';
import { Badge, Table, toneClasses } from '@/components/ui';
import { activityIcons } from '@/components/dashboard/ActivityTimeline';
import { activityTypes } from '@/services';
import { formatDate, formatShortClock } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

function EventBadge({ type }) {
  const meta = activityTypes[type] || { label: type, tone: 'neutral' };
  const Icon = activityIcons[type] || Sparkles;
  const tone = toneClasses[meta.tone] || toneClasses.neutral;
  return (
    <span className="flex items-center gap-2.5">
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-xl', tone.soft)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <Badge tone={meta.tone} size="sm">
        {meta.label}
      </Badge>
    </span>
  );
}

function LearnerCell({ row }) {
  if (!row.learnerName) return <span className="text-subtle">—</span>;
  if (!row.learnerId) return <span className="text-muted">{row.learnerName}</span>;
  return (
    <Link to={paths.learner(row.learnerId)} className="font-medium text-ink hover:text-brand">
      {row.learnerName}
    </Link>
  );
}

function When({ iso }) {
  return (
    <time dateTime={iso} className="whitespace-nowrap tabular-nums">
      <span className="block text-ink">{formatDate(iso)}</span>
      <span className="block text-xs text-muted">{formatShortClock(iso)}</span>
    </time>
  );
}

function MobileRow({ row }) {
  return (
    <article className="rounded-3xl border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <EventBadge type={row.type} />
        <time dateTime={row.createdAt} className="shrink-0 text-right text-xs tabular-nums text-muted">
          {formatDate(row.createdAt)}
          <br />
          {formatShortClock(row.createdAt)}
        </time>
      </div>
      <p className="mt-3 text-sm text-ink-soft">{row.message}</p>
      {(row.learnerName || row.centreName) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
          {row.learnerName && (
            <span className="flex items-center gap-1.5">
              <UserRound className="size-3.5" aria-hidden="true" />
              <LearnerCell row={row} />
            </span>
          )}
          {row.centreName && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {row.centreName}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export function HistoryTable({ rows }) {
  const columns = [
    { key: 'event', header: 'Event', className: 'w-[200px] lg:w-[220px]', render: (r) => <EventBadge type={r.type} /> },
    { key: 'details', header: 'Details', render: (r) => <span className="text-ink-soft">{r.message}</span> },
    { key: 'learner', header: 'Learner', className: 'whitespace-nowrap', render: (r) => <LearnerCell row={r} /> },
    { key: 'centre', header: 'Centre', className: 'hidden whitespace-nowrap lg:table-cell', headerClassName: 'hidden lg:table-cell', render: (r) => r.centreName || <span className="text-subtle">—</span> },
    { key: 'when', header: 'Date / time', render: (r) => <When iso={r.createdAt} /> },
  ];
  return <Table caption="Activity history" columns={columns} rows={rows} mobile={(r) => <MobileRow row={r} />} />;
}
