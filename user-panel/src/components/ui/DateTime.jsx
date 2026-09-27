import { forwardRef } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import { Field, controlClasses, describedBy } from './Field';
import { cn } from '@/utils/cn';
import { toISODate } from '@/utils/format';

/**
 * Date picker built on the native control (keyboard + screen-reader friendly,
 * native mobile pickers). Value is an ISO date string: yyyy-mm-dd.
 */
export const DatePicker = forwardRef(function DatePicker(
  { id, name, label, hint, error, required, optional, className, min, max, disablePast = true, ...rest },
  ref,
) {
  const inputId = id || name;
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="date"
          min={min ?? (disablePast ? toISODate(new Date()) : undefined)}
          max={max}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className={controlClasses(error, 'h-12 pl-11 pr-3 [color-scheme:inherit]')}
          {...rest}
        />
      </div>
    </Field>
  );
});

/** Time picker (24h value "HH:mm", rendered in the user's locale). */
export const TimePicker = forwardRef(function TimePicker(
  { id, name, label, hint, error, required, optional, className, step = 900, ...rest },
  ref,
) {
  const inputId = id || name;
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="relative">
        <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="time"
          step={step}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className={controlClasses(error, 'h-12 pl-11 pr-3')}
          {...rest}
        />
      </div>
    </Field>
  );
});

/** Two date pickers side by side with shared error display. */
export function DateRangePicker({ from, to, onFromChange, onToChange, fromError, toError, fromLabel = 'From', toLabel = 'To', className, idPrefix = 'range' }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <DatePicker id={`${idPrefix}-from`} label={fromLabel} value={from || ''} onChange={(e) => onFromChange(e.target.value)} error={fromError} required />
      <DatePicker id={`${idPrefix}-to`} label={toLabel} value={to || ''} min={from || undefined} onChange={(e) => onToChange(e.target.value)} error={toError} required />
    </div>
  );
}
