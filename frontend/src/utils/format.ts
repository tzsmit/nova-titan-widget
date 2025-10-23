/**
 * Number and Data Formatting Utilities
 * Ensures consistent formatting across the Nova Titan application
 * NO RANDOM TRAILING DECIMALS - All numbers formatted to specific decimal places
 */

/**
 * Format percentage with consistent decimal places
 * @param value - Number to format (0-100 scale)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "85.7%")
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (isNaN(value) || !isFinite(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format currency with consistent decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2 for cents)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || !isFinite(value)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format large numbers with K/M/B suffixes
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string (e.g., "45.6M", "1.2B")
 */
export const formatLargeNumber = (value: number, decimals: number = 1): string => {
  if (isNaN(value) || !isFinite(value)) return '0';
  
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (abs >= 1e9) {
    return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  } else if (abs >= 1e6) {
    return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  } else {
    return `${sign}${abs.toString()}`;
  }
};

/**
 * Format regular numbers with consistent decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string (e.g., "123.4")
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  if (isNaN(value) || !isFinite(value)) return '0.0';
  return value.toFixed(decimals);
};

/**
 * Format odds consistently
 * @param odds - Odds value (American format)
 * @returns Formatted odds string (e.g., "+150", "-110")
 */
export const formatOdds = (odds: number): string => {
  if (isNaN(odds) || !isFinite(odds)) return '--';
  
  if (odds === 0) return 'EVEN';
  
  if (odds > 0) {
    return `+${Math.round(odds)}`;
  } else {
    return Math.round(odds).toString();
  }
};

/**
 * Format confidence score with consistent decimal places
 * @param confidence - Confidence value (0-100 scale)
 * @returns Formatted confidence string (e.g., "85.7%")
 */
export const formatConfidence = (confidence: number): string => {
  if (isNaN(confidence)) return '0.0%';
  if (!isFinite(confidence)) return confidence === Infinity ? '100.0%' : '0.0%';
  
  let value = confidence;
  
  // Smart detection of input format:
  // Values > 2 are assumed to be in percentage format already (e.g., 75 = 75%)
  // Values 0-2 are assumed to be in decimal format (e.g., 0.75 = 75%, 1.5 = 150%)
  if (value <= 2) {
    // Decimal format, convert to percentage
    value = value * 100;
  }
  
  // Clamp to 0-100 range
  const clampedValue = Math.max(0, Math.min(100, value));
  return formatPercentage(clampedValue, 1);
};

/**
 * Format spread/line consistently
 * @param line - Point spread or line value
 * @returns Formatted line string (e.g., "+3.5", "-7.0")
 */
export const formatLine = (line: number): string => {
  if (isNaN(line) || !isFinite(line)) return '0.0';
  
  const formatted = line.toFixed(1);
  if (line > 0) {
    return `+${formatted}`;
  } else if (line < 0) {
    return formatted;
  } else {
    return 'PK'; // Pick'em
  }
};

/**
 * Format time consistently
 * @param date - Date object or ISO string
 * @returns Formatted time string (e.g., "7:30 PM")
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'TBD';
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date consistently
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "Oct 21")
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'TBD';
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format record consistently
 * @param wins - Number of wins
 * @param losses - Number of losses
 * @returns Formatted record string (e.g., "12-4")
 */
export const formatRecord = (wins: number, losses: number): string => {
  const w = Math.max(0, Math.round(wins));
  const l = Math.max(0, Math.round(losses));
  return `${w}-${l}`;
};

/**
 * Format streak consistently
 * @param count - Streak count
 * @param type - Streak type
 * @returns Formatted streak string (e.g., "W5", "L3")
 */
export const formatStreak = (count: number, type: 'win' | 'loss' | 'cover' | 'W' | 'L'): string => {
  const c = Math.max(0, Math.round(count));
  
  if (type === 'win' || type === 'W') return `W${c}`;
  if (type === 'loss' || type === 'L') return `L${c}`;
  if (type === 'cover') return `ATS${c}`;
  
  return `${c}`;
};

/**
 * Format volume consistently for market data
 * @param volume - Trading/betting volume
 * @returns Formatted volume string (e.g., "$45.6M")
 */
export const formatVolume = (volume: number): string => {
  if (volume >= 1e6) {
    return `$${formatLargeNumber(volume / 1e6, 1)}M`;
  } else if (volume >= 1e3) {
    return `$${formatLargeNumber(volume / 1e3, 0)}K`;
  } else {
    return formatCurrency(volume, 0);
  }
};

/**
 * Format movement consistently (for line movements)
 * @param movement - Line movement value
 * @returns Formatted movement string (e.g., "+1.5", "-0.5")
 */
export const formatMovement = (movement: number): string => {
  if (isNaN(movement) || !isFinite(movement) || movement === 0) return '0.0';
  
  const formatted = Math.abs(movement).toFixed(1);
  return movement > 0 ? `+${formatted}` : `-${formatted}`;
};

/**
 * Validate and sanitize numeric input
 * @param value - Input value to validate
 * @param fallback - Fallback value if invalid (default: 0)
 * @returns Valid number or fallback
 */
export const validateNumber = (value: any, fallback: number = 0): number => {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) || !isFinite(num) ? fallback : num;
};

/**
 * Round to specific decimal places (fixes floating point issues)
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export const roundToDecimals = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Format EV (Expected Value) consistently
 * @param ev - Expected value (decimal format, e.g., 0.123)
 * @returns Formatted EV string (e.g., "+12.3%")
 */
export const formatEV = (ev: number): string => {
  if (isNaN(ev) || !isFinite(ev)) return '0.0%';
  
  const percentage = ev * 100;
  const formatted = percentage.toFixed(1);
  
  if (percentage > 0) {
    return `+${formatted}%`;
  } else if (percentage < 0) {
    return `${formatted}%`;
  } else {
    return '0.0%';
  }
};

/**
 * Format temperature consistently (for weather data)
 * @param temp - Temperature in Fahrenheit
 * @returns Formatted temperature string (e.g., "72°F")
 */
export const formatTemperature = (temp: number): string => {
  if (isNaN(temp) || !isFinite(temp)) return 'N/A';
  return `${Math.round(temp)}°F`;
};

/**
 * Format wind speed consistently
 * @param speed - Wind speed in mph
 * @returns Formatted wind speed string (e.g., "15 mph")
 */
export const formatWindSpeed = (speed: number): string => {
  if (isNaN(speed) || !isFinite(speed) || speed < 0) return '0 mph';
  return `${Math.round(speed)} mph`;
};

/**
 * Format decimal numbers with specific decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted decimal string (e.g., "3.14")
 */
export const formatDecimal = (value: number, decimals: number): string => {
  if (isNaN(value) || !isFinite(value)) {
    return '0.' + '0'.repeat(decimals);
  }
  return value.toFixed(decimals);
};

/**
 * Format integer numbers (no decimal places)
 * @param value - Number to format
 * @returns Formatted integer string (e.g., "123")
 */
export const formatInteger = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) return '0';
  return Math.round(value).toString();
};