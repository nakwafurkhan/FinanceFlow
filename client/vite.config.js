import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png'],
      manifest: {
        name: 'FinanceFlow',
        short_name: 'FinanceFlow',
        description:
          'Personal finance dashboard with budgets, analytics, and AI insights',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the built static assets (hashed filenames = safe to cache).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],

        // Take control of open pages as soon as a new SW is deployed, and
        // drop stale precaches. Critical: this forces returning visitors off
        // the OLD service worker (which cached empty API responses) without
        // them having to manually clear site data.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // IMPORTANT: we deliberately do NOT cache /api/* responses.
        //
        // The previous config used NetworkFirst with a 5s timeout. Because the
        // Render free tier cold-starts in 30–60s, that 5s timeout tripped on
        // every cold load and the SW served a STALE cached response — which,
        // for a freshly-seeded/empty account, meant the dashboard showed ₹0
        // even though the API had data. Financial data must always be live,
        // so API calls now go straight to the network (no SW caching).
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Dev only — forwards /api/* to the local Express backend on port 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Manual chunks split vendor libs from app code so a code change doesn't
    // bust the entire vendor cache.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'motion-vendor': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
