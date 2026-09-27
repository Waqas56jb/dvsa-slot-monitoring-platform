import { MapPin } from 'lucide-react';
import { trustCities } from '@/data/landing';
import { Marquee } from './shared';

/** Dark continuation of the hero: cities covered, scrolling. */
export function TrustMarquee() {
  return (
    <section aria-label="Cities covered" className="relative bg-[#070b14] pb-16 pt-4 text-white sm:pb-20">
      <p className="container-page text-center text-[12px] font-medium uppercase tracking-[0.22em] text-white/40">
        Watching test centres in every corner of the UK
      </p>
      <Marquee duration={55} className="mt-7">
        {trustCities.map((c) => (
          <span key={c} className="flex items-center gap-3 px-6 font-display text-2xl font-semibold tracking-tight text-white/35 transition-colors hover:text-white sm:px-9 sm:text-3xl">
            <MapPin className="size-4 text-[#7d98ff]/70" aria-hidden="true" />
            {c}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
