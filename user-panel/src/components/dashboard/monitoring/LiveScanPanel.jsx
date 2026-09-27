import { FlaskConical, Info, Terminal } from 'lucide-react';
import { Button, Badge, MonitoringPulse } from '@/components/ui';
import { LiveEventFeed } from '@/components/dashboard/LiveEventFeed';
import { RadarScanner, useScanFocus } from './RadarScanner';
import { monitoringScope, STATUS_COPY } from './monitoringUtils';
import { useMonitoring } from '@/context/MonitoringContext';
import { getCentreSync } from '@/services';

/** Radar visualisation + live console for the monitoring control centre. */
export function LiveScanPanel() {
  const { overview, status, isActive, events, simulateMatch } = useMonitoring();
  const scope = monitoringScope(overview);
  const focus = useScanFocus(events, scope.centres);
  const focusCentre = focus.centreId ? getCentreSync(focus.centreId) : null;
  const copy = STATUS_COPY[status] || STATUS_COPY.stopped;

  return (
    <section aria-labelledby="live-scan-title" className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
      <div className="grid lg:grid-cols-5">
        {/* Radar */}
        <div className="relative flex flex-col overflow-hidden bg-night p-5 text-white sm:p-6 lg:col-span-2">
          <div className="bg-grid absolute inset-0 opacity-[0.06]" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Scan radar</p>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-white/80">
              <MonitoringPulse active={isActive} tone={copy.tone} size="sm" />
              {copy.label}
            </span>
          </div>
          <RadarScanner
            centres={scope.centres}
            active={isActive}
            focusId={focus.centreId}
            focusKind={focus.kind}
            className="relative mx-auto my-5 max-w-[260px]"
          />
          <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <p className="text-xs text-white/50">{isActive ? 'Currently checking' : 'Scanner idle'}</p>
            <p className="mt-0.5 truncate font-semibold text-white">
              {isActive ? (focusCentre ? `${focusCentre.name} · ${focusCentre.area}` : 'Preparing next check…') : status === 'paused' ? 'Monitoring is currently paused.' : 'Monitoring is stopped.'}
            </p>
          </div>
        </div>

        {/* Console */}
        <div className="flex min-w-0 flex-col p-5 sm:p-6 lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-surface-muted text-ink-soft ring-1 ring-line">
                <Terminal className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2 id="live-scan-title" className="text-base font-semibold text-ink">
                  Live monitoring
                </h2>
                <p className="text-xs text-muted">Newest events first</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral" size="sm">
                Demo
              </Badge>
              <Button variant="ghost" size="sm" leftIcon={FlaskConical} onClick={simulateMatch} disabled={!isActive}>
                Simulate a match
              </Button>
            </div>
          </div>

          <LiveEventFeed
            events={events}
            max={9}
            className="mt-4 min-h-[18rem] flex-1"
            emptyText={isActive ? 'Waiting for the next check…' : 'No live checks while monitoring is not active.'}
          />

          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Simulated in this demo — live checks will run on the SlotPilot backend.
          </p>
        </div>
      </div>
    </section>
  );
}
