import { KeyRound } from 'lucide-react';
import { Button, Card, CardHeader, Input } from '@/components/ui';
import { useForm } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services';
import { rules, passwordStrength } from '@/utils/validation';
import { cn } from '@/utils/cn';

const INITIAL = { currentPassword: '', newPassword: '', confirmPassword: '' };
const LEVELS = [
  { label: 'Too weak', cls: 'bg-danger', text: 'text-danger-ink' },
  { label: 'Weak', cls: 'bg-danger', text: 'text-danger-ink' },
  { label: 'Fair', cls: 'bg-warning', text: 'text-warning-ink' },
  { label: 'Good', cls: 'bg-success', text: 'text-success-ink' },
  { label: 'Strong', cls: 'bg-success', text: 'text-success-ink' },
];

const schema = {
  currentPassword: [rules.required('Current password')],
  newPassword: [
    rules.required('New password'),
    rules.strongPassword(),
    (v, all) => (v && v === all.currentPassword ? 'Choose a password you are not already using.' : ''),
  ],
  confirmPassword: [rules.required('Confirm password'), rules.matches('newPassword', 'Passwords do not match.')],
};

function StrengthMeter({ password }) {
  if (!password) return null;
  const score = passwordStrength(password);
  const level = LEVELS[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= score ? level.cls : 'bg-surface-sunken')} />
        ))}
      </div>
      <span className={cn('w-16 text-right text-xs font-semibold', level.text)}>{level.label}</span>
    </div>
  );
}

export function ChangePasswordCard() {
  const toast = useToast();
  const form = useForm(INITIAL, schema);

  const submit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await authService.changePassword({ currentPassword, newPassword });
      form.reset(INITIAL);
      toast.success('Password changed', { description: 'Use your new password next time you sign in.' });
    } catch (err) {
      if (err?.field) throw err;
      toast.error('Could not change password', { description: err?.message });
    }
  });

  return (
    <Card as="section" aria-labelledby="set-password">
      <CardHeader icon={KeyRound} title={<span id="set-password">Change password</span>} description="Use at least 8 characters with upper and lower case letters and a number." />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input {...form.field('currentPassword')} type="password" label="Current password" autoComplete="current-password" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Input {...form.field('newPassword')} type="password" label="New password" autoComplete="new-password" required />
            <StrengthMeter password={form.values.newPassword} />
          </div>
          <Input {...form.field('confirmPassword')} type="password" label="Confirm new password" autoComplete="new-password" required />
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" loading={form.submitting} disabled={!form.isDirty} className="w-full sm:w-auto">
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}
