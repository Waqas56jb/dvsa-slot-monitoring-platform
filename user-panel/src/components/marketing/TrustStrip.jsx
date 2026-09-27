import { BellRing, MapPinned, Radar, Users } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';

const points = [
  { icon: Radar, title: 'Real-time monitoring', text: 'Continuous checks at the interval you choose.' },
  { icon: MapPinned, title: 'Multi-centre support', text: 'Watch several test centres side by side.' },
  { icon: BellRing, title: 'Instant alerts', text: 'Dashboard, browser and sound alerts.' },
  { icon: Users, title: 'Multiple learners', text: 'Separate preferences for every learner.' },
];

export function TrustStrip() {
  return (
    <section className="relative border-y border-line bg-surface py-12 sm:py-14" aria-labelledby="trust-title">
      <div className="container-page">
        <Reveal>
          <p id="trust-title" className="mx-auto max-w-2xl text-balance text-center text-sm font-medium text-muted sm:text-base">
            Built for driving instructors, learner managers and test-slot monitoring workflows.
          </p>
        </Reveal>
        <Stagger as="ul" className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {points.map(({ icon: Icon, title, text }) => (
            <StaggerItem as="li" key={title} className="flex items-start gap-4 bg-surface p-5 sm:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
