/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}", // Esto escanea todo dentro de tu React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}