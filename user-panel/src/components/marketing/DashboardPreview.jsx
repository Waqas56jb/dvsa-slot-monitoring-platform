import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BellRing, CalendarDays, Clock, LayoutDashboard, MapPin, Radar, Settings2, Sparkles, Users, Volume2 } from 'lucide-react';
import { Avatar, MonitoringPulse, Tooltip } from '@/components/ui';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { MockWindow } from './MockWindow';
import { EASE } from './Reveal';

const rows = [
  { name: 'Hammersmith', area: 'W6', checked: 4, state: 'scanning' },
  { name: 'Hendon', area: 'NW4', checked: 9, state: 'match' },
  { name: 'Southall', area: 'UB2', checked: 12, state: 'idle' },
  { name: 'Isleworth', area: 'TW7', checked: 18, state: 'idle' },
  { name: 'Barking', area: 'IG11', checked: 23, state: 'idle' },
];

const alerts = [
  { centre: 'Hendon', date: 'Thu 16 Oct 2026', time: '08:40', learner: 'Ahmed Khan' },
  { centre: 'Mill Hill', date: 'Mon 20 Oct 2026', time: '13:10', learner: 'James Wilson' },
  { centre: 'Sutton', date: 'Fri 24 Oct 2026', time: '10:24', learner: 'Sara Ali' },
];

/** Seconds counter so "checked Xs ago" labels feel live. */
function useTicker(ms = 1000) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      <p className="truncate text-[10px] font-medium uppercase tracking-wider text-subtle">{label}</p>
      <p className={cn('mt-0.5 font-display text-lg font-bold tabular-nums', tone || 'text-ink')}>{value}</p>
    </div>
  );
}

function CentreRow({ row, tick, className }) {
  const secs = (row.checked + tick) % 30;
  return (
    <li className={cn('flex items-center gap-3 px-3.5 py-2.5', className)}>
      <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', row.state === 'match' ? 'bg-success-soft text-success-ink' : 'bg-surface-muted text-muted')}>
        <MapPin className="size-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{row.name}</p>
        <p className="truncate text-[11px] text-subtle">London · {row.area}</p>
      </div>
      {row.state === 'match' ? (
        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success-ink">1 match</span>
      ) : row.state === 'scanning' ? (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-ink">
          <MonitoringPulse size="sm" tone="brand" /> Scanning
        </span>
      ) : (
        <span className="text-[11px] tabular-nums text-subtle">{secs}s ago</span>
      )}
    </li>
  );
}

/** Rich, realistic product preview for the hero. Sample data only. */
export function DashboardPreview({ className }) {
  const tick = useTicker();
  const [alertIndex, setAlertIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const first = setTimeout(() => setShowAlert(true), 1400);
    const cycle = setInterval(() => setAlertIndex((i) => (i + 1) % alerts.length), 6500);
    return () => {
      clearTimeout(first);
      clearInterval(cycle);
    };
  }, []);

  const alert = alerts[alertIndex];

  return (
    <figure className={cn('relative', className)}>
      <figcaption className="sr-only">
        Preview of the SlotPilot dashboard with sample data: monitored London test centres, a newly detected slot and an alert notification.
      </figcaption>
      <MockWindow title="app.slotpilot.co.uk/dashboard" bodyClassName="flex text-left">
        {/* Mini sidebar */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface-muted/50 py-4 md:flex" aria-hidden="true">
          <span className="mb-2 flex size-8 items-center justify-center rounded-lg bg-brand text-white shadow-brand">
            <Radar className="size-4" />
          </span>
          {[LayoutDashboard, Users, CalendarDays, BellRing, Settings2].map((Icon, i) => (
            <span key={i} className={cn('flex size-9 items-center justify-center rounded-lg', i === 0 ? 'bg-surface text-brand ring-1 ring-line' : 'text-subtle')}>
              <Icon className="size-4" />
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 bg-canvas/60 p-3.5 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-subtle">Wednesday 30 September</p>
              <p className="font-display text-[15px] font-bold text-ink sm:text-base">Monitoring overview</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success-ink">
              <MonitoringPulse size="sm" /> Monitoring Active
            </span>
          </div>

          {/* Scan progress */}
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand/0 via-brand to-brand/0"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Learners" value="3" />
            <Stat label="Centres" value="6" />
            <Stat label="Checks today" value={(1284 + Math.floor(tick / 3)).toLocaleString('en-GB')} />
            <Stat label="Matches" value="2" tone="text-success-ink" />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-3">
              <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
                <p className="text-[12px] font-semibold text-ink">Test centres</p>
                <p className="text-[11px] text-subtle">Checked every 30s</p>
              </div>
              <ul className="divide-y divide-line">
                {rows.map((r, i) => (
                  <CentreRow key={r.name} row={r} tick={tick} className={cn(i > 2 && 'hidden sm:flex')} />
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-2">
              <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-surface p-3.5 shadow-[0_0_0_4px_color-mix(in_srgb,var(--sp-brand)_8%,transparent)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-ink">
                    <Sparkles className="size-3.5" aria-hidden="true" /> New slot detected
                  </span>
                  <span className="text-[10px] tabular-nums text-subtle">09:41</span>
                </div>
                <p className="mt-2 font-display text-base font-bold text-ink">Hendon</p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Thu 16 Oct 2026
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    08:40
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Avatar name="Ahmed Khan" size="xs" />
                  <span className="truncate text-[12px] text-ink-soft">Ahmed Khan</span>
                  <span className="ml-auto shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success-ink">94% match</span>
                </div>
                <Tooltip content="Create an account to act on real alerts" className="mt-3 flex w-full">
                  <Link
                    to={paths.register}
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover"
                  >
                    Open Booking <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Tooltip>
              </div>
              <div className="hidden rounded-2xl border border-line bg-surface p-3.5 sm:block">
                <p className="text-[12px] font-semibold text-ink">Recent activity</p>
                <ul className="mt-2 space-y-2 text-[11px]">
                  {[
                    ['bg-success', 'Match found · Hendon', '09:41'],
                    ['bg-brand', 'Scan completed · 6 centres', '09:40'],
                    ['bg-subtle', 'Monitoring resumed', '09:12'],
                  ].map(([dot, text, time]) => (
                    <li key={text} className="flex items-center gap-2">
                      <span className={cn('size-1.5 shrink-0 rounded-full', dot)} aria-hidden="true" />
                      <span className="truncate text-ink-soft">{text}</span>
                      <span className="ml-auto tabular-nums text-subtle">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MockWindow>

      {/* Floating alert notification (decorative, cycles through sample alerts) */}
      <div className="pointer-events-none absolute inset-x-3 -bottom-[4.5rem] sm:-bottom-9 sm:left-auto sm:right-8 sm:w-80 xl:-right-8" aria-hidden="true">
        <AnimatePresence mode="wait">
          {showAlert && (
            <motion.div
              key={alertIndex}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface/95 p-3.5 text-left shadow-float backdrop-blur"
            >
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
                <BellRing className="size-4" />
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-ink">Slot Found</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-subtle">
                    <Volume2 className="size-3" /> just now
                  </span>
                </div>
                <p className="truncate text-[12px] text-muted">
                  {alert.centre} · {alert.date} · {alert.time}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-subtle">For {alert.learner}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </figure>
  );
}
