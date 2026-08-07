/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        soft: '0 4px 24px -8px rgba(6, 78, 59, 0.12)',
      },
      backgroundImage: {
        'islamic-pattern':
          'radial-gradient(circle at 1px 1px, rgba(6, 78, 59, 0.045) 1px, transparent 0)',
      },
      backgroundSize: {
        'pattern-sm': '22px 22px',
      },
    },
  },
  plugins: [],
};