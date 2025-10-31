import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactGrab } from 'react-grab/plugins/vite';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), reactGrab()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
