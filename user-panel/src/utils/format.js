const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const longDateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const weekdayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
const clockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const shortClockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

/** Accepts Date, ISO timestamps and date-only strings (parsed as local dates). */
export const toDate = (v) => {
  if (v instanceof Date) return v;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T00:00:00`);
  return new Date(v);
};

/** 18 Oct 2026 */
export const formatDate = (v) => (v ? dateFmt.format(toDate(v)) : '—');
/** 18 October 2026 */
export const formatLongDate = (v) => (v ? longDateFmt.format(toDate(v)) : '—');
/** Sun, 18 Oct */
export const formatWeekday = (v) => (v ? weekdayFmt.format(toDate(v)) : '—');
/** 10:24 AM */
export const formatTime = (v) => (v ? timeFmt.format(toDate(v)).toUpperCase() : '—');
/** 10:42:13 */
export const formatClock = (v) => clockFmt.format(toDate(v));
/** 10:42 */
export const formatShortClock = (v) => shortClockFmt.format(toDate(v));
/** 18 Oct 2026 · 10:24 AM */
export const formatDateTime = (v) => (v ? `${formatDate(v)} · ${formatTime(v)}` : '—');

/** "HH:mm" → "10:24 AM" */
export function formatTimeString(hhmm) {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return formatTime(d);
}

/** "10 seconds ago", "5 min ago", "Yesterday" */
export function formatRelative(v, now = Date.now()) {
  if (!v) return 'Never';
  const diff = Math.round((now - toDate(v).getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff} seconds ago`;
  const min = Math.round(diff / 60);
  if (min < 60) return `${min} min ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(v);
}

export function formatDateRange(from, to) {
  if (!from && !to) return 'Any date';
  if (from && !to) return `From ${formatDate(from)}`;
  if (!from && to) return `Until ${formatDate(to)}`;
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export const fullName = (p) => (p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : '');

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const pluralise = (n, word, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`;

/** yyyy-mm-dd in local time */
export function toISODate(d) {
  const x = toDate(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d, n) {
  const x = new Date(toDate(d));
  x.setDate(x.getDate() + n);
  return x;
}
