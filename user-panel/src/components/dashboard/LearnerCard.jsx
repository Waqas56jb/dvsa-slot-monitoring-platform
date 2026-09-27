import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoreHorizontal, MapPin, CalendarRange, Eye, Pencil, Radar, Trash2, PauseCircle } from 'lucide-react';
import { Avatar, Dropdown, IconButton } from '@/components/ui';
import { LearnerStatusBadge } from './StatusBadges';
import { formatDateRange, formatRelative } from '@/utils/format';
import { paths } from '@/routes/paths';

/** Standard actions menu for a learner (used by table rows and cards). */
export function LearnerActions({ learner, onToggleMonitoring, onDelete, align = 'right' }) {
  return (
    <Dropdown
      align={align}
      trigger={(props) => <IconButton {...props} icon={MoreHorizontal} label={`Actions for ${learner.fullName}`} size="sm" />}
      items={[
        { label: 'View', icon: Eye, to: paths.learner(learner.id) },
        { label: 'Edit', icon: Pencil, to: paths.editLearner(learner.id) },
        {
          label: learner.isMonitoring ? 'Stop monitoring' : 'Start monitoring',
          icon: learner.isMonitoring ? PauseCircle : Radar,
          onClick: () => onToggleMonitoring?.(learner),
        },
        { divider: true },
        { label: 'Delete', icon: Trash2, danger: true, onClick: () => onDelete?.(learner) },
      ]}
    />
  );
}

/** Mobile-friendly learner card. */
export function LearnerCard({ learner, onToggleMonitoring, onDelete, index = 0 }) {
  const centres = learner.centres || [];
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className="relative rounded-3xl border border-line bg-surface p-4 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <Avatar name={learner.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <Link to={paths.learner(learner.id)} className="block truncate font-semibold text-ink after:absolute after:inset-0 after:rounded-3xl">
            {learner.fullName}
          </Link>
          <p className="truncate text-sm text-muted">{learner.email}</p>
        </div>
        <div className="relative z-10">
          <LearnerActions learner={learner} onToggleMonitoring={onToggleMonitoring} onDelete={onDelete} />
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center gap-2 text-ink-soft">
          <MapPin className="size-4 shrink-0 text-subtle" aria-hidden="true" />
          <span className="truncate">
            {centres[0]?.name || 'No centre selected'}
            {centres.length > 1 && <span className="text-muted"> +{centres.length - 1} more</span>}
          </span>
        </p>
        <p className="flex items-center gap-2 text-ink-soft">
          <CalendarRange className="size-4 shrink-0 text-subtle" aria-hidden="true" />
          {formatDateRange(learner.dateFrom, learner.dateTo)}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <LearnerStatusBadge status={learner.status} />
        <span className="text-xs text-subtle">Last alert {formatRelative(learner.lastAlertAt)}</span>
      </div>
    </motion.article>
  );
}
