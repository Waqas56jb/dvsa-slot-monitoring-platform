import { createRandom, NOW, DAY, HOUR, MINUTE } from '@/lib/mock'
import { subscriptions } from './subscriptions'

const r = createRandom(6060)
const hex = (n) => Array.from({ length: n }, () => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[r.int(0, 33)]).join('')

/** Payments are records mirrored from the (future) payment provider webhook. */
export const payments = []
for (const s of subscriptions) {
  const count = Math.min(s.cycles + 1, 6)
  for (let c = 0; c < count; c++) {
    const date = NOW - c * 30 * DAY - r.int(0, 3) * DAY - r.int(0, 23) * HOUR - r.int(0, 59) * MINUTE
    if (date < new Date(s.startDate).getTime()) break
    let status = 'Paid'
    if (c === 0 && s.status === 'Past_due') status = 'Failed'
    else if (c === 0 && s.status === 'Trialing') status = 'Pending'
    else status = r.weighted([['Paid', 96], ['Refunded', 2.5], ['Failed', 1.5]])
    payments.push({
      id: `TXN-${hex(10)}`,
      userId: s.userId,
      subscriptionId: s.id,
      plan: s.plan,
      amount: s.price,
      currency: 'GBP',
      method: s.paymentMethod,
      status,
      failureReason: status === 'Failed' ? r.pick(['Card declined by issuer', 'Insufficient funds', 'Authentication (3DS) not completed']) : null,
      refundedAt: status === 'Refunded' ? new Date(date + r.int(1, 5) * DAY).toISOString() : null,
      invoiceNumber: `INV-${new Date(date).getFullYear()}-${String(r.int(10000, 99999))}`,
      date: new Date(date).toISOString(),
    })
  }
}
payments.sort((a, b) => new Date(b.date) - new Date(a.date))

export const paymentById = (id) => payments.find((p) => p.id === id)
