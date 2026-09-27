import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { slots, slotById } from '@/data/slots'
import { monitoringById } from '@/data/monitoring'
import { notifications } from '@/data/notifications'
import { centreSummary, learnerSummary, userSummary } from './_joins'

/** Statuses an admin may set manually. "Booked" is backend-confirmed only and never admin-settable. */
export const ADMIN_SETTABLE_SLOT_STATUSES = ['Viewed', 'Expired', 'Unavailable']

const HOUR_MS = 3600e3
const DETECTED_WINDOWS = { '1h': HOUR_MS, '24h': 24 * HOUR_MS, '7d': 7 * 24 * HOUR_MS }

/**
 * Named filters (plain values, same as the API query string):
 *   centreId[], status[], alertStatus[],
 *   testDate ('7'|'14'|'30' → test date within the next N days),
 *   timeOfDay ('morning' → before 12:00 | 'afternoon' → 12:00 or later),
 *   detected ('1h'|'24h'|'7d' → detected within the window)
 */
function slotFilters({ testDate, timeOfDay, detected, ...rest } = {}) {
  const f = { ...rest }
  if (testDate) {
    const days = Number(testDate)
    f.testDate = (s) => {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      const t = new Date(`${s.testDate}T00:00:00`).getTime()
      return t >= start.getTime() && t <= start.getTime() + days * 24 * HOUR_MS
    }
  }
  if (timeOfDay === 'morning') f.timeOfDay = (s) => s.testTime < '12:00'
  if (timeOfDay === 'afternoon') f.timeOfDay = (s) => s.testTime >= '12:00'
  if (DETECTED_WINDOWS[detected]) f.detected = (s) => Date.now() - new Date(s.detectedAt).getTime() <= DETECTED_WINDOWS[detected]
  return f
}

const enrich = (s) => ({ ...s, centre: centreSummary(s.centreId), user: userSummary(s.userId), learner: learnerSummary(s.learnerId) })

/** Lifecycle timeline. "Booked" only appears when the backend has confirmed it. */
function timelineFor(s, alerts) {
  const t0 = new Date(s.detectedAt).getTime()
  const ev = [
    { title: 'Slot detected', description: `Availability observed at ${centreSummary(s.centreId)?.shortName}`, at: s.detectedAt, tone: 'brand' },
    { title: 'Filter matched', description: `${s.matchedJobIds.length} monitoring job(s) matched preferences`, at: new Date(t0 + 900).toISOString(), tone: 'info' },
  ]
  if (alerts.length) {
    ev.push({ title: 'User notification created', description: alerts.map((a) => a.channel).join(', '), at: alerts[0].createdAt, tone: 'info' })
    const delivered = alerts.find((a) => a.deliveredAt)
    if (delivered) ev.push({ title: 'Notification delivered', description: `${delivered.channel} · ${delivered.id}`, at: delivered.deliveredAt, tone: 'success' })
    const failed = alerts.find((a) => a.status === 'Failed')
    if (failed) ev.push({ title: 'Delivery failed', description: `${failed.channel} — ${failed.error}`, at: failed.createdAt, tone: 'danger' })
  }
  if (['Viewed', 'Booked', 'Read'].includes(s.status) || alerts.some((a) => a.status === 'Read')) ev.push({ title: 'User opened alert', at: new Date(t0 + 4 * 60e3).toISOString(), tone: 'neutral' })
  if (s.status === 'Booked') ev.push({ title: 'Booking confirmed by backend', description: 'User completed booking through the official service', at: s.updatedAt, tone: 'success' })
  if (['Expired', 'Unavailable'].includes(s.status)) ev.push({ title: `Slot status changed → ${s.status}`, description: s.sourceStatus, at: s.updatedAt, tone: 'neutral' })
  return ev.sort((a, b) => new Date(a.at) - new Date(b.at))
}

const mock = {
  async getSlots(query = {}) {
    await delay()
    const rows = slots.map((s) => ({ ...s, centreName: centreSummary(s.centreId)?.name, userName: userSummary(s.userId)?.name, learnerName: learnerSummary(s.learnerId)?.name }))
    const res = applyListQuery(rows, { ...query, filters: slotFilters(query.filters), searchFields: ['id', 'centreName', 'userName', 'learnerName', 'monitoringId'] })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map(enrich) })
  },
  async getRecentSlots(limit = 8) {
    await delay(150, 300)
    return clone(slots.slice(0, limit).map(enrich))
  },
  async getSlotById(id) {
    await delay()
    const s = slotById(id)
    if (!s) throw notFound('Slot', id)
    const alerts = notifications.filter((n) => n.slotId === id)
    return clone({
      ...enrich(s),
      matchedJobs: s.matchedJobIds.map(monitoringById).filter(Boolean).map((j) => ({ ...j, user: userSummary(j.userId), learner: learnerSummary(j.learnerId) })),
      alerts,
      timeline: timelineFor(s, alerts),
    })
  },
  async updateSlotStatus(id, status) {
    await delay()
    if (!ADMIN_SETTABLE_SLOT_STATUSES.includes(status)) {
      throw new ApiError(`Slots cannot be manually marked as ${status}.`, { status: 422, code: 'INVALID_STATUS' })
    }
    const s = slotById(id)
    if (!s) throw notFound('Slot', id)
    if (s.status === 'Booked') throw new ApiError('This booking was confirmed by the backend and cannot be changed.', { status: 409, code: 'INVALID_STATE' })
    const prev = s.status
    s.status = status
    s.updatedAt = new Date().toISOString()
    recordAdminAction({ action: 'Changed slot status', resource: 'Slot', resourceId: id, changes: { status: [prev, status] }, href: `/admin/slots/${id}` })
    return clone(enrich(s))
  },
  async exportSlots(query = {}) {
    await delay(400, 700)
    const { data } = await mock.getSlots({ ...query, page: 1, pageSize: 1e9 })
    recordAdminAction({ action: 'Exported data', resource: 'Slots', resourceId: `${data.length} rows` })
    return data
  },
}

const api = {
  getSlots: (q) => apiClient.get('/api/admin/slots', { params: toParams(q) }).then(unwrapList),
  getRecentSlots: (limit) => apiClient.get('/api/admin/slots', { params: { pageSize: limit, sort: 'detectedAt', order: 'desc' } }).then(unwrap),
  getSlotById: (id) => apiClient.get(`/api/admin/slots/${id}`).then(unwrap),
  updateSlotStatus: (id, status) => apiClient.patch(`/api/admin/slots/${id}`, { status }).then(unwrap),
  exportSlots: (q) => apiClient.get('/api/admin/slots/export', { params: toParams(q) }).then(unwrap),
}

export const slotService = defineService(mock, api)
