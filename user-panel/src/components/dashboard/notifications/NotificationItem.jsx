import { motion } from 'framer-motion';
import { Sparkles, Play, Pause, Clock4, UserPlus, UserPen, Bell, Info, MailOpen, Mail, Trash2, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { Dropdown, IconButton } from '@/components/ui';
import { formatRelative, formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

const EVENT_META = {
  slot_found: { icon: Sparkles, cls: 'bg-success-soft text-success-ink' },
  slot_expired: { icon: Clock4, cls: 'bg-warning-soft text-warning-ink' },
  monitoring_started: { icon: Play, cls: 'bg-brand-soft text-brand-ink' },
  monitoring_paused: { icon: Pause, cls: 'bg-warning-soft text-warning-ink' },
  learner_added: { icon: UserPlus, cls: 'bg-info-soft text-info-ink' },
  learner_updated: { icon: UserPen, cls: 'bg-info-soft text-info-ink' },
};
const TYPE_META = {
  slot: { icon: Sparkles, cls: 'bg-success-soft text-success-ink' },
  system: { icon: Info, cls: 'bg-surface-sunken text-ink-soft' },
  learner: { icon: UserPen, cls: 'bg-info-soft text-info-ink' },
};

export function notificationMeta(n) {
  return EVENT_META[n.event] || TYPE_META[n.type] || { icon: Bell, cls: 'bg-surface-sunken text-ink-soft' };
}

export function NotificationItem({ notification: n, onOpen, onToggleRead, onDelete, index = 0 }) {
  const meta = notificationMeta(n);
  const Icon = meta.icon;
  const unread = !n.read;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.025 }}
      className={cn(
        'group relative flex items-start gap-3 rounded-3xl border p-4 transition-colors sm:gap-4 sm:p-5',
        unread ? 'border-brand/25 bg-surface shadow-card' : 'border-line bg-surface/70 hover:bg-surface',
      )}
    >
      {unread && <span className="absolute left-0 top-5 h-8 w-1 rounded-r-full bg-brand" aria-hidden="true" />}
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl', meta.cls)}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <button
        type="button"
        onClick={() => onOpen(n)}
        className="min-w-0 flex-1 rounded-lg text-left after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand"
      >
        <span className="flex items-center gap-2">
          <span className={cn('truncate text-[15px]', unread ? 'font-semibold text-ink' : 'font-medium text-ink-soft')}>{n.title}</span>
          {unread && (
            <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
          )}
          <span className="sr-only">{unread ? '(unread)' : '(read)'}</span>
        </span>
        <span className={cn('mt-0.5 block text-sm leading-relaxed', unread ? 'text-ink-soft' : 'text-muted')}>{n.message}</span>
        <span className="mt-1.5 flex items-center gap-1 text-xs text-subtle">
          <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>
            {formatRelative(n.createdAt)}
          </time>
          {n.link && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-0.5 font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowUpRight className="size-3" aria-hidden="true" />
              </span>
            </>
          )}
        </span>
      </button>

      <div className="relative z-10 flex shrink-0 items-center gap-0.5">
        <IconButton
          icon={unread ? MailOpen : Mail}
          label={unread ? 'Mark as read' : 'Mark as unread'}
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => onToggleRead(n)}
        />
        <IconButton icon={Trash2} label="Delete notification" size="sm" className="hidden hover:text-danger-ink sm:inline-flex" onClick={() => onDelete(n)} />
        <Dropdown
          width="w-52"
          className="sm:hidden"
          trigger={(props) => <IconButton {...props} icon={MoreHorizontal} label={`Actions for ${n.title}`} />}
          items={[
            ...(n.link ? [{ label: 'Open', icon: ArrowUpRight, onClick: () => onOpen(n) }] : []),
            { label: unread ? 'Mark as read' : 'Mark as unread', icon: unread ? MailOpen : Mail, onClick: () => onToggleRead(n) },
            { divider: true },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => onDelete(n) },
          ]}
        />
      </div>
    </motion.li>
  );
}
