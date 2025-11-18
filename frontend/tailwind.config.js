/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gaia-dark': '#0a0f1f',
        'gaia-med': '#1c233a',
        'gaia-light': '#3c4d6f',
        'gaia-accent': '#00aaff',
        'gaia-text': '#e0e0e0',
        'gaia-card': '#1a2332',
        'severity-critical': '#e53e3e',
        'severity-high': '#dd6b20',
        'severity-medium': '#d69e2e',
        'severity-low': '#3182ce',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
