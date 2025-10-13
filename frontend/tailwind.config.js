/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nova Titan Brand Colors
        'nova-navy': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd', 
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#1a365d', // Primary Nova Titan Dark Navy
          900: '#0c2340', // Deeper navy from logo
          950: '#082f49'
        },
        'nova-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4299e1', // Light blue from logo gradient
          600: '#2d5a87', // Medium blue from logo
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1a202c',
          950: '#171923'
        },
        'nova-metallic': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        'nova-silver': {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b'
        },
        'nova-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Primary gold accent
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
        'nova-gradient': 'linear-gradient(135deg, #1a365d 0%, #2d5a87 50%, #4299e1 100%)',
        'nova-metallic': 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
        'nova-silver': 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      },
      boxShadow: {
        'nova': '0 4px 20px rgba(26, 54, 93, 0.15)',
        'nova-lg': '0 8px 30px rgba(26, 54, 93, 0.2)',
        'nova-metallic': '0 4px 20px rgba(100, 116, 139, 0.15)',
      },
      animation: {
        'pulse-nova': 'pulse-nova 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in'
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}