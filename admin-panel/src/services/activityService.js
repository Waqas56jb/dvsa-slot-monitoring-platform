import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, clone } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { activities, auditLogs } from '@/data/activities'

const ACTIVITY_SEARCH = ['event', 'description', 'actorName', 'entityLabel', 'id']
const AUDIT_SEARCH = ['id', 'adminName', 'action', 'resource', 'resourceId', 'ip']
const RANGE_HOURS = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30, '90d': 24 * 90 }

/** date: '24h' | '7d' | '30d' | '90d' → timestamp predicate. */
function withinRange(range) {
  const hours = RANGE_HOURS[range]
  return hours ? (row) => Date.now() - new Date(row.timestamp).getTime() <= hours * 3600000 : null
}

/**
 * Named filters for the activity stream (plain values, same as the API query string):
 *   category[], status[], actorType[], date ('24h'|'7d'|'30d'|'90d')
 */
function activityFilters({ date, actorType, ...rest } = {}) {
  const f = { ...rest }
  if (date) f.date = withinRange(date)
  if (actorType?.length) f.actorType = (a) => actorType.includes(a.actor.type)
  return f
}

/** Audit filters: adminName[], action[], resource[], result[], date. */
function auditFilters({ date, ...rest } = {}) {
  const f = { ...rest }
  if (date) f.date = withinRange(date)
  return f
}

const activityRows = () => activities.map((a) => ({ ...a, actorName: a.actor.name, entityLabel: a.entity.label }))

const mock = {
  async getActivity(query = {}) {
    await delay()
    const { all, ...res } = applyListQuery(activityRows(), { sort: 'timestamp', ...query, filters: activityFilters(query.filters), searchFields: ACTIVITY_SEARCH }) // eslint-disable-line no-unused-vars
    return clone(res)
  },
  async getRecentActivity(limit = 12) {
    await delay(120, 250)
    return clone(activities.slice(0, limit))
  },
  async getAuditLogs(query = {}) {
    await delay()
    const { all, ...res } = applyListQuery(auditLogs, { sort: 'timestamp', ...query, filters: auditFilters(query.filters), searchFields: AUDIT_SEARCH }) // eslint-disable-line no-unused-vars
    return clone(res)
  },
  async getAuditFacets() {
    await delay(80, 150)
    const uniq = (k) => [...new Set(auditLogs.map((l) => l[k]))].sort()
    return { admins: uniq('adminName'), actions: uniq('action'), resources: uniq('resource'), results: ['Success', 'Denied', 'Failed'] }
  },
  async exportActivity(query = {}) {
    await delay(400, 700)
    const { all } = applyListQuery(activityRows(), { sort: 'timestamp', ...query, filters: activityFilters(query.filters), page: 1, pageSize: 1e9, searchFields: ACTIVITY_SEARCH })
    recordAdminAction({ action: 'Exported data', resource: 'Activity', resourceId: `${all.length} rows` })
    return clone(all)
  },
  async exportAuditLogs(query = {}) {
    await delay(400, 700)
    const { all } = applyListQuery(auditLogs, { sort: 'timestamp', ...query, filters: auditFilters(query.filters), page: 1, pageSize: 1e9, searchFields: AUDIT_SEARCH })
    recordAdminAction({ action: 'Exported data', resource: 'Audit log', resourceId: `${all.length} rows` })
    return clone(all)
  },
}

const api = {
  getActivity: (q) => apiClient.get('/api/admin/activity', { params: toParams(q) }).then(unwrapList),
  getRecentActivity: (limit) => apiClient.get('/api/admin/activity', { params: { pageSize: limit } }).then(unwrap),
  getAuditLogs: (q) => apiClient.get('/api/admin/audit-logs', { params: toParams(q) }).then(unwrapList),
  getAuditFacets: () => apiClient.get('/api/admin/audit-logs/facets').then(unwrap),
  exportActivity: (q) => apiClient.get('/api/admin/activity/export', { params: toParams(q) }).then(unwrap),
  exportAuditLogs: (q) => apiClient.get('/api/admin/audit-logs/export', { params: toParams(q) }).then(unwrap),
}

export const activityService = defineService(mock, api)
