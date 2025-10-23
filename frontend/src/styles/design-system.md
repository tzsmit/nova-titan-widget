# Nova Titan Design System

A comprehensive design system built with CSS custom properties and Tailwind CSS for consistent, scalable, and maintainable UI components.

## Overview

The Nova Titan Design System provides a unified approach to designing and building user interfaces across the sports betting widget. It includes color palettes, typography, spacing, components, and interaction patterns specifically tailored for sports betting applications.

## Design Tokens

Design tokens are stored as CSS custom properties in `/src/styles/tokens.css` and automatically integrated with Tailwind CSS through `tailwind.config.js`.

### Color System

#### Brand Colors
```css
/* Primary (Nova Navy) */
--color-primary-800: #1a365d; /* Nova Titan Navy - Main brand color */
--color-primary-600: #0284c7; /* Primary actions, links */

/* Secondary (Nova Blue) */  
--color-secondary-500: #4299e1; /* Nova Blue - Secondary actions */

/* Gold Accent */
--color-gold-600: #d97706; /* Premium features, highlights */
```

#### Semantic Colors
```css
/* Success - Positive odds, wins, gains */
--color-success-500: #10b981;

/* Warning - Medium confidence, cautions */  
--color-warning-500: #f59e0b;

/* Error - Negative odds, losses, errors */
--color-error-500: #ef4444;
```

#### Sports Betting Specific Colors
```css
/* Odds Display */
--odds-positive-color: var(--color-success-600); /* +150 */
--odds-negative-color: var(--color-error-600);   /* -150 */
--odds-even-color: var(--color-neutral-600);     /* EVEN */

/* Confidence Levels */
--confidence-high-color: var(--color-success-500);   /* 80%+ */
--confidence-medium-color: var(--color-warning-500); /* 60-79% */
--confidence-low-color: var(--color-error-500);      /* <60% */

/* Feature Accents */
--market-intelligence-accent: var(--color-primary-600);
--ai-prediction-accent: var(--color-secondary-600);  
--parlay-builder-accent: var(--color-gold-600);
--player-props-accent: #8b5cf6; /* Purple-500 */
```

### Typography

#### Font Families
- **Primary**: Inter (system fallback: system-ui, sans-serif)
- **Monospace**: SF Mono, Monaco, Roboto Mono (for odds display)

#### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px - Small labels */
--font-size-sm: 0.875rem;   /* 14px - Body text */
--font-size-base: 1rem;     /* 16px - Default */
--font-size-lg: 1.125rem;   /* 18px - Subheadings */
--font-size-xl: 1.25rem;    /* 20px - Headings */
--font-size-2xl: 1.5rem;    /* 24px - Page titles */
```

#### Font Weights
- **Light**: 300 - Subtle text, descriptions
- **Normal**: 400 - Body text
- **Medium**: 500 - Labels, emphasized text  
- **Semibold**: 600 - Buttons, headings
- **Bold**: 700 - Important headings

### Spacing System

Based on 8px grid system:
```css
--spacing-4: 0.5rem;    /* 8px - Base unit */
--spacing-8: 1rem;      /* 16px */  
--spacing-12: 1.5rem;   /* 24px */
--spacing-16: 2rem;     /* 32px */
--spacing-24: 3rem;     /* 48px */
```

### Border Radius
```css
--radius-sm: 0.125rem;   /* 2px - Small elements */
--radius-md: 0.375rem;   /* 6px - Standard */
--radius-lg: 0.5rem;     /* 8px - Buttons, inputs */
--radius-xl: 0.75rem;    /* 12px - Cards */
--radius-2xl: 1rem;      /* 16px - Large cards */
--radius-3xl: 1.5rem;    /* 24px - Widget container */
```

## Component Classes

### Buttons
```css
.btn-base {
  /* Base button styles with focus management */
  min-height: var(--button-min-height); /* 44px touch target */
}
```

Usage:
```html
<!-- Primary Button -->
<button class="btn-base bg-primary-600 text-white hover:bg-primary-700">
  Place Bet
</button>

<!-- Secondary Button -->
<button class="btn-base bg-neutral-200 text-neutral-900 hover:bg-neutral-300">
  Cancel
</button>
```

### Cards
```css
.card-base {
  /* Standard card with hover effects */
}

.game-card {
  /* Sports game display card */
}

.market-intelligence-card {
  /* Market Intelligence specific styling */
}

.ai-prediction-card {
  /* AI Prediction specific styling */  
}
```

Usage:
```html
<!-- Standard Card -->
<div class="card-base p-6">
  Card content
</div>

<!-- Game Card -->
<div class="game-card">
  <h3>Lakers vs Warriors</h3>
  <!-- Game details -->
</div>
```

### Odds Display
```css
.odds-display {
  /* Monospace font, consistent sizing */
}

.odds-positive {
  /* Green styling for positive odds */
}

.odds-negative {
  /* Red styling for negative odds */
}
```

Usage:
```html
<!-- Positive Odds -->
<span class="odds-display odds-positive">+150</span>

<!-- Negative Odds -->  
<span class="odds-display odds-negative">-200</span>
```

### Confidence Badges
```css
.confidence-badge {
  &.high { /* 80%+ confidence - green */ }
  &.medium { /* 60-79% confidence - yellow */ }
  &.low { /* <60% confidence - red */ }
}
```

Usage:
```html
<!-- High Confidence -->
<span class="confidence-badge high">
  <span class="w-2 h-2 bg-current rounded-full"></span>
  85% Confidence
</span>
```

### Form Controls
```css
.input-base {
  /* Accessible input styling with focus management */
  min-height: var(--input-min-height); /* 44px accessibility */
}
```

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;   /* Tablet portrait */
--breakpoint-md: 768px;   /* Tablet landscape */  
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

### Mobile-First Utilities
```css
/* Prevent horizontal scroll */
.mobile-layout-safe {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Responsive grids */
.responsive-grid-1-2-3 {
  /* 1 col mobile, 2 cols tablet, 3 cols desktop */
}

.responsive-grid-1-2-4 {
  /* 1 col mobile, 2 cols tablet, 4 cols desktop */
}
```

## Accessibility

### Focus Management
All interactive elements include proper focus indicators:
```css
.focus-ring {
  /* Consistent focus styling across components */
  box-shadow: 0 0 0 var(--focus-ring-offset) var(--color-neutral-50),
              0 0 0 calc(var(--focus-ring-width) + var(--focus-ring-offset)) 
              rgba(var(--focus-ring-color), var(--focus-ring-opacity));
}
```

### Touch Targets
- Minimum 44px height/width for all interactive elements
- Proper spacing between clickable areas
- Mobile-optimized button sizing

### Screen Readers
```css
.sr-only {
  /* Visually hidden but available to screen readers */
}
```

## Animation & Motion

### Durations
```css
--animation-duration-fast: 150ms;    /* Micro-interactions */
--animation-duration-normal: 300ms;  /* Standard transitions */
--animation-duration-slow: 500ms;    /* Page transitions */
```

### Easing
```css
--animation-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
--animation-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--animation-easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### Respect Motion Preferences
The system automatically disables animations for users who prefer reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled */
}
```

## Usage Guidelines

### Color Usage
1. **Primary colors** for main actions, navigation, brand elements
2. **Secondary colors** for secondary actions, links
3. **Semantic colors** for status indicators, feedback
4. **Neutral colors** for text, borders, backgrounds

### Typography Hierarchy
1. **6xl-4xl**: Page titles, major headings
2. **3xl-2xl**: Section headings
3. **xl-lg**: Subsection headings  
4. **base**: Body text
5. **sm-xs**: Labels, captions, metadata

### Spacing Usage
1. Use the 8px grid system consistently
2. Prefer spacing tokens over arbitrary values
3. Maintain consistent margins and padding
4. Use responsive spacing for mobile optimization

## Component Examples

### Game Card Component
```html
<div class="game-card">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center space-x-3">
      <img src="team-logo.png" class="w-8 h-8 rounded-full">
      <div>
        <h3 class="font-semibold text-neutral-900">Lakers vs Warriors</h3>
        <p class="text-sm text-neutral-600">Tonight 7:00 PM</p>
      </div>
    </div>
    <div class="confidence-badge high">
      <span class="w-2 h-2 bg-current rounded-full"></span>
      87%
    </div>
  </div>
  
  <div class="grid grid-cols-3 gap-4">
    <div class="text-center">
      <p class="text-xs text-neutral-500 mb-1">Moneyline</p>
      <span class="odds-display odds-negative">-150</span>
    </div>
    <div class="text-center">
      <p class="text-xs text-neutral-500 mb-1">Spread</p>
      <span class="odds-display">-2.5 (-110)</span>
    </div>
    <div class="text-center">
      <p class="text-xs text-neutral-500 mb-1">Total</p>
      <span class="odds-display">O 215.5 (-105)</span>
    </div>
  </div>
</div>
```

### Market Intelligence Display
```html
<div class="market-intelligence-card p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-primary-800">
      Market Intelligence
    </h3>
    <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
      Live Data
    </span>
  </div>
  
  <div class="space-y-3">
    <div class="flex justify-between items-center">
      <span class="text-sm text-neutral-600">Sharp Money</span>
      <span class="font-medium text-neutral-900">68% on Lakers</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-sm text-neutral-600">Public Betting</span>
      <span class="font-medium text-neutral-900">73% on Warriors</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-sm text-neutral-600">Line Movement</span>
      <span class="font-medium text-error-600">-2.5 → -3.0</span>
    </div>
  </div>
</div>
```

## Migration Guide

When updating existing components:

1. Replace hardcoded colors with design tokens
2. Use component classes instead of utility combinations
3. Ensure proper focus management and accessibility
4. Test responsive behavior across breakpoints
5. Verify motion preferences are respected

## Development Tools

### VS Code Extensions
- **Tailwind CSS IntelliSense** - Autocomplete for classes
- **CSS Variable Autocomplete** - Support for CSS custom properties

### Browser DevTools
- Use browser inspector to verify CSS custom property values
- Test responsive breakpoints and mobile layouts
- Validate focus indicators and keyboard navigation

## Maintenance

### Adding New Tokens
1. Add CSS custom property to `tokens.css`
2. Update Tailwind config if needed for utility classes
3. Document usage in this guide
4. Update component examples

### Breaking Changes
- Always maintain backward compatibility when possible
- Provide migration guides for major changes
- Use semantic versioning for design system updates