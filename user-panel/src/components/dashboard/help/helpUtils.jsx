import { Rocket, Users, Radar, BellRing, ShieldCheck, BookOpen } from 'lucide-react';
import { helpCategories } from '@/data/helpArticles';

const ICONS = { Rocket, Users, Radar, BellRing, ShieldCheck };
export const categoryIcon = (name) => ICONS[name] || BookOpen;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Flat search across every article's title and body. */
export function searchArticles(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const out = [];
  helpCategories.forEach((cat) => {
    cat.articles.forEach((a) => {
      const title = a.title.toLowerCase();
      const body = a.body.toLowerCase();
      if (!terms.every((t) => title.includes(t) || body.includes(t) || cat.title.toLowerCase().includes(t))) return;
      const score = terms.reduce((s, t) => s + (title.includes(t) ? 3 : 0) + (body.includes(t) ? 1 : 0), 0);
      out.push({ ...a, category: cat, score });
    });
  });
  return out.sort((x, y) => y.score - x.score);
}

/** Wraps matching terms in <mark>. */
export function Highlight({ text, query }) {
  const terms = query.split(/\s+/).filter(Boolean).map(escapeRe);
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.join('|')})`, 'gi');
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-warning-soft px-0.5 text-warning-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Short excerpt around the first match. */
export function excerpt(text, query, radius = 70) {
  const first = query.split(/\s+/).filter(Boolean)[0]?.toLowerCase();
  const idx = first ? text.toLowerCase().indexOf(first) : -1;
  if (idx < 0 || text.length <= radius * 2) return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}
