/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        // New Design System Colors (from UX Design)
        primary: {
          DEFAULT: '#758AC6',
          dark: '#344161',
          medium: '#566890',
          light: '#8997B8',
          pale: '#A8B6D5',
        },
        badge: {
          bg: '#D9E1F8',
          border: '#BFCBEE',
          text: '#566890',
        },
        // Legacy colors (KEEP for backward compatibility)
        'brand-cyan': '#22d3ee',
        'brand-dark': '#0f172a',
        'brand-surface': '#1e293b',
        'brand-muted': '#475569',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        lato: ['Lato', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['32px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '700' }],
        'display-lg': ['24px', { lineHeight: '1.3', letterSpacing: '0.05em', fontWeight: '700' }],
        'display-md': ['18px', { lineHeight: '1.4', letterSpacing: '0.025em', fontWeight: '700' }],
      },
      boxShadow: {
        'button-primary': '0 2px 8px rgba(117, 138, 198, 0.4)',
        'drawer': '0 -10px 30px -15px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'heavenly-gradient': 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
      },
      borderRadius: {
        xl: '1.5rem',  // 24px - cards, search bars
        '2xl': '2rem', // 32px
      },
    },
  },
  plugins: [],
}
