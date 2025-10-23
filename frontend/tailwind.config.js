/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS Variable Integration
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
          950: 'rgb(var(--color-primary-950) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--color-secondary-50) / <alpha-value>)',
          100: 'rgb(var(--color-secondary-100) / <alpha-value>)',
          200: 'rgb(var(--color-secondary-200) / <alpha-value>)',
          300: 'rgb(var(--color-secondary-300) / <alpha-value>)',
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
          700: 'rgb(var(--color-secondary-700) / <alpha-value>)',
          800: 'rgb(var(--color-secondary-800) / <alpha-value>)',
          900: 'rgb(var(--color-secondary-900) / <alpha-value>)',
        },
        neutral: {
          50: 'rgb(var(--color-neutral-50) / <alpha-value>)',
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
        },
        gold: {
          50: 'rgb(var(--color-gold-50) / <alpha-value>)',
          100: 'rgb(var(--color-gold-100) / <alpha-value>)',
          200: 'rgb(var(--color-gold-200) / <alpha-value>)',
          300: 'rgb(var(--color-gold-300) / <alpha-value>)',
          400: 'rgb(var(--color-gold-400) / <alpha-value>)',
          500: 'rgb(var(--color-gold-500) / <alpha-value>)',
          600: 'rgb(var(--color-gold-600) / <alpha-value>)',
          700: 'rgb(var(--color-gold-700) / <alpha-value>)',
          800: 'rgb(var(--color-gold-800) / <alpha-value>)',
          900: 'rgb(var(--color-gold-900) / <alpha-value>)',
        },
        success: {
          50: 'rgb(var(--color-success-50) / <alpha-value>)',
          100: 'rgb(var(--color-success-100) / <alpha-value>)',
          500: 'rgb(var(--color-success-500) / <alpha-value>)',
          600: 'rgb(var(--color-success-600) / <alpha-value>)',
          700: 'rgb(var(--color-success-700) / <alpha-value>)',
        },
        warning: {
          50: 'rgb(var(--color-warning-50) / <alpha-value>)',
          100: 'rgb(var(--color-warning-100) / <alpha-value>)',
          500: 'rgb(var(--color-warning-500) / <alpha-value>)',
          600: 'rgb(var(--color-warning-600) / <alpha-value>)',
          700: 'rgb(var(--color-warning-700) / <alpha-value>)',
        },
        error: {
          50: 'rgb(var(--color-error-50) / <alpha-value>)',
          100: 'rgb(var(--color-error-100) / <alpha-value>)',
          500: 'rgb(var(--color-error-500) / <alpha-value>)',
          600: 'rgb(var(--color-error-600) / <alpha-value>)',
          700: 'rgb(var(--color-error-700) / <alpha-value>)',
        },
        info: {
          50: 'rgb(var(--color-info-50) / <alpha-value>)',
          100: 'rgb(var(--color-info-100) / <alpha-value>)',
          500: 'rgb(var(--color-info-500) / <alpha-value>)',
          600: 'rgb(var(--color-info-600) / <alpha-value>)',
          700: 'rgb(var(--color-info-700) / <alpha-value>)',
        },
        
        // Sports Betting Specific Colors
        'odds-positive': 'var(--odds-positive-color)',
        'odds-negative': 'var(--odds-negative-color)',
        'odds-even': 'var(--odds-even-color)',
        'confidence-high': 'var(--confidence-high-color)',
        'confidence-medium': 'var(--confidence-medium-color)',
        'confidence-low': 'var(--confidence-low-color)',
        'market-intelligence': 'var(--market-intelligence-accent)',
        'ai-prediction': 'var(--ai-prediction-accent)',
        'parlay-builder': 'var(--parlay-builder-accent)',
        'player-props': 'var(--player-props-accent)',
        
        // Legacy Nova Titan Brand Colors (for backward compatibility)
        'nova-navy': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd', 
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#1a365d',
          900: '#0c2340',
          950: '#082f49'
        },
        'nova-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4299e1',
          600: '#2d5a87',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1a202c',
          950: '#171923'
        },
        'nova-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        '220': '220px', // For game cards
      },
      maxWidth: {
        'content': 'var(--content-max-width)',
      },
      minHeight: {
        '44': '44px', // Touch target minimum
        'screen-mobile': 'calc(100vh - var(--header-height))',
      },
      fontFamily: {
        'nova': ['Inter', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
        '6xl': 'var(--font-size-6xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'nova': 'var(--shadow-nova)',
        'nova-lg': 'var(--shadow-nova-lg)',
        'nova-xl': 'var(--shadow-nova-xl)',
      },
      transitionDuration: {
        'fast': 'var(--animation-duration-fast)',
        'normal': 'var(--animation-duration-normal)',
        'slow': 'var(--animation-duration-slow)',
      },
      transitionTimingFunction: {
        'standard': 'var(--animation-easing-standard)',
        'decelerate': 'var(--animation-easing-decelerate)',
        'accelerate': 'var(--animation-easing-accelerate)',
      },
      zIndex: {
        'dropdown': 'var(--z-index-dropdown)',
        'sticky': 'var(--z-index-sticky)',
        'fixed': 'var(--z-index-fixed)',
        'modal-backdrop': 'var(--z-index-modal-backdrop)',
        'modal': 'var(--z-index-modal)',
        'popover': 'var(--z-index-popover)',
        'tooltip': 'var(--z-index-tooltip)',
        'toast': 'var(--z-index-toast)',
      },
      animation: {
        'pulse-nova': 'pulse-nova 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp var(--animation-duration-normal) ease-out',
        'slide-down': 'slideDown var(--animation-duration-normal) ease-out',
        'fade-in': 'fadeIn var(--animation-duration-fast) ease-in',
        'fade-out': 'fadeOut var(--animation-duration-fast) ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        skeleton: {
          '0%, 100%': { 
            opacity: '1',
            transform: 'translateX(-100%)'
          },
          '50%': { 
            opacity: '0.5',
            transform: 'translateX(100%)'
          }
        }
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      gridTemplateColumns: {
        'responsive': 'repeat(auto-fit, minmax(220px, 1fr))',
        'layout-desktop': '280px 1fr 320px',
        'layout-tablet': '1fr 320px',
        'layout-mobile': '1fr',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Custom plugin for component utilities
    function({ addComponents, theme }) {
      addComponents({
        '.btn-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'var(--button-min-height)',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: 'var(--button-font-weight)',
          lineHeight: theme('lineHeight.none'),
          borderRadius: 'var(--button-border-radius)',
          border: '1px solid transparent',
          cursor: 'pointer',
          transition: 'var(--button-transition)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 var(--focus-ring-offset) rgb(var(--color-neutral-50)), 
                        0 0 0 calc(var(--focus-ring-width) + var(--focus-ring-offset)) 
                        rgba(var(--color-secondary-500), var(--focus-ring-opacity))`,
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            pointerEvents: 'none',
          }
        },
        '.card-base': {
          backgroundColor: theme('colors.white'),
          borderRadius: 'var(--card-border-radius)',
          boxShadow: 'var(--card-shadow)',
          border: 'var(--card-border-width) solid rgb(var(--color-neutral-200))',
          transition: `box-shadow var(--transition-normal), 
                      transform var(--transition-normal)`,
          '&:hover': {
            boxShadow: 'var(--card-shadow-hover)',
            transform: 'translateY(-1px)',
          }
        },
        '.input-base': {
          display: 'block',
          width: '100%',
          minHeight: 'var(--input-min-height)',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: 'var(--input-font-size)',
          lineHeight: theme('lineHeight.normal'),
          color: theme('colors.gray.900'),
          backgroundColor: theme('colors.white'),
          backgroundImage: 'none',
          border: 'var(--input-border-width) solid rgb(var(--color-neutral-300))',
          borderRadius: 'var(--input-border-radius)',
          transition: `border-color var(--transition-fast), 
                      box-shadow var(--transition-fast)`,
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.secondary.500'),
            boxShadow: `0 0 0 var(--focus-ring-width) 
                        rgba(var(--color-secondary-500), var(--focus-ring-opacity))`,
          }
        },
        '.skeleton': {
          backgroundColor: theme('colors.neutral.200'),
          borderRadius: theme('borderRadius.md'),
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            animation: 'skeleton 1.5s ease-in-out infinite',
          }
        },
        // Sports Betting Specific Components
        '.odds-display': {
          fontFamily: theme('fontFamily.mono'),
          fontWeight: theme('fontWeight.semibold'),
          fontSize: theme('fontSize.sm'),
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          borderRadius: theme('borderRadius.md'),
          backgroundColor: theme('colors.neutral.100'),
          border: `1px solid rgb(var(--color-neutral-300))`,
        },
        '.odds-positive': {
          color: 'var(--odds-positive-color)',
          backgroundColor: 'rgb(var(--color-success-50))',
          borderColor: 'var(--odds-positive-color)',
        },
        '.odds-negative': {
          color: 'var(--odds-negative-color)',
          backgroundColor: 'rgb(var(--color-error-50))',
          borderColor: 'var(--odds-negative-color)',
        },
        '.confidence-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.1'),
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.full'),
          '&.high': {
            backgroundColor: 'rgb(var(--color-success-100))',
            color: 'var(--confidence-high-color)',
          },
          '&.medium': {
            backgroundColor: 'rgb(var(--color-warning-100))',
            color: 'var(--confidence-medium-color)',
          },
          '&.low': {
            backgroundColor: 'rgb(var(--color-error-100))',
            color: 'var(--confidence-low-color)',
          }
        },
        '.game-card': {
          backgroundColor: theme('colors.white'),
          borderRadius: 'var(--card-border-radius)',
          boxShadow: 'var(--card-shadow)',
          border: '1px solid rgb(var(--color-neutral-200))',
          padding: theme('spacing.4'),
          transition: `all var(--transition-normal)`,
          '&:hover': {
            boxShadow: 'var(--card-shadow-hover)',
            transform: 'translateY(-2px)',
            borderColor: 'rgb(var(--color-secondary-300))',
          }
        },
        '.market-intelligence-card': {
          backgroundColor: 'rgb(var(--color-primary-50))',
          borderColor: 'var(--market-intelligence-accent)',
          '&:hover': {
            backgroundColor: 'rgb(var(--color-primary-100))',
          }
        },
        '.ai-prediction-card': {
          backgroundColor: 'rgb(var(--color-secondary-50))',
          borderColor: 'var(--ai-prediction-accent)',
          '&:hover': {
            backgroundColor: 'rgb(var(--color-secondary-100))',
          }
        }
      })
    }
  ],
}