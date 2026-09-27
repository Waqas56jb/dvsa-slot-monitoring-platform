import { Apple, CreditCard } from 'lucide-react'
import { methodTypeOf } from '@/services/paymentService'
import { cn } from '@/utils/cn'

/** Card brand / wallet label with icon, e.g. "Visa •••• 4242". */
export function MethodLabel({ method, className }) {
  const Icon = methodTypeOf(method) === 'Apple Pay' ? Apple : CreditCard
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-ink-2', className)}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
      {method || '—'}
    </span>
  )
}
