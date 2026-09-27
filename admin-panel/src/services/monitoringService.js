import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery, withinDays } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { realtime } from '@/lib/realtime'
import { monitoringJobs, monitoringById } from '@/data/monitoring'
import { slots } from '@/data/slots'
import { notifications } from '@/data/notifications'
import { activities } from '@/data/activities'
import { centreSummary, learnerSummary, userSummary } from './_joins'
import { formatTimeSeconds } from '@/utils/format'

const enrich = (j) => ({
  ...j,
  user: userSummary(j.userId),
  learner: learnerSummary(j.learnerId),
  centres: j.centreIds.map(centreSummary).filter(Boolean),
})

const SEARCH_FIELDS = ['id', 'userName', 'userEmail', 'learnerName']
const DAY_MS = 86400000
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() }
const dayValue = (iso) => new Date(`${iso}T00:00:00`).getTime()

/**
 * Named filters (plain values, same as the API query string):
 *   status[], centre[] (centre ids — job.centreIds includes any), created ('7'|'30'|'90' days),
 *   window ('current' = test window includes today | 'next30' = starts within 30 days | 'ending7' = ends within 7 days | 'ended')
 * Mock mode turns them into predicates; the API receives them verbatim.
 */
function monitoringFilters({ centre, created, window: win, ...rest } = {}) {
  const f = { ...rest }
  if (centre?.length) f.centre = (j) => j.centreIds.some((id) => centre.includes(id))
  if (created) { const within = withinDays(Number(created)); f.created = (j) => within(j.createdAt) }
  if (win) {
    const today = startOfToday()
    if (win === 'current') f.window = (j) => dayValue(j.dateFrom) <= today && dayValue(j.dateTo) >= today
    if (win === 'next30') f.window = (j) => dayValue(j.dateFrom) > today && dayValue(j.dateFrom) <= today + 30 * DAY_MS
    if (win === 'ending7') f.window = (j) => dayValue(j.dateTo) >= today && dayValue(j.dateTo) <= today + 7 * DAY_MS
    if (win === 'ended') f.window = (j) => dayValue(j.dateTo) < today
  }
  return f
}

const TRANSITIONS = {
  pause: { from: ['Running', 'Failed'], to: 'Paused', action: 'Paused monitoring job' },
  resume: { from: ['Paused', 'Failed'], to: 'Running', action: 'Resumed monitoring job' },
  stop: { from: ['Running', 'Paused', 'Failed'], to: 'Cancelled', action: 'Stopped monitoring job' },
}

function transition(id, kind, reason) {
  const j = monitoringById(id)
  if (!j) throw notFound('Monitoring job', id)
  const t = TRANSITIONS[kind]
  if (!t.from.includes(j.status)) throw new ApiError(`Cannot ${kind} a job that is ${j.status.toLowerCase()}.`, { status: 409, code: 'INVALID_STATE' })
  const prev = j.status
  j.status = t.to
  j.updatedAt = new Date().toISOString()
  j.nextCheck = t.to === 'Running' ? new Date(Date.now() + j.frequency * 1000).toISOString() : null
  if (t.to === 'Running') j.failureReason = null
  recordAdminAction({ action: t.action, resource: 'Monitoring', resourceId: id, changes: { status: [prev, t.to], ...(reason ? { reason: [null, reason] } : {}) }, href: `/admin/monitoring/${id}`, description: `${t.action.replace(' job', '')} by admin · ${id}` })
  return enrich(clone(j))
}

const mock = {
  async getJobs(query = {}) {
    await delay()
    const rows = monitoringJobs.map((j) => ({ ...j, userName: userSummary(j.userId)?.name, userEmail: userSummary(j.userId)?.email, learnerName: learnerSummary(j.learnerId)?.name }))
    const res = applyListQuery(rows, { ...query, filters: monitoringFilters(query.filters), searchFields: SEARCH_FIELDS })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map(enrich) })
  },
  async getJobById(id) {
    await delay()
    const j = monitoringById(id)
    if (!j) throw notFound('Monitoring job', id)
    const jobSlots = slots.filter((s) => s.matchedJobIds.includes(id))
    return clone({
      ...enrich(j),
      slots: jobSlots.map((s) => ({ ...s, centre: centreSummary(s.centreId) })),
      alerts: notifications.filter((n) => n.monitoringId === id),
      activity: activities.filter((a) => a.entity.id === id).slice(0, 30),
    })
  },
  async getStatusCounts() {
    await delay(150, 300)
    return monitoringJobs.reduce((acc, j) => ({ ...acc, [j.status]: (acc[j.status] || 0) + 1 }), {})
  },
  async pauseJob(id, { reason } = {}) { await delay(); return transition(id, 'pause', reason) },
  async resumeJob(id) { await delay(); return transition(id, 'resume') },
  async stopJob(id, { reason } = {}) { await delay(); return transition(id, 'stop', reason) },
  /**
   * Bulk pause / resume. Jobs whose current status does not allow the
   * transition are skipped (not an error) and reported back.
   */
  async bulkAction(ids, action, { reason } = {}) {
    await delay(500, 800)
    if (!['pause', 'resume'].includes(action)) throw new ApiError('Unsupported bulk action.', { status: 400, code: 'BAD_REQUEST' })
    const updated = []
    const skipped = []
    for (const id of ids) {
      const j = monitoringById(id)
      if (!j || !TRANSITIONS[action].from.includes(j.status)) { skipped.push(id); continue }
      updated.push(transition(id, action, reason))
    }
    return { updated, skipped }
  },
  async updateJob(id, data) {
    await delay()
    const j = monitoringById(id)
    if (!j) throw notFound('Monitoring job', id)
    const changes = {}
    for (const k of ['dateFrom', 'dateTo', 'timeFrom', 'timeTo', 'frequency', 'centreIds', 'weekdaysOnly']) {
      if (data[k] !== undefined && JSON.stringify(data[k]) !== JSON.stringify(j[k])) { changes[k] = [j[k], data[k]]; j[k] = data[k] }
    }
    j.updatedAt = new Date().toISOString()
    recordAdminAction({ action: 'Updated monitoring job', resource: 'Monitoring', resourceId: id, changes, href: `/admin/monitoring/${id}` })
    return enrich(clone(j))
  },
  async triggerCheck(id) {
    await delay(700, 1200)
    const j = monitoringById(id)
    if (!j) throw notFound('Monitoring job', id)
    if (j.status !== 'Running') throw new ApiError(`Cannot run a check on a job that is ${j.status.toLowerCase()}.`, { status: 409, code: 'INVALID_STATE' })
    j.lastChecked = new Date().toISOString()
    j.nextCheck = new Date(Date.now() + j.frequency * 1000).toISOString()
    j.checksCount += 1
    recordAdminAction({ action: 'Triggered monitoring check', resource: 'Monitoring', resourceId: id, href: `/admin/monitoring/${id}` })
    return enrich(clone(j))
  },
  async exportJobs(query = {}) {
    await delay(400, 700)
    const { data } = await mock.getJobs({ ...query, page: 1, pageSize: 1e9 }) // getJobs applies monitoringFilters
    recordAdminAction({ action: 'Exported data', resource: 'Monitoring', resourceId: `${data.length} rows` })
    return data
  },

  /**
   * Live log stream for one job. Mock mode synthesises plausible check
   * output; the real backend will push the same line shape via SSE/Realtime.
   * Line: { id, ts, level: 'info'|'success'|'warn'|'error'|'debug', message }
   */
  subscribeToLogs(id, onLine) {
    const j = monitoringById(id)
    const centres = (j?.centreIds || []).map(centreSummary).filter(Boolean)
    let n = 0
    let idleAnnounced = false
    let closed = false
    const emit = (level, message) => !closed && onLine({ id: `${id}-${Date.now()}-${n++}`, ts: new Date().toISOString(), level, message })
    const tick = () => {
      if (!j || j.status !== 'Running') {
        if (!idleAnnounced) emit('debug', `Job is ${j?.status?.toLowerCase() ?? 'unknown'} — no checks scheduled`)
        idleAnnounced = true
        return
      }
      idleAnnounced = false
      const c = centres[Math.floor(Math.random() * centres.length)] || { shortName: 'centre' }
      emit('info', `Checking ${c.shortName} (${c.code ?? '—'})…`)
      setTimeout(() => {
        const roll = Math.random()
        if (roll < 0.12) {
          emit('success', `New availability detected · ${c.shortName}`)
          setTimeout(() => emit('success', `Filter matched (${j.timeFrom}–${j.timeTo}, ${j.dateFrom} → ${j.dateTo})`), 300)
          setTimeout(() => emit('info', `Alert queued → ${j.channels.join(', ')}`), 700)
          j.lastChecked = new Date().toISOString()
        } else if (roll < 0.17) {
          emit('warn', `Availability found outside preferred window — ignored`)
        } else if (roll < 0.2) {
          emit('error', `Upstream responded slowly (${(2 + Math.random() * 3).toFixed(1)}s) — will retry next cycle`)
        } else {
          emit('debug', `No matching slot · response ${(0.4 + Math.random()).toFixed(2)}s`)
        }
      }, 450 + Math.random() * 600)
    }
    emit('debug', `Attached to log stream for ${id} at ${formatTimeSeconds(new Date())}`)
    tick()
    const timer = setInterval(tick, 3200 + Math.random() * 1500)
    return () => { closed = true; clearInterval(timer) }
  },
}

const api = {
  getJobs: (q) => apiClient.get('/api/admin/monitoring', { params: toParams(q) }).then(unwrapList),
  getJobById: (id) => apiClient.get(`/api/admin/monitoring/${id}`).then(unwrap),
  getStatusCounts: () => apiClient.get('/api/admin/monitoring/status-counts').then(unwrap),
  pauseJob: (id, body) => apiClient.post(`/api/admin/monitoring/${id}/pause`, body).then(unwrap),
  resumeJob: (id) => apiClient.post(`/api/admin/monitoring/${id}/resume`).then(unwrap),
  stopJob: (id, body) => apiClient.post(`/api/admin/monitoring/${id}/stop`, body).then(unwrap),
  bulkAction: (ids, action, body = {}) => apiClient.post('/api/admin/monitoring/bulk', { ids, action, ...body }).then(unwrap),
  updateJob: (id, data) => apiClient.patch(`/api/admin/monitoring/${id}`, data).then(unwrap),
  triggerCheck: (id) => apiClient.post(`/api/admin/monitoring/${id}/check`).then(unwrap),
  exportJobs: (q) => apiClient.get('/api/admin/monitoring/export', { params: toParams(q) }).then(unwrap),
  // Backend will expose logs via Supabase Realtime channel `monitoring_logs:<id>` or SSE.
  subscribeToLogs: (id, onLine) => realtime.subscribe(`monitoring-log:${id}`, onLine),
}

export const monitoringService = defineService(mock, api)
