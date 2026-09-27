import { AnimatePresence } from 'framer-motion';
import { isTodayISO } from './dates';
import { NotificationItem } from './NotificationItem';

/** Renders notifications grouped into "Today" and "Earlier". */
export function NotificationList({ items, ...handlers }) {
  const today = items.filter((n) => isTodayISO(n.createdAt));
  const earlier = items.filter((n) => !isTodayISO(n.createdAt));
  const groups = [
    { key: 'today', label: 'Today', items: today },
    { key: 'earlier', label: 'Earlier', items: earlier },
  ].filter((g) => g.items.length);

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`ntf-${g.key}`}>
          <h2 id={`ntf-${g.key}`} className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-subtle">
            {g.label}
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="font-medium normal-case tracking-normal">{g.items.length}</span>
          </h2>
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {g.items.map((n, i) => (
                <NotificationItem key={n.id} notification={n} index={i} {...handlers} />
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
