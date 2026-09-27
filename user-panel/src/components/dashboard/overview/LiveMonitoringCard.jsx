import { Pause, Play, Settings2, Clock3, Users, MapPin } from 'lucide-react';
import { Button, Badge, MonitoringPulse, StatusIndicator } from '@/components/ui';
import { LiveEventFeed } from '@/components/dashboard/LiveEventFeed';
import { RadarScanner, useScanFocus } from '@/components/dashboard/monitoring/RadarScanner';
import { monitoringScope, STATUS_COPY } from '@/components/dashboard/monitoring/monitoringUtils';
import { useMonitoring } from '@/context/MonitoringContext';
import { useNow } from '@/hooks';
import { formatRelative, pluralise } from '@/utils/format';
import { paths } from '@/routes/paths';

/** Dashboard hero: live monitoring status, radar and the latest events. */
export function LiveMonitoringCard() {
  const { overview, status, isActive, events, busy, start, pause } = useMonitoring();
  const now = useNow(1000);
  const scope = monitoringScope(overview);
  const focus = useScanFocus(events, scope.centres);
  const copy = STATUS_COPY[status] || STATUS_COPY.stopped;
  const hasSessions = (overview?.sessions?.length || 0) > 0;

  return (
    <section aria-labelledby="live-monitoring-title" className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft sm:flex-row">
      {/* Radar panel */}
      <div className="relative flex items-center justify-center overflow-hidden bg-night px-6 pb-9 pt-6 sm:order-last sm:w-[36%] sm:max-w-[260px] sm:shrink-0">
        <div className="bg-grid absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <RadarScanner centres={scope.centres} active={isActive} focusId={focus.centreId} focusKind={focus.kind} className="max-w-[170px] sm:max-w-[210px]" />
        <span className="absolute bottom-3 left-0 right-0 text-center text-[11px] font-medium text-white/45">Simulated in this demo</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Live Monitoring</p>
          <Badge tone={copy.tone} dot pulse={isActive}>
            {copy.label}
          </Badge>
        </div>

        <h2 id="live-monitoring-title" className="mt-3 flex items-center gap-3 text-2xl font-bold text-ink">
          <MonitoringPulse active={isActive} tone={copy.tone} size="lg" />
          {copy.title}
        </h2>

        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-subtle" aria-hidden="true" />
            <dt className="sr-only">Scope</dt>
            <dd>
              {pluralise(scope.learners, 'learner')} · {pluralise(scope.centres.length, 'centre')}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-4 text-subtle" aria-hidden="true" />
            <dt>Last checked:</dt>
            <dd className="font-medium tabular-nums text-ink-soft">{overview?.lastScanAt ? formatRelative(overview.lastScanAt, now) : 'Not yet'}</dd>
          </div>
        </dl>

        <LiveEventFeed
          events={events}
          max={4}
          className="mt-5"
          emptyText={isActive ? 'Waiting for the next check…' : hasSessions ? 'Monitoring is paused — resume to see live checks.' : 'Create a monitoring session to start live checks.'}
        />

        <div className="mt-auto flex flex-col gap-3 pt-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <StatusIndicator status={status} size="sm" />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" leftIcon={Settings2} to={paths.monitoring} className="flex-1 sm:flex-none">
              Manage Monitoring
            </Button>
            {hasSessions ? (
              <Button
                size="sm"
                variant={isActive ? 'secondary' : 'primary'}
                leftIcon={isActive ? Pause : Play}
                loading={busy === 'start' || busy === 'pause'}
                onClick={isActive ? pause : start}
                className="flex-1 sm:flex-none"
              >
                {isActive ? 'Pause' : 'Start'}
              </Button>
            ) : (
              <Button size="sm" leftIcon={MapPin} to={paths.newMonitoring} className="flex-1 sm:flex-none">
                Set up monitoring
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
