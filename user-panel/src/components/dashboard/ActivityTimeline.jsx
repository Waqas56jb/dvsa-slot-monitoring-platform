import { motion } from 'framer-motion';
import {
  Sparkles, Play, Pause, Square, SlidersHorizontal, MapPinPlus, UserPlus, UserPen, UserMinus, ExternalLink, EyeOff, Clock4, Eye,
} from 'lucide-react';
import { activityTypes } from '@/services';
import { toneClasses } from '@/components/ui';
import { formatShortClock, formatRelative, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

export const activityIcons = {
  slot_detected: Sparkles,
  slot_viewed: Eye,
  slot_actioned: ExternalLink,
  slot_dismissed: EyeOff,
  slot_expired: Clock4,
  monitoring_started: Play,
  monitoring_paused: Pause,
  monitoring_stopped: Square,
  preference_changed: SlidersHorizontal,
  centre_added: MapPinPlus,
  learner_added: UserPlus,
  learner_updated: UserPen,
  learner_deleted: UserMinus,
};

/**
 * Vertical activity timeline.
 * items: activity records ({ id, type, message, createdAt, learnerName? })
 */
export function ActivityTimeline({ items, showDate = false, className }) {
  return (
    <ol className={cn('relative', className)}>
      {items.map((item, i) => {
        const meta = activityTypes[item.type] || { label: item.type, tone: 'neutral' };
        const Icon = activityIcons[item.type] || Sparkles;
        const tone = toneClasses[meta.tone] || toneClasses.neutral;
        const last = i === items.length - 1;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.04 }}
            className="relative flex gap-3.5 pb-5 last:pb-0"
          >
            {!last && <span className="absolute left-[17px] top-9 bottom-0 w-px bg-line" aria-hidden="true" />}
            <time dateTime={item.createdAt} className="hidden w-11 shrink-0 pt-2 text-right text-xs font-medium tabular-nums text-subtle sm:block">
              {formatShortClock(item.createdAt)}
            </time>
            <span className={cn('relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl ring-4 ring-surface', tone.soft)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-ink">{meta.label}</p>
              <p className="mt-0.5 text-sm text-muted">{item.message}</p>
              <p className="mt-1 text-xs text-subtle">
                <span className="sm:hidden">{formatShortClock(item.createdAt)} · </span>
                {showDate ? formatDate(item.createdAt) : formatRelative(item.createdAt)}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
