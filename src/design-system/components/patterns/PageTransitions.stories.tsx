import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MotionProvider } from '@/src/providers/MotionProvider';
import { pageTransitionVariants, SPRING_TRANSITION } from '@/src/providers/motion-presets';

const DemoPageTransitions = () => {
  const pages = [
    { title: 'Dashboard', description: 'See fatigue, recovery, and quick stats.' },
    { title: 'Workout Builder', description: 'Plan sets with live forecasts.' },
    { title: 'Analytics', description: 'Review trends, PRs, and muscle readiness.' },
  ];
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((current) => (current + 1) % pages.length);
  };

  return (
    <MotionProvider>
      <div className="flex flex-col gap-6 w-full max-w-xl">
        <button
          onClick={handleNext}
          className="self-start rounded-full bg-primary px-6 py-3 font-semibold text-white"
        >
          Next Page
        </button>
        <div className="relative h-48 overflow-hidden rounded-2xl bg-white/60 p-6 backdrop-blur">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pages[index].title}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={SPRING_TRANSITION}
              className="absolute inset-0 flex flex-col justify-center gap-3"
            >
              <h3 className="text-2xl font-display text-primary-dark">
                {pages[index].title}
              </h3>
              <p className="text-primary-medium">{pages[index].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionProvider>
  );
};

const meta = {
  title: 'Design System/Patterns/PageTransitions',
  component: DemoPageTransitions,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Demonstrates the shared route transition variants powered by `MotionProvider` and `pageTransitionVariants`.',
      },
    },
  },
} satisfies Meta<typeof DemoPageTransitions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DemoPageTransitions />,
};
