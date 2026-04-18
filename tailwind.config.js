/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eefbff',
          100: '#dcf4ff',
          200: '#bceaff',
          300: '#90dfff',
          400: '#A3E4FA', /* Light diamond color */
          500: '#5796F2',
          600: '#2E6BEB', /* Right shade color */
          700: '#174EDB',
          800: '#0A2D9A',
          900: '#000B8C', /* Left darkest shade */
          950: '#00086B',
        },
      },
    },
  },
  plugins: [],
};
