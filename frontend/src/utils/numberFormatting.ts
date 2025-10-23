/**
 * Number Formatting Utilities - Consistent 1-2 decimal place formatting
 * For the Nova Titan Sports multi-million dollar product
 */

/**
 * Format numbers to 1-2 decimal places based on magnitude
 * Small numbers get 2 decimals, larger numbers get 1-2 as appropriate
 */
export const formatNumber = (value: number, forceDecimals?: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  
  if (forceDecimals !== undefined) {
    return value.toFixed(forceDecimals);
  }
  
  // Round to appropriate decimal places based on magnitude
  if (Math.abs(value) >= 1000) {
    return value.toFixed(1);
  } else if (Math.abs(value) >= 100) {
    return value.toFixed(1);
  } else if (Math.abs(value) >= 10) {
    return value.toFixed(2);
  } else {
    return value.toFixed(2);
  }
};

/**
 * Format currency values (always 2 decimal places)
 */
export const formatCurrency = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
};

/**
 * Format percentages (1-2 decimal places)
 */
export const formatPercentage = (value: number, includeSymbol = true): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  
  const formatted = Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(2);
  return includeSymbol ? `${formatted}%` : formatted;
};

/**
 * Format odds (no decimals for whole numbers, 1-2 decimals for fractional)
 */
export const formatOdds = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  
  if (value % 1 === 0) {
    // Whole number
    return value > 0 ? `+${value}` : `${value}`;
  } else {
    // Decimal
    const formatted = Math.abs(value) >= 100 ? value.toFixed(1) : value.toFixed(2);
    return value > 0 ? `+${formatted}` : formatted;
  }
};

/**
 * Format large numbers with K/M abbreviations (1-2 decimals)
 */
export const formatLargeNumber = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  
  if (Math.abs(value) >= 1000000) {
    const millions = value / 1000000;
    return `${formatNumber(millions)}M`;
  } else if (Math.abs(value) >= 1000) {
    const thousands = value / 1000;
    return `${formatNumber(thousands)}K`;
  } else {
    return formatNumber(value);
  }
};

/**
 * Format win percentage (1 decimal place)
 */
export const formatWinPercentage = (wins: number, losses: number): string => {
  const total = wins + losses;
  if (total === 0) return '0.0%';
  
  const percentage = (wins / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Format statistics (1-2 decimals based on typical ranges)
 */
export const formatStat = (value: number, statType?: string): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  
  // Sport-specific formatting
  switch (statType) {
    case 'points':
    case 'yards':
    case 'rebounds':
    case 'assists':
      return value.toFixed(1);
    
    case 'percentage':
    case 'avg':
      return value.toFixed(2);
    
    case 'games':
    case 'wins':
    case 'losses':
      return Math.round(value).toString();
    
    default:
      return formatNumber(value);
  }
};