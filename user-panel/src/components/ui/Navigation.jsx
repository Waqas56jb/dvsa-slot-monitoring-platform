import { Link } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/** items: [{ label, to? }] — last item is the current page. */
export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="rounded-md px-1 py-0.5 hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn('px-1 py-0.5', last && 'font-medium text-ink')}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 text-subtle" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Standard dashboard page header: breadcrumbs, title, description, actions. */
export function PageHeader({ title, description, actions, breadcrumbs, badge, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Wizard progress indicator.
 * steps: [{ label }] · current: zero-based index
 */
export function Stepper({ steps, current, className }) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100;
  return (
    <div className={className}>
      {/* Compact bar for mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">{steps[current]?.label}</span>
          <span className="text-muted">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current + 1} aria-label="Progress">
          <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${((current + 1) / steps.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <ol className="relative hidden items-start justify-between sm:flex" aria-label="Progress">
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-line" aria-hidden="true">
          <motion.div className="h-full bg-brand" animate={{ width: `${pct}%` }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />
        </div>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.label} className="relative z-10 flex flex-1 flex-col items-center gap-2 first:items-start last:items-end" aria-current={active ? 'step' : undefined}>
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300',
                  done && 'bg-brand text-white',
                  active && 'bg-surface text-brand ring-2 ring-brand shadow-[0_0_0_5px_var(--sp-brand-soft)]',
                  !done && !active && 'bg-surface text-subtle ring-1 ring-line-strong',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn('whitespace-nowrap text-xs font-medium', active ? 'text-ink' : 'text-muted')}>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
