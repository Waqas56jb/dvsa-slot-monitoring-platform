import { MoreHorizontal } from 'lucide-react'
import { DropdownMenu } from '@/components/common/DropdownMenu'
import { Button } from '@/components/common/Button'

/** Row-level "⋯" menu. items: same shape as DropdownMenu items. */
export function ActionMenu({ items, label = 'Row actions', size = 'sm' }) {
  const visible = items.filter((i) => i && !i.hidden)
  if (!visible.length) return null
  return (
    <DropdownMenu
      items={visible}
      trigger={<Button variant="ghost" size={size} iconOnly icon={MoreHorizontal} aria-label={label} className="text-ink-3" />}
    />
  )
}
