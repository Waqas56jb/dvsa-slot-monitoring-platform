import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { notifications, adminInbox } from '@/data/notifications'
import { userSummary } from './_joins'

/** Tab → status set mapping shared with the API contract (?tab=successful). */
export const NOTIFICATION_TABS = {
  all: null,
  successful: ['Sent', 'Delivered', 'Read'],
  pending: ['Queued'],
  failed: ['Failed'],
}

/** Notification types emitted by the platform (filter options). */
export const NOTIFICATION_TYPES = ['Slot alert', 'Monitoring paused', 'Monitoring expiring', 'Payment receipt', 'Payment failed', 'Welcome']

const mock = {
  /** `tab` may be passed top-level or inside filters (as useListQuery does). */
  async getNotifications(query = {}) {
    await delay()
    const rows = notifications.map((n) => ({ ...n, userName: userSummary(n.userId)?.name, userEmail: userSummary(n.userId)?.email }))
    const { tab: filterTab, ...filters } = query.filters || {}
    const tab = query.tab || filterTab || 'all'
    if (NOTIFICATION_TABS[tab]) {
      const allowed = NOTIFICATION_TABS[tab]
      const picked = filters.status?.length ? filters.status.filter((s) => allowed.includes(s)) : allowed
      // A status filter outside the active tab yields no rows (not "no filter").
      filters.status = picked.length ? picked : () => false
    }
    const res = applyListQuery(rows, { ...query, filters, searchFields: ['id', 'message', 'userName', 'userEmail', 'type'] })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map((n) => ({ ...n, user: userSummary(n.userId) })) })
  },
  async getCounts() {
    await delay(120, 250)
    const counts = { all: notifications.length, successful: 0, pending: 0, failed: 0 }
    for (const n of notifications) for (const [tab, set] of Object.entries(NOTIFICATION_TABS)) if (set?.includes(n.status)) counts[tab]++
    return counts
  },
  async retryNotification(id) {
    await delay(500, 800)
    const n = notifications.find((x) => x.id === id)
    if (!n) throw notFound('Notification', id)
    n.status = 'Queued'
    n.attempts += 1
    n.error = null
    recordAdminAction({ action: 'Retried notification', resource: 'Notification', resourceId: id, href: '/admin/notifications' })
    setTimeout(() => { n.status = 'Delivered'; n.deliveredAt = new Date().toISOString() }, 4000)
    return clone(n)
  },

  // Admin-facing inbox (header bell)
  async getAdminInbox() { await delay(100, 200); return clone(adminInbox) },
  async markInboxRead(id) { await delay(60, 120); const i = adminInbox.find((x) => x.id === id); if (i) i.read = true; return { ok: true } },
  async markAllInboxRead() { await delay(80, 150); adminInbox.forEach((i) => { i.read = true }); return { ok: true } },
}

const api = {
  getNotifications: (q) => apiClient.get('/api/admin/notifications', { params: toParams(q) }).then(unwrapList),
  getCounts: () => apiClient.get('/api/admin/notifications/counts').then(unwrap),
  retryNotification: (id) => apiClient.post(`/api/admin/notifications/${id}/retry`).then(unwrap),
  getAdminInbox: () => apiClient.get('/api/admin/inbox').then(unwrap),
  markInboxRead: (id) => apiClient.post(`/api/admin/inbox/${id}/read`).then(unwrap),
  markAllInboxRead: () => apiClient.post('/api/admin/inbox/read-all').then(unwrap),
}

export const notificationService = defineService(mock, api)
