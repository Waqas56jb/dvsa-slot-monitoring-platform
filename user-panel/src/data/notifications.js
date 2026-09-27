import { DEMO_USER_ID } from './users';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// [type, event, title, message, ago, read, link]
const rows = [
  ['slot', 'slot_found', 'New slot found', 'Hammersmith · matching slot for Ahmed Khan.', 6 * MIN, false, '/dashboard/slots/slt_1'],
  ['system', 'monitoring_started', 'Monitoring resumed', 'West London — weekday mornings is running again.', 14 * MIN, false, '/dashboard/monitoring'],
  ['slot', 'slot_found', 'New slot found', 'Croydon · matching slot for James Wilson.', 25 * MIN, false, '/dashboard/slots/slt_2'],
  ['learner', 'learner_updated', 'Learner updated', 'Priya Sharma now prefers afternoon slots.', 38 * MIN, false, '/dashboard/learners/lrn_priya'],
  ['slot', 'slot_found', 'New slot found', 'Barking · matching slot for Mohammed Iqbal.', 58 * MIN, false, '/dashboard/slots/slt_3'],
  ['system', 'monitoring_paused', 'Monitoring paused', 'North London — second choice was paused.', 70 * MIN, true, '/dashboard/monitoring'],
  ['slot', 'slot_found', 'New slot found', 'Mill Hill · matching slot for Olivia Bennett.', 2 * HOUR, true, '/dashboard/slots/slt_4'],
  ['learner', 'learner_added', 'Learner added', 'Hamza Yusuf was added to your account.', 2.3 * HOUR, true, '/dashboard/learners/lrn_hamza'],
  ['slot', 'slot_found', 'New slot found', 'Southall · matching slot for Priya Sharma.', 3 * HOUR, true, '/dashboard/slots/slt_5'],
  ['system', 'monitoring_started', 'Monitoring started', 'South London — flexible is now active.', 3.2 * HOUR, true, '/dashboard/monitoring'],
  ['learner', 'learner_updated', 'Preferences changed', 'Chloe Evans added Morden to selected centres.', 3.6 * HOUR, true, '/dashboard/learners/lrn_chloe'],
  ['slot', 'slot_found', 'New slot found', 'Sutton · matching slot for Chloe Evans.', 5 * HOUR, true, '/dashboard/slots/slt_6'],
  ['system', 'monitoring_started', 'Monitoring started', 'East London — afternoons is now active.', 5.5 * HOUR, true, '/dashboard/monitoring'],
  ['learner', 'learner_updated', 'Learner updated', 'Daniel Okafor updated his contact details.', 6 * HOUR, true, '/dashboard/learners/lrn_daniel'],
  ['system', 'monitoring_paused', 'Monitoring paused', 'Scheduled pause overnight for all sessions.', 6.5 * HOUR, true, '/dashboard/monitoring'],
  ['slot', 'slot_found', 'New slot found', 'Wanstead · matching slot for Daniel Okafor.', 7 * HOUR, true, '/dashboard/slots/slt_7'],
  ['system', 'monitoring_started', 'Monitoring started', 'North London — early starts is now active.', 7.5 * HOUR, true, '/dashboard/monitoring'],
  ['learner', 'learner_updated', 'Learner updated', 'Liam O’Connor widened his date range.', 26 * HOUR, true, '/dashboard/learners/lrn_liam'],
  ['system', 'slot_expired', 'Slot expired', 'The Isleworth slot for Liam O’Connor is no longer listed.', 27 * HOUR, true, '/dashboard/slots/slt_8'],
  ['slot', 'slot_found', 'New slot found', 'Enfield · matching slot for Sara Ali.', 48 * HOUR, true, '/dashboard/slots/slt_9'],
];

export const buildSeedNotifications = (now) =>
  rows.map(([type, event, title, message, ago, read, link], i) => ({
    id: `ntf_${i + 1}`,
    ownerId: DEMO_USER_ID,
    type,
    event,
    title,
    message,
    link,
    read,
    createdAt: new Date(now - ago).toISOString(),
  }));
