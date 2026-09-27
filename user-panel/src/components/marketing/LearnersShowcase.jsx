import { ArrowRight, CalendarDays, CircleCheck, MapPin, Plus } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { paths } from '@/routes/paths';
import { MockWindow } from './MockWindow';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

const learners = [
  { name: 'Ahmed Khan', centre: 'Hendon', pref: 'Mornings · Oct', status: 'Monitoring', tone: 'brand', pulse: true, last: '2 min ago' },
  { name: 'Sara Ali', centre: 'Sutton', pref: 'Any time · Nov', status: 'Waiting', tone: 'warning', pulse: false, last: '1 hr ago' },
  { name: 'James Wilson', centre: 'Mill Hill', pref: 'Afternoons · Oct', status: 'Slot Found', tone: 'success', pulse: true, last: 'Just now' },
];

const points = [
  'Individual centres, dates and times for each learner',
  'Pause or resume monitoring per learner',
  'A clear history of every slot found',
];

export function LearnersShowcase({ tone = 'surface' }) {
  return (
    <Section id="learners" tone={tone}>
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <Reveal className="order-2 min-w-0 lg:order-1">
          <MockWindow
            title="Learners"
            bodyClassName="p-3 sm:p-4"
            right={
              <span className="hidden items-center gap-1 rounded-md bg-brand px-2 py-1 text-[11px] font-semibold text-white sm:inline-flex" aria-hidden="true">
                <Plus className="size-3" /> Add learner
              </span>
            }
          >
            {/* Column headings (desktop) */}
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.9fr] gap-3 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle md:grid" aria-hidden="true">
              <span>Learner</span>
              <span>Preference</span>
              <span>Status</span>
              <span className="text-right">Last activity</span>
            </div>
            <Stagger as="ul" className="space-y-2" aria-label="Sample learners">
              {learners.map((l) => (
                <StaggerItem
                  as="li"
                  key={l.name}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface p-3 md:grid-cols-[1.4fr_1fr_1fr_0.9fr]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={l.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{l.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted">
                        <MapPin className="size-3 shrink-0" aria-hidden="true" /> {l.centre}
                      </p>
                    </div>
                  </div>
                  <p className="col-span-2 row-start-2 flex items-center gap-1.5 text-xs text-ink-soft md:col-span-1 md:row-start-auto">
                    <CalendarDays className="size-3.5 shrink-0 text-subtle" aria-hidden="true" />
                    {l.pref}
                    <span className="ml-auto text-subtle md:hidden">{l.last}</span>
                  </p>
                  <div className="col-start-2 row-start-1 md:col-start-auto md:row-start-auto">
                    <Badge tone={l.tone} dot pulse={l.pulse}>
                      {l.status}
                    </Badge>
                  </div>
                  <p className="hidden text-right text-xs tabular-nums text-subtle md:block">{l.last}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="px-3 pt-3 text-[11px] text-subtle">Sample learners for demonstration.</p>
          </MockWindow>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Multi-learner"
            title="Every learner, one calm dashboard."
            description="Built for instructors and driving schools. Each learner gets their own preferences, monitoring status and slot history — so nothing slips through the cracks."
          />
          <Reveal as="ul" delay={0.1} className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-ink-soft">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                {p}
              </li>
            ))}
          </Reveal>
          <Reveal delay={0.15} className="mt-8">
            <Button to={paths.register} size="lg" rightIcon={ArrowRight}>
              Manage Learners
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
