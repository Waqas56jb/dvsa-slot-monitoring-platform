import { APP_NAME } from '@/constants/config'
import { downloadText } from '@/utils/csv'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

/**
 * Plain-text invoice generated client-side from a mirrored payment record.
 * Once the payment provider is connected this should link to the provider's
 * hosted invoice PDF instead.
 */
export function buildInvoiceText(p) {
  const line = '-'.repeat(52)
  const row = (label, value) => `${label.padEnd(20)}${value ?? '—'}`
  const amount = formatCurrency(p.amount, p.currency)
  const out = [
    `${APP_NAME} — Invoice`,
    line,
    row('Invoice number', p.invoiceNumber),
    row('Invoice date', formatDate(p.date)),
    row('Transaction ID', p.id),
    row('Status', p.status),
    '',
    row('Billed to', p.user?.name ?? p.userId),
    p.user?.email ? row('', p.user.email) : null,
    '',
    line,
    row('Description', `${p.plan} plan — monthly subscription`),
    row('Subscription', p.subscriptionId),
    row('Amount', amount),
    line,
    row('Total', `${amount} (${p.currency})`),
    row('Payment method', p.method),
    row('Paid at', p.status === 'Paid' || p.status === 'Refunded' ? formatDateTime(p.date) : '—'),
    p.status === 'Refunded' ? row('Refunded', `${formatCurrency(p.refundAmount ?? p.amount, p.currency)} on ${formatDateTime(p.refundedAt)}`) : null,
    p.status === 'Failed' && p.failureReason ? row('Failure reason', p.failureReason) : null,
    '',
    'Generated from records mirrored from the payment provider.',
    `Generated ${formatDateTime(new Date())}.`,
  ]
  return out.filter((l) => l !== null).join('\r\n')
}

export function downloadInvoice(p) {
  downloadText(`${p.invoiceNumber || p.id}.txt`, buildInvoiceText(p))
}
