// Tailwind CSS v4 is processed through PostCSS in Next.js.
// The old @tailwindcss/vite plugin was removed with the Vite stack; without
// this plugin Tailwind emits no utility classes and the site renders unstyled.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
