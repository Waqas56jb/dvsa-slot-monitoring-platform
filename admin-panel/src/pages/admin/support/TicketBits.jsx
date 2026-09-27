import { ArrowDown, ArrowUp } from 'lucide-react'
import { Badge } from '@/components/common/StatusBadge'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/cn'

/**
 * Priority indicator. Colour is reserved for what needs attention:
 * Urgent is a red pill, High is amber text with an arrow, Normal/Low stay neutral.
 */
export function PriorityLabel({ priority, className }) {
  if (priority === 'Urgent') return <Badge tone="danger" dot className={className}>Urgent</Badge>
  if (priority === 'High') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-[13px] font-medium text-warning', className)}>
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />High
      </span>
    )
  }
  if (priority === 'Low') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-[13px] text-ink-3', className)}>
        <ArrowDown className="h-3.5 w-3.5 text-ink-4" aria-hidden />Low
      </span>
    )
  }
  return <span className={cn('text-[13px] text-ink-2', className)}>{priority || 'Normal'}</span>
}

/** Assigned admin (avatar + name) or a muted "Unassigned". */
export function Assignee({ assignee, meId }) {
  if (!assignee) return <span className="text-[13px] text-ink-4">Unassigned</span>
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar name={assignee.name} size="xs" />
      <span className="truncate text-[13px] text-ink-2">{assignee.name}{assignee.id === meId && <span className="text-ink-4"> (you)</span>}</span>
    </span>
  )
}

export const OPEN_STATUSES = ['Open', 'In Progress', 'Waiting']
