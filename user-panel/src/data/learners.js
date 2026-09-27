import { DEMO_USER_ID } from './users';
import { toISODate, addDays } from '@/utils/format';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const base = [
  ['lrn_ahmed', 'Ahmed', 'Khan', ['ctr_hammersmith', 'ctr_southall', 'ctr_isleworth'], 7, 35, '09:00', '12:00', 12 * MIN],
  ['lrn_sara', 'Sara', 'Ali', ['ctr_enfield', 'ctr_woodgreen'], 14, 50, '08:00', '14:00', 48 * MIN],
  ['lrn_james', 'James', 'Wilson', ['ctr_croydon', 'ctr_bromley', 'ctr_sutton'], 5, 30, '10:00', '16:00', 4 * MIN],
  ['lrn_olivia', 'Olivia', 'Bennett', ['ctr_hendon', 'ctr_millhill'], 10, 45, '07:00', '12:00', 2 * HOUR],
  ['lrn_mohammed', 'Mohammed', 'Iqbal', ['ctr_barking', 'ctr_goodmayes', 'ctr_hornchurch'], 3, 28, '12:00', '17:00', 22 * MIN],
  ['lrn_chloe', 'Chloe', 'Evans', ['ctr_sutton', 'ctr_morden'], 12, 60, '09:00', '15:00', 3 * HOUR],
  ['lrn_daniel', 'Daniel', 'Okafor', ['ctr_wanstead', 'ctr_barking'], 6, 40, '08:00', '11:00', 35 * MIN],
  ['lrn_priya', 'Priya', 'Sharma', ['ctr_southall', 'ctr_greenford'], 9, 42, '13:00', '17:30', 9 * MIN],
  ['lrn_liam', 'Liam', "O'Connor", ['ctr_isleworth', 'ctr_hammersmith'], 20, 75, '09:00', '13:00', 1 * DAY],
  ['lrn_emily', 'Emily', 'Clarke', ['ctr_bromley'], 15, 55, '10:00', '15:00', 2 * DAY],
  ['lrn_hamza', 'Hamza', 'Yusuf', ['ctr_hendon', 'ctr_enfield'], 8, 38, '07:30', '10:30', 5 * HOUR],
  ['lrn_grace', 'Grace', 'Thompson', ['ctr_croydon'], 25, 90, '11:00', '16:00', 4 * DAY],
];

export const buildSeedLearners = (now) =>
  base.map(([id, firstName, lastName, centreIds, fromDays, toDays, timeFrom, timeTo, lastActivityAgo], i) => ({
    id,
    ownerId: DEMO_USER_ID,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
    phone: `07700 900${String(200 + i * 7).padStart(3, '0')}`,
    referenceNote: 'Reference held securely by the backend — not stored in the browser.',
    centreIds,
    preferredDate: toISODate(addDays(now, fromDays + 4)),
    dateFrom: toISODate(addDays(now, fromDays)),
    dateTo: toISODate(addDays(now, toDays)),
    timeFrom,
    timeTo,
    excludeWeekends: i % 3 === 0,
    notifications: { browser: true, sound: i % 2 === 0, email: i % 4 === 0 },
    notes: '',
    createdAt: new Date(now - (60 - i * 4) * DAY).toISOString(),
    updatedAt: new Date(now - lastActivityAgo).toISOString(),
    lastActivityAt: new Date(now - lastActivityAgo).toISOString(),
  }));
