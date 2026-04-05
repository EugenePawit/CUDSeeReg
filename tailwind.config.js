/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Noto Sans Thai', 'sans-serif'],
        'display': ['Outfit', 'sans-serif'],
        'kanit': ['Kanit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 14px 48px 0 rgba(31, 38, 135, 0.12)',
      },
      borderRadius: {
        'bento': '1.25rem',
      },
      backdropBlur: {
        '2xl': '40px',
      },
    },
  },
  plugins: [],
}