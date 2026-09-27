import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Pause, Play, Square, Trash2, MapPin, Timer, Clock3, Search, Sparkles, CalendarRange } from 'lucide-react';
import { AvatarGroup, Button, Tooltip } from '@/components/ui';
import { SessionStatusBadge } from '@/components/dashboard/StatusBadges';
import { formatRelative, formatDateRange, formatTimeString } from '@/utils/format';
import { intervalLabel } from './monitoringUtils';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

const MAX_TAGS = 3;

function Meta({ icon: Icon, label, children }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium tabular-nums text-ink">{children}</dd>
    </div>
  );
}

/**
 * One monitoring session. `pending` is the action currently running for it
 * ('active' | 'paused' | 'stopped' | 'delete' | null).
 */
export function SessionCard({ session, now, pending, onSetStatus, onRequestStop, onRequestDelete, index = 0 }) {
  const { status } = session;
  const extra = session.centres.length - MAX_TAGS;
  const c = session.criteria;
  const busy = Boolean(pending);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex min-w-0 flex-col rounded-3xl border bg-surface p-5 shadow-soft sm:p-6',
        status === 'active' ? 'border-success/30' : 'border-line',
      )}
      aria-label={session.name}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink">{session.name}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {status === 'active' ? `Running since ${formatRelative(session.startedAt, now)}` : status === 'paused' ? 'Paused — preferences saved' : 'Stopped'}
          </p>
        </div>
        <SessionStatusBadge status={status} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        {session.learners.length ? (
          <>
            <AvatarGroup names={session.learners.map((l) => l.fullName)} max={4} size="sm" />
            <p className="min-w-0 truncate text-sm text-ink-soft">
              {session.learners.length === 1 ? (
                <Link to={paths.learner(session.learners[0].id)} className="font-medium text-ink hover:text-brand">
                  {session.learners[0].fullName}
                </Link>
              ) : (
                `${session.learners.length} learners`
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">No learners in this session</p>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Centres">
        {session.centres.slice(0, MAX_TAGS).map((ct) => (
          <li key={ct.id} className="inline-flex h-7 items-center gap-1 rounded-full bg-surface-muted px-2.5 text-xs font-medium text-ink-soft ring-1 ring-line">
            <MapPin className="size-3 text-subtle" aria-hidden="true" />
            {ct.name}
          </li>
        ))}
        {extra > 0 && (
          <li>
            <Tooltip content={session.centres.slice(MAX_TAGS).map((x) => x.name).join(', ')}>
              <span tabIndex={0} className="inline-flex h-7 items-center rounded-full bg-surface-sunken px-2.5 text-xs font-semibold text-muted">
                +{extra}
              </span>
            </Tooltip>
          </li>
        )}
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-surface-muted/70 p-4 sm:grid-cols-3">
        <Meta icon={Timer} label="Interval">
          {intervalLabel(session.interval)}
        </Meta>
        <Meta icon={Clock3} label="Last checked">
          {formatRelative(session.lastCheckedAt, now)}
        </Meta>
        <Meta icon={CalendarRange} label="Window">
          {c?.dateFrom || c?.dateTo ? formatDateRange(c.dateFrom, c.dateTo) : 'Learner defaults'}
        </Meta>
        <Meta icon={Search} label="Checks">
          {(session.checksCount || 0).toLocaleString('en-GB')}
        </Meta>
        <Meta icon={Sparkles} label="Matches">
          {session.matchesCount || 0}
        </Meta>
        <Meta icon={Clock3} label="Times">
          {c?.timeFrom && c?.timeTo ? `${formatTimeString(c.timeFrom)} – ${formatTimeString(c.timeTo)}` : 'Learner defaults'}
        </Meta>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {status === 'active' ? (
          <Button size="sm" variant="secondary" leftIcon={Pause} loading={pending === 'paused'} disabled={busy} onClick={() => onSetStatus(session, 'paused')}>
            Pause
          </Button>
        ) : (
          <Button size="sm" variant="secondary" leftIcon={Play} loading={pending === 'active'} disabled={busy || !session.learners.length} onClick={() => onSetStatus(session, 'active')}>
            {status === 'paused' ? 'Resume' : 'Start'}
          </Button>
        )}
        {status !== 'stopped' && (
          <Button size="sm" variant="ghost" leftIcon={Square} disabled={busy} onClick={() => onRequestStop(session)}>
            Stop
          </Button>
        )}
        <Button size="sm" variant="danger-ghost" leftIcon={Trash2} disabled={busy} onClick={() => onRequestDelete(session)} className="ml-auto">
          Delete
        </Button>
      </div>
    </motion.article>
  );
}
