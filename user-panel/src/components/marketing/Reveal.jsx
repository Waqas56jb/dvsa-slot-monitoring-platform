import { motion } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1];

/**
 * Fade-up on scroll. Plays once. Reduced motion is handled globally by
 * <MotionConfig reducedMotion="user">.
 */
export function Reveal({ as = 'div', delay = 0, y = 14, className, children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Parent + child variants for staggered lists. */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function Stagger({ as = 'div', className, children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerParent} className={className} {...rest}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ as = 'div', className, children, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp variants={staggerChild} className={className} {...rest}>
      {children}
    </Comp>
  );
}
