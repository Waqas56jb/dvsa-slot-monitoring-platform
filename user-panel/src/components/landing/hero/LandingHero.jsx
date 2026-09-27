import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, PlayCircle, ShieldCheck, Star } from 'lucide-react';
import { Button, SmartImage } from '@/components/ui';
import { paths } from '@/routes/paths';
import { useMediaQuery } from '@/hooks';
import { heroDetections, heroStats, heroWords, testimonials } from '@/data/landing';
import { img } from '@/data/images';
import { DetectionConsole } from './DetectionConsole';
import { useHeroTimeline } from './useHeroTimeline';

const HeroScene = lazy(() => import('./HeroScene'));
const EASE = [0.16, 1, 0.3, 1];

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % heroWords.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid align-top">
      {/* invisible sizer keeps layout stable on every word */}
      {heroWords.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">{w}</span>
      ))}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={heroWords[i]}
          initial={{ opacity: 0, y: '0.45em', filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: '-0.35em', filter: 'blur(10px)' }}
          transition={{ duration: 0.55, ease: EASE }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {/* gradient text lives on an inner span — filter + background-clip:text on one element renders blank in Chrome */}
          <span className="bg-gradient-to-r from-[#9fb3ff] via-[#7d98ff] to-[#34d399] bg-clip-text pb-[0.08em] text-transparent">{heroWords[i]}</span>
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{heroWords.join(', ')}</span>
    </span>
  );
}

const fade = (delay) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, ease: EASE, delay },
});

export function LandingHero() {
  const sectionRef = useRef(null);
  const compact = !useMediaQuery('(min-width: 1024px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [webgl] = useState(supportsWebGL);
  const [visible, setVisible] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const use3D = webgl && !reducedMotion;
  const { ref: timeline, state } = useHeroTimeline(heroDetections.length, visible);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  // Subtle scroll-out: content lifts and fades as you leave the hero.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative isolate -mt-16 flex min-h-[100svh] flex-col overflow-hidden bg-[#070b14] pt-16 text-white lg:-mt-[76px] lg:pt-[76px]"
    >
      {/* Scene / fallback */}
      <motion.div style={{ scale: sceneScale }} className="absolute inset-0 -z-10" aria-hidden="true">
        {use3D ? (
          <Suspense fallback={null}>
            <div className={`absolute inset-0 transition-opacity duration-[1400ms] ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
              <HeroScene timeline={timeline} compact={compact} running={visible} onReady={() => setSceneReady(true)} eventSource={sectionRef} />
            </div>
          </Suspense>
        ) : (
          <SmartImage image="roadLightTrails" priority className="absolute inset-0" imgClassName="opacity-60" />
        )}
      </motion.div>

      {/* Legibility + atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/85 via-[#070b14]/10 to-transparent lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#070b14] via-[#070b14]/75 to-transparent lg:block lg:w-[62%]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070b14] to-transparent" />
        <div className="absolute -left-40 top-20 size-[520px] rounded-full bg-[#3b5bfd]/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence baseFrequency=%220.85%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
      </div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-page relative flex flex-1 flex-col justify-between gap-10 pb-10 pt-10 sm:pt-16 lg:justify-center lg:pb-24 lg:pt-10">
        <div className="max-w-[640px]">
          <motion.a
            href="#workflow"
            {...fade(0.1)}
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] py-1.5 pl-1.5 pr-4 text-[13px] text-white/80 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            <span className="rounded-full bg-gradient-to-r from-[#3b5bfd] to-[#6f5bff] px-2.5 py-0.5 text-[11px] font-semibold text-white">Live</span>
            Monitoring 284 UK test centres right now
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.a>

          <motion.h1
            id="hero-title"
            {...fade(0.2)}
            className="mt-6 text-balance font-display text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.6rem]"
          >
            Get your driving test <RotatingWord />
          </motion.h1>

          <motion.p {...fade(0.32)} className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-white/65 sm:text-lg">
            SlotPilot watches your chosen UK test centres around the clock and alerts you the instant a slot that fits your dates and times appears — so you can book it on GOV.UK before it’s gone.
          </motion.p>

          <motion.div {...fade(0.44)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button to={paths.register} size="xl" rightIcon={ArrowRight} className="shadow-[0_18px_40px_-12px_rgba(59,91,253,0.8)]">
              Start monitoring free
            </Button>
            <Button href="#workflow" size="xl" variant="onDark" leftIcon={PlayCircle}>
              See how it works
            </Button>
          </motion.div>

          <motion.div {...fade(0.56)} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {testimonials.slice(0, 4).map((t) => (
                  <img key={t.name} src={img(t.image, 96, 70)} alt="" loading="lazy" className="size-9 rounded-full object-cover ring-2 ring-[#070b14]" />
                ))}
              </div>
              <div className="text-[13px] leading-tight">
                <p className="flex items-center gap-0.5 text-amber-300" aria-label="Rated 4.9 out of 5">
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-3.5 fill-current" aria-hidden="true" />)}
                  <span className="ml-1.5 font-semibold text-white">4.9</span>
                </p>
                <p className="mt-1 text-white/55">from 2,300+ learners &amp; instructors</p>
              </div>
            </div>
            <span className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />
            <p className="flex items-center gap-2 text-[13px] text-white/55">
              <ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" /> We never book for you — you stay in control
            </p>
          </motion.div>
        </div>

        {/* Live console — bottom on mobile, floating right on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.8 }}
          className="flex flex-col items-stretch gap-4 lg:absolute lg:bottom-24 lg:right-8 lg:items-end xl:right-12"
        >
          <DetectionConsole detection={heroDetections[state.index]} phase={state.phase} className="mx-auto lg:mx-0" />
          <dl className="mx-auto grid w-full max-w-[400px] grid-cols-3 gap-2 lg:mx-0">
            {heroStats.map((s) => (
              <div key={s.label} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center backdrop-blur-md">
                <dt className="order-2 text-[11px] text-white/50">{s.label}</dt>
                <dd className="font-display text-lg font-bold tracking-tight text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </motion.div>

      <a href="#audiences" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/70 lg:flex" aria-label="Scroll to content">
        Scroll
        <ChevronDown className="size-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
