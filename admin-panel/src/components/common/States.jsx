import { AlertOctagon, Inbox, Lock, RotateCw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { cn } from '@/utils/cn'

/** <EmptyState icon={Users} title="No users found" description="…" action={<Button/>} /> */
export function EmptyState({ icon: Icon = Inbox, title, description, action, secondaryAction, className, compact = false, image }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)}>
      {image ? (
        <img src={image} alt="" loading="lazy" className="mb-5 h-28 w-44 rounded-xl object-cover opacity-90" />
      ) : (
        <div className="relative mb-4">
          <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-b from-brand-50 to-transparent opacity-70" aria-hidden />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-ink-3 shadow-card">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-3">{description}</p>}
      {(action || secondaryAction) && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{secondaryAction}{action}</div>}
    </div>
  )
}

/** <ErrorState title message onRetry showBack /> */
export function ErrorState({ title = 'Something went wrong.', message = 'Unable to load this data. Please try again.', onRetry, showBack = false, className, compact = false }) {
  const navigate = useNavigate()
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)} role="alert">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
        <AlertOctagon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-3">{message}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {showBack && <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Go back</Button>}
        {onRetry && <Button variant="primary" icon={RotateCw} onClick={() => onRetry()}>Retry</Button>}
      </div>
    </div>
  )
}

export function AccessRestricted({ className, compact = false }) {
  return (
    <EmptyState
      className={className}
      compact={compact}
      icon={Lock}
      title="Access restricted"
      description="You don't have permission to access this section. Ask a Super Admin if you need access."
      action={<Button variant="primary" to="/admin/dashboard">Return to dashboard</Button>}
    />
  )
}
