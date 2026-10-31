/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F3F7F2',
          100: '#E3EDE3',
          200: '#C5DBC7',
          300: '#9CC3A2',
          400: '#6FA57D',
          500: '#4E8A62',
          600: '#3D7050',
          700: '#2F5A41',
          800: '#264733',
          900: '#1E3A2A',
        },
        cream: {
          50: '#FDFBF6',
          100: '#FAF6EC',
          200: '#F3ECDB',
          300: '#E9DFC6',
        },
        amber: {
          50: '#FFF8E6',
          100: '#FDEFC3',
          500: '#B7791F',
          800: '#6B4510',
        },
        rose: {
          50: '#FDF1F0',
          100: '#FADAD6',
          700: '#B42318',
        },
        ink: {
          DEFAULT: '#1F2A24',
          muted: '#5B6660',
        },
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(38, 71, 51, 0.25)',
      },
      fontFamily: {
        sans: ['ui-rounded', '"SF Pro Rounded"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
