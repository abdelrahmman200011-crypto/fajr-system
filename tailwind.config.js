/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      colors: {
        'primary-green': '#114b39',
        'primary-green-deep': '#0a3d2e',
        'primary-green-soft': '#eaf5f1',
        'accent-gold': '#cda036',
        'accent-gold-soft': '#f7f0db',
        'bg-light': '#f4f7f6',
        'bg-surface': '#ffffff',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        soft: '0 8px 20px -10px rgba(17, 75, 57, 0.18)',
        premium: '0 18px 38px -22px rgba(10, 61, 46, 0.32)',
      },
      backgroundImage: {
        'islamic-pattern':
          'radial-gradient(circle at 1px 1px, rgba(17, 75, 57, 0.05) 1px, transparent 0)',
      },
      backgroundSize: {
        'pattern-sm': '22px 22px',
      },
    },
  },
  plugins: [],
};