// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { devApi } from './dev-api.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.satvastones.in',
  integrations: [react()],
  build: {
    inlineStylesheets: 'always'
  },
  vite: {
    plugins: [tailwindcss(), devApi()]
  }
});
