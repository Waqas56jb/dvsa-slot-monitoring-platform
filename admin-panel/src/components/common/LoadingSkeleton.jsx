import { cn } from '@/utils/cn'

export function Skeleton({ className, style }) {
  return <div className={cn('skeleton', className)} style={style} aria-hidden />
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} className="h-3" style={{ width: `${i === lines - 1 ? 60 : 100 - i * 8}%` }} />)}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="card p-4" aria-hidden>
      <div className="flex items-center justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
      <Skeleton className="mt-4 h-7 w-28" />
      <Skeleton className="mt-3 h-3 w-36" />
    </div>
  )
}

export function SkeletonTable({ rows = 8, columns = 6 }) {
  return (
    <div className="divide-y divide-line" aria-hidden role="presentation">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          {Array.from({ length: columns - 1 }, (_, c) => <Skeleton key={c} className="h-3 flex-1" style={{ maxWidth: `${120 + ((r * 7 + c * 13) % 5) * 30}px` }} />)}
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 260 }) {
  return (
    <div className="flex items-end gap-2 px-1" style={{ height }} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${30 + ((i * 37) % 60)}%` }} />)}
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex items-center gap-4"><Skeleton className="h-14 w-14 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-56" /><Skeleton className="h-3 w-40" /></div></div>
      <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonStatCard key={i} />)}</div>
      <div className="card p-5"><SkeletonText lines={6} /></div>
    </div>
  )
}
