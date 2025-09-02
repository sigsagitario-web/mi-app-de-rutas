/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // si tus componentes están aquí
    "./pages/**/*.{js,ts,jsx,tsx}",      // si tus páginas están aquí
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

