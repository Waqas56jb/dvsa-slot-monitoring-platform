import { UserPlus, Radar, Play } from 'lucide-react';
import { PageHeader, Button, Alert } from '@/components/ui';
import { DashboardStats } from '@/components/dashboard/overview/DashboardStats';
import { LiveMonitoringCard } from '@/components/dashboard/overview/LiveMonitoringCard';
import { LatestSlotCard } from '@/components/dashboard/overview/LatestSlotCard';
import { MatchesChart } from '@/components/dashboard/overview/MatchesChart';
import { RecentActivityCard } from '@/components/dashboard/overview/RecentActivityCard';
import { LearnersSnapshot } from '@/components/dashboard/overview/LearnersSnapshot';
import { useAuth } from '@/context/AuthContext';
import { useMonitoring } from '@/context/MonitoringContext';
import { useDocumentTitle } from '@/hooks';
import { greeting } from '@/utils/format';
import { paths } from '@/routes/paths';

function MonitoringNotice() {
  const { overview, status, busy, start } = useMonitoring();
  if (!overview || status === 'active') return null;
  const hasSessions = overview.sessions.length > 0;

  if (!hasSessions) {
    return (
      <Alert
        tone="info"
        title="Monitoring isn’t set up yet."
        action={
          <Button size="sm" leftIcon={Radar} to={paths.newMonitoring}>
            New Monitoring
          </Button>
        }
      >
        Choose learners, centres and preferred times — we’ll alert you when matching availability appears.
      </Alert>
    );
  }

  return (
    <Alert
      tone="warning"
      title={status === 'paused' ? 'Monitoring is currently paused.' : 'Monitoring is currently stopped.'}
      action={
        <Button size="sm" leftIcon={Play} loading={busy === 'start'} onClick={start}>
          Resume
        </Button>
      }
    >
      Your preferences are saved. Resume to keep checking for matching slots.
    </Alert>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.firstName || 'there'}.`}
        description="Here's what's happening with your monitored learners."
        actions={
          <>
            <Button variant="secondary" leftIcon={UserPlus} to={paths.newLearner} className="flex-1 sm:flex-none">
              Add Learner
            </Button>
            <Button leftIcon={Radar} to={paths.newMonitoring} className="flex-1 sm:flex-none">
              New Monitoring
            </Button>
          </>
        }
      />

      <div className="space-y-4 sm:space-y-6">
        <MonitoringNotice />
        <DashboardStats />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <LiveMonitoringCard />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <LatestSlotCard />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-8">
            <MatchesChart days={14} />
            <LearnersSnapshot limit={5} />
          </div>
          <div className="min-w-0 lg:col-span-4">
            <RecentActivityCard limit={6} />
          </div>
        </div>
      </div>
    </>
  );
}
