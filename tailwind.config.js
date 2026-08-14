/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // PhishSheriff brand blue (from the product logo)
        brand: {
          50: '#eff5ff', 100: '#dbe8fe', 200: '#bfd7fe', 300: '#93bbfd',
          400: '#6096fa', 500: '#2f6bf6', 600: '#1a53eb', 700: '#1440d8',
          800: '#1736af', 900: '#19328a',
        },
        // Risk semantics
        risk: {
          high: '#ef4444',
          med: '#f59e0b',
          low: '#22c55e',
          secure: '#94a3b8',
        },
        rail: '#0b1220',   // dark navy icon rail
        canvas: '#f6f8fc', // page background
        ink: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        pop: '0 10px 30px rgba(16,24,40,0.12)',
      },
    },
  },
  plugins: [],
}
