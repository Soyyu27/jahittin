/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0F3D3E',
          DEFAULT: '#0F3D3E',
          light: '#1a5f61',
        },
        secondary: {
          DEFAULT: '#E2DCC8',
          light: '#f5f1e3',
        },
        accent: {
          green: '#70A37F',
          cream: '#E8DCCF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}