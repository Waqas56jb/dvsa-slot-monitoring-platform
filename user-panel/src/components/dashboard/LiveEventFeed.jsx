import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, CircleCheck, Sparkles, Info } from 'lucide-react';
import { formatClock } from '@/utils/format';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

const kinds = {
  check: { icon: Search, cls: 'text-info-ink' },
  clear: { icon: CircleCheck, cls: 'text-muted' },
  match: { icon: Sparkles, cls: 'text-success-ink' },
  system: { icon: Info, cls: 'text-warning-ink' },
};

/**
 * Console-style live feed of monitoring events.
 * events: [{ id, at, kind, message, slotId? }] newest first.
 */
export function LiveEventFeed({ events, emptyText = 'Waiting for the next check…', className, max = 12 }) {
  const list = events.slice(0, max);
  return (
    <div className={cn('rounded-2xl border border-line bg-surface-muted/60 font-mono text-[13px]', className)}>
      <ol className="divide-y divide-line/70" aria-live="polite" aria-label="Live monitoring events">
        <AnimatePresence initial={false}>
          {list.length === 0 && (
            <li className="px-4 py-6 text-center font-sans text-sm text-muted">{emptyText}</li>
          )}
          {list.map((e) => {
            const k = kinds[e.kind] || kinds.system;
            const Icon = k.icon;
            return (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: -8, backgroundColor: e.kind === 'match' ? 'rgba(16,185,129,0.14)' : 'rgba(0,0,0,0)' }}
                animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                transition={{ duration: 0.4, backgroundColor: { duration: 2.4 } }}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <time dateTime={e.at} className="shrink-0 tabular-nums text-subtle">
                  {formatClock(e.at)}
                </time>
                <Icon className={cn('size-3.5 shrink-0', k.cls)} aria-hidden="true" />
                <span className={cn('min-w-0 flex-1 truncate', e.kind === 'match' ? 'font-semibold text-success-ink' : 'text-ink-soft')}>{e.message}</span>
                {e.slotId && (
                  <Link to={paths.slot(e.slotId)} className="shrink-0 font-sans text-xs font-semibold text-brand hover:text-brand-hover">
                    View
                  </Link>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}
