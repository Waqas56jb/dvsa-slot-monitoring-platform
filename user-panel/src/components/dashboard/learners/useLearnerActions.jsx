import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { learnerService } from '@/services';

/**
 * Shared learner mutations (toggle monitoring, delete with confirmation).
 * Returns handlers plus the ConfirmDialog element to render once.
 */
export function useLearnerActions({ onDeleted } = {}) {
  const toast = useToast();
  const [target, setTarget] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const toggleMonitoring = async (learner) => {
    const enable = !learner.isMonitoring;
    setTogglingId(learner.id);
    try {
      const updated = await learnerService.setMonitoring(learner.id, enable);
      toast.success(enable ? 'Monitoring started' : 'Monitoring stopped', {
        description: enable
          ? `${learner.fullName} is now being monitored for matching slots.`
          : `${learner.fullName} is no longer being monitored.`,
      });
      return updated;
    } catch (err) {
      toast.error('Could not update monitoring', { description: err.message });
      return undefined;
    } finally {
      setTogglingId(null);
    }
  };

  const requestDelete = (learner) => {
    setTarget(learner);
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await learnerService.remove(target.id);
      toast.success('Learner deleted', { description: `${target.fullName} and their monitoring were removed.` });
      setOpen(false);
      onDeleted?.(target);
    } catch (err) {
      toast.error('Could not delete learner', { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const dialog = (
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={confirmDelete}
      loading={deleting}
      title={`Delete ${target?.fullName || 'learner'}?`}
      description="This removes the learner, stops any monitoring for them and clears their unactioned slot alerts. This can't be undone."
      confirmLabel="Delete learner"
    />
  );

  return { toggleMonitoring, requestDelete, togglingId, dialog };
}
