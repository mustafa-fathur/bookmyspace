/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/*.{html,js,ejs}", "node_modules/preline/dist/*.js"],
  theme: {
    extend: {},
  },
  plugins: ['preline/plugin'],
}

