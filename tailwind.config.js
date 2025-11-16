/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        glass: {
          surface: {
            light: 'rgba(255,255,255,0.55)',
            lightElevated: 'rgba(255,255,255,0.62)',
            dark: 'rgba(15,23,42,0.72)',
            darkElevated: 'rgba(15,23,42,0.82)',
          },
          border: {
            light: 'rgba(255,255,255,0.35)',
            subtle: 'rgba(255,255,255,0.25)',
            dark: 'rgba(255,255,255,0.18)',
          },
        },
        // Dark mode background colors
        dark: {
          bg: {
            primary: '#0f172a',    // Slate 900 - main background
            secondary: '#1e293b',  // Slate 800 - elevated surfaces
            tertiary: '#334155',   // Slate 700 - cards/panels
          },
          text: {
            primary: '#f8fafc',    // Slate 50 - primary text
            secondary: '#cbd5e1',  // Slate 300 - secondary text
            muted: '#94a3b8',      // Slate 400 - muted text
          },
          border: {
            DEFAULT: '#334155',    // Slate 700
            subtle: '#1e293b',     // Slate 800
            emphasis: '#475569',   // Slate 600
          },
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
        'glass': '0 20px 45px -35px rgba(15,23,42,0.75)',
      },
      backgroundImage: {
        'heavenly-gradient': 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
        'dark-gradient': 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.96) 100%)',
        'dark-gradient-elevated': 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.98) 100%)',
        'dark-radial': 'radial-gradient(ellipse at top, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.98) 70%)',
        'marble-texture': 'url("/data/marble-texture.png")',
        'photo-overlay': 'linear-gradient(120deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1))',
      },
      borderRadius: {
        xl: '1.5rem',  // 24px - cards, search bars
        '2xl': '2rem', // 32px
      },
    },
  },
  plugins: [],
}
