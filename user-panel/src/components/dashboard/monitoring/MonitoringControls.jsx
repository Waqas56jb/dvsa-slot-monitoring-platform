import { useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button, ConfirmDialog, StatusIndicator } from '@/components/ui';
import { useMonitoring } from '@/context/MonitoringContext';

/** Global start / pause / stop control bar for all monitoring sessions. */
export function MonitoringControls() {
  const { status, busy, start, pause, stop, overview } = useMonitoring();
  const [confirmStop, setConfirmStop] = useState(false);
  const hasSessions = (overview?.sessions?.length || 0) > 0;

  const handleStop = async () => {
    await stop();
    setConfirmStop(false);
  };

  if (!hasSessions) return null;

  const hint = {
    active: 'All active sessions are checking for matching slots.',
    paused: 'Monitoring is currently paused. No checks are running, so you won’t receive new slot alerts.',
    stopped: 'Monitoring is currently stopped. Your sessions and preferences are saved — start again at any time.',
  }[status];

  return (
    <section aria-label="Monitoring controls" className={`flex flex-col gap-4 rounded-3xl border ${status === 'paused' ? 'border-warning/40 bg-warning-soft/40' : 'border-line bg-surface'} p-4 shadow-soft sm:p-5 lg:flex-row lg:items-center lg:justify-between`}>
      <div className="min-w-0">
        <StatusIndicator status={status} />
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
        <Button
          variant={status === 'active' ? 'secondary' : 'success'}
          leftIcon={Play}
          onClick={start}
          loading={busy === 'start'}
          disabled={status === 'active' || Boolean(busy)}
        >
          {status === 'active' ? 'Running' : 'Start Monitoring'}
        </Button>
        <Button variant="secondary" leftIcon={Pause} onClick={pause} loading={busy === 'pause'} disabled={status !== 'active' || Boolean(busy)}>
          Pause Monitoring
        </Button>
        <Button variant="danger-ghost" leftIcon={Square} onClick={() => setConfirmStop(true)} disabled={status === 'stopped' || Boolean(busy)}>
          Stop Monitoring
        </Button>
      </div>

      <ConfirmDialog
        open={confirmStop}
        onClose={() => setConfirmStop(false)}
        onConfirm={handleStop}
        loading={busy === 'stop'}
        icon={Square}
        title="Stop all monitoring?"
        description="Every session will stop checking for slots and you won’t receive new alerts. Your sessions and preferences are kept so you can start again later."
        confirmLabel="Stop monitoring"
      />
    </section>
  );
}
