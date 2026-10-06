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
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          900: 'var(--brand-900)',
        },
        surface: {
          dark: '#18181b',
          light: '#f4f4f5',
          white: 'var(--bg-main)',
        },
        text: {
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
          light: 'var(--text-subtle)',
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
