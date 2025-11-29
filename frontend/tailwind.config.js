/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f9fafb',
          dark: '#020617',
        },
        surface: {
          light: '#ffffff',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}

