import { forwardRef, useId } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Checkbox with label. Accepts `checked` or (from useForm) `value`. */
export const Checkbox = forwardRef(function Checkbox({ id, name, label, description, checked, value, onChange, error, className, disabled, ...rest }, ref) {
  const auto = useId();
  const inputId = id || name || auto;
  const isChecked = checked ?? Boolean(value);
  return (
    <div className={className}>
      <label htmlFor={inputId} className={cn('group flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60')}>
        <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="checkbox"
            checked={isChecked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'peer size-5 cursor-pointer appearance-none rounded-md border bg-surface transition-colors',
              'checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              error ? 'border-danger' : 'border-line-strong group-hover:border-subtle',
            )}
            {...rest}
          />
          <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
        </span>
        {(label || description) && (
          <span className="text-sm leading-snug">
            {label && <span className="font-medium text-ink">{label}</span>}
            {description && <span className="mt-0.5 block text-muted">{description}</span>}
          </span>
        )}
      </label>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 pl-8 text-[13px] text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
});

/** Accessible toggle switch (role="switch"). */
export function Switch({ id, checked, onChange, label, description, disabled, size = 'md', className, icon: Icon }) {
  const auto = useId();
  const switchId = id || auto;
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'size-4' : 'size-5';
  const travel = size === 'sm' ? 16 : 20;
  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ? undefined : 'Toggle'}
      aria-labelledby={label ? `${switchId}-label` : undefined}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:opacity-50',
        track,
        checked ? 'bg-brand' : 'bg-line-strong',
      )}
    >
      <motion.span
        className={cn('rounded-full bg-white shadow-sm', knob)}
        animate={{ x: checked ? travel : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
      />
    </button>
  );
  if (!label) return <span className={className}>{control}</span>;
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-soft">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <label id={`${switchId}-label`} htmlFor={switchId} className="block cursor-pointer text-sm font-medium text-ink">
            {label}
          </label>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
      </div>
      {control}
    </div>
  );
}

/**
 * Large selectable card used for radio/checkbox choices (onboarding, wizards).
 * Render inside a container with role="radiogroup" or role="group".
 */
export function ChoiceCard({ selected, onSelect, title, description, icon: Icon, multiple = false, className, children, disabled }) {
  return (
    <button
      type="button"
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-150',
        selected
          ? 'border-brand bg-brand-soft/60 ring-4 ring-brand/10'
          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted/60',
        disabled && 'opacity-50',
        className,
      )}
    >
      {Icon && (
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors', selected ? 'bg-brand text-white' : 'bg-surface-muted text-ink-soft')}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
        {children}
      </span>
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-colors',
          multiple ? 'rounded-md' : 'rounded-full',
          selected ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface',
        )}
        aria-hidden="true"
      >
        {selected && <Check className="size-3" strokeWidth={3.5} />}
      </span>
    </button>
  );
}

/** Compact segmented control (e.g. Light / Dark / System). options: [{ value, label, icon }] */
export function SegmentedControl({ options, value, onChange, label, className, size = 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-xl border border-line bg-surface-muted p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors',
              size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span layoutId={`seg-${label}`} className="absolute inset-0 rounded-lg bg-surface shadow-soft ring-1 ring-line" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.icon && <o.icon className="size-4" aria-hidden="true" />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
