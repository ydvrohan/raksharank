/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep indigo "street-at-dusk" — anchors hero/nav/footer
        night: {
          DEFAULT: '#12173A',
          light: '#1B2154',
          deep: '#080B22',
        },
        // Warm paper background for content sections
        paper: {
          DEFAULT: '#FFF9F2',
          dim: '#FBF1E4',
        },
        ink: {
          DEFAULT: '#1B1B2F',
          soft: '#4A4A63',
        },
        // Marigold — CTA / brand accent (auspicious, high-visibility)
        marigold: {
          DEFAULT: '#F2A93B',
          dark: '#D9831F',
          light: '#FBDDA3',
        },
        // Sindoor rose — used sparingly for women-safety touch points
        sindoor: {
          DEFAULT: '#C2185B',
          dark: '#8E0F42',
        },
        // Zone scale — this IS the product's information system
        zone: {
          safer: '#0E9F6E',
          'safer-bg': '#E4F7EF',
          moderate: '#E6B400',
          'moderate-bg': '#FDF6DC',
          risky: '#F2722F',
          'risky-bg': '#FDEAE0',
          unsafe: '#D7263D',
          'unsafe-bg': '#FBE1E4',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 14px -2px rgba(18, 23, 58, 0.10)',
        card: '0 4px 24px -4px rgba(18, 23, 58, 0.14)',
        glow: '0 0 0 1px rgba(242, 169, 59, 0.4), 0 8px 24px -8px rgba(242, 169, 59, 0.5)',
      },
      backgroundImage: {
        'dusk-grid':
          'radial-gradient(circle at 20% 20%, rgba(242,169,59,0.10), transparent 40%), radial-gradient(circle at 80% 0%, rgba(194,24,91,0.12), transparent 45%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
      },
    },
  },
  plugins: [],
}
