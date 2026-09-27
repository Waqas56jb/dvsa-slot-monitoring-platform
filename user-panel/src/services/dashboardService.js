/**
 * Dashboard aggregates.
 * Future: GET /dashboard/summary · GET /dashboard/analytics?days=
 */
import { delay, clone } from './mockDb';
import { learnersTable, slotsTable, notificationsTable, sessionsTable, isToday } from './selectors';
import { requireUserId } from './session';
import { toISODate, addDays } from '@/utils/format';

/** Stable pseudo-random number for a given key (keeps charts steady between reloads). */
function seeded(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

export const dashboardService = {
  async getStats() {
    await delay(200, 420);
    const ownerId = requireUserId();
    const activeSessions = sessionsTable.all(ownerId).filter((s) => s.status === 'active');
    const monitoring = new Set(activeSessions.flatMap((s) => s.learnerIds));
    return {
      activeLearners: learnersTable.all(ownerId).length,
      monitoring: monitoring.size,
      slotsFound: slotsTable.all(ownerId).filter((s) => s.status === 'new').length,
      alertsToday: notificationsTable.all(ownerId).filter((n) => isToday(n.createdAt)).length,
    };
  },

  /** Daily checks and matches for the last `days` days. */
  async getAnalytics(days = 14) {
    await delay(250, 500);
    const ownerId = requireUserId();
    const slots = slotsTable.all(ownerId);
    const hasData = learnersTable.all(ownerId).length > 0;
    const today = new Date();
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = addDays(today, -i);
      const key = toISODate(day);
      const real = slots.filter((s) => toISODate(s.detectedAt) === key).length;
      const base = hasData ? Math.round(seeded(`${ownerId}${key}`) * 4) : 0;
      series.push({
        date: key,
        label: day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        matches: real + base,
        checks: hasData ? 180 + Math.round(seeded(`c${ownerId}${key}`) * 140) : 0,
      });
    }
    return clone(series);
  },
};
