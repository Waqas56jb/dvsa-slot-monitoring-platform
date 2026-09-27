import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tooltip } from './Tooltip'

/** Usage meter: <ProgressBar value={3} max={5} label="Learners" /> */
export function ProgressBar({ value = 0, max = 100, label, showValue = true, tone, className, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100))
  const color = tone === 'danger' || (tone == null && pct >= 90) ? 'bg-danger-dot' : tone === 'warning' || (tone == null && pct >= 75) ? 'bg-warning-dot' : 'bg-brand-500'
  return (
    <div className={cn('min-w-0', className)}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          {label && <span className="truncate text-ink-3">{label}</span>}
          {showValue && <span className="font-medium text-ink-2 tabular">{value}/{max}</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-muted', size === 'sm' ? 'h-1' : 'h-1.5')} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={typeof label === 'string' ? label : undefined}>
        <div className={cn('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Monospace ID with copy-to-clipboard. */
export function CopyId({ value, to, className }) {
  const [copied, setCopied] = useState(false)
  const copy = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400) } catch { /* clipboard blocked */ }
  }
  const text = <span className="truncate font-mono text-[12.5px]">{value}</span>
  return (
    <span className={cn('group inline-flex max-w-full items-center gap-1', className)}>
      {to ? <Link to={to} className="min-w-0 truncate text-brand-600 hover:underline dark:text-brand-300" onClick={(e) => e.stopPropagation()}>{text}</Link> : <span className="min-w-0 text-ink-2">{text}</span>}
      <Tooltip content={copied ? 'Copied' : 'Copy'}>
        <button type="button" onClick={copy} className="rounded p-0.5 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink focus:opacity-100" aria-label={`Copy ${value}`}>
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        </button>
      </Tooltip>
    </span>
  )
}

/**
 * Sensitive value, masked by default. Revealing is permission-gated; `onReveal`
 * must call a dedicated, audited service endpoint that returns the raw value.
 */
export function MaskedValue({ masked, onReveal, canReveal = false, className }) {
  const [revealed, setRevealed] = useState(null)
  const [busy, setBusy] = useState(false)
  const toggle = async () => {
    if (revealed) { setRevealed(null); return }
    setBusy(true)
    try {
      const v = await onReveal?.()
      if (v) { setRevealed(v); setTimeout(() => setRevealed(null), 15000) }
    } catch {
      // Caller surfaces the error (e.g. toast); stay masked.
    } finally { setBusy(false) }
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="font-mono text-[13px] tracking-wide text-ink">{revealed || masked}</span>
      {canReveal && onReveal && (
        <Tooltip content={revealed ? 'Hide' : 'Reveal for 15s (audited)'}>
          <button type="button" onClick={toggle} disabled={busy} className="rounded p-1 text-ink-3 hover:bg-subtle hover:text-ink" aria-label={revealed ? 'Hide value' : 'Reveal value'}>
            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </Tooltip>
      )}
    </span>
  )
}

/** Keyboard key hint. */
export const Kbd = ({ children, className }) => (
  <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-subtle px-1 font-sans text-[11px] font-medium text-ink-3', className)}>{children}</kbd>
)

/** Inline text link to an entity detail page. */
export const EntityLink = ({ to, children, className, mono }) => (
  <Link to={to} onClick={(e) => e.stopPropagation()} className={cn('text-ink hover:text-brand-600 hover:underline underline-offset-2 dark:hover:text-brand-300', mono && 'font-mono text-[12.5px]', className)}>{children}</Link>
)

/** Section heading inside cards/pages. */
export const SectionTitle = ({ children, action, className }) => (
  <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
    <h3 className="text-[13px] font-semibold tracking-wide text-ink-3 uppercase">{children}</h3>
    {action}
  </div>
)
