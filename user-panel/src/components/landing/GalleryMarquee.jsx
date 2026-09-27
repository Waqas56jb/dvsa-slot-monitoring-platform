import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { img, imgAlt } from '@/data/images';
import { galleryRows } from '@/data/landing';
import { Marquee } from './shared';

/** Two rows of photography drifting in opposite directions. */
export function GalleryMarquee() {
  // Images inside a moving track aren't re-checked by native lazy-loading,
  // so load them eagerly — but only once the section is close to the viewport.
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: '800px 0px' });
  return (
    <section ref={ref} aria-label="On the road across the UK" className="relative overflow-hidden bg-[#070b14] py-20 sm:py-28">
      <div className="container-page mb-12 flex flex-col items-center text-center">
        <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Your test. Your city. <span className="text-white/40">Your time.</span></p>
      </div>
      <div className="space-y-5 [transform:rotate(-2deg)_scale(1.04)]">
        {galleryRows.map((row, r) => (
          <Marquee key={r} direction={r ? 'right' : 'left'} duration={r ? 70 : 60}>
            {row.map((key) => (
              <figure key={key} className="group relative mx-2.5 h-[180px] w-[260px] shrink-0 overflow-hidden rounded-[1.25rem] bg-[#131c2e] sm:h-[240px] sm:w-[360px]">
                {near && <img
                  src={img(key, 720, 70)}
                  srcSet={`${img(key, 480, 65)} 480w, ${img(key, 720, 70)} 720w`}
                  sizes="(min-width: 640px) 360px, 260px"
                  alt={imgAlt(key)}
                  loading="eager"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 transition-opacity group-hover:opacity-30" aria-hidden="true" />
              </figure>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
