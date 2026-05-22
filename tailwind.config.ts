import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#f0f9f6',
          100: '#d9f0e9',
          200: '#b3e1d3',
          300: '#7ecab8',
          400: '#47ae97',
          500: '#2a937e',
          600: '#1a6b5a',
          700: '#155548',
          800: '#124438',
          900: '#0e3529',
          950: '#071e17',
        },
        gold: {
          300: '#e8d08a',
          400: '#dbbf6a',
          500: '#c9a84c',
          600: '#b8922e',
        },
        // Keep forest as alias to teal for backwards compat
        forest: {
          50:  '#f0f9f6',
          100: '#d9f0e9',
          200: '#b3e1d3',
          300: '#7ecab8',
          400: '#47ae97',
          500: '#2a937e',
          600: '#1a6b5a',
          700: '#155548',
          800: '#124438',
          900: '#0e3529',
          950: '#071e17',
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
