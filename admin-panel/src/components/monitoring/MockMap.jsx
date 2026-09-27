import { useId, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/utils/cn'

// Small deterministic PRNG so each centre gets its own (stable) street layout.
function seeded(seed) {
  let s = Math.abs(Math.floor(seed)) % 2147483647 || 1
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

const fmtCoord = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`

/**
 * Illustrative map preview — no external map provider. A stylised street grid,
 * river and parkland with a pulsing pin at the centre's coordinates.
 * Works in both themes because everything is drawn with semantic tokens.
 *
 * <MockMap lat={51.597} lng={-0.109} label="Wood Green" />
 */
export function MockMap({ lat, lng, label, className, height = 'h-64 sm:h-72' }) {
  const uid = useId().replace(/:/g, '')
  const layout = useMemo(() => {
    const rnd = seeded((lat || 51.5) * 1e4 + (lng || 0) * 7e3)
    const W = 600, H = 360
    const verticals = Array.from({ length: 6 }, (_, i) => ({ x: 40 + i * 100 + (rnd() - 0.5) * 40, tilt: (rnd() - 0.5) * 60 }))
    const horizontals = Array.from({ length: 4 }, (_, i) => ({ y: 30 + i * 95 + (rnd() - 0.5) * 30, tilt: (rnd() - 0.5) * 50 }))
    const riverY = 60 + rnd() * 240
    const river = `M-20 ${riverY} C ${W * 0.2} ${riverY - 80 + rnd() * 40}, ${W * 0.4} ${riverY + 90 - rnd() * 40}, ${W * 0.62} ${riverY + 10} S ${W * 0.9} ${riverY - 70}, ${W + 20} ${riverY - 30}`
    const parks = Array.from({ length: 3 }, () => ({ x: rnd() * (W - 120), y: rnd() * (H - 90), w: 70 + rnd() * 60, h: 45 + rnd() * 40 }))
    const blocks = Array.from({ length: 14 }, () => ({ x: rnd() * (W - 60), y: rnd() * (H - 40), w: 24 + rnd() * 30, h: 16 + rnd() * 20 }))
    const arterial = `M-20 ${H * 0.72} Q ${W * 0.35} ${H * 0.4 + rnd() * 40} ${W * 0.55} ${H * 0.5} T ${W + 20} ${H * 0.2 + rnd() * 40}`
    return { W, H, verticals, horizontals, river, parks, blocks, arterial }
  }, [lat, lng])

  const { W, H } = layout
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)

  return (
    <figure className={cn('relative min-w-0 overflow-hidden rounded-lg border border-line bg-subtle', height, className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={`Illustrative map preview${label ? ` of ${label}` : ''}${hasCoords ? ` at ${fmtCoord(lat, 'N', 'S')}, ${fmtCoord(lng, 'E', 'W')}` : ''}`}>
        <defs>
          <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" className="fill-none stroke-line" strokeWidth="0.6" />
          </pattern>
          <radialGradient id={`${uid}-vignette`} cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill={`url(#${uid}-grid)`} />

        {layout.parks.map((p, i) => <rect key={`p${i}`} x={p.x} y={p.y} width={p.w} height={p.h} rx="14" className="fill-success-soft stroke-success-dot/20" strokeWidth="1" />)}
        {layout.blocks.map((b, i) => <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" className="fill-muted" />)}

        <path d={layout.river} className="fill-none stroke-info-soft" strokeWidth="26" strokeLinecap="round" />
        <path d={layout.river} className="fill-none stroke-info-dot/25" strokeWidth="1.2" strokeDasharray="1 0" />

        {/* minor streets */}
        <g className="stroke-surface" strokeWidth="7" strokeLinecap="round" fill="none">
          {layout.verticals.map((v, i) => <path key={`v${i}`} d={`M${v.x} -10 L${v.x + v.tilt} ${H + 10}`} />)}
          {layout.horizontals.map((h, i) => <path key={`h${i}`} d={`M-10 ${h.y} L${W + 10} ${h.y + h.tilt}`} />)}
        </g>
        <g className="stroke-line-strong" strokeWidth="0.8" fill="none" opacity="0.7">
          {layout.verticals.map((v, i) => <path key={`vo${i}`} d={`M${v.x} -10 L${v.x + v.tilt} ${H + 10}`} strokeDasharray="0" />)}
        </g>

        {/* arterial road */}
        <path d={layout.arterial} className="fill-none stroke-line-strong" strokeWidth="14" strokeLinecap="round" />
        <path d={layout.arterial} className="fill-none stroke-surface" strokeWidth="11" strokeLinecap="round" />
        <path d={layout.arterial} className="fill-none stroke-warning-dot/40" strokeWidth="1.2" strokeDasharray="8 8" />

        <rect width={W} height={H} fill={`url(#${uid}-vignette)`} />
      </svg>

      {/* Pin */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full" aria-hidden>
        <span className="absolute top-full left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-500/30" />
        <span className="absolute top-full left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/25" />
        <MapPin className="relative h-9 w-9 fill-brand-600 text-surface drop-shadow-[0_3px_4px_rgb(0_0_0/0.25)]" strokeWidth={1.6} />
      </div>

      <figcaption className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface/90 px-2 py-1 text-[11px] font-medium text-ink-3 shadow-card backdrop-blur-sm">
        Map preview
      </figcaption>
      {label && (
        <span className="absolute top-3 right-3 max-w-[55%] truncate rounded-md border border-line bg-surface/90 px-2 py-1 text-[11px] font-medium text-ink-2 shadow-card backdrop-blur-sm">{label}</span>
      )}
      {hasCoords && (
        <span className="absolute bottom-3 left-3 rounded-md border border-line bg-surface/90 px-2 py-1 font-mono text-[11px] text-ink-2 shadow-card backdrop-blur-sm tabular">
          {fmtCoord(lat, 'N', 'S')}, {fmtCoord(lng, 'E', 'W')}
        </span>
      )}
    </figure>
  )
}
