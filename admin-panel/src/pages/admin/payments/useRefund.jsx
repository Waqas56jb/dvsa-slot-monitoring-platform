import { useCallback } from 'react'
import { useConfirm } from '@/components/modals/ConfirmModal'
import { usePermission } from '@/context/AdminAuthContext'
import { useToast } from '@/context/NotificationContext'
import { paymentService } from '@/services/paymentService'
import { PERMISSIONS as P } from '@/constants/permissions'
import { formatCurrency, formatDate } from '@/utils/format'

/**
 * Full refund of a Paid transaction, with required reason.
 * const { canRefund, refund, confirmElement } = useRefund()
 */
export function useRefund() {
  const can = usePermission()
  const toast = useToast()
  const { confirm, confirmElement } = useConfirm()
  const permitted = can(P.PAYMENTS_REFUND)

  const refund = useCallback((p, onDone) => confirm({
    title: 'Refund this payment?',
    description: 'The full amount is returned to the original payment method. This cannot be undone.',
    confirmLabel: `Refund ${formatCurrency(p.amount, p.currency)}`,
    requireReason: true,
    reasonLabel: 'Reason for refund',
    children: (
      <dl className="divide-y divide-line rounded-lg border border-line bg-subtle text-[13px]">
        <div className="flex items-baseline justify-between gap-4 px-3.5 py-3">
          <dt className="text-ink-3">Refund amount</dt>
          <dd className="text-xl font-semibold tracking-tight text-ink tabular">{formatCurrency(p.amount, p.currency)}</dd>
        </div>
        <div className="flex justify-between gap-4 px-3.5 py-2"><dt className="text-ink-3">Transaction</dt><dd className="font-mono text-[12.5px] text-ink-2">{p.id}</dd></div>
        <div className="flex justify-between gap-4 px-3.5 py-2"><dt className="text-ink-3">Customer</dt><dd className="truncate text-ink-2">{p.user?.name ?? p.userId}</dd></div>
        <div className="flex justify-between gap-4 px-3.5 py-2"><dt className="text-ink-3">Method</dt><dd className="truncate text-ink-2">{p.method}</dd></div>
        <div className="flex justify-between gap-4 px-3.5 py-2"><dt className="text-ink-3">Paid on</dt><dd className="text-ink-2">{formatDate(p.date)}</dd></div>
      </dl>
    ),
    onConfirm: async (reason) => {
      const updated = await paymentService.refundPayment(p.id, { reason })
      onDone?.(updated)
      toast.success(`Refund of ${formatCurrency(updated.refundAmount ?? p.amount, p.currency)} issued.`)
    },
  }), [confirm, toast])

  return { canRefund: (p) => permitted && p?.status === 'Paid', refund, confirmElement }
}
