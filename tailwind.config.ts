import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tempo brand — vivid electric violet
        tempo: {
          50:  '#F3EEFF',
          100: '#E5D9FF',
          200: '#CCB4FF',
          300: '#AB85FF',
          400: '#8A56FF',
          500: '#7C3BFF',  // primary
          600: '#6620EE',
          700: '#5218C4',
          800: '#3F129A',
          900: '#2C0C70',
        },
        // Mint teal accent
        mint: {
          300: '#6EEEDD',
          400: '#2EE8CB',
          500: '#0DD9B8',  // accent
          600: '#08B899',
          700: '#059178',
        },
        // Coral for urgency/danger
        coral: {
          400: '#FF6B7A',
          500: '#FF4757',  // danger
          600: '#E83347',
        },
        // Amber for streaks/warnings
        amber: {
          400: '#FFB74D',
          500: '#FFA040',
          600: '#E8862A',
        },
        // Neutral (dark-tinted)
        ink: {
          50:  '#F5F4FF',
          100: '#ECEAFE',
          200: '#D5D2FC',
          300: '#B0ABED',
          400: '#857FC4',
          500: '#5E5896',
          600: '#423D72',
          700: '#2D2850',
          800: '#1A1635',
          900: '#0D0B1F',
          950: '#07061A',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'tempo-gradient':  'linear-gradient(135deg, #7C3BFF 0%, #9B27AF 100%)',
        'tempo-soft':      'linear-gradient(135deg, #F3EEFF 0%, #EDE9FE 100%)',
        'mint-gradient':   'linear-gradient(135deg, #0DD9B8 0%, #06C5A6 100%)',
        'card-glow':       'linear-gradient(145deg, rgba(124,59,255,0.06) 0%, rgba(13,217,184,0.04) 100%)',
        'dark-surface':    'linear-gradient(145deg, #14112A 0%, #1A1635 100%)',
      },
      boxShadow: {
        'soft':    '0 2px 20px -4px rgba(124,59,255,0.12), 0 8px 24px -8px rgba(0,0,0,0.08)',
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'glow':    '0 0 0 1px rgba(124,59,255,0.15), 0 4px 20px rgba(124,59,255,0.18)',
        'glow-sm': '0 0 0 1px rgba(124,59,255,0.2)',
        'mint':    '0 4px 16px rgba(13,217,184,0.25)',
        'dark':    '0 4px 24px rgba(0,0,0,0.4)',
        'lift':    '0 8px 32px -4px rgba(124,59,255,0.2), 0 2px 8px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-up':     'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down':   'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':     'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft':  'bounceSoft 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':      'shimmer 2s infinite',
        'pulse-ring':   'pulseRing 1.5s ease-out infinite',
        'float':        'float 3s ease-in-out infinite',
        'confetti':     'confetti 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        bounceSoft:{ '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.08)' }, '70%': { transform: 'scale(0.96)' }, '100%': { transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.8' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        confetti:  { '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' }, '50%': { transform: 'scale(1.3) rotate(15deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
