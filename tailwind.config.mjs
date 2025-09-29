/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0071BB',
          blue: '#0071BB',
        },
        navy: '#0A2540',
        cyan: '#00A9E0',
        'light-blue': '#E6F4FA',
      },
      fontFamily: {
        heading: ['Revolution Gothic Bold', 'sans-serif'],
        body: ['Neuzeit Grotesk', 'sans-serif'],
        sans: ['Neuzeit Grotesk', 'sans-serif'],
      },
      fontWeight: {
        'heading': '700',
        'body': '400',
      },
    },
  },
  plugins: [],
};