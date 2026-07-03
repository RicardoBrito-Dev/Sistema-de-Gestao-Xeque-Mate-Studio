import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8CC6A',
          dark: '#A8860A',
          muted: 'rgba(212,175,55,0.15)',
        },
        crimson: {
          DEFAULT: '#C0392B',
          light: '#E74C3C',
          dark: '#922B21',
          muted: 'rgba(192,57,43,0.15)',
        },
        studio: {
          bg: '#0a0a0a',
          surface: '#111111',
          card: '#161616',
          border: '#222222',
          'border-light': '#2a2a2a',
          text: '#F0F0F0',
          muted: '#888888',
          'muted-dark': '#555555',
        },
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'Impact', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #A8860A 100%)',
        'crimson-gradient': 'linear-gradient(135deg, #C0392B 0%, #922B21 100%)',
        'dark-gradient': 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
        'card-gradient': 'linear-gradient(145deg, #1a1a1a 0%, #111111 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212,175,55,0.3)',
        'gold-lg': '0 0 40px rgba(212,175,55,0.4)',
        'crimson': '0 0 20px rgba(192,57,43,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(212,175,55,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
