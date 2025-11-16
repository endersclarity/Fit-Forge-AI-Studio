import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./.storybook/vitest.setup.ts'],
    globalSetup: './vitest.global-setup.ts',
    pool: 'threads',
    minThreads: 1,
    maxThreads: 1,
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
