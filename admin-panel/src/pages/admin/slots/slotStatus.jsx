import { useCallback } from 'react'
import { ArrowRight, CircleSlash, Eye, Hourglass, Info } from 'lucide-react'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { slotService, ADMIN_SETTABLE_SLOT_STATUSES } from '@/services/slotService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { cn } from '@/utils/cn'

const STATUS_COPY = {
  Viewed: { icon: Eye, tone: 'brand', description: 'Records that the user has seen this alert. No notification is sent to the user.' },
  Expired: { icon: Hourglass, tone: 'warning', description: 'Use when the test date has passed or the slot is no longer relevant. The user is not notified.' },
  Unavailable: { icon: CircleSlash, tone: 'warning', description: 'Use when the slot is no longer listed on the official booking service. The user is not notified.' },
}

/**
 * Admin "Mark status" action for slots. Only Viewed / Expired / Unavailable can be
 * set manually — "Booked" is backend-confirmed only and is never offered here.
 *
 * const { menuItems, markStatus, confirmElement } = useSlotStatusAction()
 */
export function useSlotStatusAction() {
  const can = usePermission()
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const allowed = can(P.SLOTS_MANAGE)

  const markStatus = useCallback((slot, status, onDone) => {
    const copy = STATUS_COPY[status]
    return confirm({
      title: `Mark slot as ${status}?`,
      description: `${slot.id} is currently ${slot.status}. ${copy.description}`,
      confirmLabel: `Mark as ${status}`,
      tone: copy.tone,
      onConfirm: async () => {
        const updated = await slotService.updateSlotStatus(slot.id, status)
        onDone?.(updated)
        toast.success(`Slot marked as ${status}.`)
      },
    })
  }, [confirm, toast])

  /** Options that apply to this slot (empty when not permitted or backend-confirmed). */
  const optionsFor = useCallback((slot) => {
    if (!allowed || slot.status === 'Booked') return []
    return ADMIN_SETTABLE_SLOT_STATUSES.filter((s) => s !== slot.status)
  }, [allowed])

  /** DropdownMenu / ActionMenu items. */
  const menuItems = useCallback((slot, onDone) => {
    const opts = optionsFor(slot)
    if (!opts.length) return []
    return [
      { type: 'label', label: 'Mark status' },
      ...opts.map((s) => ({ label: `Mark as ${s}`, icon: STATUS_COPY[s].icon, onSelect: () => markStatus(slot, s, onDone) })),
    ]
  }, [optionsFor, markStatus])

  return { menuItems, markStatus, optionsFor, canManage: allowed, confirmElement }
}

const STAGES = ['Detected', 'Matched', 'Alerted', 'User action']

/** One-line explainer of the slot lifecycle shown above the slots table. */
export function SlotLifecycleLegend({ className }) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:gap-4', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1" aria-label="Slot lifecycle">
        {STAGES.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="rounded-md bg-subtle px-1.5 py-0.5 text-xs font-medium text-ink-2">{s}</span>
            {i < STAGES.length - 1 && <ArrowRight className="h-3 w-3 text-ink-4" aria-hidden />}
          </li>
        ))}
      </ol>
      <p className="flex min-w-0 items-start gap-1.5 text-xs text-ink-3">
        <Info className="mt-px h-3.5 w-3.5 shrink-0 text-ink-4" aria-hidden />
        <span>Slots are availability observations supplied by the backend. <span className="font-medium text-ink-2">Booked</span> is only shown once the backend confirms the user completed a booking themselves.</span>
      </p>
    </div>
  )
}
