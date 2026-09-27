import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion';
import { img } from '@/data/images';
import { bigStats } from '@/data/landing';
import { EASE } from './shared';

function CountUp({ value, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const c = animate(0, value, { duration: 2, ease: EASE, onUpdate: setN });
    return () => c.stop();
  }, [inView, value]);
  return <span ref={ref} className="tabular-nums">{n.toFixed(decimals)}{suffix}</span>;
}

/** Parallax photo band with animated numbers. */
export function StatsBand() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-13%', '13%']);

  return (
    <section ref={ref} aria-label="SlotPilot in numbers" className="relative isolate overflow-hidden py-28 text-white sm:py-40">
      <motion.img
        style={{ y }}
        src={img('interchange', 1920, 70)}
        srcSet={`${img('interchange', 960, 70)} 960w, ${img('interchange', 1920, 70)} 1920w, ${img('interchange', 2560, 70)} 2560w`}
        sizes="100vw"
        alt=""
        loading="lazy"
        className="absolute inset-x-0 top-[-18%] -z-10 h-[136%] w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#070b14]/90 via-[#070b14]/75 to-[#070b14]/90" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(59,91,253,0.25),transparent_65%)]" aria-hidden="true" />

      <div className="container-page">
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto max-w-3xl text-balance text-center font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Speed matters when a slot can vanish in minutes.
        </motion.p>
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] bg-white/10 ring-1 ring-white/10 backdrop-blur-sm lg:grid-cols-4">
          {bigStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className="flex flex-col items-center bg-[#070b14]/55 px-4 py-10 text-center sm:py-12">
              <dd className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
                <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </dd>
              <dt className="mt-3 text-[13px] text-white/55 sm:text-sm">{s.label}</dt>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
