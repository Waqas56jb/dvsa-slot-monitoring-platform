import { DEMO_USER_ID } from './users';
import { toISODate, addDays } from '@/utils/format';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// [id, learnerId, centreId, daysAhead, time, detectedAgo, status, sessionId, score]
const rows = [
  ['slt_1', 'lrn_ahmed', 'ctr_hammersmith', 21, '10:24', 6 * MIN, 'new', 'mon_west', 96],
  ['slt_2', 'lrn_james', 'ctr_croydon', 14, '13:52', 25 * MIN, 'new', 'mon_south', 92],
  ['slt_3', 'lrn_mohammed', 'ctr_barking', 9, '14:10', 58 * MIN, 'new', 'mon_east', 88],
  ['slt_4', 'lrn_olivia', 'ctr_millhill', 18, '08:47', 2 * HOUR, 'new', 'mon_north', 94],
  ['slt_5', 'lrn_priya', 'ctr_southall', 26, '15:14', 3 * HOUR, 'viewed', 'mon_west', 90],
  ['slt_6', 'lrn_chloe', 'ctr_sutton', 33, '11:36', 5 * HOUR, 'viewed', 'mon_south', 85],
  ['slt_7', 'lrn_daniel', 'ctr_wanstead', 12, '09:21', 9 * HOUR, 'actioned', 'mon_east', 97],
  ['slt_8', 'lrn_liam', 'ctr_isleworth', 40, '10:05', 1 * DAY, 'expired', 'mon_west', 91],
  ['slt_9', 'lrn_sara', 'ctr_enfield', 22, '12:40', 2 * DAY, 'expired', 'mon_paused', 87],
  ['slt_10', 'lrn_hamza', 'ctr_hendon', 16, '08:02', 3 * DAY, 'actioned', 'mon_paused', 93],
  ['slt_11', 'lrn_james', 'ctr_bromley', 11, '15:48', 4 * DAY, 'expired', 'mon_south', 82],
  ['slt_12', 'lrn_ahmed', 'ctr_southall', 8, '11:12', 5 * DAY, 'expired', 'mon_west', 89],
];

export const buildSeedSlots = (now) =>
  rows.map(([id, learnerId, centreId, daysAhead, time, detectedAgo, status, sessionId, matchScore]) => ({
    id,
    ownerId: DEMO_USER_ID,
    learnerId,
    centreId,
    date: toISODate(addDays(now, daysAhead)),
    time,
    detectedAt: new Date(now - detectedAgo).toISOString(),
    status,
    matchScore,
    matched: { centre: true, date: true, time: matchScore >= 85 },
    sessionId,
  }));
