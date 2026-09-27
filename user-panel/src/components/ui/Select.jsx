import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Field, controlClasses, describedBy } from './Field';

/**
 * Native select (best accessibility + mobile pickers) with custom styling.
 * options: [{ value, label }]
 */
export const Select = forwardRef(function Select(
  { id, name, label, hint, error, required, optional, options = [], placeholder, className, selectClassName, icon: Icon, size = 'md', ...rest },
  ref,
) {
  const selectId = id || name;
  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />}
        <select
          ref={ref}
          id={selectId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          className={controlClasses(
            error,
            cn('appearance-none pr-10', size === 'sm' ? 'h-10 pl-3 text-sm' : 'h-12 pl-3.5', Icon && 'pl-11', selectClassName),
          )}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
    </Field>
  );
});
