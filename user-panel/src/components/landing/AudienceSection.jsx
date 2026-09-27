import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmartImage } from '@/components/ui';
import { audiences } from '@/data/landing';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { EASE, LandingHeading } from './shared';

/** Three tall photographic cards; the middle one is offset for rhythm. */
export function AudienceSection() {
  return (
    <section id="audiences" aria-labelledby="audiences-title" className="relative overflow-hidden bg-canvas py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" aria-hidden="true" />
      <div className="container-page">
        <LandingHeading
          id="audiences-title"
          eyebrow="Built for everyone on the road"
          title={<>One tool. Every kind of <span className="bg-gradient-to-r from-brand to-[#6f5bff] bg-clip-text text-transparent">learner journey.</span></>}
          description="Whether you’re booking your own test or managing a diary of pupils, SlotPilot keeps watch so you don’t have to."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-3 lg:gap-6">
          {audiences.map((a, i) => (
            <motion.article
              key={a.key}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
              className={cn('group relative h-[460px] overflow-hidden rounded-[2rem] shadow-card sm:h-[520px]', i === 1 && 'md:translate-y-12')}
            >
              <SmartImage
                image={a.image}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="absolute inset-0"
                imgClassName="transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/45 to-transparent" aria-hidden="true" />
              <div className="absolute inset-0 bg-[#3b5bfd]/0 transition-colors duration-700 group-hover:bg-[#3b5bfd]/10" aria-hidden="true" />

              <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#a9b9ff]">{a.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-[1.7rem]">{a.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">{a.body}</p>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] max-md:grid-rows-[1fr]">
                  <ul className="overflow-hidden">
                    {a.points.map((p) => (
                      <li key={p} className="mt-3 flex items-center gap-2 text-[14px] text-white/85">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"><Check className="size-3" aria-hidden="true" /></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={paths.register} className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-white hover:text-night">
                  Get started <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
