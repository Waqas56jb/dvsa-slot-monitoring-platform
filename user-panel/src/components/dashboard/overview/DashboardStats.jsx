import { Users, Radar, Sparkles, BellRing, RefreshCw } from 'lucide-react';
import { StatCard, Button } from '@/components/ui';
import { dashboardService } from '@/services';
import { useResource } from '@/hooks';
import { pluralise } from '@/utils/format';

/** Four headline metrics, refreshed silently as data changes. */
export function DashboardStats() {
  const { data, loading, error, reload } = useResource(() => dashboardService.getStats(), [], {
    topics: ['learners', 'slots', 'notifications'],
  });

  if (error && !data) {
    return (
      <div role="alert" className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-danger/20 bg-danger-soft/40 p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-ink-soft">We couldn’t load your summary metrics.</p>
        <Button size="sm" variant="secondary" leftIcon={RefreshCw} onClick={() => reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const busy = loading && !data;
  const s = data || {};
  const tiles = [
    { label: 'Active Learners', value: s.activeLearners, icon: Users, tone: 'brand', footnote: 'On your account' },
    { label: 'Monitoring', value: s.monitoring, icon: Radar, tone: 'info', footnote: s.monitoring ? `${pluralise(s.monitoring, 'learner')} being watched` : 'No learners being watched' },
    { label: 'Slots Found', value: s.slotsFound, icon: Sparkles, tone: 'success', footnote: 'New matches to review' },
    { label: 'Alerts Today', value: s.alertsToday, icon: BellRing, tone: 'warning', footnote: 'Notifications since midnight' },
  ];

  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {tiles.map((t, i) => (
        <StatCard key={t.label} {...t} value={t.value ?? 0} loading={busy} delay={i * 0.05} className="min-w-0 p-4 sm:p-5" />
      ))}
    </section>
  );
}
