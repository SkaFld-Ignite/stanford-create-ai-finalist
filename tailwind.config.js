/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,md,mdx}", "./docs/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8C1515', // Stanford Cardinal
          dark: '#7a1212',
          light: '#9e1818',
        },
        cardinal: '#8C1515',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
  },
};