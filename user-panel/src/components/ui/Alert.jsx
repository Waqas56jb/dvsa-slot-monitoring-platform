import { Info, CircleCheck, TriangleAlert, CircleAlert, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const styles = {
  info: { box: 'border-info/25 bg-info-soft/60', icon: Info, iconCls: 'text-info-ink' },
  success: { box: 'border-success/25 bg-success-soft/60', icon: CircleCheck, iconCls: 'text-success-ink' },
  warning: { box: 'border-warning/30 bg-warning-soft/70', icon: TriangleAlert, iconCls: 'text-warning-ink' },
  danger: { box: 'border-danger/25 bg-danger-soft/60', icon: CircleAlert, iconCls: 'text-danger-ink' },
  neutral: { box: 'border-line bg-surface-muted', icon: Info, iconCls: 'text-muted' },
};

/** Inline alert / callout. */
export function Alert({ tone = 'info', title, children, icon, action, onDismiss, className }) {
  const s = styles[tone] || styles.info;
  const Icon = icon || s.icon;
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-2xl border p-4', s.box, className)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', s.iconCls)} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children && <div className={cn('leading-relaxed text-ink-soft', title && 'mt-0.5')}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface/70 hover:text-ink" aria-label="Dismiss">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
