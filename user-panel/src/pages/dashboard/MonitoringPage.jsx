import { Plus } from 'lucide-react';
import { paths } from '@/routes/paths';
import { PageHeader, Button, ErrorState } from '@/components/ui';
import { SessionStatusBadge } from '@/components/dashboard/StatusBadges';
import { MonitoringControls } from '@/components/dashboard/monitoring/MonitoringControls';
import { MonitoringSummary } from '@/components/dashboard/monitoring/MonitoringSummary';
import { LiveScanPanel } from '@/components/dashboard/monitoring/LiveScanPanel';
import { SessionsList } from '@/components/dashboard/monitoring/SessionsList';
import { useMonitoring } from '@/context/MonitoringContext';
import { useDocumentTitle } from '@/hooks';

export default function MonitoringPage() {
  useDocumentTitle('Monitoring');
  const { overview, status, refresh } = useMonitoring();

  if (!overview) {
    return (
      <>
        <PageHeader title="Monitoring" />
        <ErrorState title="Couldn’t load monitoring" description="We couldn’t read your monitoring sessions. Please try again." onRetry={refresh} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Monitoring"
        badge={<SessionStatusBadge status={status} />}
        description="Your control centre for live slot checks — start, pause or stop monitoring and manage each session."
        actions={
          <Button leftIcon={Plus} to={paths.newMonitoring} className="w-full sm:w-auto">
            New monitoring
          </Button>
        }
      />

      <div className="space-y-4 sm:space-y-6">
        <MonitoringControls />
        <MonitoringSummary overview={overview} />
        <LiveScanPanel />
        <SessionsList sessions={overview.sessions} />
      </div>
    </>
  );
}
