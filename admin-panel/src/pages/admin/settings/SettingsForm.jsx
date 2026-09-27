import { useId } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Toggle } from '@/components/forms/Fields'
import { cn } from '@/utils/cn'

/**
 * Card-shaped form for one settings section. The <fieldset disabled> makes
 * every control read-only in one place when the admin can't manage settings.
 */
export function SettingsForm({ section, title, description, dirty, saving, readOnly, onSubmit, onReset, children }) {
  const headingId = useId()
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      noValidate
      aria-labelledby={headingId}
      className="card min-w-0"
      data-section={section}
    >
      <header className="border-b border-line px-4 py-4 sm:px-6">
        <h2 id={headingId} className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </header>
      <fieldset disabled={readOnly || saving} className="min-w-0 divide-y divide-line px-4 sm:px-6">
        <legend className="sr-only">{title} settings</legend>
        {children}
      </fieldset>
      {!readOnly && (
        <footer className="flex flex-col-reverse gap-3 border-t border-line bg-subtle/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-b-card sm:px-6">
          <p className={cn('text-[13px]', dirty ? 'text-warning' : 'text-ink-4')} aria-live="polite">
            {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
          </p>
          <div className="flex gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
            <Button variant="secondary" onClick={onReset} disabled={!dirty || saving}>Reset</Button>
            <Button type="submit" variant="primary" icon={Save} loading={saving} disabled={!dirty}>Save changes</Button>
          </div>
        </footer>
      )}
    </form>
  )
}

/**
 * Label + description on the left, control on the right (stacked on mobile).
 * children is a render prop receiving { id, 'aria-describedby', 'aria-invalid', error }.
 */
export function SettingRow({ label, description, error, required, children, className }) {
  const id = useId()
  const describedBy = [description && `${id}-desc`, error && `${id}-err`].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,280px)] sm:items-start sm:gap-8', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
        </label>
        {description && <p id={`${id}-desc`} className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </div>
      <div className="min-w-0">
        {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, error })}
        {error && <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-danger" role="alert">{error}</p>}
      </div>
    </div>
  )
}

export function ToggleRow({ label, description, checked, onChange, extra, className }) {
  return (
    <div className={cn('py-4', className)}>
      <Toggle label={label} description={description} checked={checked} onChange={onChange} />
      {extra && <div className="mt-2">{extra}</div>}
    </div>
  )
}

/** Group of related rows with a visible legend (e.g. "Alert channels"). */
export function SettingGroup({ legend, description, error, children }) {
  return (
    <fieldset className="min-w-0 py-4">
      <legend className="float-left w-full text-sm font-semibold text-ink">{legend}</legend>
      {description && <p className="clear-both pt-0.5 text-[13px] text-ink-3">{description}</p>}
      <div className="clear-both divide-y divide-line">{children}</div>
      {error && <p className="mt-1 text-xs font-medium text-danger" role="alert">{error}</p>}
    </fieldset>
  )
}

/** Small unit label rendered inside an Input's `suffix` slot. */
export const Unit = ({ children }) => <span className="pointer-events-none pr-1.5 text-xs text-ink-4">{children}</span>
