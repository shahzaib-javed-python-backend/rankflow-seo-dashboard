/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070a12',
          900: '#0b0f1a',
          850: '#0e1320',
          800: '#121828',
          750: '#161d31',
          700: '#1b2336',
          600: '#25304a',
          500: '#32405e',
        },
        brand: {
          50: '#ecfdf7',
          100: '#d1faec',
          200: '#a6f3da',
          300: '#6ee8c3',
          400: '#34d4a7',
          500: '#14b88f',
          600: '#0a9a78',
          700: '#0a7a61',
          800: '#0c604e',
          900: '#0c4f41',
        },
        accent: {
          400: '#f6a93b',
          500: '#ec8b1c',
          600: '#cf6e0b',
        },
        success: '#16a34a',
        warning: '#eab308',
        danger: '#e11d48',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px -12px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)',
        glow: '0 0 0 1px rgba(20,184,143,0.25), 0 8px 30px -8px rgba(20,184,143,0.35)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 0%, rgba(20,184,143,0.10), transparent 60%)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.8)', opacity: '0.7' }, '100%': { transform: 'scale(2)', opacity: '0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22,1,0.36,1)',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.22,1,0.36,1)',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};
