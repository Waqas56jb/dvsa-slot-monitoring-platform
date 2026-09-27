import { Badge } from '@/components/ui';
import { LEARNER_STATUS, SLOT_STATUS, SESSION_STATUS } from '@/services';

export function LearnerStatusBadge({ status, size }) {
  const s = LEARNER_STATUS[status] || LEARNER_STATUS.inactive;
  return (
    <Badge tone={s.tone} dot pulse={status === 'monitoring'} size={size}>
      {s.label}
    </Badge>
  );
}

export function SlotStatusBadge({ status, size }) {
  const s = SLOT_STATUS[status] || SLOT_STATUS.viewed;
  return (
    <Badge tone={s.tone} dot pulse={status === 'new'} size={size}>
      {s.label}
    </Badge>
  );
}

export function SessionStatusBadge({ status, size }) {
  const s = SESSION_STATUS[status] || SESSION_STATUS.stopped;
  return (
    <Badge tone={s.tone} dot pulse={status === 'active'} size={size}>
      {s.label}
    </Badge>
  );
}
