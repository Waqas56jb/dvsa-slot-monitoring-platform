import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Field, controlClasses, describedBy } from './Field';

/**
 * Text input with label, hint, error, optional leading icon and trailing slot.
 * `type="password"` gets a show/hide toggle automatically.
 */
export const Input = forwardRef(function Input(
  { id, name, label, hint, error, required, optional, icon: Icon, trailing, className, inputClassName, type = 'text', labelAction, ...rest },
  ref,
) {
  const inputId = id || name;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} optional={optional} className={className} labelAction={labelAction}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-subtle" aria-hidden="true" />}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={isPassword && reveal ? 'text' : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className={controlClasses(error, cn('h-12 px-3.5', Icon && 'pl-11', (isPassword || trailing) && 'pr-12', inputClassName))}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        ) : trailing ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ id, name, label, hint, error, required, optional, className, rows = 4, ...rest }, ref) {
  const inputId = id || name;
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={controlClasses(error, 'resize-y px-3.5 py-3 leading-relaxed')}
        {...rest}
      />
    </Field>
  );
});
