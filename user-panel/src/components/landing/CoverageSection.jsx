import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock3, MapPin } from 'lucide-react';
import { SmartImage } from '@/components/ui';
import { coverageCities } from '@/data/landing';
import { EASE, LandingHeading } from './shared';

/** Horizontal, snap-scrolling city cards (swipeable on touch). */
export function CoverageSection() {
  const track = useRef(null);
  const scroll = (dir) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 420), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="coverage-title" className="relative overflow-hidden bg-surface py-24 sm:py-32">
      <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <LandingHeading
          align="left"
          id="coverage-title"
          eyebrow="Coverage"
          title="From Wood Green to Edinburgh."
          description="Monitor any combination of UK practical test centres. Pick the ones you can realistically reach — we’ll watch them all at once."
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous cities" className="flex size-12 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:bg-ink hover:text-canvas">
            <ArrowLeft className="size-5" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next cities" className="flex size-12 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:bg-ink hover:text-canvas">
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 [scrollbar-width:none] sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-label="Cities, scroll horizontally"
      >
        {coverageCities.map((c, i) => (
          <motion.article
            key={c.city + i}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: EASE, delay: Math.min(i, 4) * 0.08 }}
            className="group relative h-[440px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] sm:w-[360px]"
          >
            <SmartImage image={c.image} width={900} sizes="(min-width: 640px) 360px, 80vw" className="absolute inset-0" imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" aria-hidden="true" />
            <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
              <MapPin className="size-3.5" aria-hidden="true" /> {c.centres} centres
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="font-display text-3xl font-bold tracking-tight text-white">{c.city}</h3>
              <p className="mt-1.5 text-sm text-white/70">{c.note}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-white/70"><Clock3 className="size-4" aria-hidden="true" /> Typical wait</span>
                <span className="font-semibold">{c.wait}</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
