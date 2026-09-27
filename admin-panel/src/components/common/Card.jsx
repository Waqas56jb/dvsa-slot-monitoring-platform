import { cn } from '@/utils/cn'

/**
 * <Card title="…" description="…" actions={<Button/>} padding="md|none" footer={…}>
 */
export function Card({ title, description, actions, icon: Icon, children, className, bodyClassName, padding = 'md', footer, as: Tag = 'section', ...props }) {
  const hasHeader = title || actions
  return (
    <Tag className={cn('card min-w-0', className)} {...props}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-start gap-2.5">
            {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold leading-6 tracking-[-0.01em] text-ink">{title}</h2>}
              {description && <p className="mt-0.5 text-[13px] leading-5 text-ink-3">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padding === 'md' && 'p-4 sm:p-5', padding === 'sm' && 'p-3', bodyClassName)}>{children}</div>
      {footer && <footer className="border-t border-line px-4 py-3 sm:px-5">{footer}</footer>}
    </Tag>
  )
}
