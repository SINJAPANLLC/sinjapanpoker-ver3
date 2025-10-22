/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#0d5c26',
          darkGreen: '#083919',
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
      },
      animation: {
        'card-deal': 'deal 0.5s ease-out',
        'chip-toss': 'toss 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        toss: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

