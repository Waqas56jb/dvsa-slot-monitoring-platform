/**
 * Read-model helpers that join raw records into the shapes the UI needs.
 * The Node.js API will return these joined shapes directly later on.
 */
import { table } from './mockDb';
import { getCentreSync } from './centreService';
import { fullName } from '@/utils/format';

export const learnersTable = table('learners');
export const slotsTable = table('slots');
export const sessionsTable = table('monitoringSessions');
export const notificationsTable = table('notifications');
export const activityTable = table('activity');

export const LEARNER_STATUS = {
  monitoring: { label: 'Monitoring', tone: 'brand' },
  waiting: { label: 'Waiting', tone: 'warning' },
  slot_found: { label: 'Slot Found', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
};

export const SLOT_STATUS = {
  new: { label: 'New', tone: 'success' },
  viewed: { label: 'Viewed', tone: 'info' },
  actioned: { label: 'Actioned', tone: 'brand' },
  expired: { label: 'Expired', tone: 'neutral' },
  dismissed: { label: 'Dismissed', tone: 'neutral' },
};

export const SESSION_STATUS = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
  stopped: { label: 'Stopped', tone: 'neutral' },
};

export function sessionsForLearner(ownerId, learnerId) {
  return sessionsTable.all(ownerId).filter((s) => s.learnerIds.includes(learnerId));
}

/** Effective criteria: session overrides fall back to the learner's own preferences. */
export function effectiveCriteria(learner, session) {
  const c = session?.criteria || {};
  return {
    centreIds: c.centreIds?.length ? c.centreIds : learner.centreIds,
    dateFrom: c.dateFrom || learner.dateFrom,
    dateTo: c.dateTo || learner.dateTo,
    timeFrom: c.timeFrom || learner.timeFrom,
    timeTo: c.timeTo || learner.timeTo,
  };
}

export function decorateLearner(learner) {
  const ownerId = learner.ownerId;
  const sessions = sessionsForLearner(ownerId, learner.id);
  const slots = slotsTable.all(ownerId).filter((s) => s.learnerId === learner.id);
  const newSlots = slots.filter((s) => s.status === 'new');
  const active = sessions.find((s) => s.status === 'active');
  const paused = sessions.find((s) => s.status === 'paused');

  let status = 'inactive';
  if (newSlots.length) status = 'slot_found';
  else if (active) status = 'monitoring';
  else if (paused) status = 'waiting';

  const lastAlert = slots.reduce((max, s) => (!max || s.detectedAt > max ? s.detectedAt : max), null);

  return {
    ...learner,
    fullName: fullName(learner),
    status,
    isMonitoring: Boolean(active),
    session: active || paused || sessions[0] || null,
    centres: learner.centreIds.map(getCentreSync).filter(Boolean),
    newSlotCount: newSlots.length,
    totalSlotCount: slots.length,
    lastAlertAt: lastAlert,
  };
}

export function decorateSlot(slot) {
  const learner = learnersTable.find(slot.learnerId);
  const session = slot.sessionId ? sessionsTable.find(slot.sessionId) : null;
  return {
    ...slot,
    learner: learner ? { id: learner.id, firstName: learner.firstName, lastName: learner.lastName, fullName: fullName(learner) } : null,
    centre: getCentreSync(slot.centreId),
    session: session ? { id: session.id, name: session.name, status: session.status } : null,
    startsAt: `${slot.date}T${slot.time}:00`,
  };
}

export function decorateSession(session) {
  const learners = session.learnerIds.map((id) => learnersTable.find(id)).filter(Boolean);
  const centreIds = new Set();
  learners.forEach((l) => effectiveCriteria(l, session).centreIds.forEach((c) => centreIds.add(c)));
  return {
    ...session,
    learners: learners.map((l) => ({ id: l.id, firstName: l.firstName, lastName: l.lastName, fullName: fullName(l) })),
    centreIds: [...centreIds],
    centres: [...centreIds].map(getCentreSync).filter(Boolean),
  };
}

export function overallStatus(sessions) {
  if (sessions.some((s) => s.status === 'active')) return 'active';
  if (sessions.some((s) => s.status === 'paused')) return 'paused';
  return 'stopped';
}

export const isToday = (iso) => {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};
