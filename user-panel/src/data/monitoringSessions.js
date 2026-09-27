import { DEMO_USER_ID } from './users';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

/**
 * A monitoring session watches a set of learners' preferences.
 * 8 learners sit in active sessions, 2 are paused (shown as "waiting").
 */
export const buildSeedMonitoringSessions = (now) => [
  {
    id: 'mon_west',
    ownerId: DEMO_USER_ID,
    name: 'West London — weekday mornings',
    learnerIds: ['lrn_ahmed', 'lrn_priya', 'lrn_liam'],
    status: 'active',
    interval: '60',
    notify: { dashboard: true, browser: true, sound: true, email: false },
    createdAt: new Date(now - 9 * 24 * HOUR).toISOString(),
    startedAt: new Date(now - 3 * HOUR).toISOString(),
    lastCheckedAt: new Date(now - 10 * 1000).toISOString(),
    checksCount: 1284,
    matchesCount: 6,
  },
  {
    id: 'mon_south',
    ownerId: DEMO_USER_ID,
    name: 'South London — flexible',
    learnerIds: ['lrn_james', 'lrn_chloe'],
    status: 'active',
    interval: '60',
    notify: { dashboard: true, browser: true, sound: true, email: true },
    createdAt: new Date(now - 6 * 24 * HOUR).toISOString(),
    startedAt: new Date(now - 5 * HOUR).toISOString(),
    lastCheckedAt: new Date(now - 14 * 1000).toISOString(),
    checksCount: 962,
    matchesCount: 4,
  },
  {
    id: 'mon_east',
    ownerId: DEMO_USER_ID,
    name: 'East London — afternoons',
    learnerIds: ['lrn_mohammed', 'lrn_daniel'],
    status: 'active',
    interval: '120',
    notify: { dashboard: true, browser: false, sound: true, email: false },
    createdAt: new Date(now - 4 * 24 * HOUR).toISOString(),
    startedAt: new Date(now - 2 * HOUR).toISOString(),
    lastCheckedAt: new Date(now - 22 * 1000).toISOString(),
    checksCount: 418,
    matchesCount: 2,
  },
  {
    id: 'mon_north',
    ownerId: DEMO_USER_ID,
    name: 'North London — early starts',
    learnerIds: ['lrn_olivia'],
    status: 'active',
    interval: '60',
    notify: { dashboard: true, browser: true, sound: false, email: false },
    createdAt: new Date(now - 3 * 24 * HOUR).toISOString(),
    startedAt: new Date(now - 90 * MIN).toISOString(),
    lastCheckedAt: new Date(now - 31 * 1000).toISOString(),
    checksCount: 211,
    matchesCount: 1,
  },
  {
    id: 'mon_paused',
    ownerId: DEMO_USER_ID,
    name: 'North London — second choice',
    learnerIds: ['lrn_sara', 'lrn_hamza'],
    status: 'paused',
    interval: '300',
    notify: { dashboard: true, browser: true, sound: true, email: false },
    createdAt: new Date(now - 12 * 24 * HOUR).toISOString(),
    startedAt: null,
    lastCheckedAt: new Date(now - 7 * HOUR).toISOString(),
    checksCount: 2210,
    matchesCount: 3,
  },
];
