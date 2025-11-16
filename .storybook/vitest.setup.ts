// Mock Framer Motion BEFORE any imports to prevent motion components from rendering animation attributes
import { vi } from 'vitest';
import * as React from 'react';

// Create a mock that strips animation props and renders standard DOM elements
const createMotionComponent = (Component: string) => {
  return React.forwardRef<any, any>((props, ref) => {
    // Strip all Framer Motion specific props
    const {
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileFocus,
      whileDrag,
      whileInView,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragTransition,
      dragPropagation,
      dragControls,
      dragListener,
      dragSnapToOrigin,
      onDragStart,
      onDragEnd,
      onDrag,
      onDirectionLock,
      onDragTransitionEnd,
      layout,
      layoutId,
      layoutDependency,
      layoutScroll,
      layoutRoot,
      onLayoutAnimationStart,
      onLayoutAnimationComplete,
      onViewportEnter,
      onViewportLeave,
      viewport,
      custom,
      inherit,
      onAnimationStart,
      onAnimationComplete,
      onUpdate,
      transformTemplate,
      transformValues,
      ...rest
    } = props;
    return React.createElement(Component, { ...rest, ref });
  });
};

// Create motion proxy that generates motion.div, motion.span, etc.
const motionProxy = new Proxy({} as any, {
  get: (_target, prop: string) => {
    if (prop === '$$typeof' || prop === 'render' || prop === 'displayName') {
      return undefined;
    }
    return createMotionComponent(prop);
  },
});

// Mock AnimatePresence to just render children
const MockAnimatePresence = ({ children }: { children?: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

// Mock useAnimation hook
const mockUseAnimation = () => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  set: vi.fn(),
});

// Mock useMotionValue hook
const mockUseMotionValue = (initial: any) => ({
  get: () => initial,
  set: vi.fn(),
  subscribe: vi.fn(() => () => {}),
  onChange: vi.fn(() => () => {}),
  destroy: vi.fn(),
  current: initial,
});

// Mock useTransform hook
const mockUseTransform = (_value: any, _input: any, output: any) => {
  const outputValue = Array.isArray(output) ? output[0] : output;
  return mockUseMotionValue(outputValue);
};

// Mock useSpring hook
const mockUseSpring = (value: any) => mockUseMotionValue(typeof value === 'number' ? value : value?.get?.() ?? 0);

// Mock useScroll hook
const mockUseScroll = () => ({
  scrollX: mockUseMotionValue(0),
  scrollY: mockUseMotionValue(0),
  scrollXProgress: mockUseMotionValue(0),
  scrollYProgress: mockUseMotionValue(0),
});

// Mock useInView hook
const mockUseInView = () => false;

// Mock useDragControls hook
const mockUseDragControls = () => ({
  start: vi.fn(),
  componentControls: new Set(),
});

// Mock useReducedMotion hook
const mockUseReducedMotion = () => false;

// Mock useAnimationFrame hook
const mockUseAnimationFrame = (_callback: (t: number) => void) => {};

// Mock useTime hook
const mockUseTime = () => mockUseMotionValue(0);

// Mock useVelocity hook
const mockUseVelocity = (value: any) => mockUseMotionValue(0);

// Mock useMotionTemplate hook
const mockUseMotionTemplate = (strings: TemplateStringsArray, ...values: any[]) => {
  return mockUseMotionValue(strings.join(''));
};

// Mock useWillChange hook
const mockUseWillChange = () => mockUseMotionValue('auto');

// Mock useAnimate hook
const mockUseAnimate = () => {
  const scope = { current: null };
  const animate = vi.fn().mockResolvedValue(undefined);
  return [scope, animate];
};

// Mock LazyMotion component
const MockLazyMotion = ({ children }: { children?: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

// Mock MotionConfig component
const MockMotionConfig = ({ children }: { children?: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

// Mock domAnimation and domMax features
const mockDomAnimation = {};
const mockDomMax = {};

// Mock Reorder components
const MockReorderGroup = React.forwardRef<any, any>(({ children, ...props }, ref) => {
  const { values, onReorder, axis, ...rest } = props;
  return React.createElement('ul', { ...rest, ref }, children);
});

const MockReorderItem = React.forwardRef<any, any>(({ children, ...props }, ref) => {
  const { value, ...rest } = props;
  return React.createElement('li', { ...rest, ref }, children);
});

const MockReorder = {
  Group: MockReorderGroup,
  Item: MockReorderItem,
};

// Mock LayoutGroup component
const MockLayoutGroup = ({ children }: { children?: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

vi.mock('framer-motion', () => ({
  motion: motionProxy,
  AnimatePresence: MockAnimatePresence,
  useAnimation: mockUseAnimation,
  useMotionValue: mockUseMotionValue,
  useTransform: mockUseTransform,
  useSpring: mockUseSpring,
  useScroll: mockUseScroll,
  useInView: mockUseInView,
  useDragControls: mockUseDragControls,
  useReducedMotion: mockUseReducedMotion,
  useAnimationFrame: mockUseAnimationFrame,
  useTime: mockUseTime,
  useVelocity: mockUseVelocity,
  useMotionTemplate: mockUseMotionTemplate,
  useWillChange: mockUseWillChange,
  useAnimate: mockUseAnimate,
  LazyMotion: MockLazyMotion,
  MotionConfig: MockMotionConfig,
  domAnimation: mockDomAnimation,
  domMax: mockDomMax,
  Reorder: MockReorder,
  LayoutGroup: MockLayoutGroup,
  m: motionProxy, // Alias for motion
  animate: vi.fn().mockResolvedValue(undefined),
  stagger: vi.fn((delay: number) => delay),
  spring: vi.fn(() => ({})),
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  circIn: [0.55, 0, 1, 0.45],
  circOut: [0, 0.55, 0.45, 1],
  circInOut: [0.85, 0, 0.15, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  backOut: [0.34, 1.56, 0.64, 1],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  anticipate: vi.fn(() => 0),
  cubicBezier: vi.fn(() => () => 0),
}));

// Mock the custom MotionProvider to provide a default context for tests
vi.mock('@/src/providers/MotionProvider', () => ({
  MotionProvider: ({ children }: { children: React.ReactNode }) => children,
  useMotion: () => ({
    isMotionEnabled: false, // Disable animations in tests for predictable behavior
    featureFlagEnabled: true,
    prefersReducedMotion: true, // Treat tests as preferring reduced motion
    setPrefersReducedMotion: vi.fn(),
  }),
  useMotionEnabled: () => false,
}));

import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';
import '@testing-library/jest-dom';

// Mock localStorage for tests
const localStorageMock = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
  clear: () => {},
};

global.localStorage = localStorageMock as any;

// Apply base project annotations (addon previews load inside Storybook proper, not in Vitest)
setProjectAnnotations([projectAnnotations]);
