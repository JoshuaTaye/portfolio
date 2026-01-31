/**
 * Centralized Framer Motion variants.
 * Calm, elegant motion — no bouncy or playful easing.
 */

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const sectionHover = {
  rest: { scale: 1 },
  hover: { scale: 1.01 },
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2 },
};

export const fillTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

export const tapTransition = {
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

/** Use with prefers-reduced-motion: respect reduced motion by shortening/removing motion. */
export const reducedMotionVariant = (prefersReduced: boolean) =>
  prefersReduced
    ? { transition: { duration: 0.01 } }
    : { transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } };
