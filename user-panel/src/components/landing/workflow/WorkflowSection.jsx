import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useSpring } from 'framer-motion';
import { workflowSteps } from '@/data/landing';
import { cn } from '@/utils/cn';
import { EASE, LandingHeading } from '../shared';
import { PhoneFrame, SCREENS } from './PhoneScreens';

function StepBlock({ step, index, active, onActive }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => { if (inView) onActive(index); }, [inView, index, onActive]);
  const Screen = SCREENS[step.screen];
  return (
    <div ref={ref} className="flex min-h-0 flex-col justify-center py-6 lg:min-h-[78vh] lg:py-0">
      <motion.div
        animate={{ opacity: active ? 1 : 0.35 }}
        transition={{ duration: 0.5 }}
        className="max-lg:!opacity-100"
      >
        <p className="font-display text-sm font-bold tracking-[0.2em] text-[#7d98ff]">STEP {step.step}</p>
        <h3 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{step.title}</h3>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/60">{step.body}</p>
      </motion.div>
      {/* Inline phone on small screens */}
      <div className="mt-8 flex justify-center lg:hidden">
        <PhoneFrame className="w-[250px]">
          <Screen />
        </PhoneFrame>
      </div>
    </div>
  );
}

/**
 * Scroll-driven "how it works": the phone stays pinned while the steps
 * scroll past; the active step swaps the phone screen with a 3D flip.
 */
export function WorkflowSection() {
  const [active, setActive] = useState(0);
  const railRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start 60%', 'end 40%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const Screen = SCREENS[workflowSteps[active].screen];

  return (
    <section id="workflow" aria-labelledby="workflow-title" className="relative overflow-clip bg-[#070b14] py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#3b5bfd]/15 blur-[140px]" />
        <div className="bg-grid absolute inset-0 opacity-[0.05] mask-radial" />
      </div>

      <div className="container-page relative">
        <LandingHeading
          dark
          id="workflow-title"
          eyebrow="How it works"
          title={<>From sign-up to test day in <span className="bg-gradient-to-r from-[#9fb3ff] to-[#34d399] bg-clip-text text-transparent">four calm steps.</span></>}
          description="Set it up once. SlotPilot does the watching — you just act on the alert."
        />

        <div className="mt-16 grid gap-10 lg:mt-8 lg:grid-cols-2 lg:gap-20">
          {/* Pinned phone */}
          <div className="relative hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              <div className="absolute size-[420px] rounded-full bg-gradient-to-tr from-[#3b5bfd]/40 to-[#34d399]/20 blur-[90px]" aria-hidden="true" />
              <div className="relative [perspective:1600px]">
                <motion.div
                  initial={{ rotateY: -18, rotateX: 6 }}
                  whileInView={{ rotateY: -8, rotateX: 4 }}
                  transition={{ duration: 1.4, ease: EASE }}
                  className="[transform-style:preserve-3d]"
                >
                  <PhoneFrame>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, rotateY: 35, scale: 0.94 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateY: -35, scale: 0.94 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="size-full"
                      >
                        <Screen />
                      </motion.div>
                    </AnimatePresence>
                  </PhoneFrame>
                </motion.div>
                {/* step dots */}
                <div className="absolute -right-14 top-1/2 flex -translate-y-1/2 flex-col gap-3" aria-hidden="true">
                  {workflowSteps.map((s, i) => (
                    <span key={s.key} className={cn('h-2 w-2 rounded-full transition-all duration-500', i === active ? 'h-8 bg-[#7d98ff]' : 'bg-white/20')} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div ref={railRef} className="relative lg:py-[12vh]">
            <div className="absolute bottom-0 left-0 top-0 hidden w-px bg-white/10 lg:block" aria-hidden="true">
              <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-gradient-to-b from-[#7d98ff] to-[#34d399]" />
            </div>
            <div className="space-y-16 lg:space-y-0 lg:pl-12">
              {workflowSteps.map((s, i) => <StepBlock key={s.key} step={s} index={i} active={i === active} onActive={setActive} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
