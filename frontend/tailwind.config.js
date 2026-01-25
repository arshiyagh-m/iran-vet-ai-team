/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0f172a', // سرمه‌ای تیره
          green: '#15803d', // سبز طبیعت
          light: '#f1f5f9',
          gold: '#eab308'
        }
      }
    },
  },
  plugins: [],
}

