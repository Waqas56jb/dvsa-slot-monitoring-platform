import { motion } from 'framer-motion';
import { CircleAlert, RefreshCw, CircleCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { Spinner } from './Spinner';

/** Friendly empty state with optional action. */
export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className, compact }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong bg-surface/60 text-center',
        compact ? 'px-6 py-10' : 'px-6 py-16 sm:py-20',
        className,
      )}
    >
      {Icon && (
        <div className="relative mb-5">
          <div className="absolute inset-0 -m-3 rounded-full bg-brand-soft/70 blur-md" aria-hidden="true" />
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-brand shadow-soft">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {secondaryAction}
          {action}
        </div>
      )}
    </motion.div>
  );
}

/** Error state with retry. */
export function ErrorState({ title = 'Something went wrong', description, error, onRetry, className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center rounded-3xl border border-danger/20 bg-danger-soft/40 px-6 py-14 text-center', className)}>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger-ink">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description || error?.message || 'We could not load this content. Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-6" leftIcon={RefreshCw} onClick={() => onRetry()}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Centered spinner for route/section loading. */
export function LoadingState({ label = 'Loading…', className, fullPage }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-muted', fullPage ? 'min-h-[60vh]' : 'py-16', className)} role="status" aria-live="polite">
      <Spinner className="size-6 text-brand" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Inline success confirmation. */
export function SuccessState({ title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center text-center', className)} role="status">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success-ink"
      >
        <CircleCheck className="size-7" aria-hidden="true" />
      </motion.span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Shimmer placeholder. */
export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-lg', className)} aria-hidden="true" />;
}

/** Common skeleton compositions. */
export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={cn('rounded-3xl border border-line bg-surface p-5 shadow-soft', className)} aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 5, className }) {
  return (
    <div className={cn('divide-y divide-line rounded-3xl border border-line bg-surface shadow-soft', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="ml-auto hidden h-3.5 w-24 sm:block" />
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
