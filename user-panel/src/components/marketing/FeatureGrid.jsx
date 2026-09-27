import { Activity, BellRing, CalendarRange, ClockArrowLeft, MapPinned, Radar, SlidersHorizontal, Users } from 'lucide-react';
import { Stagger, StaggerItem } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

const features = [
  { icon: Radar, title: 'Continuous monitoring', text: 'Checks run at the interval you choose, from every 30 seconds to every 5 minutes.' },
  { icon: MapPinned, title: 'Multi-centre coverage', text: 'Search and select as many centres as your plan allows, per learner.' },
  { icon: CalendarRange, title: 'Date & time preferences', text: 'Set a date range, a preferred time window and optionally skip weekends.' },
  { icon: BellRing, title: 'Instant alerts', text: 'Dashboard, browser and sound alerts the moment a match is found.' },
  { icon: Users, title: 'Multi-learner management', text: 'Separate preferences, status and history for every learner.' },
  { icon: SlidersHorizontal, title: 'Full control', text: 'Pause, resume or stop monitoring for everyone or one learner at a time.' },
  { icon: ClockArrowLeft, title: 'Slot history', text: 'Every detected slot is kept so you can review what appeared and when.' },
  { icon: Activity, title: 'Activity log', text: 'A transparent record of checks, matches and actions on your account.' },
];

/** Compact overview grid used on the Features page. */
export function FeatureGrid({ tone = 'canvas' }) {
  return (
    <Section id="overview" tone={tone}>
      <div className="container-page">
        <SectionHeading
          eyebrow="At a glance"
          title="Focused features, no clutter."
          description="SlotPilot does one job well: watching for suitable availability and telling you quickly."
        />
        <Stagger as="ul" className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <StaggerItem as="li" key={title} className="bg-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
