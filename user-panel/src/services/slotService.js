/**
 * Detected slots ("matches").
 * Future: GET /slots?status=&sort= · GET /slots/:id · PATCH /slots/:id { status }
 * Slot detection itself will run server-side and arrive over a realtime channel.
 */
import { delay, clone, ServiceError } from './mockDb';
import { slotsTable, sessionsTable, learnersTable, decorateSlot } from './selectors';
import { requireUserId } from './session';
import { publish } from './realtime';
import { logActivity } from './activityService';
import { pushNotification } from './notificationService';
import { getCentreName } from './centreService';
import { createId } from '@/utils/id';
import { formatDate, formatTimeString, fullName } from '@/utils/format';

const SORTS = {
  newest: (a, b) => b.detectedAt.localeCompare(a.detectedAt),
  closest: (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  centre: (a, b) => (a.centre?.name || '').localeCompare(b.centre?.name || ''),
};

function getOwned(id, ownerId) {
  const s = slotsTable.find(id);
  if (!s || s.ownerId !== ownerId) throw new ServiceError('This slot could not be found. It may have been removed.', 'not_found');
  return s;
}

function changed(slot) {
  publish('slots', slot);
  publish('learners');
}

export const slotService = {
  /** status: 'all' | 'new' | 'viewed' | 'actioned' | 'expired' */
  async list({ status = 'all', sort = 'newest', learnerId = '', search = '' } = {}) {
    await delay(220, 460);
    const ownerId = requireUserId();
    const q = search.trim().toLowerCase();
    return clone(
      slotsTable
        .all(ownerId)
        .filter((s) => (status === 'all' ? s.status !== 'dismissed' : s.status === status))
        .filter((s) => !learnerId || s.learnerId === learnerId)
        .map(decorateSlot)
        .filter((s) => !q || s.centre?.name.toLowerCase().includes(q) || s.learner?.fullName.toLowerCase().includes(q))
        .sort(SORTS[sort] || SORTS.newest),
    );
  },

  async counts() {
    const ownerId = requireUserId();
    const all = slotsTable.all(ownerId);
    const by = (st) => all.filter((s) => s.status === st).length;
    return {
      all: all.filter((s) => s.status !== 'dismissed').length,
      new: by('new'),
      viewed: by('viewed'),
      actioned: by('actioned'),
      expired: by('expired'),
    };
  },

  async get(id) {
    await delay(160, 320);
    const ownerId = requireUserId();
    return clone(decorateSlot(getOwned(id, ownerId)));
  },

  async latestNew() {
    await delay(120, 260);
    const ownerId = requireUserId();
    const s = slotsTable
      .all(ownerId)
      .filter((x) => x.status === 'new')
      .sort(SORTS.newest)[0];
    return s ? clone(decorateSlot(s)) : null;
  },

  async markViewed(id) {
    const ownerId = requireUserId();
    const s = getOwned(id, ownerId);
    if (s.status !== 'new') return clone(decorateSlot(s));
    const updated = slotsTable.update(id, { status: 'viewed', viewedAt: new Date().toISOString() });
    changed(updated);
    return clone(decorateSlot(updated));
  },

  /** Records that the user opened the official booking service for this slot. */
  async markActioned(id) {
    await delay(80, 160);
    const ownerId = requireUserId();
    const s = getOwned(id, ownerId);
    const updated = slotsTable.update(id, { status: 'actioned', actionedAt: new Date().toISOString() });
    logActivity(ownerId, {
      type: 'slot_actioned',
      message: `Official booking opened for ${getCentreName(s.centreId)} slot`,
      learnerId: s.learnerId,
      centreId: s.centreId,
    });
    changed(updated);
    return clone(decorateSlot(updated));
  },

  async dismiss(id) {
    await delay(150, 300);
    const ownerId = requireUserId();
    const s = getOwned(id, ownerId);
    const updated = slotsTable.update(id, { status: 'dismissed', previousStatus: s.status, dismissedAt: new Date().toISOString() });
    logActivity(ownerId, {
      type: 'slot_dismissed',
      message: `${getCentreName(s.centreId)} slot dismissed`,
      learnerId: s.learnerId,
      centreId: s.centreId,
    });
    changed(updated);
    return clone(decorateSlot(updated));
  },

  async restore(id) {
    await delay(100, 200);
    const ownerId = requireUserId();
    const s = getOwned(id, ownerId);
    const updated = slotsTable.update(id, { status: s.previousStatus || 'viewed', previousStatus: null });
    changed(updated);
    return clone(decorateSlot(updated));
  },

  /**
   * Internal: record a newly detected slot. Called by the monitoring
   * simulator today; the backend detection service will do this later.
   */
  recordDetected(ownerId, { sessionId, learnerId, centreId, date, time, matchScore }) {
    const learner = learnersTable.find(learnerId);
    const slot = {
      id: createId('slt'),
      ownerId,
      learnerId,
      centreId,
      date,
      time,
      detectedAt: new Date().toISOString(),
      status: 'new',
      matchScore,
      matched: { centre: true, date: true, time: true },
      sessionId,
    };
    slotsTable.insert(slot);
    if (sessionId) {
      const session = sessionsTable.find(sessionId);
      if (session) sessionsTable.update(sessionId, { matchesCount: (session.matchesCount || 0) + 1 });
    }
    if (learner) learnersTable.update(learnerId, { lastActivityAt: slot.detectedAt });
    logActivity(ownerId, { type: 'slot_detected', message: `Matching slot detected at ${getCentreName(centreId)}`, learnerId, centreId });
    pushNotification(ownerId, {
      type: 'slot',
      event: 'slot_found',
      title: 'New slot found',
      message: `${getCentreName(centreId)} · ${formatDate(date)} at ${formatTimeString(time)}${learner ? ` for ${fullName(learner)}` : ''}.`,
      link: `/dashboard/slots/${slot.id}`,
    });
    changed(slot);
    publish('monitoring');
    return clone(decorateSlot(slot));
  },
};
