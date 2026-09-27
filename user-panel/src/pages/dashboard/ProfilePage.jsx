import { CalendarCheck, CreditCard, ShieldCheck, Settings2, KeyRound } from 'lucide-react';
import { Avatar, Badge, Button, Card, ErrorState, PageHeader, SkeletonCard } from '@/components/ui';
import { ProfileForm } from '@/components/dashboard/account/ProfileForm';
import { userService } from '@/services';
import { useDocumentTitle, useResource } from '@/hooks';
import { pricingPlans } from '@/data/pricing';
import { USAGE_TYPES } from '@/config/app';
import { formatLongDate, fullName } from '@/utils/format';
import { paths } from '@/routes/paths';

function AccountSummary({ profile }) {
  const plan = pricingPlans.find((p) => p.id === profile.plan);
  const usage = USAGE_TYPES.find((u) => u.value === profile.usageType)?.label;
  const rows = [
    { icon: CalendarCheck, label: 'Member since', value: formatLongDate(profile.createdAt) },
    { icon: CreditCard, label: 'Plan', value: <Badge tone="brand">{plan?.name || 'Free'}</Badge> },
    ...(usage ? [{ icon: ShieldCheck, label: 'Account type', value: usage }] : []),
  ];
  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={fullName(profile)} src={profile.avatarUrl || undefined} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{fullName(profile)}</p>
            <p className="truncate text-sm text-muted">{profile.email}</p>
          </div>
        </div>
        <dl className="mt-5 space-y-3 border-t border-line pt-5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted">
                <r.icon className="size-4 text-subtle" aria-hidden="true" />
                {r.label}
              </dt>
              <dd className="font-medium text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card>
        <p className="text-sm font-semibold text-ink">Looking for something else?</p>
        <div className="mt-3 flex flex-col gap-2">
          <Button variant="secondary" leftIcon={KeyRound} to={`${paths.settings}?section=security`} fullWidth className="justify-start">
            Change password
          </Button>
          <Button variant="secondary" leftIcon={Settings2} to={`${paths.settings}?section=notifications`} fullWidth className="justify-start">
            Notification settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { data: profile, loading, error, reload } = useResource(() => userService.getProfile(), [], { topics: ['user'] });

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal and business details." />
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
          <div className="space-y-5 lg:col-span-2">
            <SkeletonCard lines={5} />
            <SkeletonCard lines={2} />
          </div>
          <SkeletonCard lines={3} />
        </div>
      ) : error || !profile ? (
        <ErrorState title="Couldn't load your profile" error={error} onRetry={reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfileForm key={profile.id} profile={profile} />
          </div>
          <AccountSummary profile={profile} />
        </div>
      )}
    </>
  );
}
