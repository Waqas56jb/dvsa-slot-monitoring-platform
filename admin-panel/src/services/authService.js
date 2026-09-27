import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap } from '@/lib/service'
import { delay } from '@/lib/mock'
import { admins, MOCK_ADMIN_PASSWORD } from '@/data/admins'
import { SESSION_TIMEOUT_MINUTES } from '@/constants/config'
import { recordAdminAction } from '@/lib/mockAudit'

const publicAdmin = (a) => ({ id: a.id, name: a.name, email: a.email, role: a.role, phone: a.phone, title: a.title, lastLogin: a.lastLogin, twoFactor: a.twoFactor, createdAt: a.createdAt })
const newExpiry = () => Date.now() + SESSION_TIMEOUT_MINUTES * 60_000

// Mock session list for the signed-in admin (mutable so revocations stick for the page lifetime).
let mockSessions = [
  { id: 'ses_1', device: 'Chrome · Windows', location: 'London, UK', ip: '81.2.69.142', current: true, lastSeen: new Date().toISOString(), createdAt: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { id: 'ses_2', device: 'Safari · iPhone', location: 'London, UK', ip: '81.2.71.18', current: false, lastSeen: new Date(Date.now() - 5 * 3600e3).toISOString(), createdAt: new Date(Date.now() - 9 * 86400e3).toISOString() },
  { id: 'ses_3', device: 'Chrome · macOS', location: 'Manchester, UK', ip: '86.14.203.7', current: false, lastSeen: new Date(Date.now() - 3 * 86400e3).toISOString(), createdAt: new Date(Date.now() - 21 * 86400e3).toISOString() },
]

const mock = {
  async login({ email, password }) {
    await delay(600, 900)
    if (email?.toLowerCase().includes('offline')) throw new ApiError('Network error — check your connection and try again.', { code: 'NETWORK' })
    const admin = admins.find((a) => a.email.toLowerCase() === email?.trim().toLowerCase())
    if (!admin || password !== MOCK_ADMIN_PASSWORD) throw new ApiError('Incorrect email or password.', { status: 401, code: 'INVALID_CREDENTIALS' })
    if (admin.status === 'Suspended') throw new ApiError('This admin account is suspended. Contact a Super Admin.', { status: 403, code: 'ACCOUNT_SUSPENDED' })
    if (admin.status === 'Invited') throw new ApiError('Finish accepting your invitation before signing in.', { status: 403, code: 'INVITE_PENDING' })
    const previousLogin = admin.lastLogin
    admin.lastLogin = new Date().toISOString()
    return { token: `mock.${admin.id}.${Math.random().toString(36).slice(2)}`, admin: { ...publicAdmin(admin), lastLogin: previousLogin }, expiresAt: newExpiry() }
  },
  async logout() { await delay(120, 200) },
  async getCurrentAdmin(session) {
    await delay(80, 150)
    const a = admins.find((x) => x.id === session?.admin?.id)
    if (!a || a.status !== 'Active') throw new ApiError('Session is no longer valid.', { status: 401, code: 'UNAUTHORIZED' })
    return publicAdmin(a)
  },
  async refreshSession() { await delay(150, 250); return { expiresAt: newExpiry() } },
  async forgotPassword(email) {
    await delay(700, 1000)
    if (!email) throw new ApiError('Email is required.', { status: 422 })
    // Always succeed so the UI does not reveal which emails exist.
    return { ok: true }
  },
  async resetPassword({ token, password }) {
    await delay(700, 1000)
    if (token === 'expired') throw new ApiError('This reset link has expired. Request a new one.', { status: 410, code: 'TOKEN_EXPIRED' })
    if (!password || password.length < 12) throw new ApiError('Password must be at least 12 characters.', { status: 422 })
    return { ok: true }
  },
  async updateProfile(id, data) {
    await delay()
    const a = admins.find((x) => x.id === id)
    if (!a) throw new ApiError('Admin account not found.', { status: 404, code: 'NOT_FOUND' })
    if (data.name != null && data.name.trim().length < 2) throw new ApiError('Enter your full name.', { status: 422, details: { name: 'Enter your full name.' } })
    Object.assign(a, { name: data.name ?? a.name, phone: data.phone ?? a.phone, title: data.title ?? a.title })
    recordAdminAction({ action: 'Updated own profile', resource: 'Admin', resourceId: id, href: `/admin/admins/${id}` })
    return publicAdmin(a)
  },
  async changePassword({ current, next }) {
    await delay(600, 900)
    if (current !== MOCK_ADMIN_PASSWORD) throw new ApiError('Current password is incorrect.', { status: 422, code: 'INVALID_PASSWORD' })
    if (!next || next.length < 12) throw new ApiError('New password must be at least 12 characters.', { status: 422 })
    if (next === current) throw new ApiError('Choose a password you haven’t used before.', { status: 422, code: 'PASSWORD_REUSED' })
    recordAdminAction({ action: 'Changed password', resource: 'Session', resourceId: 'self' })
    return { ok: true }
  },
  async logoutAllSessions() {
    await delay(500, 700)
    const revoked = mockSessions.filter((x) => !x.current).length
    mockSessions = mockSessions.filter((x) => x.current)
    recordAdminAction({ action: 'Signed out all other sessions', resource: 'Session', resourceId: 'all', changes: { sessions: [String(revoked), '0'] } })
    return { ok: true, revoked }
  },
  async revokeSession(sessionId) {
    await delay(300, 500)
    const s = mockSessions.find((x) => x.id === sessionId)
    if (!s) throw new ApiError('This session has already ended.', { status: 404, code: 'NOT_FOUND' })
    if (s.current) throw new ApiError('Use Sign out to end your current session.', { status: 422 })
    mockSessions = mockSessions.filter((x) => x.id !== sessionId)
    recordAdminAction({ action: 'Signed out session', resource: 'Session', resourceId: sessionId, description: s.device })
    return { ok: true }
  },
  async getSessions() {
    await delay()
    return mockSessions.map((x) => ({ ...x, lastSeen: x.current ? new Date().toISOString() : x.lastSeen }))
  },
}

const api = {
  login: (body) => apiClient.post('/api/admin/auth/login', body).then(unwrap),
  logout: () => apiClient.post('/api/admin/auth/logout').then(unwrap),
  getCurrentAdmin: () => apiClient.get('/api/admin/auth/me').then(unwrap),
  refreshSession: () => apiClient.post('/api/admin/auth/refresh').then(unwrap),
  forgotPassword: (email) => apiClient.post('/api/admin/auth/forgot-password', { email }).then(unwrap),
  resetPassword: (body) => apiClient.post('/api/admin/auth/reset-password', body).then(unwrap),
  updateProfile: (id, data) => apiClient.patch('/api/admin/profile', data).then(unwrap),
  changePassword: (body) => apiClient.post('/api/admin/profile/password', body).then(unwrap),
  logoutAllSessions: () => apiClient.post('/api/admin/auth/logout-all').then(unwrap),
  revokeSession: (id) => apiClient.delete(`/api/admin/auth/sessions/${id}`).then(unwrap),
  getSessions: () => apiClient.get('/api/admin/auth/sessions').then(unwrap),
}

export const authService = defineService(mock, api)
