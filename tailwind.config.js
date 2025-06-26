/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Helvetica Neue', 'Inter', 'Arial', 'system-ui', 'sans-serif'],
        'body': ['Helvetica Neue', 'Inter', 'Arial', 'system-ui', 'sans-serif'],
        'druk-super': ['Druk Wide Super', 'Impact', 'Arial Black', 'sans-serif'],
        'druk-bold': ['Druk Wide Bold', 'Arial Black', 'Helvetica', 'sans-serif'],
        'display': ['Druk Wide Super', 'Impact', 'Arial Black', 'sans-serif'],
      },
      colors: {
        aideas: {
          yellow: '#FFCC00',
          blue: '#0099FF',
          orange: '#FF4400',
          purple: '#8B5CF6',
          black: '#000000',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(255, 204, 0, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 153, 255, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 68, 0, 0.3)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
