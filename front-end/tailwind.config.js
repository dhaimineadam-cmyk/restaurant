/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          srms: {
            ink: '#17120f',
            charcoal: '#241c18',
            bordeaux: '#7f1d1d',
            wine: '#511111',
            gold: '#d6a84f',
            cream: '#fff7e8',
            ivory: '#fffaf2',
            sage: '#5f7f68',
            terracotta: '#c45a31',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          display: ['Playfair Display', 'Georgia', 'serif'],
        },
        animation: {
          'fade-in-down': 'fade-in-down 0.5s ease-out',
          'progress': 'progress 3s linear forwards',
        },
        keyframes: {
          'fade-in-down': {
            '0%': {
              opacity: '0',
              transform: 'translateY(-10px) translateX(-50%)'
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0) translateX(-50%)'
            },
          },
          'progress': {
            '0%': {
              width: '100%'
            },
            '100%': {
              width: '0%'
            },
          },
        },
      },
    },
    plugins: [],
  }
  
