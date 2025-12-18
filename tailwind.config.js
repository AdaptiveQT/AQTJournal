/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cyberpunk base
        'beast-black': {
          DEFAULT: '#000000',
          50: '#1E1E1E',
          100: '#121212',
          200: '#0A0A0A',
        },
        // Neon green accent
        'beast-green': {
          DEFAULT: '#00E676',
          50: '#E8FFF3',
          100: '#B9FFD8',
          200: '#69FFAE',
          300: '#00FF88',
          400: '#00E676',
          500: '#00C853',
          600: '#00A844',
          glow: 'rgba(0, 230, 118, 0.5)',
        },
        // Warning/bearish red
        'beast-red': {
          DEFAULT: '#FF5252',
          50: '#FFE8E8',
          100: '#FFBABA',
          200: '#FF8A8A',
          300: '#FF5252',
          400: '#FF1744',
          glow: 'rgba(255, 82, 82, 0.5)',
        },
        // Win/gold accent
        'beast-gold': {
          DEFAULT: '#FFD700',
          50: '#FFFCE8',
          100: '#FFF4B8',
          200: '#FFEA70',
          300: '#FFD700',
          glow: 'rgba(255, 215, 0, 0.5)',
        },
        // Cyberpunk surface colors
        'cyber': {
          dark: '#0f0f0f',
          surface: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 0.5s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
        'mascot-wave': 'mascot-wave 1s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 230, 118, 0.3), 0 0 10px rgba(0, 230, 118, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 230, 118, 0.6), 0 0 30px rgba(0, 230, 118, 0.4), 0 0 40px rgba(0, 230, 118, 0.2)' },
        },
        'neon-flicker': {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'confetti': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '0' },
        },
        'mascot-wave': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
      boxShadow: {
        'neon-green': '0 0 5px rgba(0, 230, 118, 0.3), 0 0 10px rgba(0, 230, 118, 0.2), 0 0 20px rgba(0, 230, 118, 0.1)',
        'neon-green-lg': '0 0 10px rgba(0, 230, 118, 0.4), 0 0 20px rgba(0, 230, 118, 0.3), 0 0 40px rgba(0, 230, 118, 0.2)',
        'neon-red': '0 0 5px rgba(255, 82, 82, 0.3), 0 0 10px rgba(255, 82, 82, 0.2)',
        'neon-gold': '0 0 5px rgba(255, 215, 0, 0.3), 0 0 10px rgba(255, 215, 0, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        'neon-border': 'linear-gradient(90deg, #00E676, #00C853, #00E676)',
        'card-gradient': 'linear-gradient(135deg, rgba(22, 33, 62, 0.8) 0%, rgba(15, 15, 15, 0.9) 100%)',
      },
    },
  },
  plugins: [],
};
