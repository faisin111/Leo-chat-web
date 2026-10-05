/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Primary Indigo
          600: '#4f46e5', // Primary Hover
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
        // sm: 640px (default)
        // md: 768px (default) - Tablet
        // lg: 1024px (default) - Desktop
        // xl: 1280px (default) - Large Desktop
        // 2xl: 1536px (default)
      }
    },
  },
  plugins: [],
}
