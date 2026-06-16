import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

const src = (p) => fileURLToPath(new URL(`./src${p}`, import.meta.url));

// Standalone Vitest config (separate from vite.config.js so the image optimizer
// / bundle visualizer don't run during tests).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': src(''),
      '@components': src('/components'),
      '@pages': src('/pages'),
      '@hooks': src('/hooks'),
      '@services': src('/services'),
      '@store': src('/store'),
      '@utils': src('/utils'),
      '@assets': src('/assets'),
      '@mock-data': src('/mock-data'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
