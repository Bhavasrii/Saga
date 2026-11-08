/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#faf8f4',
        ink: {
          DEFAULT: '#1c1b19',
          muted: '#636059',
          light: '#8f8b82',
        },
        borderWarm: '#e7e3da',
        forest: {
          DEFAULT: '#1f7a52',
          hover: '#1a6244',
          tint: '#eef8f2',
          light: '#d2ecd9',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
      },
    },
  },
  plugins: [],
}
