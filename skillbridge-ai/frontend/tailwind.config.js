/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Google Material You / Cloud Console tokens
        'g-bg': '#F8F9FA',
        'g-surface': '#FFFFFF',
        'g-card': '#FFFFFF',
        'g-border': '#DADCE0',
        'g-blue': {
          50: '#E8F0FE',
          100: '#D2E3FC',
          200: '#AECBFA',
          400: '#4285F4',
          500: '#1A73E8',
          600: '#1557B0',
          700: '#0D47A1',
        },
        'g-teal': {
          50: '#E0F2F1',
          100: '#B2DFDB',
          400: '#26A69A',
          500: '#00897B',
          600: '#00695C',
        },
        'g-violet': {
          50: '#EDE7F6',
          100: '#D1C4E9',
          400: '#9575CD',
          500: '#7C4DFF',
          600: '#651FFF',
        },
        'g-green': {
          400: '#66BB6A',
          500: '#34A853',
          600: '#2E7D32',
        },
        'g-red': {
          400: '#EF5350',
          500: '#EA4335',
          600: '#C62828',
        },
        'g-yellow': {
          400: '#FFCA28',
          500: '#FBBC04',
          600: '#F57F17',
        },
        'g-text':   '#202124',
        'g-text-2': '#5F6368',
        'g-text-3': '#80868B',
        'g-text-4': '#BDC1C6',
      },
      boxShadow: {
        'google':       '0 1px 3px rgba(60,64,67,0.15), 0 2px 6px rgba(60,64,67,0.10)',
        'google-md':    '0 2px 6px rgba(60,64,67,0.20), 0 4px 12px rgba(60,64,67,0.12)',
        'google-lg':    '0 4px 12px rgba(60,64,67,0.20), 0 8px 24px rgba(60,64,67,0.12)',
        'google-hover': '0 4px 16px rgba(60,64,67,0.25), 0 8px 24px rgba(60,64,67,0.15)',
        'blue-glow':    '0 4px 20px rgba(26,115,232,0.25)',
        'teal-glow':    '0 4px 20px rgba(0,137,123,0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-mesh':    'linear-gradient(-45deg, #1A73E8, #00897B, #7C4DFF, #4285F4)',
        'hero-card':    'linear-gradient(135deg, #E8F0FE 0%, #E0F2F1 100%)',
        'google-blue':  'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
        'google-teal':  'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
        'google-violet':'linear-gradient(135deg, #7C4DFF 0%, #9575CD 100%)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-up':       'slideUp 0.3s ease-out',
        'fade-in':        'fadeIn 0.3s ease-out',
        'skeleton':       'skeleton 1.5s ease-in-out infinite',
        'wave-1':         'wave 0.9s ease-in-out infinite',
        'wave-2':         'wave 0.9s ease-in-out 0.1s infinite',
        'wave-3':         'wave 0.9s ease-in-out 0.2s infinite',
        'wave-4':         'wave 0.9s ease-in-out 0.3s infinite',
        'wave-5':         'wave 0.9s ease-in-out 0.4s infinite',
        'float':          'float 5s ease-in-out infinite',
        'pulse-soft':     'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        skeleton: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
}
