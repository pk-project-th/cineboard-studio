/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          900: '#12110f',
          800: '#1c1a17',
          700: '#2c2822',
          600: '#453f36',
          500: '#696053',
          400: '#968b78',
          300: '#c5baa5',
          200: '#e4dcd0',
          100: '#f5f2eb',
          amber: '#d97706',
          gold: '#f59e0b',
          film: '#e08a3c',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
