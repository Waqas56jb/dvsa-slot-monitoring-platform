import { useState } from 'react';
import { MonitorSmartphone, Smartphone, Monitor, LogOut } from 'lucide-react';
import { Badge, Button, Card, CardHeader, ConfirmDialog, ErrorState, Skeleton } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services';
import { useResource } from '@/hooks';
import { formatRelative } from '@/utils/format';

const isMobileDevice = (d = '') => /iphone|android|ipad|mobile/i.test(d);

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

export function ActiveSessionsCard() {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useResource(() => userService.listSessions(), []);
  const [target, setTarget] = useState(null);
  const [open, setOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const revoke = async () => {
    setRevoking(true);
    try {
      setData(await userService.revokeSession(target.id));
      toast.success('Session signed out', { description: `${target.device} no longer has access.` });
      setOpen(false);
    } catch (err) {
      toast.error('Could not sign out that session', { description: err.message });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Card as="section" aria-labelledby="set-sessions">
      <CardHeader
        icon={MonitorSmartphone}
        title={<span id="set-sessions">Active sessions</span>}
        description="Devices signed in to your account."
        action={<Badge tone="neutral" size="sm">Preview</Badge>}
      />
      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={reload} className="py-8" />
      ) : (
        <ul className="space-y-2.5">
          {data.map((s) => {
            const Icon = isMobileDevice(s.device) ? Smartphone : Monitor;
            return (
              <li key={s.id} className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                      {s.device}
                      {s.current && <Badge tone="success" size="sm" dot>This device</Badge>}
                    </p>
                    <p className="truncate text-[13px] text-muted">
                      {s.location} · {s.current ? 'Active now' : `Last active ${lowerFirst(formatRelative(s.lastActiveAt))}`}
                    </p>
                  </div>
                </div>
                {!s.current && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={LogOut}
                    onClick={() => {
                      setTarget(s);
                      setOpen(true);
                    }}
                  >
                    Sign out
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-[13px] text-muted">
        Session data here is simulated for the demo. Real device sessions will be managed securely by the backend once it is connected.
      </p>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={revoke}
        loading={revoking}
        icon={LogOut}
        title="Sign out this session?"
        description={`${target?.device || 'This device'} will be signed out and will need to sign in again.`}
        confirmLabel="Sign out"
      />
    </Card>
  );
}
