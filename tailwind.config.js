/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f9f2',
          100: '#e8f3e1',
          200: '#d2e7c4',
          300: '#bcd9a7',
          400: '#a8d08d', // User specified theme green #a8d08d
          500: '#8ebd70',
          600: '#6fa24e',
          700: '#558238', // Deep green for text/actions
          800: '#3f6329',
          900: '#2b451b',
          950: '#17260e',
        },
        soa: {
          header: '#a8d08d',
          light: '#f5f9f2',
          dark: '#2b451b',
          border: '#000000',
        }
      },
      screens: {
        'print': {'raw': 'print'},
      }
    },
  },
  plugins: [],
}

