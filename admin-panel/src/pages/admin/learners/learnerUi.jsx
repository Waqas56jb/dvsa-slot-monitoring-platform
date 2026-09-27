import { Link } from 'react-router-dom'
import { ShieldCheck, ShieldQuestion, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/common/StatusBadge'
import { Tooltip } from '@/components/common/Tooltip'
import { cn } from '@/utils/cn'

export const REFERENCE_STATUSES = ['Verified', 'Pending verification', 'Unverified']
export const TEST_TYPES = ['Car (manual)', 'Car (automatic)', 'Motorcycle']
export const LEARNER_STATUSES = ['Active', 'Inactive']

const REF_META = {
  Verified: { tone: 'success', icon: ShieldCheck },
  'Pending verification': { tone: 'warning', icon: ShieldQuestion },
  Unverified: { tone: 'neutral', icon: ShieldAlert },
}

/** Verification state of a learner's licence/reference identifier. */
export function ReferenceStatusBadge({ status, size }) {
  const meta = REF_META[status] || REF_META.Unverified
  const Icon = meta.icon
  return (
    <Badge tone={meta.tone} size={size}>
      <span className="inline-flex items-center gap-1">
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
        {status || 'Unverified'}
      </span>
    </Badge>
  )
}

/** Masked reference + status stacked, for table cells. Never renders the raw value. */
export function ReferenceCell({ masked, status }) {
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span className="font-mono text-[12.5px] tracking-wide text-ink-2" aria-label="Licence reference (masked)">{masked || '—'}</span>
      <ReferenceStatusBadge status={status} size="sm" />
    </span>
  )
}

/**
 * Compact list of centre names: first `max` then "+N" with the rest in a tooltip.
 * centres: [{ id, shortName, name }]
 */
export function CentreList({ centres = [], max = 2, link = false, className }) {
  const list = centres.filter(Boolean)
  if (!list.length) return <span className="text-ink-4">None</span>
  const shown = list.slice(0, max)
  const rest = list.slice(max)
  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-1', className)}>
      {shown.map((c) => (
        link ? (
          <Link
            key={c.id}
            to={`/admin/test-centres/${c.id}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[10rem] truncate rounded-md border border-line bg-subtle px-1.5 py-px text-xs text-ink-2 hover:border-line-strong hover:text-ink"
          >
            {c.shortName || c.name}
          </Link>
        ) : (
          <span key={c.id} className="max-w-[10rem] truncate rounded-md border border-line bg-subtle px-1.5 py-px text-xs text-ink-2">{c.shortName || c.name}</span>
        )
      ))}
      {rest.length > 0 && (
        <Tooltip content={rest.map((c) => c.shortName || c.name).join(', ')}>
          <button type="button" onClick={(e) => e.stopPropagation()} className="rounded-md px-1 text-xs font-medium text-ink-3 hover:text-ink" aria-label={`${rest.length} more centres: ${rest.map((c) => c.shortName || c.name).join(', ')}`}>
            +{rest.length}
          </button>
        </Tooltip>
      )}
    </span>
  )
}
