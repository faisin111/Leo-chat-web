/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: 'var(--bg-main)',
        gray: {
          50: 'var(--bg-muted)',
          100: 'var(--bg-subtle)',
          200: 'var(--border-main)',
          300: 'var(--border-main)',
          400: 'var(--text-subtle)',
          500: 'var(--text-muted)',
          600: 'var(--text-muted)',
          700: 'var(--text-main)',
          900: 'var(--text-main)',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
        },
        surface: {
          dark: '#111827',
          light: '#f9fafb',
          white: '#ffffff',
        },
        text: {
          main: '#111827',
          muted: '#6b7280',
          light: '#9ca3af',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
}
