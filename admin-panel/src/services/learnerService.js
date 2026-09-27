import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { learners, learnerById } from '@/data/learners'
import { monitoringJobs } from '@/data/monitoring'
import { slots } from '@/data/slots'
import { notifications } from '@/data/notifications'
import { centreSummary, userSummary, sanitizeLearner } from './_joins'
import { formatDayDate } from '@/utils/format'

const SEARCH_FIELDS = ['name', 'userEmail', 'userName', 'id', 'licenceRef']

/**
 * Named filters (plain values, same as the API query string):
 *   status[], referenceStatus[], testType[], centre[] (test centre ids — matches any preferred centre)
 * Mock mode turns them into predicates; the API receives them verbatim.
 */
function learnerFilters({ centre, ...rest } = {}) {
  const f = { ...rest }
  const ids = centre == null ? [] : Array.isArray(centre) ? centre : [centre]
  if (ids.length) f.centre = (l) => l.preferredCentres.some((c) => ids.includes(c))
  return f
}

const withUser = (l) => { const u = userSummary(l.userId); return { ...l, userEmail: u?.email, userName: u?.name } }

const enrich = (l) => ({ ...sanitizeLearner(l), user: userSummary(l.userId), centres: l.preferredCentres.map(centreSummary).filter(Boolean) })

function timelineFor(l, jobs, lSlots, lNotes) {
  const events = [{ type: 'created', title: 'Learner created', at: l.createdAt, tone: 'neutral' }]
  for (const j of jobs) {
    events.push({ type: 'monitoring', title: 'Monitoring started', description: `${j.id} · ${j.centreIds.length} centre(s)`, at: j.createdAt, tone: 'brand', href: `/admin/monitoring/${j.id}` })
    if (j.status === 'Paused' || j.status === 'Failed') events.push({ type: 'monitoring', title: `Monitoring ${j.status.toLowerCase()}`, description: j.failureReason || j.id, at: j.updatedAt, tone: j.status === 'Failed' ? 'danger' : 'warning' })
  }
  for (const s of lSlots.slice(0, 6)) {
    events.push({ type: 'slot', title: 'Slot detected', description: `${centreSummary(s.centreId)?.shortName} · ${formatDayDate(s.testDate)} ${s.testTime}`, at: s.detectedAt, tone: 'info', href: `/admin/slots/${s.id}` })
    if (s.status === 'Expired') events.push({ type: 'slot', title: 'Slot expired', description: s.id, at: s.updatedAt, tone: 'neutral' })
  }
  for (const n of lNotes.slice(0, 4)) events.push({ type: 'alert', title: 'Alert sent', description: `${n.channel} · ${n.status}`, at: n.createdAt, tone: n.status === 'Failed' ? 'danger' : 'success' })
  return events.sort((a, b) => new Date(b.at) - new Date(a.at))
}

const mock = {
  async getLearners(query = {}) {
    await delay()
    const res = applyListQuery(learners.map(withUser), { ...query, filters: learnerFilters(query.filters), searchFields: SEARCH_FIELDS })
    return clone({ total: res.total, page: res.page, pageSize: res.pageSize, data: res.data.map(enrich) })
  },
  /** Returns all matching rows (no pagination, references masked) for CSV export. */
  async exportLearners(query = {}) {
    await delay(400, 700)
    const { all } = applyListQuery(learners.map(withUser), { ...query, filters: learnerFilters(query.filters), page: 1, pageSize: 1e9, searchFields: SEARCH_FIELDS })
    recordAdminAction({ action: 'Exported data', resource: 'Learners', resourceId: `${all.length} rows` })
    return clone(all.map(enrich))
  },
  async getLearnerById(id) {
    await delay()
    const l = learnerById(id)
    if (!l) throw notFound('Learner', id)
    const jobs = monitoringJobs.filter((j) => j.learnerId === id)
    const lSlots = slots.filter((s) => s.learnerId === id)
    const lNotes = notifications.filter((n) => lSlots.some((s) => s.id === n.slotId))
    return clone({
      ...enrich(l),
      monitoring: jobs.map((j) => ({ ...j, centres: j.centreIds.map(centreSummary) })),
      slots: lSlots.map((s) => ({ ...s, centre: centreSummary(s.centreId) })),
      notifications: lNotes,
      timeline: timelineFor(l, jobs, lSlots, lNotes),
    })
  },
  /** Audited, permission-checked reveal of the raw licence/reference identifier. */
  async revealReference(id) {
    await delay(300, 500)
    const l = learnerById(id)
    if (!l) throw notFound('Learner', id)
    recordAdminAction({ action: 'Viewed masked learner reference', resource: 'Learner', resourceId: id, href: `/admin/learners/${id}` })
    return l.licenceRef
  },
  async updateLearner(id, data) {
    await delay()
    const l = learnerById(id)
    if (!l) throw notFound('Learner', id)
    Object.assign(l, data)
    recordAdminAction({ action: 'Updated learner', resource: 'Learner', resourceId: id, href: `/admin/learners/${id}` })
    return enrich(l)
  },
}

const api = {
  getLearners: (q) => apiClient.get('/api/admin/learners', { params: toParams(q) }).then(unwrapList),
  exportLearners: (q) => apiClient.get('/api/admin/learners/export', { params: toParams(q) }).then(unwrap),
  getLearnerById: (id) => apiClient.get(`/api/admin/learners/${id}`).then(unwrap),
  revealReference: (id) => apiClient.post(`/api/admin/learners/${id}/reveal-reference`).then(unwrap),
  updateLearner: (id, data) => apiClient.patch(`/api/admin/learners/${id}`, data).then(unwrap),
}

export const learnerService = defineService(mock, api)
