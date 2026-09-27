/**
 * Learner management.
 * Future: GET/POST /learners · GET/PATCH/DELETE /learners/:id · POST /learners/:id/monitoring
 */
import { delay, clone, ServiceError } from './mockDb';
import { learnersTable, sessionsTable, slotsTable, decorateLearner } from './selectors';
import { requireUserId } from './session';
import { publish } from './realtime';
import { logActivity } from './activityService';
import { pushNotification } from './notificationService';
import { getCentreName } from './centreService';
import { createId } from '@/utils/id';
import { fullName } from '@/utils/format';

const EDITABLE = [
  'firstName', 'lastName', 'email', 'phone', 'centreIds', 'preferredDate', 'dateFrom', 'dateTo',
  'timeFrom', 'timeTo', 'excludeWeekends', 'notifications', 'notes',
];

function pick(data) {
  const out = {};
  EDITABLE.forEach((k) => {
    if (data[k] !== undefined) out[k] = typeof data[k] === 'string' ? data[k].trim() : data[k];
  });
  return out;
}

function getOwned(id, ownerId) {
  const l = learnersTable.find(id);
  if (!l || l.ownerId !== ownerId) throw new ServiceError('Learner not found.', 'not_found');
  return l;
}

function notifyChange() {
  publish('learners');
  publish('monitoring');
}

/** Turn monitoring on/off for a single learner (internal helper). */
function applyMonitoring(ownerId, learner, enabled) {
  const sessions = sessionsTable.all(ownerId).filter((s) => s.learnerIds.includes(learner.id));
  const now = new Date().toISOString();
  if (enabled) {
    if (sessions.some((s) => s.status === 'active')) return;
    const solo = sessions.find((s) => s.learnerIds.length === 1);
    if (solo) {
      sessionsTable.update(solo.id, { status: 'active', startedAt: now });
    } else {
      sessionsTable.insert({
        id: createId('mon'),
        ownerId,
        name: `${fullName(learner)} — personal`,
        learnerIds: [learner.id],
        criteria: null,
        status: 'active',
        interval: '60',
        notify: { dashboard: true, ...learner.notifications },
        createdAt: now,
        startedAt: now,
        lastCheckedAt: null,
        checksCount: 0,
        matchesCount: 0,
      });
    }
    logActivity(ownerId, { type: 'monitoring_started', message: `Monitoring started for ${fullName(learner)}`, learnerId: learner.id });
  } else {
    sessions.forEach((s) => {
      const remaining = s.learnerIds.filter((id) => id !== learner.id);
      if (remaining.length === 0) sessionsTable.update(s.id, { status: 'stopped', startedAt: null });
      else sessionsTable.update(s.id, { learnerIds: remaining });
    });
    logActivity(ownerId, { type: 'monitoring_stopped', message: `Monitoring stopped for ${fullName(learner)}`, learnerId: learner.id });
  }
}

export const learnerService = {
  /** status: 'all' | 'monitoring' | 'slot_found' | 'waiting' | 'inactive' */
  async list({ search = '', status = 'all' } = {}) {
    await delay(220, 480);
    const ownerId = requireUserId();
    const q = search.trim().toLowerCase();
    return clone(
      learnersTable
        .all(ownerId)
        .map(decorateLearner)
        .filter(
          (l) =>
            (status === 'all' || l.status === status) &&
            (!q || l.fullName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.centres.some((c) => c.name.toLowerCase().includes(q))),
        )
        .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt)),
    );
  },

  async get(id) {
    await delay(160, 320);
    const ownerId = requireUserId();
    return clone(decorateLearner(getOwned(id, ownerId)));
  },

  async create(data) {
    await delay(500, 800);
    const ownerId = requireUserId();
    const now = new Date().toISOString();
    const learner = {
      id: createId('lrn'),
      ownerId,
      referenceNote: 'Reference held securely by the backend — not stored in the browser.',
      excludeWeekends: false,
      notifications: { browser: true, sound: true, email: false },
      notes: '',
      centreIds: [],
      ...pick(data),
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    learnersTable.insert(learner);
    logActivity(ownerId, { type: 'learner_added', message: `${fullName(learner)} added`, learnerId: learner.id });
    pushNotification(ownerId, {
      type: 'learner',
      event: 'learner_added',
      title: 'Learner added',
      message: `${fullName(learner)} was added to your account.`,
      link: `/dashboard/learners/${learner.id}`,
    });
    if (data.monitoringEnabled) applyMonitoring(ownerId, learner, true);
    notifyChange();
    return clone(decorateLearner(learner));
  },

  async update(id, data) {
    await delay(400, 700);
    const ownerId = requireUserId();
    const before = getOwned(id, ownerId);
    const patch = pick(data);
    const now = new Date().toISOString();
    const updated = learnersTable.update(id, { ...patch, updatedAt: now, lastActivityAt: now });

    const added = (patch.centreIds || []).filter((c) => !before.centreIds.includes(c));
    added.forEach((c) =>
      logActivity(ownerId, { type: 'centre_added', message: `${getCentreName(c)} added to ${fullName(updated)}'s centres`, learnerId: id, centreId: c }),
    );
    const prefChanged = ['dateFrom', 'dateTo', 'timeFrom', 'timeTo', 'preferredDate', 'excludeWeekends'].some(
      (k) => patch[k] !== undefined && patch[k] !== before[k],
    );
    if (prefChanged) {
      logActivity(ownerId, { type: 'preference_changed', message: `Test preferences updated for ${fullName(updated)}`, learnerId: id });
    } else if (!added.length) {
      logActivity(ownerId, { type: 'learner_updated', message: `${fullName(updated)} updated`, learnerId: id });
    }
    pushNotification(ownerId, {
      type: 'learner',
      event: 'learner_updated',
      title: 'Learner updated',
      message: `${fullName(updated)}'s details were saved.`,
      link: `/dashboard/learners/${id}`,
    });
    if (data.monitoringEnabled !== undefined) applyMonitoring(ownerId, updated, data.monitoringEnabled);
    notifyChange();
    return clone(decorateLearner(updated));
  },

  async remove(id) {
    await delay(300, 600);
    const ownerId = requireUserId();
    const learner = getOwned(id, ownerId);
    applyMonitoring(ownerId, learner, false);
    learnersTable.remove(id);
    slotsTable.removeWhere((s) => s.learnerId === id && s.status === 'new');
    logActivity(ownerId, { type: 'learner_deleted', message: `${fullName(learner)} removed`, learnerName: fullName(learner) });
    notifyChange();
    publish('slots');
    return true;
  },

  async setMonitoring(id, enabled) {
    await delay(300, 550);
    const ownerId = requireUserId();
    const learner = getOwned(id, ownerId);
    applyMonitoring(ownerId, learner, enabled);
    learnersTable.update(id, { lastActivityAt: new Date().toISOString() });
    pushNotification(ownerId, {
      type: 'system',
      event: enabled ? 'monitoring_started' : 'monitoring_paused',
      title: enabled ? 'Monitoring started' : 'Monitoring stopped',
      message: `${fullName(learner)} is ${enabled ? 'now being monitored' : 'no longer being monitored'}.`,
      link: `/dashboard/learners/${id}`,
    });
    notifyChange();
    return clone(decorateLearner(learnersTable.find(id)));
  },

  /** Lightweight list for pickers (no latency). */
  async options() {
    const ownerId = requireUserId();
    return learnersTable.all(ownerId).map((l) => ({ value: l.id, label: fullName(l), centreIds: l.centreIds }));
  },
};
