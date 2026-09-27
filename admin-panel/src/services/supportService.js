import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { sessionAdmin } from '@/lib/session'
import { supportTickets, ticketById } from '@/data/support'
import { userById } from '@/data/users'
import { subscriptions } from '@/data/subscriptions'
import { monitoringById } from '@/data/monitoring'
import { slotById } from '@/data/slots'
import { adminSummary, centreSummary, learnerSummary, userSummary } from './_joins'

const PRIORITY_RANK = { Low: 0, Normal: 1, High: 2, Urgent: 3 }
const STATUS_RANK = { Open: 0, 'In Progress': 1, Waiting: 2, Resolved: 3, Closed: 4 }
const SEARCH_FIELDS = ['id', 'subject', 'userName', 'userEmail', 'category']

/**
 * Named filters (plain values, same as the API query string):
 *   status[], priority[], category[], assignee ('unassigned' | admin id)
 * The page resolves "me" to the signed-in admin's id before calling.
 */
function ticketFilters({ assignee, ...rest } = {}) {
  const f = { ...rest }
  if (assignee === 'unassigned') f.assignee = (t) => !t.assigneeId
  else if (assignee) f.assignee = (t) => t.assigneeId === assignee
  return f
}

const toRow = (t) => ({ ...t, userName: userSummary(t.userId)?.name, userEmail: userSummary(t.userId)?.email, priorityRank: PRIORITY_RANK[t.priority] ?? 1, statusRank: STATUS_RANK[t.status] ?? 0 })

const enrich = (t) => ({ ...t, user: userSummary(t.userId), assignee: t.assigneeId ? adminSummary(t.assigneeId) : null, messageCount: t.messages.length, lastFrom: t.messages[t.messages.length - 1]?.from ?? null })

const mock = {
  async getTickets(query = {}) {
    await delay()
    const res = applyListQuery(supportTickets.map(toRow), { ...query, filters: ticketFilters(query.filters), searchFields: SEARCH_FIELDS })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map(({ messages, internalNotes, ...t }) => enrich({ ...t, messages })) }) // eslint-disable-line no-unused-vars
  },
  async getCounts() {
    await delay(100, 200)
    return supportTickets.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {})
  },
  async exportTickets(query = {}) {
    await delay(400, 700)
    const { all } = applyListQuery(supportTickets.map(toRow), { ...query, filters: ticketFilters(query.filters), page: 1, pageSize: 1e9, searchFields: SEARCH_FIELDS })
    recordAdminAction({ action: 'Exported data', resource: 'Support', resourceId: `${all.length} rows` })
    return clone(all.map(({ messages, internalNotes, ...t }) => enrich({ ...t, messages }))) // eslint-disable-line no-unused-vars
  },
  async getTicketById(id) {
    await delay()
    const t = ticketById(id)
    if (!t) throw notFound('Ticket', id)
    const u = userById(t.userId)
    const job = t.monitoringId ? monitoringById(t.monitoringId) : null
    const slot = t.slotId ? slotById(t.slotId) : null
    return clone({
      ...enrich(t),
      userDetails: u ? { ...userSummary(u.id), phone: u.phone, createdAt: u.createdAt, learnersCount: u.learnersCount, activeMonitoring: u.activeMonitoring, plan: subscriptions.find((s) => s.userId === u.id)?.plan ?? null } : null,
      monitoring: job ? { ...job, learner: learnerSummary(job.learnerId), centres: job.centreIds.map(centreSummary) } : null,
      slot: slot ? { ...slot, centre: centreSummary(slot.centreId) } : null,
    })
  },
  async reply(id, body) {
    await delay(400, 700)
    const t = ticketById(id)
    if (!t) throw notFound('Ticket', id)
    const admin = sessionAdmin()
    const msg = { id: `msg_${Date.now()}`, from: 'admin', authorName: admin?.name || 'Support', body, createdAt: new Date().toISOString() }
    t.messages.push(msg)
    t.updatedAt = msg.createdAt
    if (t.status === 'Open') t.status = 'In Progress'
    if (!t.assigneeId && admin) t.assigneeId = admin.id
    recordAdminAction({ action: 'Replied to ticket', resource: 'Support', resourceId: id, href: `/admin/support/${id}` })
    return clone(msg)
  },
  async addInternalNote(id, body) {
    await delay(250, 400)
    const t = ticketById(id)
    if (!t) throw notFound('Ticket', id)
    const note = { id: `in_${Date.now()}`, author: sessionAdmin()?.name || 'Admin', body, createdAt: new Date().toISOString() }
    t.internalNotes.unshift(note)
    recordAdminAction({ action: 'Added internal note', resource: 'Support', resourceId: id, href: `/admin/support/${id}` })
    return clone(note)
  },
  async updateTicket(id, data) {
    await delay(250, 450)
    const t = ticketById(id)
    if (!t) throw notFound('Ticket', id)
    const changes = {}
    for (const k of ['status', 'priority', 'assigneeId', 'category']) if (data[k] !== undefined && data[k] !== t[k]) { changes[k] = [t[k], data[k]]; t[k] = data[k] }
    t.updatedAt = new Date().toISOString()
    recordAdminAction({ action: 'Updated ticket', resource: 'Support', resourceId: id, changes, href: `/admin/support/${id}` })
    return clone(enrich(t))
  },
}

const api = {
  getTickets: (q) => apiClient.get('/api/admin/support', { params: toParams(q) }).then(unwrapList),
  getCounts: () => apiClient.get('/api/admin/support/counts').then(unwrap),
  exportTickets: (q) => apiClient.get('/api/admin/support/export', { params: toParams(q) }).then(unwrap),
  getTicketById: (id) => apiClient.get(`/api/admin/support/${id}`).then(unwrap),
  reply: (id, body) => apiClient.post(`/api/admin/support/${id}/reply`, { body }).then(unwrap),
  addInternalNote: (id, body) => apiClient.post(`/api/admin/support/${id}/notes`, { body }).then(unwrap),
  updateTicket: (id, data) => apiClient.patch(`/api/admin/support/${id}`, data).then(unwrap),
}

export const supportService = defineService(mock, api)
