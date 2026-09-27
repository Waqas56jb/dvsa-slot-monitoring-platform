import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Radar, Plus, Square, Trash2 } from 'lucide-react';
import { Button, EmptyState, ConfirmDialog, FilterChips } from '@/components/ui';
import { monitoringService } from '@/services';
import { useToast } from '@/context/ToastContext';
import { useNow } from '@/hooks';
import { SessionCard } from './SessionCard';
import { paths } from '@/routes/paths';

const SUCCESS = {
  active: ['Monitoring resumed', 'We’ll alert you as soon as a matching slot appears.'],
  paused: ['Session paused', 'Preferences are saved — resume at any time.'],
  stopped: ['Session stopped', 'This session will no longer check for slots.'],
};

/** Monitoring sessions with per-session controls. */
export function SessionsList({ sessions = [] }) {
  const toast = useToast();
  const now = useNow(5000);
  const [pending, setPending] = useState({});
  const [confirm, setConfirm] = useState(null); // { type: 'stop' | 'delete', session }
  const [filter, setFilter] = useState('all');

  const setBusy = (id, value) => setPending((p) => ({ ...p, [id]: value }));

  const setStatus = async (session, status) => {
    setBusy(session.id, status);
    try {
      await monitoringService.setSessionStatus(session.id, status);
      const [title, description] = SUCCESS[status];
      toast.success(title, { description: `${session.name}. ${description}` });
      return true;
    } catch (err) {
      toast.error('Could not update session', { description: err.message });
      return false;
    } finally {
      setBusy(session.id, null);
    }
  };

  const remove = async (session) => {
    setBusy(session.id, 'delete');
    try {
      await monitoringService.deleteSession(session.id);
      toast.success('Session deleted', { description: `“${session.name}” was removed.` });
    } catch (err) {
      toast.error('Could not delete session', { description: err.message });
    } finally {
      setBusy(session.id, null);
    }
  };

  const onConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === 'stop') await setStatus(confirm.session, 'stopped');
    else await remove(confirm.session);
    setConfirm(null);
  };

  const counts = {
    all: sessions.length,
    active: sessions.filter((s) => s.status === 'active').length,
    paused: sessions.filter((s) => s.status === 'paused').length,
    stopped: sessions.filter((s) => s.status === 'stopped').length,
  };
  const visible = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <section aria-labelledby="sessions-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="sessions-title" className="text-lg font-semibold text-ink">
            Monitoring sessions
          </h2>
          <p className="mt-0.5 text-sm text-muted">Each session watches a set of learners, centres and preferred times.</p>
        </div>
        {sessions.length > 0 && (
          <FilterChips
            label="Filter sessions by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'active', label: 'Active', count: counts.active },
              { value: 'paused', label: 'Paused', count: counts.paused },
              { value: 'stopped', label: 'Stopped', count: counts.stopped },
            ]}
          />
        )}
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Radar}
          title="No monitoring sessions yet"
          description="Create a session to choose learners, test centres and preferred dates and times. We’ll alert you when a matching slot appears."
          action={
            <Button leftIcon={Plus} to={paths.newMonitoring}>
              New monitoring
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState compact icon={Radar} title={`No ${filter} sessions`} description="Try another filter to see your other sessions." action={<Button variant="secondary" size="sm" onClick={() => setFilter('all')}>Show all sessions</Button>} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <AnimatePresence initial={false}>
            {visible.map((s, i) => (
              <SessionCard
                key={s.id}
                session={s}
                index={i}
                now={now}
                pending={pending[s.id]}
                onSetStatus={setStatus}
                onRequestStop={(session) => setConfirm({ type: 'stop', session })}
                onRequestDelete={(session) => setConfirm({ type: 'delete', session })}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={onConfirm}
        loading={confirm ? Boolean(pending[confirm.session.id]) : false}
        icon={confirm?.type === 'stop' ? Square : Trash2}
        tone={confirm?.type === 'stop' ? 'warning' : 'danger'}
        title={confirm?.type === 'stop' ? 'Stop this session?' : 'Delete this session?'}
        description={
          confirm?.type === 'stop'
            ? `“${confirm?.session.name}” will stop checking for slots. You can start it again later.`
            : `“${confirm?.session.name}” will be permanently removed. Detected slots and history are kept.`
        }
        confirmLabel={confirm?.type === 'stop' ? 'Stop session' : 'Delete session'}
      />
    </section>
  );
}
