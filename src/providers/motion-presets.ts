import { Variants, Transition } from 'framer-motion';

export const SPRING_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const sheetVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
    filter: 'blur(12px)',
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
};

export const pageTransitionVariants: Variants = {
  initial: {
    x: 64,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      ...SPRING_TRANSITION,
      mass: 0.6,
    },
  },
  exit: {
    x: -64,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const listContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_TRANSITION,
      stiffness: 260,
      damping: 25,
    },
  },
};

export const shimmerVariants: Variants = {
  idle: {
    backgroundPosition: '-200% 0',
  },
  shimmer: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
