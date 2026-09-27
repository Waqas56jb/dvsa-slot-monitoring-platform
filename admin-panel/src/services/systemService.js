import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap } from '@/lib/service'
import { delay, clone } from '@/lib/mock'
import { services, workers, engineSummary, systemBanner } from '@/data/analytics'

/** Read-only view of backend-reported infrastructure state. */
const mock = {
  async getSystemHealth() {
    await delay(250, 500)
    const online = workers.filter((w) => w.status === 'Online' || w.status === 'Degraded')
    return clone({
      services,
      workers,
      engine: {
        ...engineSummary,
        activeWorkers: online.length,
        totalWorkers: workers.length,
        capacity: workers.reduce((a, w) => a + w.capacity, 0),
        jobsRunning: workers.reduce((a, w) => a + w.jobs, 0),
        avgResponseMs: Math.round(online.reduce((a, w) => a + (w.avgResponseMs || 0), 0) / Math.max(1, online.length)),
        lastHeartbeat: workers.map((w) => w.lastHeartbeat).sort().slice(-1)[0],
      },
      checkedAt: new Date().toISOString(),
      overall: services.some((s) => s.status === 'Down') ? 'Down' : services.some((s) => s.status === 'Degraded') ? 'Degraded' : 'Operational',
    })
  },
  async getBanner() {
    await delay(60, 120)
    return clone(systemBanner)
  },
}

const api = {
  getSystemHealth: () => apiClient.get('/api/admin/system-health').then(unwrap),
  getBanner: () => apiClient.get('/api/admin/system-health/banner').then(unwrap),
}

export const systemService = defineService(mock, api)
