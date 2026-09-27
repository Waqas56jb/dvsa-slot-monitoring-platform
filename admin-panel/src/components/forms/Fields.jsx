import { forwardRef, useId, useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'

const controlBase =
  'w-full rounded-lg border bg-surface text-sm text-ink placeholder:text-ink-4 transition-[border-color,box-shadow] duration-150 ' +
  'focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-ink-3'
const controlBorder = (error) => (error ? 'border-danger-dot focus:border-danger-dot focus:ring-danger-dot/15' : 'border-line-strong hover:border-ink-4')

/**
 * Wraps any control with label / hint / error. Passes `id` + aria props to the child via render prop.
 * <FormField label="Email" required hint="…" error={errors.email}>{(p) => <Input {...p} />}</FormField>
 */
export function FormField({ label, hint, error, required, children, className, labelAction, htmlFor }) {
  const autoId = useId()
  const id = htmlFor || autoId
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
            {label}
            {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
          </label>
          {labelAction}
        </div>
      )}
      {typeof children === 'function' ? children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, error }) : children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-3">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger" role="alert">{error}</p>}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, error, icon: Icon, suffix, size = 'md', ...props }, ref) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-4" aria-hidden />}
      <input
        ref={ref}
        className={cn(controlBase, controlBorder(error), size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-10 px-3', Icon && 'pl-9', suffix && 'pr-10', className)}
        {...props}
      />
      {suffix && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{suffix}</div>}
    </div>
  )
})

export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false)
  return (
    <Input
      ref={ref}
      type={show ? 'text' : 'password'}
      {...props}
      suffix={
        <button type="button" onClick={() => setShow((s) => !s)} className="rounded-md p-1.5 text-ink-3 hover:bg-subtle hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  )
})

export const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(controlBase, controlBorder(error), 'px-3 py-2.5 leading-relaxed', className)} {...props} />
})

/** Native select, styled. options: [{ value, label }] or strings. */
export const Select = forwardRef(function Select({ className, error, options = [], placeholder, size = 'md', ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(controlBase, controlBorder(error), 'appearance-none pr-9', size === 'sm' ? 'h-8 pl-2.5 text-[13px]' : 'h-10 pl-3', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
    </div>
  )
})

export function Checkbox({ checked, indeterminate, onChange, label, description, className, disabled, id, ...props }) {
  const autoId = useId()
  const cid = id || autoId
  return (
    <label htmlFor={cid} className={cn('inline-flex items-start gap-2.5', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer', className)}>
      <input
        id={cid}
        type="checkbox"
        ref={(el) => { if (el) el.indeterminate = !!indeterminate && !checked }}
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked, e)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong accent-brand-600"
        {...props}
      />
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm text-ink">{label}</span>}
          {description && <span className="block text-xs text-ink-3">{description}</span>}
        </span>
      )}
    </label>
  )
}

/** Accessible switch. <Toggle checked onChange={(v)=>…} label="…" description="…" /> */
export function Toggle({ checked, onChange, label, description, disabled, size = 'md', className, id, 'aria-label': ariaLabel }) {
  const autoId = useId()
  const tid = id || autoId
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5'
  const button = (
    <button
      id={tid}
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={!label ? ariaLabel : undefined}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn('relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50', track, checked ? 'bg-brand-600' : 'bg-line-strong dark:bg-muted')}
    >
      <span className={cn('rounded-full bg-white shadow-sm transition-transform duration-200', knob, checked ? shift : 'translate-x-0')} />
    </button>
  )
  if (!label) return <span className={className}>{button}</span>
  return (
    <div className={cn('flex items-start justify-between gap-6', className)}>
      <label htmlFor={tid} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-ink-3">{description}</span>}
      </label>
      {button}
    </div>
  )
}

export function RadioCards({ value, onChange, options, name, columns = 2 }) {
  return (
    <div role="radiogroup" className={cn('grid gap-2.5', columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : '')}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <label key={o.value} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors', active ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-line hover:border-line-strong hover:bg-subtle')}>
            <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="mt-0.5 accent-brand-600" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{o.label}</span>
              {o.description && <span className="mt-0.5 block text-xs text-ink-3">{o.description}</span>}
            </span>
          </label>
        )
      })}
    </div>
  )
}
