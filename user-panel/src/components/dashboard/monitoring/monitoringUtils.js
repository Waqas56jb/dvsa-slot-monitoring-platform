import { MONITORING_INTERVALS } from '@/config/app';

export const STATUS_COPY = {
  active: { label: 'ACTIVE', title: 'Monitoring active', tone: 'success' },
  paused: { label: 'PAUSED', title: 'Monitoring paused', tone: 'warning' },
  stopped: { label: 'STOPPED', title: 'Monitoring stopped', tone: 'neutral' },
};

/**
 * Learners / centres in scope. While active, counts the active sessions;
 * otherwise counts every non-stopped session so paused numbers still read well.
 */
export function monitoringScope(overview) {
  const sessions = overview?.sessions || [];
  const scoped = overview?.status === 'active' ? sessions.filter((s) => s.status === 'active') : sessions.filter((s) => s.status !== 'stopped');
  const learners = new Set(scoped.flatMap((s) => s.learnerIds));
  const centreMap = new Map();
  scoped.forEach((s) => s.centres.forEach((c) => centreMap.set(c.id, c)));
  return { learners: learners.size, centres: [...centreMap.values()], sessionCount: scoped.length };
}

export const intervalLabel = (value) => MONITORING_INTERVALS.find((i) => i.value === String(value))?.label || `Every ${value}s`;
