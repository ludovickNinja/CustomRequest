/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fbf6ec',
          100: '#f4e7c8',
          200: '#e8cf90',
          300: '#dbb45c',
          400: '#cc9a35',
          500: '#b78327',
          600: '#a06d20',
          700: '#82571c',
          800: '#67451c',
          900: '#54391b',
        },
      },
    },
  },
  plugins: [],
};
