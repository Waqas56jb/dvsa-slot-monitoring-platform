import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap } from '@/lib/service'
import { delay } from '@/lib/mock'
import { users } from '@/data/users'
import { learners } from '@/data/learners'
import { monitoringJobs } from '@/data/monitoring'
import { slots } from '@/data/slots'
import { testCentres } from '@/data/testCentres'
import { centreSummary, userSummary } from './_joins'

const LIMIT = 5
const has = (q, ...vals) => vals.some((v) => v && String(v).toLowerCase().includes(q))

/** Result: { users: Hit[], learners, monitoring, slots, centres }, Hit = { id, title, subtitle, href } */
const mock = {
  async globalSearch(query) {
    await delay(120, 220)
    const q = query.trim().toLowerCase().replace(/^#/, '')
    if (q.length < 2) return { users: [], learners: [], monitoring: [], slots: [], centres: [] }
    const take = (arr) => arr.slice(0, LIMIT)
    return {
      users: take(users.filter((u) => has(q, u.name, u.email, u.id, u.phone))).map((u) => ({ id: u.id, title: u.name, subtitle: u.email, meta: u.status, href: `/admin/users/${u.id}` })),
      learners: take(learners.filter((l) => has(q, l.name, l.id))).map((l) => ({ id: l.id, title: l.name, subtitle: `Learner · ${userSummary(l.userId)?.email}`, meta: l.referenceStatus, href: `/admin/learners/${l.id}` })),
      monitoring: take(monitoringJobs.filter((j) => has(q, j.id, userSummary(j.userId)?.name))).map((j) => ({ id: j.id, title: j.id, subtitle: `${userSummary(j.userId)?.name} · ${j.centreIds.length} centre(s)`, meta: j.status, href: `/admin/monitoring/${j.id}` })),
      slots: take(slots.filter((s) => has(q, s.id, centreSummary(s.centreId)?.name))).map((s) => ({ id: s.id, title: s.id, subtitle: `${centreSummary(s.centreId)?.shortName} · ${s.testDate} ${s.testTime}`, meta: s.status, href: `/admin/slots/${s.id}` })),
      centres: take(testCentres.filter((c) => has(q, c.name, c.city, c.code, c.region, c.postcode))).map((c) => ({ id: c.id, title: c.name, subtitle: `${c.city} · ${c.code}`, meta: c.status, href: `/admin/test-centres/${c.id}` })),
    }
  },
}

const api = {
  globalSearch: (q) => apiClient.get('/api/admin/search', { params: { q } }).then(unwrap),
}

export const searchService = defineService(mock, api)
