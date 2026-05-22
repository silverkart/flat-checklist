import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#f0faf9',
          100: '#ccefec',
          200: '#99dfd9',
          300: '#5fcbc3',
          400: '#2aada0',
          500: '#1e9387',
          600: '#177870',
          700: '#125e57',
          800: '#0e4843',
          900: '#0a3430',
          950: '#051e1c',
        },
        gold: {
          300: '#e8d08a',
          400: '#dbbf6a',
          500: '#c9a84c',
          600: '#b8922e',
        },
        // Keep forest as alias to teal for backwards compat
        forest: {
          50:  '#f0faf9',
          100: '#ccefec',
          200: '#99dfd9',
          300: '#5fcbc3',
          400: '#2aada0',
          500: '#1e9387',
          600: '#177870',
          700: '#125e57',
          800: '#0e4843',
          900: '#0a3430',
          950: '#051e1c',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
