import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { paths } from '@/routes/paths';
import { RoutePattern } from './RoutePattern';
import { Reveal } from './Reveal';

/** Closing call-to-action panel. All copy and actions can be overridden. */
export function FinalCta({
  title = 'Ready to stop manually searching?',
  description = 'Set your preferences once and let SlotPilot monitor the availability for you.',
  primary = { label: 'Start Monitoring', to: paths.register },
  secondary = { label: 'Explore Features', to: paths.features },
}) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28" aria-labelledby="final-cta-title">
      <div className="container-page">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-night px-6 py-16 text-center shadow-float sm:px-12 lg:py-20">
          <RoutePattern onDark />
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[640px] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(59_91_253/0.45),transparent)]"
            aria-hidden="true"
          />
          <h2 id="final-cta-title" className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">{description}</p>
          <div className="relative mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button to={primary.to} size="xl" rightIcon={ArrowRight}>
              {primary.label}
            </Button>
            {secondary && (
              <Button to={secondary.to} href={secondary.href} size="xl" variant="onDark">
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
