/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2025 Nova Titan Premium Brand Palette
        'nova-midnight': {
          DEFAULT: '#0E0F19', // Midnight Navy
          50: '#2a2b3f',
          100: '#1e1f2d',
          200: '#181925',
          300: '#14151f',
          400: '#11121b',
          500: '#0E0F19',
          600: '#0b0c14',
          700: '#08090f',
          800: '#05060a',
          900: '#020305'
        },
        'nova-indigo': {
          DEFAULT: '#191A2C', // Deep Indigo
          50: '#3d3e5a',
          100: '#2f3049',
          200: '#25263b',
          300: '#1d1e30',
          400: '#18192a',
          500: '#191A2C',
          600: '#141523',
          700: '#0f101a',
          800: '#0a0b11',
          900: '#050608'
        },
        'nova-purple': {
          DEFAULT: '#5A29FF', // Royal Purple
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#5A29FF',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        'nova-violet': {
          DEFAULT: '#B57FFF', // Electric Violet
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#B57FFF',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87'
        },
        'nova-gold': {
          DEFAULT: '#F8CC4B', // Gold Accent
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F8CC4B',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        }
      },
      fontFamily: {
        'nova': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // 2025 Premium Gradients
        'nova-gradient': 'linear-gradient(135deg, #0E0F19 0%, #191A2C 30%, #5A29FF 100%)',
        'nova-gradient-alt': 'linear-gradient(135deg, #5A29FF 0%, #B57FFF 100%)',
        'nova-gradient-gold': 'linear-gradient(135deg, #5A29FF 0%, #F8CC4B 100%)',
        'nova-glass': 'linear-gradient(135deg, rgba(90, 41, 255, 0.1) 0%, rgba(181, 127, 255, 0.05) 100%)',
        'nova-dark': 'linear-gradient(180deg, #0E0F19 0%, #191A2C 100%)',
      },
      boxShadow: {
        // 2025 Premium Shadows
        'nova': '0 4px 24px rgba(90, 41, 255, 0.15)',
        'nova-lg': '0 8px 32px rgba(90, 41, 255, 0.2)',
        'nova-xl': '0 12px 48px rgba(90, 41, 255, 0.25)',
        'nova-glow': '0 0 20px rgba(181, 127, 255, 0.3)',
        'nova-glow-gold': '0 0 20px rgba(248, 204, 75, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      animation: {
        // 2025 Premium Animations
        'pulse-nova': 'pulse-nova 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        'pulse-nova': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(181, 127, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(181, 127, 255, 0.5)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}