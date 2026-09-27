import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BellRing, CalendarCheck2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { img } from '@/data/images';
import { paths } from '@/routes/paths';
import { EASE } from './shared';

/** Cinematic closing section: photo, glass card and floating alerts with parallax. */
export function LandingFinalCta() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%']);
  const floatA = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const floatB = useTransform(scrollYProgress, [0, 1], [40, -120]);

  return (
    <section ref={ref} aria-labelledby="cta-title" className="relative bg-canvas px-3 py-16 sm:px-6 sm:py-24">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] px-6 py-20 text-white sm:px-12 sm:py-28 lg:py-32">
        <motion.img
          style={{ y: imgY }}
          src={img('bigBenSunset', 1920, 72)}
          srcSet={`${img('bigBenSunset', 1080, 70)} 1080w, ${img('bigBenSunset', 1920, 72)} 1920w`}
          sizes="100vw"
          alt=""
          loading="lazy"
          className="absolute inset-x-0 top-[-12%] -z-10 h-[124%] w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070b14]/95 via-[#070b14]/75 to-[#070b14]/30" aria-hidden="true" />

        <motion.div style={{ y: floatA }} className="absolute right-[8%] top-[18%] hidden w-72 rounded-2xl bg-white/90 p-3.5 text-night shadow-2xl backdrop-blur-xl lg:block" aria-hidden="true">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#3b5bfd] text-white"><BellRing className="size-4" /></span>
            <div><p className="text-[13px] font-bold">Slot found · Mill Hill</p><p className="text-[12px] text-night/60">Fri 17 Oct at 10:42</p></div>
          </div>
        </motion.div>
        <motion.div style={{ y: floatB }} className="absolute bottom-[16%] right-[16%] hidden w-64 rounded-2xl bg-[#0b1220]/80 p-3.5 ring-1 ring-white/10 backdrop-blur-xl lg:block" aria-hidden="true">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300"><CalendarCheck2 className="size-4" /></span>
            <div><p className="text-[13px] font-bold text-white">Booked on GOV.UK</p><p className="text-[12px] text-white/55">Test day: 14 Oct 🎉</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }} className="max-w-xl">
          <h2 id="cta-title" className="text-balance font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl">
            Your test slot is out there. Let’s find it.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">Set up in under five minutes. Cancel any time. No card needed to start.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to={paths.register} size="xl" rightIcon={ArrowRight} className="shadow-[0_18px_40px_-12px_rgba(59,91,253,0.8)]">Start monitoring free</Button>
            <Button to={paths.pricing} size="xl" variant="onDark">View pricing</Button>
          </div>
          <p className="mt-7 flex items-center gap-2 text-sm text-white/55"><ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" /> Independent service · not affiliated with the DVSA</p>
        </motion.div>
      </div>
    </section>
  );
}
