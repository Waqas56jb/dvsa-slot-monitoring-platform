/**
 * Activity log / history.
 * Future: GET /activity?learnerId=&centreId=&type=&from=&to=&page=  ·  written server-side.
 */
import { delay, clone } from './mockDb';
import { activityTable, learnersTable } from './selectors';
import { requireUserId } from './session';
import { publish } from './realtime';
import { getCentreSync } from './centreService';
import { createId } from '@/utils/id';
import { fullName } from '@/utils/format';

function decorate(entry) {
  const learner = entry.learnerId ? learnersTable.find(entry.learnerId) : null;
  return {
    ...entry,
    learnerName: learner ? fullName(learner) : entry.learnerName || null,
    centreName: entry.centreId ? getCentreSync(entry.centreId)?.name ?? null : null,
  };
}

/** Internal: record an event. Used by other services, not by UI components. */
export function logActivity(ownerId, { type, message, learnerId = null, centreId = null, learnerName }) {
  const entry = {
    id: createId('act'),
    ownerId,
    type,
    message,
    learnerId,
    centreId,
    learnerName,
    createdAt: new Date().toISOString(),
  };
  activityTable.insert(entry);
  publish('activity', entry);
  return entry;
}

export const activityService = {
  async recent(limit = 6) {
    await delay(120, 260);
    const ownerId = requireUserId();
    return clone(
      activityTable
        .all(ownerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
        .map(decorate),
    );
  },

  async list({ search = '', learnerId = '', centreId = '', type = '', dateFrom = '', dateTo = '', page = 1, pageSize = 10 } = {}) {
    await delay(200, 420);
    const ownerId = requireUserId();
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    const rows = activityTable
      .all(ownerId)
      .map(decorate)
      .filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return (
          (!learnerId || e.learnerId === learnerId) &&
          (!centreId || e.centreId === centreId) &&
          (!type || e.type === type) &&
          (from === null || t >= from) &&
          (to === null || t <= to) &&
          (!q || e.message.toLowerCase().includes(q) || e.learnerName?.toLowerCase().includes(q) || e.centreName?.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = rows.length;
    const start = (page - 1) * pageSize;
    return { items: clone(rows.slice(start, start + pageSize)), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  },

  async forLearner(learnerId, limit = 10) {
    await delay(120, 260);
    const ownerId = requireUserId();
    return clone(
      activityTable
        .all(ownerId)
        .filter((e) => e.learnerId === learnerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
        .map(decorate),
    );
  },
};
