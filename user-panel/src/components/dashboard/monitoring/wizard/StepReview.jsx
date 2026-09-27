import { Users, MapPin, CalendarRange, Clock3, Bell, Pencil } from 'lucide-react';
import { AvatarGroup, Button } from '@/components/ui';
import { getCentreSync } from '@/services';
import { formatDateRange, formatTimeString } from '@/utils/format';
import { intervalLabel } from '../monitoringUtils';

const CHANNEL_LABELS = { dashboard: 'Dashboard', browser: 'Browser', sound: 'Sound', email: 'Email' };

function Row({ icon: Icon, label, step, onEdit, children }) {
  return (
    <div className="flex items-start gap-3 py-4 sm:gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft ring-1 ring-line">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
        <dd className="mt-1 text-sm text-ink">{children}</dd>
      </div>
      <Button variant="ghost" size="sm" leftIcon={Pencil} onClick={() => onEdit(step)} aria-label={`Edit ${label.toLowerCase()}`}>
        <span className="hidden sm:inline">Edit</span>
      </Button>
    </div>
  );
}

export function StepReview({ values, learners, onEdit }) {
  const selected = (learners || []).filter((l) => values.learnerIds.includes(l.id));
  const centres = values.centreIds.map(getCentreSync).filter(Boolean);
  const channels = Object.entries(values.notify).filter(([, on]) => on).map(([k]) => CHANNEL_LABELS[k]);
  const autoName = selected.length === 1 ? `${selected[0].fullName} — monitoring` : `${selected.length} learners — monitoring`;

  return (
    <div>
      <div className="rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
        <p className="text-xs font-medium text-brand-ink">Session name</p>
        <p className="mt-0.5 text-lg font-semibold text-ink">{values.name.trim() || autoName}</p>
      </div>
      <dl className="mt-2 divide-y divide-line">
        <Row icon={Users} label="Learners" step={0} onEdit={onEdit}>
          <div className="flex flex-wrap items-center gap-3">
            <AvatarGroup names={selected.map((l) => l.fullName)} max={5} size="sm" />
            <span className="min-w-0">{selected.map((l) => l.fullName).join(', ')}</span>
          </div>
        </Row>
        <Row icon={MapPin} label={`Test centres (${centres.length})`} step={1} onEdit={onEdit}>
          <ul className="flex flex-wrap gap-1.5">
            {centres.map((c) => (
              <li key={c.id} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-soft ring-1 ring-line">
                {c.name}
              </li>
            ))}
          </ul>
        </Row>
        <Row icon={CalendarRange} label="Date range" step={2} onEdit={onEdit}>
          {formatDateRange(values.dateFrom, values.dateTo)}
        </Row>
        <Row icon={Clock3} label="Preferred times" step={3} onEdit={onEdit}>
          {formatTimeString(values.timeFrom)} – {formatTimeString(values.timeTo)}
        </Row>
        <Row icon={Bell} label="Alerts & interval" step={4} onEdit={onEdit}>
          {channels.length ? channels.join(' · ') : 'No alerts (Slots page only)'}
          <span className="block text-muted">
            {intervalLabel(values.interval)} · {values.startNow ? 'starts immediately' : 'saved paused'}
          </span>
        </Row>
      </dl>
    </div>
  );
}
