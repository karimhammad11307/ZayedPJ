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
        'mint-pale':   '#E8F4F0',
        mint:          '#4A9B7F',
        forest:        '#1E4D3A',
        'forest-dark': '#15392A',
        terracotta:    '#C94B2C',
        rust:          '#A8391F',
        blush:         '#E8B4A0',
        mustard:       '#E8A820',
        brown:         '#2C1810',
        'brown-light': '#8B6F5E',
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
        'warm-sm':     '0 2px 8px rgba(44, 24, 16, 0.08)',
        'warm-md':     '0 4px 16px rgba(44, 24, 16, 0.12)',
        'warm-lg':     '0 8px 32px rgba(44, 24, 16, 0.16)',
        'terracotta-glow': '0 4px 20px rgba(201, 75, 44, 0.2)',
        'mint-glow':   '0 4px 20px rgba(74, 155, 127, 0.2)',
      },
      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '88':  '22rem',
        '128': '32rem',
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
