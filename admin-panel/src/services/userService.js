import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone, pad } from '@/lib/mock'
import { applyListQuery, withinDays } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { users, userById } from '@/data/users'
import { learners } from '@/data/learners'
import { monitoringJobs } from '@/data/monitoring'
import { slots } from '@/data/slots'
import { notifications } from '@/data/notifications'
import { payments } from '@/data/payments'
import { subscriptions } from '@/data/subscriptions'
import { activities } from '@/data/activities'
import { centreSummary, learnerSummary, sanitizeLearner } from './_joins'
import { sessionAdmin } from '@/lib/session'

const SEARCH_FIELDS = ['name', 'email', 'phone', 'id', 'city']

/**
 * Named filters (plain values, same as the API query string):
 *   status[], plan[], joined ('7'|'30'|'90' days), monitoring ('active'|'none'), learners ('0'|'1'|'2+')
 * Mock mode turns them into predicates; the API receives them verbatim.
 */
function userFilters({ joined, monitoring, learners, plan, ...rest } = {}) {
  const f = { ...rest }
  if (plan?.length) f.plan = (u) => plan.includes(u.plan || 'None')
  if (joined) { const within = withinDays(Number(joined)); f.joined = (u) => within(u.createdAt) }
  if (monitoring === 'active') f.monitoring = (u) => u.activeMonitoring > 0
  if (monitoring === 'none') f.monitoring = (u) => u.activeMonitoring === 0
  if (learners === '0') f.learners = (u) => u.learnersCount === 0
  if (learners === '1') f.learners = (u) => u.learnersCount === 1
  if (learners === '2+') f.learners = (u) => u.learnersCount >= 2
  return f
}

function setStatus(id, status, action) {
  const u = userById(id)
  if (!u) throw notFound('User', id)
  const prev = u.status
  u.status = status
  recordAdminAction({ action, resource: 'User', resourceId: id, changes: { status: [prev, status] }, href: `/admin/users/${id}`, description: `${action} · ${u.name}` })
  return clone(u)
}

const mock = {
  async getUsers(query = {}) {
    await delay()
    const { all, ...res } = applyListQuery(users, { ...query, filters: userFilters(query.filters), searchFields: SEARCH_FIELDS }) // eslint-disable-line no-unused-vars
    return clone(res)
  },
  async getUserById(id) {
    await delay()
    const u = userById(id)
    if (!u) throw notFound('User', id)
    return clone({
      ...u,
      subscription: subscriptions.find((s) => s.userId === id) || null,
      learners: learners.filter((l) => l.userId === id).map(sanitizeLearner),
      monitoring: monitoringJobs.filter((j) => j.userId === id).map((j) => ({ ...j, learner: learnerSummary(j.learnerId), centres: j.centreIds.map(centreSummary) })),
      slots: slots.filter((s) => s.userId === id).map((s) => ({ ...s, centre: centreSummary(s.centreId), learner: learnerSummary(s.learnerId) })),
      notifications: notifications.filter((n) => n.userId === id),
      payments: payments.filter((p) => p.userId === id),
      activity: activities.filter((a) => a.actor.id === id || a.entity.id === id || a.description?.includes(u.name)).slice(0, 40),
    })
  },
  async createUser(data) {
    await delay(500, 800)
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new ApiError('A user with this email already exists.', { status: 409, code: 'EMAIL_TAKEN', details: { email: 'Email already registered' } })
    }
    const u = {
      id: `usr_${pad(9000 + users.length, 5)}`, name: data.name, email: data.email, phone: data.phone || '', city: data.city || 'London',
      status: data.status || 'Pending', emailVerified: false, source: 'Admin created', learnersCount: 0, monitoringCount: 0, activeMonitoring: 0,
      slotsDetected: 0, alertsSent: 0, plan: null, lastActive: null, createdAt: new Date().toISOString(), notes: [],
    }
    users.unshift(u)
    recordAdminAction({ action: 'Created user', resource: 'User', resourceId: u.id, href: `/admin/users/${u.id}` })
    return clone(u)
  },
  async updateUser(id, data) {
    await delay()
    const u = userById(id)
    if (!u) throw notFound('User', id)
    const changes = {}
    for (const k of ['name', 'email', 'phone', 'city']) if (data[k] != null && data[k] !== u[k]) { changes[k] = [u[k], data[k]]; u[k] = data[k] }
    recordAdminAction({ action: 'Updated user', resource: 'User', resourceId: id, changes, href: `/admin/users/${id}` })
    return clone(u)
  },
  async suspendUser(id, { reason } = {}) { await delay(); const u = setStatus(id, 'Suspended', 'Suspended user'); return { ...u, suspendReason: reason } },
  async reactivateUser(id) { await delay(); return setStatus(id, 'Active', 'Reactivated user') },
  async deleteUser(id) {
    await delay()
    const i = users.findIndex((u) => u.id === id)
    if (i < 0) throw notFound('User', id)
    const [u] = users.splice(i, 1)
    recordAdminAction({ action: 'Deleted user', resource: 'User', resourceId: id, description: `Deleted user · ${u.name}` })
    return { ok: true }
  },
  async bulkUpdate(ids, action) {
    await delay(500, 800)
    for (const id of ids) {
      if (action === 'suspend') setStatus(id, 'Suspended', 'Suspended user')
      else if (action === 'activate') setStatus(id, 'Active', 'Reactivated user')
      else if (action === 'delete') { const i = users.findIndex((u) => u.id === id); if (i >= 0) users.splice(i, 1) }
    }
    if (action === 'delete') recordAdminAction({ action: 'Bulk deleted users', resource: 'User', resourceId: `${ids.length} users` })
    return { ok: true, count: ids.length }
  },
  async sendPasswordReset(id) {
    await delay(500, 800)
    const u = userById(id)
    if (!u) throw notFound('User', id)
    recordAdminAction({ action: 'Reset user password', resource: 'User', resourceId: id, href: `/admin/users/${id}` })
    return { ok: true, email: u.email }
  },
  async addNote(id, body) {
    await delay(250, 400)
    const u = userById(id)
    if (!u) throw notFound('User', id)
    const note = { id: `note_${Date.now()}`, author: sessionAdmin()?.name || 'Admin', body, createdAt: new Date().toISOString() }
    u.notes = [note, ...(u.notes || [])]
    recordAdminAction({ action: 'Added internal note', resource: 'User', resourceId: id, href: `/admin/users/${id}` })
    return note
  },
  /** Returns all matching rows (no pagination) for CSV export. */
  async exportUsers(query = {}) {
    await delay(400, 700)
    const { all } = applyListQuery(users, { ...query, filters: userFilters(query.filters), page: 1, pageSize: 1e9, searchFields: SEARCH_FIELDS })
    recordAdminAction({ action: 'Exported data', resource: 'Users', resourceId: `${all.length} rows` })
    return clone(all)
  },
}

const api = {
  getUsers: (q) => apiClient.get('/api/admin/users', { params: toParams(q) }).then(unwrapList),
  getUserById: (id) => apiClient.get(`/api/admin/users/${id}`).then(unwrap),
  createUser: (data) => apiClient.post('/api/admin/users', data).then(unwrap),
  updateUser: (id, data) => apiClient.patch(`/api/admin/users/${id}`, data).then(unwrap),
  suspendUser: (id, body) => apiClient.post(`/api/admin/users/${id}/suspend`, body).then(unwrap),
  reactivateUser: (id) => apiClient.post(`/api/admin/users/${id}/reactivate`).then(unwrap),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`).then(unwrap),
  bulkUpdate: (ids, action) => apiClient.post('/api/admin/users/bulk', { ids, action }).then(unwrap),
  sendPasswordReset: (id) => apiClient.post(`/api/admin/users/${id}/password-reset`).then(unwrap),
  addNote: (id, body) => apiClient.post(`/api/admin/users/${id}/notes`, { body }).then(unwrap),
  exportUsers: (q) => apiClient.get('/api/admin/users/export', { params: toParams(q) }).then(unwrap),
}

export const userService = defineService(mock, api)
