import { apiClient } from '@/lib/apiClient'
import { defineService, unwrap } from '@/lib/service'
import { delay, clone, createRandom, DAY } from '@/lib/mock'
import {
  kpis, platformActivity, slotPipeline, monitoringStatusCounts, userGrowth, monitoringTrend, notificationTrend,
  revenueTrend, usageTrend, centrePerformance, planMix, channelMix,
} from '@/data/analytics'

const RANGE_DAYS = { today: 1, '24h': 1, '7d': 7, '30d': 30, '90d': 90 }

function kpiSpark(key) {
  const src = platformActivity['30d']
  const field = { totalUsers: 'users', activeMonitoring: 'jobs', slotsToday: 'slots', alertsToday: 'alerts', activeLearners: 'users', conversionRate: 'users' }[key]
  return field ? src.slice(-14).map((d) => ({ t: d.t, value: d[field] })) : null
}

/* ---- Analytics history (mock) ------------------------------------------------
 * The data module keeps short, dashboard-sized windows. Analytics needs up to
 * 90 days plus the previous period for deltas, so mock mode extends each daily
 * series backwards deterministically. The real API returns full history.
 */
const HISTORY_DAYS = 180
function extendBack(arr, keys, seed) {
  const r = createRandom(seed)
  const out = [...arr]
  while (out.length < HISTORY_DAYS) {
    const next = out[0]
    const point = { t: next.t - DAY }
    for (const k of keys) point[k] = Math.max(1, Math.round(next[k] * (0.996 + (r.next() - 0.5) * 0.06)))
    out.unshift(point)
  }
  return out
}
const HISTORY = {
  userGrowth: extendBack(userGrowth, ['registrations', 'active', 'returning'], 11),
  monitoring: extendBack(monitoringTrend, ['created', 'active', 'completed', 'failed'], 12),
  slots: extendBack(slotPipeline, ['discovered', 'matched', 'alerts', 'bookingActions'], 13),
  notifications: extendBack(notificationTrend, ['sent', 'delivered', 'failed', 'read'], 14),
}
const sum = (arr, k) => arr.reduce((a, d) => a + (d[k] || 0), 0)
const avg = (arr, k) => (arr.length ? Math.round(sum(arr, k) / arr.length) : 0)
const pct = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : null)

const mock = {
  /** GET /api/admin/dashboard?range= */
  async getDashboard({ range = '7d' } = {}) {
    await delay(300, 600)
    const k = Object.fromEntries(Object.entries(kpis).map(([key, v]) => [key, { ...v, spark: kpiSpark(key) }]))
    return clone({ kpis: k, monitoringStatus: monitoringStatusCounts, pipeline: slotPipeline.slice(-(range === '90d' || range === '30d' ? 14 : 7)) })
  },
  /** GET /api/admin/analytics/activity?range=24h|7d|30d */
  async getPlatformActivity(range = '7d') {
    await delay(200, 400)
    return clone(platformActivity[range] || platformActivity['7d'])
  },
  /** GET /api/admin/analytics?range=7d|30d|90d */
  async getAnalytics({ range = '30d' } = {}) {
    await delay(400, 700)
    const days = RANGE_DAYS[range] || 30
    const win = (arr) => ({ cur: arr.slice(-days), prev: arr.slice(-2 * days, -days) })
    const ug = win(HISTORY.userGrowth)
    const mt = win(HISTORY.monitoring)
    const sp = win(HISTORY.slots)
    const nt = win(HISTORY.notifications)
    const [lastMonth, prevMonth] = revenueTrend.slice(-2).reverse()
    const kpi = (cur, prev, key, agg = sum) => ({ value: agg(cur, key), delta: pct(agg(cur, key), agg(prev, key)), spark: cur.map((d) => ({ t: d.t, value: d[key] })) })
    const centres = centrePerformance.slice(0, 10)
    return clone({
      range,
      days,
      userGrowth: ug.cur,
      monitoring: mt.cur,
      slots: sp.cur,
      notifications: nt.cur,
      revenue: revenueTrend,
      usage: usageTrend,
      centrePerformance: centres,
      centreSummary: {
        centres: centrePerformance.length,
        avgDetections: Math.round(centrePerformance.reduce((a, c) => a + c.slots, 0) / Math.max(1, centrePerformance.length)),
        avgMatchRate: Math.round(centrePerformance.reduce((a, c) => a + c.matchRate, 0) / Math.max(1, centrePerformance.length)),
      },
      planMix,
      channelMix,
      kpis: {
        registrations: kpi(ug.cur, ug.prev, 'registrations'),
        activeUsers: kpi(ug.cur, ug.prev, 'active', avg),
        jobsCreated: kpi(mt.cur, mt.prev, 'created'),
        slotsDiscovered: kpi(sp.cur, sp.prev, 'discovered'),
        alertsSent: kpi(nt.cur, nt.prev, 'sent'),
        grossRevenue: { value: lastMonth.gross, delta: pct(lastMonth.gross, prevMonth.gross), spark: revenueTrend.map((d) => ({ t: d.t, value: d.gross })) },
      },
      totals: {
        registrations: sum(ug.cur, 'registrations'),
        jobsCreated: sum(mt.cur, 'created'),
        slotsDiscovered: sum(sp.cur, 'discovered'),
        alertsSent: sum(nt.cur, 'sent'),
        grossRevenue: lastMonth.gross,
      },
    })
  },
}

const api = {
  getDashboard: (params) => apiClient.get('/api/admin/dashboard', { params }).then(unwrap),
  getPlatformActivity: (range) => apiClient.get('/api/admin/analytics/activity', { params: { range } }).then(unwrap),
  getAnalytics: (params) => apiClient.get('/api/admin/analytics', { params }).then(unwrap),
}

export const analyticsService = defineService(mock, api)
