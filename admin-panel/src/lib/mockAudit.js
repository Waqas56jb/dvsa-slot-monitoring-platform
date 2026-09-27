/**
 * Mock-mode side effects for admin actions: every mutation writes an audit
 * entry + an activity event and publishes both on the realtime bus, the same
 * way the backend will once audit logging moves server-side.
 */
import { auditLogs, activities } from '@/data/activities'
import { realtime } from './realtime'
import { sessionAdmin } from './session'
import { ROLE_LABELS } from '@/constants/permissions'

let auditSeq = 800000
let activitySeq = 950000

export function recordAdminAction({ action, resource, resourceId, changes = {}, href, result = 'Success', description }) {
  const admin = sessionAdmin() || { id: 'adm_unknown', name: 'Unknown admin', role: null }
  const timestamp = new Date().toISOString()
  const audit = {
    id: `AUD-${++auditSeq}`,
    adminId: admin.id,
    adminName: admin.name,
    adminRole: ROLE_LABELS[admin.role] || '—',
    action,
    resource,
    resourceId,
    changes,
    result,
    ip: '127.0.0.1',
    userAgent: navigator.userAgent.includes('Firefox') ? 'Firefox · this device' : 'Chromium · this device',
    timestamp,
  }
  auditLogs.unshift(audit)
  const activity = {
    id: `ACT-${++activitySeq}`,
    category: 'Admin',
    event: action,
    description: description || `${admin.name} · ${resource} ${resourceId}`,
    actor: { type: 'admin', id: admin.id, name: admin.name },
    entity: { type: resource.toLowerCase(), id: resourceId, label: resourceId, href: href || '/admin/audit-logs' },
    ip: '127.0.0.1',
    status: result === 'Success' ? 'Success' : 'Failed',
    timestamp,
  }
  activities.unshift(activity)
  realtime.publish('audit', audit)
  realtime.publish('activity', activity)
  return audit
}
