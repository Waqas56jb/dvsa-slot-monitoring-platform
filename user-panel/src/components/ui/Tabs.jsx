import { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/**
 * Accessible tab list (arrow-key navigation). Content is rendered by the
 * caller — pair with <TabPanel> or conditionally render based on `value`.
 *
 * tabs: [{ value, label, count?, icon? }]
 */
export function Tabs({ tabs, value, onChange, label = 'Tabs', className, variant = 'underline' }) {
  const group = useId();
  const listRef = useRef(null);

  const onKeyDown = (e) => {
    const idx = tabs.findIndex((t) => t.value === value);
    let next = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(tabs[next].value);
      listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
    }
  };

  const pills = variant === 'pills';

  return (
    <div className={cn('scrollbar-thin -mx-1 overflow-x-auto px-1', !pills && 'border-b border-line', className)}>
      <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('flex min-w-max', pills ? 'gap-1.5' : 'gap-5')}>
        {tabs.map((t) => {
          const active = t.value === value;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={`${group}-tab-${t.value}`}
              aria-selected={active}
              aria-controls={`${group}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.value)}
              className={cn(
                'relative flex items-center gap-2 text-sm font-medium transition-colors',
                pills
                  ? cn('h-10 rounded-full px-4', active ? 'bg-ink text-surface' : 'bg-surface text-muted ring-1 ring-line hover:text-ink')
                  : cn('h-11 pb-px', active ? 'text-ink' : 'text-muted hover:text-ink'),
              )}
            >
              {Icon && <Icon className="size-4" aria-hidden="true" />}
              {t.label}
              {t.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px] font-semibold leading-5 tabular-nums',
                    pills ? (active ? 'bg-surface/20 text-surface' : 'bg-surface-sunken text-muted') : active ? 'bg-brand-soft text-brand-ink' : 'bg-surface-sunken text-muted',
                  )}
                >
                  {t.count}
                </span>
              )}
              {!pills && active && <motion.span layoutId={`tab-underline-${group}`} className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
