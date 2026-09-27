import { cn } from '@/utils/cn';

/**
 * Low-contrast decorative background: winding route lines, waypoint dots and
 * faint map grid. Purely decorative (aria-hidden) and masked at the edges.
 */
export function RoutePattern({ className, onDark }) {
  const stroke = onDark ? 'rgb(255 255 255 / 0.14)' : 'var(--sp-line-strong)';
  const accent = onDark ? 'rgb(169 185 255 / 0.55)' : 'var(--sp-brand)';
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className={cn('absolute inset-0 mask-radial', onDark ? 'opacity-[0.07]' : 'bg-grid opacity-60')} />
      <svg className="absolute left-1/2 top-0 h-full w-[1400px] -translate-x-1/2 mask-radial" viewBox="0 0 1400 800" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d="M-40 620 C 180 560, 260 380, 470 400 S 760 560, 960 430 S 1260 180, 1460 240" stroke={stroke} strokeWidth="1.5" />
        <path d="M-40 700 C 220 660, 360 520, 560 540 S 880 700, 1100 560 S 1330 420, 1460 470" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
        <path d="M120 -20 C 180 140, 120 260, 260 340 S 520 420, 600 560 S 640 760, 720 840" stroke={stroke} strokeWidth="1.2" />
        <path d="M1180 -20 C 1120 120, 1220 240, 1100 330 S 900 420, 880 560 S 960 760, 900 840" stroke={stroke} strokeWidth="1.2" strokeDasharray="4 10" />
        <path d="M470 400 C 560 300, 700 280, 820 220" stroke={accent} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" />
        {[
          [470, 400],
          [960, 430],
          [260, 340],
          [1100, 330],
          [560, 540],
          [820, 220],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="9" fill={accent} fillOpacity={i === 0 || i === 5 ? 0.12 : 0.06} />
            <circle cx={cx} cy={cy} r="3" fill={i === 0 || i === 5 ? accent : stroke} />
          </g>
        ))}
      </svg>
    </div>
  );
}
