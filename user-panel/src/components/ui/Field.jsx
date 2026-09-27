import { CircleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Label + hint + error wrapper shared by all form controls. */
export function Field({ id, label, hint, error, required, optional, className, children, labelAction }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || labelAction) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-ink">
              {label}
              {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
              {optional && <span className="ml-1.5 text-xs font-normal text-subtle">Optional</span>}
            </label>
          )}
          {labelAction}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] text-danger-ink" role="alert">
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const controlClasses = (error, extra) =>
  cn(
    'w-full rounded-xl border bg-surface text-[15px] text-ink placeholder:text-subtle shadow-[0_1px_2px_rgb(15_23_42/0.04)]',
    'transition-[border-color,box-shadow] duration-150 outline-none',
    'focus:border-brand focus:ring-4 focus:ring-brand/12',
    'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted',
    error ? 'border-danger/70 focus:border-danger focus:ring-danger/12' : 'border-line-strong hover:border-subtle/60',
    extra,
  );

export const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);
