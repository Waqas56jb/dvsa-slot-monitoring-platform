import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

function hash(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

/** Finds the centre named in the most recent check/match event. */
export function useScanFocus(events = [], centres = []) {
  return useMemo(() => {
    const latest = events.find((e) => e.kind === 'check' || e.kind === 'match');
    if (!latest) return { centreId: null, kind: null };
    const hit = centres.find((c) => latest.message.includes(c.name));
    return { centreId: hit?.id ?? null, kind: latest.kind, at: latest.at };
  }, [events, centres]);
}

/**
 * Decorative radar sweep with a dot per monitored centre. The dot for the
 * centre currently being "checked" lights up; a match flashes green.
 * Designed for fixed dark (`bg-night`) panels.
 */
export function RadarScanner({ centres = [], active, focusId, focusKind, className, showLabels = true }) {
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const reduce = useReducedMotion();

  const dots = useMemo(
    () =>
      centres.slice(0, 18).map((c, i) => {
        const angle = hash(c.id) * Math.PI * 2;
        const radius = 28 + ((hash(`${c.id}r`) * 0.6 + (i % 3) * 0.2) % 1) * 60;
        return { ...c, x: 100 + Math.cos(angle) * radius, y: 100 + Math.sin(angle) * radius };
      }),
    [centres],
  );

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 4.5, ease: 'linear', repeat: Infinity }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" className="size-full">
            <path d="M100 100 L196 100 A96 96 0 0 0 167.9 32.1 Z" fill={`url(#${gid}-sweep)`} opacity="0.7" />
            <line x1="100" y1="100" x2="196" y2="100" stroke="var(--sp-brand)" strokeOpacity="0.9" strokeWidth="1.5" />
          </svg>
        </motion.div>
      )}
      <svg viewBox="0 0 200 200" className="relative size-full overflow-visible" role="img" aria-label={`Radar showing ${centres.length} monitored test centres${active ? ', scanning' : ', idle'}`}>
        <defs>
          <radialGradient id={`${gid}-bg`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--sp-brand)" stopOpacity="0.22" />
            <stop offset="70%" stopColor="var(--sp-brand)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--sp-brand)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${gid}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--sp-brand)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--sp-brand)" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="96" fill={`url(#${gid}-bg)`} />
        {[32, 56, 80, 96].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="white" strokeOpacity={r === 96 ? 0.14 : 0.08} strokeDasharray={r === 96 ? undefined : '2 4'} />
        ))}
        <line x1="4" y1="100" x2="196" y2="100" stroke="white" strokeOpacity="0.06" />
        <line x1="100" y1="4" x2="100" y2="196" stroke="white" strokeOpacity="0.06" />

        {dots.map((d) => {
          const focused = d.id === focusId && active;
          const tone = focused && focusKind === 'match' ? 'var(--sp-success)' : 'var(--sp-brand)';
          return (
            <g key={d.id}>
              {focused && (
                <motion.circle
                  key={`${d.id}-${focusKind}`}
                  cx={d.x}
                  cy={d.y}
                  fill="none"
                  stroke={tone}
                  strokeWidth="1.5"
                  initial={{ r: 3, opacity: 0.9 }}
                  animate={{ r: 14, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <circle cx={d.x} cy={d.y} r={focused ? 4 : 2.6} fill={focused ? tone : 'white'} fillOpacity={focused ? 1 : active ? 0.55 : 0.3} />
              {showLabels && focused && (
                <text x={d.x} y={d.y - 9} textAnchor="middle" fontSize="8" fontWeight="600" fill="white" fillOpacity="0.9" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {d.name}
                </text>
              )}
            </g>
          );
        })}

        <circle cx="100" cy="100" r="3.5" fill={active ? 'var(--sp-brand)' : 'white'} fillOpacity={active ? 1 : 0.4} />
      </svg>
    </div>
  );
}
