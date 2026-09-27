import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone, NOW, HOUR, DAY } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { admins, adminById } from '@/data/admins'
import { auditLogs } from '@/data/activities'
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from '@/constants/permissions'
import { sessionAdmin } from '@/lib/session'

const enrich = (a) => ({ ...a, roleLabel: ROLE_LABELS[a.role] })

function loginHistory(a) {
  if (!a.lastLogin) return []
  const base = new Date(a.lastLogin).getTime()
  const devices = ['Chrome · macOS', 'Chrome · Windows', 'Safari · iPhone']
  return Array.from({ length: 8 }, (_, i) => ({
    id: `${a.id}_login_${i}`,
    at: new Date(base - i * (i < 3 ? 9 * HOUR : 2 * DAY)).toISOString(),
    device: devices[i % devices.length],
    location: i % 4 === 3 ? 'Manchester, UK' : 'London, UK',
    ip: `81.2.${60 + i}.${120 + i * 3}`,
    result: a.status === 'Suspended' && i === 0 ? 'Denied' : i === 5 ? 'Failed' : 'Success',
  })).filter((l) => new Date(l.at).getTime() > NOW - 60 * DAY)
}

const VALID_ROLES = Object.values(ROLES)
const ADMIN_STATUSES = ['Active', 'Invited', 'Suspended']

const mock = {
  async getAdmins(query = {}) {
    await delay()
    const { all, ...res } = applyListQuery(admins.map(enrich), { ...query, searchFields: ['name', 'email', 'roleLabel', 'title'] }) // eslint-disable-line no-unused-vars
    return clone(res)
  },
  /** Totals across all admins (unfiltered) for the role summary cards. */
  async getAdminStats() {
    await delay(150, 300)
    const byRole = Object.fromEntries(VALID_ROLES.map((r) => [r, { total: 0, active: 0, invited: 0, suspended: 0 }]))
    const byStatus = Object.fromEntries(ADMIN_STATUSES.map((s) => [s, 0]))
    for (const a of admins) {
      const bucket = byRole[a.role]
      if (bucket) { bucket.total += 1; bucket[a.status.toLowerCase()] = (bucket[a.status.toLowerCase()] || 0) + 1 }
      byStatus[a.status] = (byStatus[a.status] || 0) + 1
    }
    return { total: admins.length, byRole, byStatus }
  },
  async getAdminById(id) {
    await delay()
    const a = adminById(id)
    if (!a) throw notFound('Admin', id)
    return clone({ ...enrich(a), permissions: ROLE_PERMISSIONS[a.role], loginHistory: loginHistory(a), actions: auditLogs.filter((l) => l.adminId === id).slice(0, 25) })
  },
  async createAdmin(data) {
    await delay(600, 900)
    if (!VALID_ROLES.includes(data.role)) throw new ApiError('Choose a valid role.', { status: 422, details: { role: 'Choose a role.' } })
    if (admins.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
      throw new ApiError('An admin with this email already exists.', { status: 409, details: { email: 'An admin with this email already exists.' } })
    }
    const a = { id: `adm_${String(admins.length + 1).padStart(3, '0')}`, name: data.name, email: data.email, role: data.role, status: 'Invited', phone: data.phone || '', lastLogin: null, createdAt: new Date().toISOString(), twoFactor: false, title: data.title || '' }
    admins.push(a)
    recordAdminAction({ action: 'Created admin', resource: 'Admin', resourceId: a.id, changes: { role: [null, ROLE_LABELS[a.role]] }, href: `/admin/admins/${a.id}`, description: `Invited ${a.name} as ${ROLE_LABELS[a.role]}` })
    return clone(enrich(a))
  },
  async changeRole(id, role) {
    await delay()
    const a = adminById(id)
    if (!a) throw notFound('Admin', id)
    if (sessionAdmin()?.id === id) throw new ApiError('You cannot change your own role.', { status: 403, code: 'SELF_ROLE_CHANGE' })
    if (!VALID_ROLES.includes(role)) throw new ApiError('Choose a valid role.', { status: 422 })
    if (a.role === role) return clone(enrich(a))
    const prev = a.role
    a.role = role
    recordAdminAction({ action: 'Changed admin role', resource: 'Admin', resourceId: id, changes: { role: [ROLE_LABELS[prev], ROLE_LABELS[role]] }, href: `/admin/admins/${id}`, description: `${a.name}: ${ROLE_LABELS[prev]} → ${ROLE_LABELS[role]}` })
    return clone(enrich(a))
  },
  async setStatus(id, status, { reason } = {}) {
    await delay()
    const a = adminById(id)
    if (!a) throw notFound('Admin', id)
    if (sessionAdmin()?.id === id) throw new ApiError('You cannot change your own status.', { status: 403, code: 'SELF_STATUS_CHANGE' })
    if (!['Active', 'Suspended'].includes(status)) throw new ApiError('Unsupported status.', { status: 422 })
    const prev = a.status
    // Reactivating someone who never accepted their invite puts them back to Invited.
    a.status = status === 'Active' && !a.lastLogin ? 'Invited' : status
    recordAdminAction({ action: status === 'Suspended' ? 'Suspended admin' : 'Reactivated admin', resource: 'Admin', resourceId: id, changes: { status: [prev, a.status], ...(reason ? { reason: [null, reason] } : {}) }, href: `/admin/admins/${id}`, description: reason ? `${a.name}: ${reason}` : undefined })
    return clone(enrich(a))
  },
  async resendInvite(id) {
    await delay(400, 600)
    const a = adminById(id)
    if (!a) throw notFound('Admin', id)
    if (a.status !== 'Invited') throw new ApiError('This admin has already accepted their invitation.', { status: 409, code: 'INVITE_ACCEPTED' })
    recordAdminAction({ action: 'Resent admin invitation', resource: 'Admin', resourceId: id, href: `/admin/admins/${id}` })
    return { ok: true }
  },
}

const api = {
  getAdmins: (q) => apiClient.get('/api/admin/admins', { params: toParams(q) }).then(unwrapList),
  getAdminStats: () => apiClient.get('/api/admin/admins/stats').then(unwrap),
  getAdminById: (id) => apiClient.get(`/api/admin/admins/${id}`).then(unwrap),
  createAdmin: (data) => apiClient.post('/api/admin/admins', data).then(unwrap),
  changeRole: (id, role) => apiClient.patch(`/api/admin/admins/${id}`, { role }).then(unwrap),
  setStatus: (id, status, { reason } = {}) => apiClient.patch(`/api/admin/admins/${id}`, { status, reason }).then(unwrap),
  resendInvite: (id) => apiClient.post(`/api/admin/admins/${id}/invite`).then(unwrap),
}

export const adminService = defineService(mock, api)
