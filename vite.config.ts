import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Core React runtime — tiny, always needed
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Router + helmet
            if (id.includes('react-router-dom') || id.includes('react-helmet-async')) {
              return 'vendor-router';
            }
            // Motion library — large, loaded after hydration
            if (id.includes('node_modules/motion')) {
              return 'vendor-motion';
            }
            // Icons — medium, deferred
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Admin panel — only loaded on /aniadmin, keep separate
            if (id.includes('AdminPanel') || id.includes('src/components/admin')) {
              return 'chunk-admin';
            }
            // Checkout / Cart — only on those routes
            if (id.includes('CheckoutPage') || id.includes('CartPage') || id.includes('OrderSuccess')) {
              return 'chunk-checkout';
            }
            // Blog pages — infrequently visited
            if (id.includes('BlogsPage') || id.includes('BlogDetailPage')) {
              return 'chunk-blog';
            }
          },
        },
      },
      // Enable minification for production
      minify: 'esbuild',
      chunkSizeWarningLimit: 800,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
