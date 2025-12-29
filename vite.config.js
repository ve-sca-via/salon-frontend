import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      // Image optimization settings
      jpg: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
      avif: {
        quality: 70,
      },
      // Only optimize assets in production
      test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false,
              },
            },
          },
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
    }),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@services': '/src/services',
      '@store': '/src/store',
      '@utils': '/src/utils',
      '@assets': '/src/assets',
      '@mock-data': '/src/mock-data',
    },
  },
  build: {
    // Reduce chunk size warning limit to catch issues early
    chunkSizeWarningLimit: 500,
    // Optimize chunk size with aggressive code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Redux and state management (heavy but used everywhere)
          if (id.includes('node_modules/@reduxjs/toolkit') || 
              id.includes('node_modules/react-redux') || 
              id.includes('node_modules/redux-persist')) {
            return 'redux-vendor';
          }
          
          // Supabase client (heavy but critical)
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          
          // Date libraries - CRITICAL: Only use date-fns, remove moment.js
          // Keeping both is 2.5MB+ of duplicate functionality
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          if (id.includes('node_modules/moment')) {
            return 'moment-vendor'; // This should be removed!
          }
          
          // Charts - HEAVY (500KB+), only used in vendor dashboard
          if (id.includes('node_modules/recharts')) {
            return 'charts-vendor';
          }
          
          // Calendar - HEAVY (200KB+), only used in booking pages
          if (id.includes('node_modules/react-big-calendar')) {
            return 'calendar-vendor';
          }
          
          // Icons - Keep separate for caching
          if (id.includes('node_modules/react-icons')) {
            return 'icons-vendor';
          }
          
          // Forms and validation
          if (id.includes('node_modules/react-hook-form')) {
            return 'forms-vendor';
          }
          
          // HTTP client and utilities
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }
          
          // Toast notifications
          if (id.includes('node_modules/react-toastify')) {
            return 'toast-vendor';
          }
          
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
