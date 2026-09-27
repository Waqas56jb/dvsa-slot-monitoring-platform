import { apiClient, ApiError } from '@/lib/apiClient'
import { defineService, unwrap, unwrapList, toParams } from '@/lib/service'
import { delay, notFound, clone, createRandom, NOW, DAY } from '@/lib/mock'
import { applyListQuery } from '@/utils/query'
import { recordAdminAction } from '@/lib/mockAudit'
import { testCentres, centreById } from '@/data/testCentres'
import { slots } from '@/data/slots'
import { monitoringJobs } from '@/data/monitoring'
import { learnerSummary, userSummary } from './_joins'

const r = createRandom(88)

function detectionSeries(c) {
  return Array.from({ length: 30 }, (_, i) => ({ t: NOW - (29 - i) * DAY, value: c.status === 'Active' ? Math.max(0, Math.round((c.demandScore / 10) * (0.5 + r.next()))) : 0 }))
}

const mock = {
  async getCentres(query = {}) {
    await delay()
    const { all, ...res } = applyListQuery(testCentres, { ...query, searchFields: ['name', 'city', 'code', 'region', 'postcode'] }) // eslint-disable-line no-unused-vars
    return clone(res)
  },
  async getAllCentres() {
    await delay(100, 200)
    return clone(testCentres.map((c) => ({ id: c.id, name: c.name, shortName: c.shortName, region: c.region, status: c.status })))
  },
  async getCentreById(id) {
    await delay()
    const c = centreById(id)
    if (!c) throw notFound('Test centre', id)
    return clone({
      ...c,
      detectionSeries: detectionSeries(c),
      hourly: Array.from({ length: 12 }, (_, i) => ({ hour: `${String(7 + i).padStart(2, '0')}:00`, value: Math.round((i > 1 && i < 5 ? 14 : 6) * (0.6 + r.next() * 0.8)) })),
      recentSlots: slots.filter((s) => s.centreId === id).slice(0, 12).map((s) => ({ ...s, user: userSummary(s.userId), learner: learnerSummary(s.learnerId) })),
      jobs: monitoringJobs.filter((j) => j.centreIds.includes(id) && j.status === 'Running').slice(0, 10).map((j) => ({ ...j, user: userSummary(j.userId), learner: learnerSummary(j.learnerId) })),
    })
  },
  async createCentre(data) {
    await delay(500, 800)
    if (testCentres.some((c) => c.code.toLowerCase() === data.code.toLowerCase())) {
      throw new ApiError('A centre with this code already exists.', { status: 409, details: { code: 'Code already in use' } })
    }
    const c = {
      id: `ctr_${String(testCentres.length + 1).padStart(3, '0')}`, name: data.name, shortName: data.name.replace(/ Driving Test Centre$/i, ''),
      city: data.city, region: data.region, code: data.code.toUpperCase(), address: data.address, postcode: data.postcode,
      coordinates: { lat: Number(data.lat) || 51.5, lng: Number(data.lng) || -0.12 }, status: data.status || 'Active', monitoringJobs: 0,
      slotsDetected: 0, slotsDetected7d: 0, slotsDetected24h: 0, lastChecked: null, availability: 'None', demandScore: 0, avgWaitWeeks: null,
      checkInterval: Number(data.checkInterval) || 120, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), notes: data.notes || '',
    }
    testCentres.unshift(c)
    recordAdminAction({ action: 'Created test centre', resource: 'Test centre', resourceId: c.id, href: `/admin/test-centres/${c.id}`, description: `Created test centre · ${c.name}` })
    return clone(c)
  },
  async updateCentre(id, data) {
    await delay()
    const c = centreById(id)
    if (!c) throw notFound('Test centre', id)
    if (data.code && testCentres.some((x) => x.id !== id && x.code.toLowerCase() === data.code.toLowerCase())) {
      throw new ApiError('A centre with this code already exists.', { status: 409, details: { code: 'Code already in use' } })
    }
    if (data.code) data = { ...data, code: data.code.toUpperCase() }
    if (data.checkInterval != null) data = { ...data, checkInterval: Number(data.checkInterval) }
    const changes = {}
    for (const k of ['name', 'city', 'region', 'code', 'address', 'postcode', 'status', 'checkInterval', 'notes']) {
      if (data[k] !== undefined && data[k] !== c[k]) { changes[k] = [c[k], data[k]]; c[k] = data[k] }
    }
    if (data.name) c.shortName = data.name.replace(/ Driving Test Centre$/i, '')
    if (data.status === 'Inactive') c.availability = 'None'
    if (data.lat != null || data.lng != null) c.coordinates = { lat: Number(data.lat ?? c.coordinates.lat), lng: Number(data.lng ?? c.coordinates.lng) }
    c.updatedAt = new Date().toISOString()
    recordAdminAction({ action: 'Updated test centre', resource: 'Test centre', resourceId: id, changes, href: `/admin/test-centres/${id}`, description: `Updated test centre · ${c.name}` })
    return clone(c)
  },
  async setCentreStatus(id, status) {
    await delay()
    const c = centreById(id)
    if (!c) throw notFound('Test centre', id)
    if (c.status === status) return clone(c)
    const prev = c.status
    c.status = status
    if (status === 'Inactive') c.availability = 'None'
    c.updatedAt = new Date().toISOString()
    const verb = status === 'Active' ? 'Activated' : 'Deactivated'
    recordAdminAction({ action: `${verb} test centre`, resource: 'Test centre', resourceId: id, changes: { status: [prev, status] }, href: `/admin/test-centres/${id}`, description: `${verb} test centre · ${c.name}` })
    return clone(c)
  },
}

const api = {
  getCentres: (q) => apiClient.get('/api/admin/test-centres', { params: toParams(q) }).then(unwrapList),
  getAllCentres: () => apiClient.get('/api/admin/test-centres', { params: { fields: 'summary', pageSize: 1000 } }).then(unwrap),
  getCentreById: (id) => apiClient.get(`/api/admin/test-centres/${id}`).then(unwrap),
  createCentre: (data) => apiClient.post('/api/admin/test-centres', data).then(unwrap),
  updateCentre: (id, data) => apiClient.patch(`/api/admin/test-centres/${id}`, data).then(unwrap),
  setCentreStatus: (id, status) => apiClient.patch(`/api/admin/test-centres/${id}`, { status }).then(unwrap),
}

export const centreService = defineService(mock, api)
