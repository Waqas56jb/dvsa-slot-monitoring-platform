import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery, withinDays } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { payments, paymentById } from '@/data/payments'
import { subscriptionById } from '@/data/subscriptions'
import { userSummary } from './_joins'

const enrich = (p) => ({ ...p, user: userSummary(p.userId) })

/** Card brand / wallet derived from the stored method label ("Visa •••• 4242"). */
export const PAYMENT_METHOD_TYPES = ['Visa', 'Mastercard', 'Apple Pay']
export const methodTypeOf = (method = '') => PAYMENT_METHOD_TYPES.find((t) => method.startsWith(t)) || 'Other'

/**
 * Named filters (plain values, same as the API query string):
 *   status[], plan[], methodType[] ('Visa'|'Mastercard'|'Apple Pay'),
 *   range ('7'|'30'|'90' days back), from / to (YYYY-MM-DD, inclusive; London dates)
 */
function paymentFilters({ methodType, range, from, to, ...rest } = {}) {
  const f = { ...rest }
  if (methodType?.length) f.methodType = (p) => methodType.includes(methodTypeOf(p.method))
  if (range) { const within = withinDays(Number(range)); f.range = (p) => within(p.date) }
  if (from) { const t = new Date(`${from}T00:00:00`).getTime(); if (!Number.isNaN(t)) f.from = (p) => new Date(p.date).getTime() >= t }
  if (to) { const t = new Date(`${to}T23:59:59.999`).getTime(); if (!Number.isNaN(t)) f.to = (p) => new Date(p.date).getTime() <= t }
  return f
}

const mock = {
  async getPayments(query = {}) {
    await delay()
    const rows = payments.map((p) => ({ ...p, userName: userSummary(p.userId)?.name, userEmail: userSummary(p.userId)?.email }))
    const res = applyListQuery(rows, { ...query, filters: paymentFilters(query.filters), searchFields: ['id', 'userName', 'userEmail', 'invoiceNumber', 'subscriptionId'] })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map(enrich) })
  },
  async getSummary() {
    await delay(150, 250)
    const last30 = payments.filter((p) => Date.now() - new Date(p.date) < 30 * 864e5)
    const sum = (arr) => arr.reduce((a, p) => a + p.amount, 0)
    return {
      gross30d: sum(last30.filter((p) => p.status === 'Paid')),
      paid30d: last30.filter((p) => p.status === 'Paid').length,
      failed30d: last30.filter((p) => p.status === 'Failed').length,
      refunded30d: sum(last30.filter((p) => p.status === 'Refunded')),
      pending: payments.filter((p) => p.status === 'Pending').length,
      // Daily paid volume for the last 30 days (sparkline)
      daily: Array.from({ length: 30 }, (_, i) => {
        const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (29 - i))
        const end = start.getTime() + 864e5
        return { t: start.getTime(), value: sum(payments.filter((p) => p.status === 'Paid' && new Date(p.date) >= start && new Date(p.date) < end)) }
      }),
    }
  },
  async getPaymentById(id) {
    await delay()
    const p = paymentById(id)
    if (!p) throw notFound('Payment', id)
    return clone({ ...enrich(p), subscription: subscriptionById(p.subscriptionId) || null })
  },
  async refundPayment(id, { reason, amount } = {}) {
    await delay(700, 1000)
    const p = paymentById(id)
    if (!p) throw notFound('Payment', id)
    if (p.status !== 'Paid') throw new ApiError('Only paid transactions can be refunded.', { status: 409, code: 'INVALID_STATE' })
    if (amount != null && (amount <= 0 || amount > p.amount)) throw new ApiError('Refund amount must be between £0.01 and the original amount.', { status: 422, code: 'INVALID_AMOUNT' })
    p.status = 'Refunded'
    p.refundedAt = new Date().toISOString()
    p.refundReason = reason
    p.refundAmount = amount ?? p.amount
    recordAdminAction({ action: 'Issued refund', resource: 'Payment', resourceId: id, changes: { status: ['Paid', 'Refunded'], amount: [null, String(p.refundAmount)] }, href: `/admin/payments/${id}`, description: reason ? `Reason: ${reason}` : undefined })
    return clone(enrich(p))
  },
  async exportPayments(query = {}) {
    await delay(400, 700)
    const { data } = await mock.getPayments({ ...query, page: 1, pageSize: 1e9 })
    recordAdminAction({ action: 'Exported data', resource: 'Payments', resourceId: `${data.length} rows` })
    return data
  },
}

const api = {
  getPayments: (q) => apiClient.get('/api/admin/payments', { params: toParams(q) }).then(unwrapList),
  getSummary: () => apiClient.get('/api/admin/payments/summary').then(unwrap),
  getPaymentById: (id) => apiClient.get(`/api/admin/payments/${id}`).then(unwrap),
  refundPayment: (id, body) => apiClient.post(`/api/admin/payments/${id}/refund`, body).then(unwrap),
  exportPayments: (q) => apiClient.get('/api/admin/payments/export', { params: toParams(q) }).then(unwrap),
}

export const paymentService = defineService(mock, api)
