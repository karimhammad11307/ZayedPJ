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
        cream:         '#F5F0E8',
        'cream-light': '#FAFAF8',
        'cream-warm':  '#F0E6D2',
        'mint-soft':   '#F0F7F4',
        mint:          '#4A9B7F',
        forest:        '#1E4D3A',
        'forest-dark': '#15392A',
        terracotta:    '#C94B2C',
        rust:          '#A8391F',
        blush:         '#E8B4A0',
        mustard:       '#E8A820',
        brown:         '#2C1810',
        'brown-muted': '#6B5B4E',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn:  '14px',
      },
      boxShadow: {
        card:          '0 2px 16px 0 rgba(44,24,16,0.07)',
        'card-hover':  '0 8px 24px rgba(201,75,44,0.12)',
        'warm':        '0 4px 12px rgba(74,155,127,0.3)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        marquee:         'marquee 28s linear infinite',
        'fade-in':       'fade-in 0.4s ease both',
        'slide-in-right': 'slide-in-right 0.35s ease both',
      },
    },
  },
  plugins: [],
}

export default config
