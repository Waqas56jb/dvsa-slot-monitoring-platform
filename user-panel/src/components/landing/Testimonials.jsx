import { Quote, Star } from 'lucide-react';
import { img } from '@/data/images';
import { testimonials } from '@/data/landing';
import { cn } from '@/utils/cn';
import { LandingHeading, Marquee } from './shared';

function Card({ t, className }) {
  return (
    <figure className={cn('mb-5 rounded-[1.5rem] border border-line bg-surface p-6 shadow-soft', className)}>
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4 fill-current" aria-hidden="true" />)}
        </div>
        <Quote className="size-5 text-line-strong" aria-hidden="true" />
      </div>
      <blockquote className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <img src={img(t.image, 120, 70)} alt="" loading="lazy" className="size-11 rounded-full object-cover" />
        <span>
          <span className="block text-sm font-semibold text-ink">{t.name}</span>
          <span className="block text-[13px] text-muted">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Three vertical auto-scrolling columns (one on mobile, horizontally). */
export function Testimonials() {
  const cols = [0, 1, 2].map((c) => testimonials.filter((_, i) => i % 3 === c));
  return (
    <section aria-labelledby="love-title" className="relative overflow-hidden bg-canvas py-24 sm:py-32">
      <div className="container-page">
        <LandingHeading
          id="love-title"
          eyebrow="Loved on the road"
          title="Learners pass sooner. Instructors get their evenings back."
        />

        {/* Mobile: horizontal marquee */}
        <Marquee duration={60} className="mt-12 md:hidden">
          {testimonials.map((t) => <Card key={t.name} t={t} className="mx-2.5 mb-0 w-[300px] shrink-0" />)}
        </Marquee>

        {/* Desktop: vertical columns moving at different speeds */}
        <div className="mt-16 hidden h-[720px] grid-cols-3 gap-5 md:grid">
          {cols.map((col, i) => (
            <Marquee key={i} direction="up" duration={[46, 58, 50][i]} className="h-full">
              {col.concat(col).map((t, k) => <Card key={`${t.name}-${k}`} t={t} />)}
            </Marquee>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-subtle">Sample testimonials shown for demonstration.</p>
      </div>
    </section>
  );
}
