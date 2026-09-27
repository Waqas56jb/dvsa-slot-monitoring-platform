/**
 * Monitoring sessions and controls.
 * Future: GET /monitoring · POST /monitoring/sessions · PATCH /monitoring/sessions/:id
 *         POST /monitoring/start|pause|stop
 * The actual checking will run in a backend worker; the UI only reads status.
 */
import { delay, clone, ServiceError } from './mockDb';
import {
  sessionsTable, learnersTable, slotsTable, decorateSession, overallStatus, effectiveCriteria, isToday,
} from './selectors';
import { requireUserId } from './session';
import { publish } from './realtime';
import { logActivity } from './activityService';
import { pushNotification } from './notificationService';
import { createId } from '@/utils/id';
import { fullName } from '@/utils/format';

const STATUS_WORD = { active: 'started', paused: 'paused', stopped: 'stopped' };

function getOwned(id, ownerId) {
  const s = sessionsTable.find(id);
  if (!s || s.ownerId !== ownerId) throw new ServiceError('Monitoring session not found.', 'not_found');
  return s;
}

function changed() {
  publish('monitoring');
  publish('learners');
}

function buildOverview(ownerId) {
  const sessions = sessionsTable
    .all(ownerId)
    .map(decorateSession)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const active = sessions.filter((s) => s.status === 'active');
  const learnerIds = new Set(active.flatMap((s) => s.learnerIds));
  const centreIds = new Set(active.flatMap((s) => s.centreIds));
  const lastScanAt = active.reduce((m, s) => (s.lastCheckedAt && (!m || s.lastCheckedAt > m) ? s.lastCheckedAt : m), null);
  const matchesToday = slotsTable.all(ownerId).filter((s) => isToday(s.detectedAt)).length;
  return {
    status: overallStatus(sessions),
    sessions,
    learnersMonitored: learnerIds.size,
    centresMonitored: centreIds.size,
    lastScanAt,
    matchesToday,
    checksTotal: sessions.reduce((n, s) => n + (s.checksCount || 0), 0),
  };
}

function setStatus(ownerId, session, status) {
  const now = new Date().toISOString();
  sessionsTable.update(session.id, { status, startedAt: status === 'active' ? now : session.startedAt && status === 'paused' ? session.startedAt : null });
  logActivity(ownerId, {
    type: status === 'active' ? 'monitoring_started' : status === 'paused' ? 'monitoring_paused' : 'monitoring_stopped',
    message: `Monitoring ${STATUS_WORD[status]} for ${session.name}`,
    learnerId: session.learnerIds.length === 1 ? session.learnerIds[0] : null,
  });
}

async function setAll(status) {
  await delay(350, 650);
  const ownerId = requireUserId();
  const sessions = sessionsTable.all(ownerId).filter((s) => s.learnerIds.length > 0);
  if (!sessions.length) {
    throw new ServiceError('Create a monitoring session first — choose learners, centres and preferences.', 'no_sessions');
  }
  const targets = sessions.filter((s) => s.status !== status && !(status === 'paused' && s.status === 'stopped'));
  targets.forEach((s) => setStatus(ownerId, s, status));
  if (targets.length) {
    pushNotification(ownerId, {
      type: 'system',
      event: status === 'active' ? 'monitoring_started' : 'monitoring_paused',
      title: `Monitoring ${STATUS_WORD[status]}`,
      message: `${targets.length} monitoring session${targets.length > 1 ? 's' : ''} ${STATUS_WORD[status]}.`,
      link: '/dashboard/monitoring',
    });
  }
  changed();
  return clone(buildOverview(ownerId));
}

export const monitoringService = {
  async getOverview() {
    await delay(160, 340);
    const ownerId = requireUserId();
    return clone(buildOverview(ownerId));
  },

  /** No-latency read for the live engine. */
  getOverviewSync() {
    return clone(buildOverview(requireUserId()));
  },

  async getSession(id) {
    await delay(120, 260);
    const ownerId = requireUserId();
    return clone(decorateSession(getOwned(id, ownerId)));
  },

  /**
   * data: { name, learnerIds, criteria: { centreIds, dateFrom, dateTo, timeFrom, timeTo }, notify, interval, start }
   */
  async createSession(data) {
    await delay(500, 900);
    const ownerId = requireUserId();
    if (!data.learnerIds?.length) throw new ServiceError('Select at least one learner.', 'validation', 'learnerIds');
    const now = new Date().toISOString();
    const learners = data.learnerIds.map((id) => learnersTable.find(id)).filter(Boolean);
    const session = {
      id: createId('mon'),
      ownerId,
      name: data.name?.trim() || (learners.length === 1 ? `${fullName(learners[0])} — monitoring` : `${learners.length} learners — monitoring`),
      learnerIds: data.learnerIds,
      criteria: data.criteria || null,
      status: data.start === false ? 'paused' : 'active',
      interval: data.interval || '60',
      notify: data.notify || { dashboard: true, browser: true, sound: true, email: false },
      createdAt: now,
      startedAt: data.start === false ? null : now,
      lastCheckedAt: null,
      checksCount: 0,
      matchesCount: 0,
    };
    sessionsTable.insert(session);
    logActivity(ownerId, {
      type: 'monitoring_started',
      message: `Monitoring started for ${session.name}`,
      learnerId: learners.length === 1 ? learners[0].id : null,
    });
    pushNotification(ownerId, {
      type: 'system',
      event: 'monitoring_started',
      title: 'Monitoring started',
      message: `${session.name} is now active.`,
      link: '/dashboard/monitoring',
    });
    changed();
    return clone(decorateSession(session));
  },

  async setSessionStatus(id, status) {
    await delay(250, 500);
    const ownerId = requireUserId();
    const s = getOwned(id, ownerId);
    setStatus(ownerId, s, status);
    changed();
    return clone(decorateSession(sessionsTable.find(id)));
  },

  async deleteSession(id) {
    await delay(250, 450);
    const ownerId = requireUserId();
    const s = getOwned(id, ownerId);
    sessionsTable.remove(id);
    logActivity(ownerId, { type: 'monitoring_stopped', message: `Monitoring session "${s.name}" deleted` });
    changed();
    return true;
  },

  startAll: () => setAll('active'),
  pauseAll: () => setAll('paused'),
  stopAll: () => setAll('stopped'),

  /**
   * Internal (simulation): list of learner × centre targets being watched by
   * active sessions, with each learner's effective criteria.
   */
  getActiveTargets() {
    const ownerId = requireUserId();
    const targets = [];
    sessionsTable
      .all(ownerId)
      .filter((s) => s.status === 'active')
      .forEach((session) => {
        session.learnerIds.forEach((lid) => {
          const learner = learnersTable.find(lid);
          if (!learner) return;
          const criteria = effectiveCriteria(learner, session);
          criteria.centreIds.forEach((centreId) =>
            targets.push({ sessionId: session.id, learnerId: lid, learnerName: fullName(learner), centreId, criteria }),
          );
        });
      });
    return targets;
  },

  /** Internal (simulation): mark sessions as checked. */
  recordCheck(sessionIds) {
    const now = new Date().toISOString();
    sessionIds.forEach((id) => {
      const s = sessionsTable.find(id);
      if (s) sessionsTable.update(id, { lastCheckedAt: now, checksCount: (s.checksCount || 0) + 1 });
    });
    publish('monitoring', { tick: true });
  },
};
