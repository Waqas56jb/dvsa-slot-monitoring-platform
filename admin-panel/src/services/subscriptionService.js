import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { subscriptions, subscriptionById, PLANS } from '@/data/subscriptions'
import { payments } from '@/data/payments'
import { userById } from '@/data/users'
import { userSummary } from './_joins'

const enrich = (s) => ({ ...s, user: userSummary(s.userId) })

const mock = {
  async getPlans() { await delay(80, 150); return clone(Object.values(PLANS)) },
  async getSubscriptions(query = {}) {
    await delay()
    const rows = subscriptions.map((s) => ({ ...s, userName: userSummary(s.userId)?.name, userEmail: userSummary(s.userId)?.email }))
    const res = applyListQuery(rows, { ...query, searchFields: ['id', 'userName', 'userEmail', 'plan'] })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map(enrich) })
  },
  async getSummary() {
    await delay(150, 250)
    const active = subscriptions.filter((s) => ['Active', 'Trialing'].includes(s.status))
    const mrr = active.filter((s) => s.status === 'Active').reduce((a, s) => a + s.price, 0)
    const byPlan = Object.keys(PLANS).map((p) => ({ name: p, value: active.filter((s) => s.plan === p).length }))
    return { active: active.length, mrr, pastDue: subscriptions.filter((s) => s.status === 'Past_due').length, cancelled30d: subscriptions.filter((s) => s.cancelledAt && Date.now() - new Date(s.cancelledAt) < 30 * 864e5).length, byPlan }
  },
  async getSubscriptionById(id) {
    await delay()
    const s = subscriptionById(id)
    if (!s) throw notFound('Subscription', id)
    const u = userById(s.userId)
    return clone({ ...enrich(s), planDetails: PLANS[s.plan], payments: payments.filter((p) => p.subscriptionId === id), userDetails: u ? { learnersCount: u.learnersCount, activeMonitoring: u.activeMonitoring } : null })
  },
  async changePlan(id, plan) {
    await delay(500, 800)
    const s = subscriptionById(id)
    if (!s) throw notFound('Subscription', id)
    if (!PLANS[plan]) throw new ApiError('Unknown plan.', { status: 422 })
    if (s.plan === plan) throw new ApiError(`This subscription is already on the ${plan} plan.`, { status: 409, code: 'NO_CHANGE' })
    const prev = s.plan
    Object.assign(s, { plan, price: PLANS[plan].price, learnerLimit: PLANS[plan].learnerLimit, monitoringLimit: PLANS[plan].monitoringLimit })
    recordAdminAction({ action: 'Changed subscription plan', resource: 'Subscription', resourceId: id, changes: { plan: [prev, plan] }, href: `/admin/subscriptions/${id}` })
    return clone(enrich(s))
  },
  /**
   * immediate=true  → access ends now (status Cancelled, no renewal).
   * immediate=false → stays active until the current period ends (cancelAtPeriodEnd).
   */
  async cancelSubscription(id, { immediate = false, reason } = {}) {
    await delay(500, 800)
    const s = subscriptionById(id)
    if (!s) throw notFound('Subscription', id)
    if (['Cancelled', 'Expired'].includes(s.status)) throw new ApiError('This subscription has already ended.', { status: 409, code: 'INVALID_STATE' })
    const prev = s.status
    s.cancelledAt = new Date().toISOString()
    s.cancelReason = reason || null
    if (immediate || !s.renewalDate) {
      s.status = 'Cancelled'
      s.renewalDate = null
      s.cancelAtPeriodEnd = false
    } else {
      s.cancelAtPeriodEnd = true
    }
    recordAdminAction({
      action: immediate ? 'Cancelled subscription' : 'Scheduled subscription cancellation',
      resource: 'Subscription', resourceId: id, changes: { status: [prev, s.status] }, href: `/admin/subscriptions/${id}`,
      description: reason ? `Reason: ${reason}` : undefined,
    })
    return clone(enrich(s))
  },
  async extendSubscription(id, days) {
    await delay()
    const s = subscriptionById(id)
    if (!s) throw notFound('Subscription', id)
    if (['Cancelled', 'Expired'].includes(s.status)) throw new ApiError('Ended subscriptions cannot be extended.', { status: 409, code: 'INVALID_STATE' })
    const base = s.renewalDate ? new Date(s.renewalDate).getTime() : Date.now()
    s.renewalDate = new Date(base + days * 864e5).toISOString()
    recordAdminAction({ action: `Extended subscription by ${days} days`, resource: 'Subscription', resourceId: id, href: `/admin/subscriptions/${id}` })
    return clone(enrich(s))
  },
}

const api = {
  getPlans: () => apiClient.get('/api/admin/plans').then(unwrap),
  getSubscriptions: (q) => apiClient.get('/api/admin/subscriptions', { params: toParams(q) }).then(unwrapList),
  getSummary: () => apiClient.get('/api/admin/subscriptions/summary').then(unwrap),
  getSubscriptionById: (id) => apiClient.get(`/api/admin/subscriptions/${id}`).then(unwrap),
  changePlan: (id, plan) => apiClient.patch(`/api/admin/subscriptions/${id}`, { plan }).then(unwrap),
  cancelSubscription: (id, body) => apiClient.post(`/api/admin/subscriptions/${id}/cancel`, body).then(unwrap),
  extendSubscription: (id, days) => apiClient.post(`/api/admin/subscriptions/${id}/extend`, { days }).then(unwrap),
}

export const subscriptionService = defineService(mock, api)
