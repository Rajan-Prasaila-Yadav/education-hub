/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0A0A0F',
          900: '#111118',
          800: '#1C1C27',
          700: '#2A2A3A',
          600: '#3D3D52',
          500: '#5C5C7A',
          400: '#7C7C9A',
          300: '#9F9FBA',
          200: '#C8C8DA',
          100: '#E8E8F0',
          50:  '#F5F5FA',
        },
        volt: {
          500: '#A8FF00',
          400: '#C3FF3D',
          300: '#D8FF75',
          600: '#84CC00',
          700: '#5F9200',
        },
        azure: {
          500: '#3B7FFF',
          400: '#6B9FFF',
          300: '#9BBFFF',
          600: '#2255CC',
          50:  '#EBF1FF',
        },
        coral: {
          500: '#FF5757',
          400: '#FF8080',
          600: '#CC3333',
          50:  '#FFF0F0',
        },
        amber: {
          500: '#FFB800',
          400: '#FFCF4D',
          600: '#CC9200',
          50:  '#FFF8E6',
        },
        jade: {
          500: '#00C896',
          400: '#33D9AD',
          600: '#009970',
          50:  '#E6FAF5',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'volt': '0 0 30px rgba(168, 255, 0, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.08)',
        'glow-azure': '0 0 24px rgba(59, 127, 255, 0.2)',
      },
      animation: {
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
