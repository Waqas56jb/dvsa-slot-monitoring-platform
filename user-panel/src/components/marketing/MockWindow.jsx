import { cn } from '@/utils/cn';

/** App-window frame used around product mock-ups. */
export function MockWindow({ title = 'app.slotpilot.co.uk', className, bodyClassName, children, right }) {
  return (
    <div className={cn('overflow-hidden rounded-3xl border border-line bg-surface shadow-float', className)}>
      <div className="flex items-center gap-3 border-b border-line bg-surface-muted/70 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </div>
        <div className="mx-auto hidden min-w-0 max-w-[60%] truncate rounded-md bg-surface px-3 py-0.5 text-center text-[11px] font-medium text-subtle ring-1 ring-line sm:block">
          {title}
        </div>
        {right && <div className="ml-auto sm:ml-0">{right}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/** Tiny "Demo preview" chip for mock-ups. */
export function DemoTag({ className, children = 'Demo preview' }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-subtle', className)}>
      {children}
    </span>
  );
}
