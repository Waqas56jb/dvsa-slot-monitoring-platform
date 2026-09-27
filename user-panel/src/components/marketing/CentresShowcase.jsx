import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, CircleCheck, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { centres, featuredLondonCentres } from '@/data/centres';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { MockWindow } from './MockWindow';
import { Reveal } from './Reveal';
import { Section, SectionHeading } from './SectionHeading';

const london = featuredLondonCentres.map((id) => centres.find((c) => c.id === id)).filter(Boolean);
const areas = ['All', ...new Set(london.map((c) => c.area))];

const bullets = [
  'Search and multi-select centres in seconds',
  'Group centres by area to cover a whole side of London',
  'Different centres for every learner',
];

export function CentresShowcase({ tone = 'canvas' }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All');
  const [selected, setSelected] = useState(['ctr_hendon', 'ctr_millhill', 'ctr_enfield', 'ctr_sutton']);
  const searchId = useId();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return london.filter(
      (c) => (area === 'All' || c.area === area) && (!q || c.name.toLowerCase().includes(q) || c.postcode.toLowerCase().includes(q)),
    );
  }, [query, area]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectedCentres = london.filter((c) => selected.includes(c.id));

  return (
    <Section id="centres" tone={tone}>
      <div className="container-page grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Test centres"
            title="Monitor the centres that matter."
            description="Choose exactly where each learner is happy to take their test. SlotPilot watches every selected centre at once, so you never have to check them one by one."
          />
          <Reveal as="ul" delay={0.1} className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[15px] text-ink-soft">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                {b}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.1} className="min-w-0">
          <MockWindow title="Select test centres" bodyClassName="p-4 sm:p-5">
            <label htmlFor={searchId} className="sr-only">
              Search sample test centres
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search centres or postcodes…"
                className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-sm text-ink outline-none placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
              />
            </div>

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin" role="group" aria-label="Filter by area">
              {areas.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  aria-pressed={area === a}
                  className={cn(
                    'h-8 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors',
                    area === a ? 'bg-ink text-surface' : 'bg-surface-muted text-muted hover:text-ink',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>

            <ul className="mt-3 grid max-h-[268px] gap-1.5 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-2" aria-label="Sample London test centres">
              {visible.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <li key={c.id}>
                    <label
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors',
                        on ? 'border-brand/40 bg-brand-soft/60' : 'border-line bg-surface hover:border-line-strong',
                      )}
                    >
                      <input type="checkbox" className="peer sr-only" checked={on} onChange={() => toggle(c.id)} />
                      <span
                        className={cn(
                          'flex size-[18px] shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand',
                          on ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface',
                        )}
                        aria-hidden="true"
                      >
                        {on && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                        <span className="block truncate text-[11px] text-subtle">
                          {c.area} · {c.postcode}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
              {visible.length === 0 && <li className="col-span-full py-8 text-center text-sm text-muted">No sample centres match “{query}”.</li>}
            </ul>

            <div className="mt-4 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink" aria-live="polite">
                  {selected.length} of {london.length} centres selected
                </p>
                {selected.length > 0 && (
                  <button type="button" onClick={() => setSelected([])} className="text-xs font-semibold text-muted hover:text-ink">
                    Clear
                  </button>
                )}
              </div>
              <ul className="mt-3 flex min-h-8 flex-wrap gap-1.5" aria-label="Selected centres">
                <AnimatePresence initial={false}>
                  {selectedCentres.map((c) => (
                    <motion.li
                      key={c.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                    >
                      <span className="inline-flex h-8 items-center gap-1 rounded-full border border-line bg-surface pl-2.5 pr-1 text-xs font-medium text-ink-soft">
                        <MapPin className="size-3 text-brand" aria-hidden="true" />
                        {c.name}
                        <button
                          type="button"
                          onClick={() => toggle(c.id)}
                          className="ml-0.5 flex size-6 items-center justify-center rounded-full text-subtle hover:bg-surface-muted hover:text-ink"
                          aria-label={`Remove ${c.name}`}
                        >
                          <X className="size-3" aria-hidden="true" />
                        </button>
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <Button to={paths.register} fullWidth className="mt-4" rightIcon={ArrowRight} disabled={selected.length === 0}>
                Monitor {selected.length || ''} {selected.length === 1 ? 'centre' : 'centres'}
              </Button>
            </div>
          </MockWindow>
          <p className="mt-3 text-center text-xs text-subtle">These are sample centre records for the demo — not live availability.</p>
        </Reveal>
      </div>
    </Section>
  );
}
