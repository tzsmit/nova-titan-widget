// Validation Utilities

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate US phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validate age (18+ for most betting jurisdictions)
 */
export function isValidAge(age: number, minimumAge: number = 18): boolean {
  return age >= minimumAge && age <= 120;
}

/**
 * Validate date string (YYYY-MM-DD format)
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate probability (0-1 range)
 */
export function isValidProbability(probability: number): boolean {
  return typeof probability === 'number' && 
         probability >= 0 && 
         probability <= 1 && 
         !isNaN(probability);
}

/**
 * Validate percentage (0-100 range)
 */
export function isValidPercentage(percentage: number): boolean {
  return typeof percentage === 'number' && 
         percentage >= 0 && 
         percentage <= 100 && 
         !isNaN(percentage);
}

/**
 * Validate monetary amount
 */
export function isValidAmount(amount: number, min: number = 0, max?: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
}

/**
 * Validate American odds format
 */
export function isValidAmericanOdds(odds: number): boolean {
  return typeof odds === 'number' && 
         !isNaN(odds) && 
         odds !== 0 && 
         odds >= -10000 && 
         odds <= 10000;
}

/**
 * Validate decimal odds format
 */
export function isValidDecimalOdds(odds: number): boolean {
  return typeof odds === 'number' && 
         !isNaN(odds) && 
         odds > 1 && 
         odds <= 1000;
}

/**
 * Validate fractional odds
 */
export function isValidFractionalOdds(numerator: number, denominator: number): boolean {
  return typeof numerator === 'number' && 
         typeof denominator === 'number' &&
         !isNaN(numerator) && 
         !isNaN(denominator) &&
         numerator > 0 && 
         denominator > 0 &&
         Number.isInteger(numerator) && 
         Number.isInteger(denominator);
}

/**
 * Validate game ID format (UUID or alphanumeric)
 */
export function isValidGameId(gameId: string): boolean {
  // UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // Alphanumeric format
  const alphaNumericRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  
  return uuidRegex.test(gameId) || alphaNumericRegex.test(gameId);
}

/**
 * Validate team abbreviation
 */
export function isValidTeamAbbreviation(abbreviation: string): boolean {
  const abbrevRegex = /^[A-Z]{2,5}$/;
  return abbrevRegex.test(abbreviation);
}

/**
 * Validate league type
 */
export function isValidLeague(league: string): boolean {
  const validLeagues = ['NBA', 'NFL', 'MLB', 'NHL', 'MLS', 'NCAAB', 'NCAAF'];
  return validLeagues.includes(league);
}

/**
 * Validate sport type
 */
export function isValidSport(sport: string): boolean {
  const validSports = ['basketball', 'football', 'baseball', 'hockey', 'soccer'];
  return validSports.includes(sport);
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKey(apiKey: string): boolean {
  // Basic validation: not empty, reasonable length, alphanumeric + some special chars
  const apiKeyRegex = /^[a-zA-Z0-9_.-]{10,100}$/;
  return apiKeyRegex.test(apiKey);
}

/**
 * Validate JWT token format
 */
export function isValidJwtToken(token: string): boolean {
  const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  return jwtRegex.test(token);
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 */
export function isValidCountryCode(countryCode: string): boolean {
  const countryRegex = /^[A-Z]{2}$/;
  return countryRegex.test(countryCode);
}

/**
 * Validate US state code
 */
export function isValidStateCode(stateCode: string): boolean {
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
  ];
  return validStates.includes(stateCode);
}

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous HTML chars
    .substring(0, maxLength);
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  const num = parseFloat(input);
  if (isNaN(num)) return null;
  
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  
  return num;
}

/**
 * Validate object has required properties
 */
export function hasRequiredProperties<T extends Record<string, any>>(
  obj: any,
  requiredProps: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') return false;
  
  return requiredProps.every(prop => 
    obj.hasOwnProperty(prop) && obj[prop] !== undefined && obj[prop] !== null
  );
}

/**
 * Validate array of items using validator function
 */
export function validateArray<T>(
  items: any[],
  validator: (item: any) => item is T,
  maxLength?: number
): items is T[] {
  if (!Array.isArray(items)) return false;
  if (maxLength && items.length > maxLength) return false;
  
  return items.every(validator);
}

/**
 * Create validation result object
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  return {
    isValid: results.every(r => r.isValid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings)
  };
}

/**
 * Create a validation result
 */
export function createValidationResult(
  isValid: boolean,
  errors: string[] = [],
  warnings: string[] = []
): ValidationResult {
  return { isValid, errors, warnings };
}