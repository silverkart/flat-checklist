import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f4',
          100: '#dcede6',
          200: '#badccf',
          300: '#8ec3b0',
          400: '#5ea38e',
          500: '#3d8772',
          600: '#2d6c5b',
          700: '#255549',
          800: '#1e443b',
          900: '#1a3a2a',
          950: '#0d1f17',
        },
        gold: {
          300: '#e8d08a',
          400: '#dbbf6a',
          500: '#c9a84c',
          600: '#b8922e',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
