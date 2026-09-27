import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/** Base surface. `interactive` adds a subtle hover lift. */
export const Card = forwardRef(function Card({ as: Tag = 'div', interactive, padded = true, className, children, ...rest }, ref) {
  return (
    <Tag
      ref={ref}
      className={cn(
        'rounded-3xl border border-line bg-surface shadow-soft',
        padded && 'p-5 sm:p-6',
        interactive && 'transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export function CardHeader({ title, description, icon: Icon, action, className, titleAs: T = 'h2' }) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft ring-1 ring-line">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <T className="text-base font-semibold text-ink">{title}</T>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Card that fades up on mount — for dashboard grids. */
export function MotionCard({ delay = 0, className, children, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6', className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
