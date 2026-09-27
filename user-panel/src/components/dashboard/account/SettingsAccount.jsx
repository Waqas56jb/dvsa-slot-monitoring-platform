import { useState } from 'react';
import { UserRound, RotateCcw, Trash2, DatabaseZap, ArrowRight } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardHeader, ConfirmDialog } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services';
import { pricingPlans } from '@/data/pricing';
import { formatLongDate, fullName } from '@/utils/format';
import { paths } from '@/routes/paths';

export function SettingsAccount({ onReset }) {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const plan = pricingPlans.find((p) => p.id === user?.plan);

  const reset = async () => {
    setResetting(true);
    try {
      await userService.resetDemoData();
      toast.success('Demo data reset', { description: 'Learners, slots, notifications and history are back to their starting state.' });
      setOpen(false);
      onReset?.();
    } catch (err) {
      toast.error('Could not reset demo data', { description: err.message });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <Card as="section" aria-labelledby="set-account">
        <CardHeader icon={UserRound} title={<span id="set-account">Account</span>} description="Your sign-in email and plan." />
        <div className="flex flex-col gap-4 rounded-2xl bg-surface-muted/70 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar name={fullName(user)} src={user?.avatarUrl || undefined} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{fullName(user)}</p>
              <p className="truncate text-sm text-muted">{user?.email}</p>
              <p className="mt-0.5 text-xs text-subtle">Member since {formatLongDate(user?.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="brand">{plan?.name || 'Free'} plan</Badge>
            <Button variant="secondary" size="sm" rightIcon={ArrowRight} to={paths.profile}>
              Edit profile
            </Button>
          </div>
        </div>
      </Card>

      <Card as="section" aria-labelledby="set-demo">
        <CardHeader icon={DatabaseZap} title={<span id="set-demo">Demo data</span>} description="This workspace runs on sample data stored in your browser." />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-muted">Restore the original sample learners, slots, notifications and history. Your profile and password are kept.</p>
          <Button variant="secondary" leftIcon={RotateCcw} onClick={() => setOpen(true)} className="shrink-0">
            Reset demo data
          </Button>
        </div>
      </Card>

      <Card as="section" aria-labelledby="set-danger" className="border-danger/25">
        <CardHeader icon={Trash2} title={<span id="set-danger">Delete account</span>} description="Permanently remove your account and all associated data." />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-muted">
            Account deletion will be available once the SlotPilot backend is connected, so your data can be removed securely from every system.
          </p>
          <Button variant="danger" leftIcon={Trash2} disabled aria-describedby="set-danger" className="shrink-0">
            Delete account
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={reset}
        loading={resetting}
        tone="warning"
        icon={RotateCcw}
        title="Reset demo data?"
        description="All learners, slots, monitoring sessions, notifications and history will be replaced with the original sample data. Changes you have made will be lost."
        confirmLabel="Reset data"
      />
    </div>
  );
}
