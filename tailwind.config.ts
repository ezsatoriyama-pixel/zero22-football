import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f8fafc',
        card: '#ffffff',
        accent: '#0071e3',
        'accent-hover': '#0077ed',
        'text-primary': '#1d1d1f',
        'text-secondary': '#86868b',
        'text-tertiary': '#6e6e73',
        'border-light': '#e5e7eb',
        'win-home': '#34c759',
        'win-draw': '#ff9f0a',
        'win-away': '#ff375f',
        'pro-gold': '#bf8b2e',
        'pro-bg': '#fef3c7',
      },
      borderRadius: {
        card: '24px',
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,0.05)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.1)',
      },
      maxWidth: {
        page: '1200px',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
          '"SF Pro Text"', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
