import { DEMO_USER_ID } from './users';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Activity / history event types and their display metadata. */
export const activityTypes = {
  slot_detected: { label: 'Slot detected', tone: 'success' },
  slot_viewed: { label: 'Slot viewed', tone: 'info' },
  slot_actioned: { label: 'Booking opened', tone: 'brand' },
  slot_dismissed: { label: 'Slot dismissed', tone: 'neutral' },
  slot_expired: { label: 'Slot expired', tone: 'warning' },
  monitoring_started: { label: 'Monitoring started', tone: 'brand' },
  monitoring_paused: { label: 'Monitoring paused', tone: 'warning' },
  monitoring_stopped: { label: 'Monitoring stopped', tone: 'danger' },
  preference_changed: { label: 'Preference changed', tone: 'info' },
  centre_added: { label: 'Centre added', tone: 'info' },
  learner_added: { label: 'Learner added', tone: 'neutral' },
  learner_updated: { label: 'Learner updated', tone: 'neutral' },
  learner_deleted: { label: 'Learner removed', tone: 'danger' },
};

// [type, message, learnerId, centreId, ago]
const rows = [
  ['slot_detected', 'Matching slot detected at Hammersmith', 'lrn_ahmed', 'ctr_hammersmith', 6 * MIN],
  ['monitoring_started', 'Monitoring started for West London — weekday mornings', null, null, 9 * MIN],
  ['centre_added', 'Isleworth added to Ahmed Khan’s centres', 'lrn_ahmed', 'ctr_isleworth', 17 * MIN],
  ['slot_detected', 'Matching slot detected at Croydon', 'lrn_james', 'ctr_croydon', 25 * MIN],
  ['learner_updated', 'Priya Sharma’s time preference updated', 'lrn_priya', null, 38 * MIN],
  ['slot_detected', 'Matching slot detected at Barking', 'lrn_mohammed', 'ctr_barking', 58 * MIN],
  ['monitoring_paused', 'North London — second choice paused', 'lrn_sara', null, 70 * MIN],
  ['slot_detected', 'Matching slot detected at Mill Hill', 'lrn_olivia', 'ctr_millhill', 2 * HOUR],
  ['learner_added', 'Hamza Yusuf added', 'lrn_hamza', null, 2.3 * HOUR],
  ['slot_detected', 'Matching slot detected at Southall', 'lrn_priya', 'ctr_southall', 3 * HOUR],
  ['monitoring_started', 'Monitoring started for South London — flexible', 'lrn_james', null, 3.2 * HOUR],
  ['preference_changed', 'Morden added for Chloe Evans', 'lrn_chloe', 'ctr_morden', 3.6 * HOUR],
  ['slot_detected', 'Matching slot detected at Sutton', 'lrn_chloe', 'ctr_sutton', 5 * HOUR],
  ['monitoring_started', 'Monitoring started for East London — afternoons', 'lrn_mohammed', null, 5.5 * HOUR],
  ['slot_detected', 'Matching slot detected at Wanstead', 'lrn_daniel', 'ctr_wanstead', 9 * HOUR],
  ['slot_actioned', 'Official booking opened for Wanstead slot', 'lrn_daniel', 'ctr_wanstead', 8.8 * HOUR],
  ['slot_expired', 'Isleworth slot no longer available', 'lrn_liam', 'ctr_isleworth', 1 * DAY],
  ['preference_changed', 'Date range widened for Liam O’Connor', 'lrn_liam', null, 1.1 * DAY],
  ['monitoring_stopped', 'Monitoring stopped for Grace Thompson', 'lrn_grace', null, 1.5 * DAY],
  ['slot_expired', 'Enfield slot no longer available', 'lrn_sara', 'ctr_enfield', 2 * DAY],
  ['slot_detected', 'Matching slot detected at Enfield', 'lrn_sara', 'ctr_enfield', 2.05 * DAY],
  ['slot_detected', 'Matching slot detected at Hendon', 'lrn_hamza', 'ctr_hendon', 3 * DAY],
  ['slot_actioned', 'Official booking opened for Hendon slot', 'lrn_hamza', 'ctr_hendon', 2.95 * DAY],
  ['learner_updated', 'Emily Clarke’s phone number updated', 'lrn_emily', null, 3.4 * DAY],
  ['slot_expired', 'Bromley slot no longer available', 'lrn_james', 'ctr_bromley', 4 * DAY],
  ['slot_detected', 'Matching slot detected at Bromley', 'lrn_james', 'ctr_bromley', 4.1 * DAY],
  ['monitoring_stopped', 'Monitoring stopped for Emily Clarke', 'lrn_emily', null, 4.5 * DAY],
  ['slot_expired', 'Southall slot no longer available', 'lrn_ahmed', 'ctr_southall', 5 * DAY],
  ['slot_detected', 'Matching slot detected at Southall', 'lrn_ahmed', 'ctr_southall', 5.1 * DAY],
  ['preference_changed', 'Afternoon window added for Mohammed Iqbal', 'lrn_mohammed', null, 5.6 * DAY],
  ['learner_added', 'Grace Thompson added', 'lrn_grace', null, 6 * DAY],
  ['monitoring_started', 'Monitoring started for North London — early starts', 'lrn_olivia', null, 6.2 * DAY],
  ['centre_added', 'Goodmayes added to Mohammed Iqbal’s centres', 'lrn_mohammed', 'ctr_goodmayes', 6.5 * DAY],
  ['learner_added', 'Emily Clarke added', 'lrn_emily', null, 7 * DAY],
  ['learner_added', 'Liam O’Connor added', 'lrn_liam', null, 8 * DAY],
  ['monitoring_started', 'Monitoring started for West London — weekday mornings', 'lrn_ahmed', null, 9 * DAY],
];

export const buildSeedActivity = (now) =>
  rows.map(([type, message, learnerId, centreId, ago], i) => ({
    id: `act_${i + 1}`,
    ownerId: DEMO_USER_ID,
    type,
    message,
    learnerId,
    centreId,
    createdAt: new Date(now - ago).toISOString(),
  }));
