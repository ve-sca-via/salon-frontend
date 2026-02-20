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
        quality: 70,
      },
      jpeg: {
        quality: 70,
      },
      png: {
        quality: 75,
      },
      webp: {
        quality: 75,
      },
      avif: {
        quality: 65,
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
    // Remove console statements in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize chunk size with aggressive code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Only split out truly independent libraries
          // Everything else stays in vendor to prevent initialization issues
          
          // HTTP client - completely independent of React
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }
          
          // Date utilities - completely independent of React
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          
          // Everything else from node_modules goes in the main vendor bundle
          // This includes React, Redux, and ALL React-dependent packages
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
