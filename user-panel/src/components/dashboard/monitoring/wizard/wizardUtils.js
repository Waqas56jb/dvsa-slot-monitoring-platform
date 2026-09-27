import { toISODate, addDays } from '@/utils/format';

export const STEPS = [
  { key: 'learners', label: 'Learners' },
  { key: 'centres', label: 'Centres' },
  { key: 'dates', label: 'Dates' },
  { key: 'times', label: 'Times' },
  { key: 'notify', label: 'Alerts' },
  { key: 'review', label: 'Review' },
];

export const initialValues = {
  learnerIds: [],
  centreIds: [],
  dateFrom: '',
  dateTo: '',
  timeFrom: '',
  timeTo: '',
  notify: { dashboard: true, browser: true, sound: true, email: false },
  interval: '60',
  startNow: true,
  name: '',
};

const today = () => toISODate(new Date());

/** Defaults derived from the selected learners' own preferences. */
export function defaultsFromLearners(learners, fallbackCentreIds = []) {
  const fromLearners = [...new Set(learners.flatMap((l) => l.centreIds || []))];
  const centreIds = fromLearners.length ? fromLearners : fallbackCentreIds;
  const froms = learners.map((l) => l.dateFrom).filter(Boolean).sort();
  const tos = learners.map((l) => l.dateTo).filter(Boolean).sort();
  const tFrom = learners.map((l) => l.timeFrom).filter(Boolean).sort();
  const tTo = learners.map((l) => l.timeTo).filter(Boolean).sort();
  let dateFrom = froms[0] || today();
  if (dateFrom < today()) dateFrom = today();
  let dateTo = tos[tos.length - 1] || toISODate(addDays(new Date(), 42));
  if (dateTo < dateFrom) dateTo = toISODate(addDays(dateFrom, 28));
  return {
    centreIds,
    dateFrom,
    dateTo,
    timeFrom: tFrom[0] || '08:00',
    timeTo: tTo[tTo.length - 1] || '16:00',
  };
}

/** Returns an errors object for the given step index. */
export function validateStep(step, v) {
  const e = {};
  if (step === 0 && !v.learnerIds.length) e.learnerIds = 'Select at least one learner to monitor.';
  if (step === 1 && !v.centreIds.length) e.centreIds = 'Select at least one test centre.';
  if (step === 2) {
    if (!v.dateFrom) e.dateFrom = 'Choose a start date.';
    else if (v.dateFrom < today()) e.dateFrom = 'Choose a date from today onwards.';
    if (!v.dateTo) e.dateTo = 'Choose an end date.';
    else if (v.dateFrom && v.dateTo < v.dateFrom) e.dateTo = 'End date must be on or after the start date.';
  }
  if (step === 3) {
    if (!v.timeFrom) e.timeFrom = 'Choose an earliest time.';
    if (!v.timeTo) e.timeTo = 'Choose a latest time.';
    else if (v.timeFrom && v.timeTo <= v.timeFrom) e.timeTo = 'Latest time must be after the earliest time.';
  }
  if (step === 4) {
    if (!v.interval) e.interval = 'Choose how often to check.';
    if (v.name && v.name.trim().length > 60) e.name = 'Keep the name to 60 characters or fewer.';
  }
  return e;
}
