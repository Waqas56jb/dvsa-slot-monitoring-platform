import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui';
import { DEMO_CREDENTIALS } from '@/config/app';

/** Small helper card so reviewers can try the app with the seeded demo account. */
export function DemoCredentials({ onUse }) {
  return (
    <section aria-labelledby="demo-account-title" className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface-muted/60 p-4">
      <div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-brand ring-1 ring-line">
            <FlaskConical className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 text-sm">
            <p id="demo-account-title" className="font-semibold text-ink">
              Demo account
            </p>
            <dl className="mt-0.5 space-y-0.5 text-[13px] text-muted">
              <div className="flex gap-1.5">
                <dt className="sr-only">Email</dt>
                <dd className="truncate font-mono">{DEMO_CREDENTIALS.email}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="sr-only">Password</dt>
                <dd className="font-mono">{DEMO_CREDENTIALS.password}</dd>
              </div>
            </dl>
          </div>
        </div>
        <Button variant="secondary" size="md" onClick={onUse} className="shrink-0">
          Use demo account
        </Button>
      </div>
    </section>
  );
}
