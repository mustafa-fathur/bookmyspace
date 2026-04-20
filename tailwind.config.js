/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: '#001A9E',
        action: '#2F7CF6',
        accent: '#AEE9FF',
        neutralbg: '#F8FAFC',
        neutraltext: '#1E293B',
        neutralborder: '#E2E8F0',
      },
    },
  },
  plugins: [],
};
