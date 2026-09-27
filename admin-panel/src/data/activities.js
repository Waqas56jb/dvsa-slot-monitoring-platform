import { createRandom, NOW, DAY, pad } from '@/lib/mock'
import { users } from './users'
import { monitoringJobs } from './monitoring'
import { slots } from './slots'
import { notifications } from './notifications'
import { payments } from './payments'
import { admins } from './admins'
import { centreById, testCentres } from './testCentres'
import { learners } from './learners'
import { ROLE_LABELS } from '@/constants/permissions'

const r = createRandom(9090)
const ip = () => `${r.pick([81, 86, 92, 109, 151, 176, 212])}.${r.int(0, 255)}.${r.int(0, 255)}.${r.int(1, 254)}`
const SYSTEM = { type: 'system', id: 'system', name: 'System' }
const userActor = (u) => ({ type: 'user', id: u.id, name: u.name })
const adminActor = (a) => ({ type: 'admin', id: a.id, name: a.name })

/**
 * Activity = operational event stream (what happened on the platform).
 * Shape: { id, category, event, description, actor, entity: { type, id, label, href }, ip, status, timestamp }
 */
const raw = []
const push = (e) => raw.push({ ip: e.actor.type === 'system' ? null : ip(), status: 'Success', ...e })

for (const u of users.slice(0, 120)) {
  push({ category: 'User', event: 'User registered', description: `${u.name} created an account`, actor: userActor(u), entity: { type: 'user', id: u.id, label: u.email, href: `/admin/users/${u.id}` }, timestamp: u.createdAt })
}
for (const j of monitoringJobs.slice(-160)) {
  const u = users.find((x) => x.id === j.userId)
  push({ category: 'Monitoring', event: 'Monitoring job created', description: `New monitoring job across ${j.centreIds.length} centre${j.centreIds.length > 1 ? 's' : ''}`, actor: userActor(u), entity: { type: 'monitoring', id: j.id, label: j.id, href: `/admin/monitoring/${j.id}` }, timestamp: j.createdAt })
  if (j.status === 'Failed') push({ category: 'Monitoring', event: 'Monitoring job failed', description: j.failureReason, actor: SYSTEM, entity: { type: 'monitoring', id: j.id, label: j.id, href: `/admin/monitoring/${j.id}` }, status: 'Failed', timestamp: j.updatedAt })
  if (j.status === 'Paused') push({ category: 'Monitoring', event: 'Monitoring job paused', description: 'Paused by account owner', actor: userActor(u), entity: { type: 'monitoring', id: j.id, label: j.id, href: `/admin/monitoring/${j.id}` }, status: 'Warning', timestamp: j.updatedAt })
}
for (const s of slots.slice(0, 220)) {
  const c = centreById(s.centreId)
  push({ category: 'Slot', event: 'Slot detected', description: `Slot detected at ${c.name}`, actor: SYSTEM, entity: { type: 'slot', id: s.id, label: s.id, href: `/admin/slots/${s.id}` }, timestamp: s.detectedAt })
}
for (const n of notifications.slice(0, 220)) {
  if (n.status === 'Queued') continue
  push({ category: 'Notification', event: n.status === 'Failed' ? 'Alert delivery failed' : 'Alert delivered', description: `${n.channel} · ${n.type}${n.error ? ` — ${n.error}` : ''}`, actor: SYSTEM, entity: { type: 'notification', id: n.id, label: n.id, href: `/admin/notifications?search=${n.id}` }, status: n.status === 'Failed' ? 'Failed' : 'Success', timestamp: n.deliveredAt || n.createdAt })
}
for (const p of payments.slice(0, 120)) {
  const u = users.find((x) => x.id === p.userId)
  push({ category: 'Payment', event: p.status === 'Failed' ? 'Payment failed' : p.status === 'Refunded' ? 'Payment refunded' : 'Payment completed', description: `${p.plan} plan · £${p.amount.toFixed(2)}`, actor: userActor(u), entity: { type: 'payment', id: p.id, label: p.id, href: `/admin/payments/${p.id}` }, status: p.status === 'Failed' ? 'Failed' : 'Success', timestamp: p.date })
}
const SYSTEM_EVENTS = [
  ['Monitoring worker restarted', 'Worker #04 restarted after memory threshold', 'Warning'],
  ['Scheduled job completed', 'Nightly data retention sweep removed 1,284 expired slot records', 'Success'],
  ['Queue backlog cleared', 'Notification queue drained to 0 after spike', 'Success'],
  ['Upstream latency elevated', 'Availability source p95 latency above 4s for 6 minutes', 'Warning'],
  ['Deployment completed', 'Admin API v2.14.0 deployed to production', 'Success'],
  ['Health check failed', 'Storage health probe timed out (auto-recovered)', 'Failed'],
]
for (let i = 0; i < 40; i++) {
  const [event, description, status] = r.pick(SYSTEM_EVENTS)
  push({ category: 'System', event, description, actor: SYSTEM, entity: { type: 'system', id: 'system', label: 'Platform', href: '/admin/system-health' }, status, timestamp: new Date(NOW - Math.floor(Math.pow(r.next(), 1.3) * 30 * DAY)).toISOString() })
}

/**
 * Audit log = security-focused record of admin actions only.
 * Shape: { id, adminId, adminName, adminRole, action, resource, resourceId, changes, result, ip, userAgent, timestamp }
 */
export const auditLogs = []
const AUDIT_ACTIONS = [
  ['Changed user status', 'User', () => r.pick(users).id, () => ({ status: ['Active', 'Suspended'] })],
  ['Paused monitoring job', 'Monitoring', () => r.pick(monitoringJobs).id, () => ({ status: ['Running', 'Paused'] })],
  ['Resumed monitoring job', 'Monitoring', () => r.pick(monitoringJobs).id, () => ({ status: ['Paused', 'Running'] })],
  ['Updated test centre', 'Test centre', () => r.pick(testCentres).id, () => ({ checkInterval: ['120', '90'] })],
  ['Changed platform setting', 'Settings', () => 'monitoring.defaultInterval', () => ({ value: ['120', '90'] })],
  ['Created admin', 'Admin', () => r.pick(admins).id, () => ({ role: [null, 'Analyst'] })],
  ['Changed admin role', 'Admin', () => r.pick(admins).id, () => ({ role: ['Support Admin', 'Operations Admin'] })],
  ['Issued refund', 'Payment', () => r.pick(payments).id, () => ({ status: ['Paid', 'Refunded'] })],
  ['Exported data', 'Users', () => 'users.csv', () => ({ rows: [null, String(r.int(40, 900))] })],
  ['Reset user password', 'User', () => r.pick(users).id, () => ({})],
  ['Viewed masked learner reference', 'Learner', () => r.pick(learners).id, () => ({})],
  ['Signed in', 'Session', () => 'session', () => ({})],
]
const UAS = ['Chrome 140 · macOS', 'Chrome 140 · Windows', 'Safari 19 · macOS', 'Edge 140 · Windows', 'Firefox 142 · Ubuntu']
for (let i = 0; i < 160; i++) {
  const a = r.pick(admins.filter((x) => x.status !== 'Invited'))
  const [action, resource, idFn, changesFn] = r.pick(AUDIT_ACTIONS)
  const denied = a.role === 'analyst' && !['Exported data', 'Signed in'].includes(action) && r.chance(0.6)
  auditLogs.push({
    id: `AUD-${pad(700000 + i * 13, 7)}`,
    adminId: a.id,
    adminName: a.name,
    adminRole: ROLE_LABELS[a.role],
    action,
    resource,
    resourceId: idFn(),
    changes: changesFn(),
    result: denied ? 'Denied' : r.chance(0.03) ? 'Failed' : 'Success',
    ip: ip(),
    userAgent: r.pick(UAS),
    timestamp: new Date(NOW - Math.floor(Math.pow(r.next(), 1.2) * 60 * DAY) - r.int(0, 3600) * 1000).toISOString(),
  })
}
auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

for (const l of auditLogs.slice(0, 60)) {
  if (l.action === 'Viewed masked learner reference' || l.action === 'Signed in') continue
  push({ category: 'Admin', event: l.action, description: `${l.adminName} · ${l.resource} ${l.resourceId}`, actor: { type: 'admin', id: l.adminId, name: l.adminName }, entity: { type: 'audit', id: l.id, label: l.resourceId, href: '/admin/audit-logs' }, status: l.result === 'Success' ? 'Success' : 'Failed', timestamp: l.timestamp })
}

export const activities = raw
  .filter((e) => new Date(e.timestamp).getTime() <= NOW)
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .map((e, i) => ({ id: `ACT-${pad(900000 - i, 6)}`, ...e }))

export { adminActor, userActor, SYSTEM as SYSTEM_ACTOR }
