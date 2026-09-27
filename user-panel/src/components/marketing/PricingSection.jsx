import { ArrowRight, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui';
import { pricingNote, pricingPlans } from '@/data/pricing';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { Stagger, StaggerItem } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

function PlanCard({ plan }) {
  const hi = plan.highlighted;
  return (
    <StaggerItem
      className={cn(
        'relative flex flex-col rounded-3xl p-6 sm:p-8',
        hi
          ? 'bg-night text-white shadow-float ring-1 ring-brand/40 lg:-my-4 lg:py-12'
          : 'border border-line bg-surface shadow-soft',
      )}
    >
      {hi && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-3xl bg-[radial-gradient(70%_100%_at_50%_0%,rgb(59_91_253/0.35),transparent)]" aria-hidden="true" />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <h3 className={cn('text-lg font-semibold', hi ? 'text-white' : 'text-ink')}>{plan.name}</h3>
        {plan.badge && <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">{plan.badge}</span>}
      </div>
      <p className={cn('relative mt-2 min-h-[3rem] text-sm leading-relaxed', hi ? 'text-white/65' : 'text-muted')}>{plan.description}</p>
      <p className="relative mt-6 flex items-baseline gap-1">
        <span className={cn('font-display text-5xl font-bold tracking-tight', hi ? 'text-white' : 'text-ink')}>£{plan.price}</span>
        <span className={cn('text-sm', hi ? 'text-white/60' : 'text-muted')}>/ {plan.period}</span>
      </p>
      <Button
        to={`${paths.register}?plan=${plan.id}`}
        variant={hi ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        rightIcon={ArrowRight}
        className="relative mt-7"
        aria-label={`${plan.cta} with the ${plan.name} plan`}
      >
        {plan.cta}
      </Button>
      <ul className={cn('relative mt-8 space-y-3 border-t pt-6 text-sm', hi ? 'border-white/10' : 'border-line')}>
        {plan.features.map((f) => (
          <li key={f} className={cn('flex items-start gap-3', hi ? 'text-white/85' : 'text-ink-soft')}>
            <span
              className={cn(
                'mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full',
                hi ? 'bg-brand text-white' : 'bg-brand-soft text-brand-ink',
              )}
            >
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </StaggerItem>
  );
}

export function PricingSection({ tone = 'canvas', id = 'pricing', headingAs = 'h2', showHeading = true }) {
  return (
    <Section id={id} tone={tone}>
      <div className="container-page">
        {showHeading && (
          <SectionHeading
            as={headingAs}
            eyebrow="Pricing"
            title="Simple plans that grow with your diary."
            description="Start small as an independent instructor or cover a whole driving school. No payment is taken in this demo."
          />
        )}
        <Stagger className={cn('mx-auto grid max-w-6xl items-start gap-5 lg:grid-cols-3 lg:items-center', showHeading && 'mt-14 lg:mt-16')}>
          {pricingPlans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </Stagger>
        <p className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-2 text-center text-sm text-muted">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          {pricingNote}
        </p>
      </div>
    </Section>
  );
}
