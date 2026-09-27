import { Lock, Mail, Phone, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { Input } from '@/components/ui';
import { StepHeader } from './OnboardingShell';

/** Placeholder panel — licence details are never collected in the browser. */
function LicencePlaceholder() {
  return (
    <div>
      <p className="text-sm font-medium text-ink" id="licence-info-label">
        Licence / reference information
      </p>
      <div
        aria-labelledby="licence-info-label"
        aria-disabled="true"
        className="mt-1.5 flex gap-3.5 rounded-2xl border border-dashed border-line-strong bg-surface-muted/70 p-4"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-success-ink ring-1 ring-line">
          <ShieldCheck className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 text-[13px] leading-relaxed text-muted">
          <p className="flex items-center gap-1.5 font-semibold text-ink">
            <Lock className="size-3.5" aria-hidden="true" />
            Not collected here
          </p>
          <p className="mt-1">
            Sensitive details such as driving licence numbers or test booking references are <strong className="font-semibold text-ink-soft">not stored in your browser</strong>. They will be collected securely by the SlotPilot backend once it is connected.
          </p>
        </div>
      </div>
    </div>
  );
}

export function StepLearner({ form }) {
  return (
    <>
      <StepHeader icon={UserPlus} step="Step 2" title="Add your first learner" description="Tell us who you're finding a test for. You can add more learners from your dashboard at any time." />
      <div className="space-y-5">
        <Input {...form.field('learnerName')} label="Full name" icon={UserRound} placeholder="e.g. Sophie Turner" autoComplete="off" required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input {...form.field('learnerEmail')} type="email" label="Email" icon={Mail} placeholder="learner@example.co.uk" autoComplete="off" required />
          <Input {...form.field('learnerPhone')} type="tel" label="Phone" icon={Phone} placeholder="07700 900123" autoComplete="off" optional />
        </div>
        <LicencePlaceholder />
      </div>
    </>
  );
}
