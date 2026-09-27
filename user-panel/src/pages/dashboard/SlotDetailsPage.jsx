import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { PageHeader, Button, EmptyState, ErrorState, ConfirmDialog } from '@/components/ui';
import { SlotStatusBadge } from '@/components/dashboard/StatusBadges';
import { SlotSummary, SlotDetailSkeleton } from '@/components/dashboard/slots/SlotSummary';
import { PreferenceMatch } from '@/components/dashboard/slots/PreferenceMatch';
import { BookingPanel } from '@/components/dashboard/slots/BookingPanel';
import { slotService } from '@/services';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle, useResource } from '@/hooks';
import { formatRelative } from '@/utils/format';
import { paths } from '@/routes/paths';

export default function SlotDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: slot, setData, loading, error, reload } = useResource(() => slotService.get(id), [id]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useDocumentTitle(slot?.centre ? `${slot.centre.name} slot` : 'Slot details');

  // Opening a new slot marks it as viewed.
  const slotId = slot?.id;
  const isNew = slot?.status === 'new';
  useEffect(() => {
    if (!slotId || !isNew) return;
    slotService
      .markViewed(slotId)
      .then((updated) => setData((s) => (s && s.id === updated.id ? { ...s, ...updated } : s)))
      .catch(() => {});
  }, [slotId, isNew, setData]);

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      await slotService.dismiss(slot.id);
      toast.success('Slot dismissed', {
        description: `${slot.centre?.name} · ${slot.learner?.fullName || 'learner'}`,
        duration: 6000,
        action: {
          label: 'Undo',
          onClick: () =>
            slotService
              .restore(slot.id)
              .then(() => toast.info('Slot restored'))
              .catch((err) => toast.error('Could not restore slot', { description: err.message })),
        },
      });
      setConfirmOpen(false);
      navigate(paths.slots);
    } catch (err) {
      toast.error('Could not dismiss slot', { description: err.message });
      setDismissing(false);
    }
  };

  const breadcrumbs = [{ label: 'Slots', to: paths.slots }, { label: slot?.centre?.name || 'Slot details' }];

  if (loading && !slot) return <SlotDetailSkeleton />;

  if (error && !slot) {
    return (
      <>
        <PageHeader title="Slot details" breadcrumbs={breadcrumbs} />
        {error.code === 'not_found' ? (
          <EmptyState
            icon={SearchX}
            title="Slot not found"
            description={error.message}
            action={
              <Button leftIcon={ArrowLeft} to={paths.slots}>
                Back to slots
              </Button>
            }
          />
        ) : (
          <ErrorState title="Couldn’t load this slot" error={error} onRetry={reload} />
        )}
      </>
    );
  }

  if (!slot) return null;

  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={`${slot.centre?.name || 'Unknown'} Test Centre`}
        badge={<SlotStatusBadge status={slot.status} />}
        description={`Matching slot detected ${formatRelative(slot.detectedAt)}${slot.learner ? ` for ${slot.learner.fullName}` : ''}.`}
        actions={
          <Button variant="ghost" leftIcon={ArrowLeft} to={paths.slots}>
            All slots
          </Button>
        }
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-7">
          <SlotSummary slot={slot} />
          <PreferenceMatch slot={slot} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <BookingPanel
              slot={slot}
              onActioned={(updated) => setData((s) => ({ ...s, ...updated }))}
              onDismiss={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDismiss}
        loading={dismissing}
        title="Dismiss this slot?"
        description="It will be removed from your matches. You can undo straight after from the notification."
        confirmLabel="Dismiss slot"
      />
    </>
  );
}
