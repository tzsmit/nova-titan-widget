/**
 * Geolocation Service
 * 
 * Features:
 * - HTML5 Geolocation API integration
 * - State detection from coordinates
 * - Legal state validation
 * - Reverse geocoding
 * - Error handling
 * - Timeout management
 * 
 * Phase 4: Compliance & Legal
 */

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  state?: string; // Two-letter state code
  isLegalState?: boolean;
  city?: string;
  country?: string;
  error?: string;
}

// Platform types (determines which compliance rules apply)
export type PlatformType = 'traditional' | 'sweepstakes';

// Traditional sports betting states (real money, regulated)
export const LEGAL_BETTING_STATES = [
  'AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'LA', 'MI', 'NJ', 'NY', 
  'PA', 'TN', 'VA', 'WV', 'WY', 'AR', 'MD', 'MA', 'NV', 'OH', 'RI'
];

// Social gaming / sweepstakes states (Stake.us, Underdog, PrizePicks model)
// Legal in most states except: WA, ID, NV, MT (sometimes)
export const SOCIAL_GAMING_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'NE', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WV', 'WI', 'WY', 'DC'
];

// Restricted states for social gaming (typically: WA, ID, NV, MT)
export const SOCIAL_GAMING_RESTRICTED = ['WA', 'ID', 'NV', 'MT'];

// State-specific age requirements
export const STATE_AGE_REQUIREMENTS: Record<string, number> = {
  // Traditional sports betting: 21+ everywhere
  'AZ': 21, 'CO': 21, 'CT': 21, 'IL': 21, 'IN': 21, 'IA': 21,
  'KS': 21, 'LA': 21, 'MI': 21, 'NJ': 21, 'NY': 21, 'PA': 21,
  'TN': 21, 'VA': 21, 'WV': 21, 'WY': 21, 'AR': 21, 'MD': 21,
  'MA': 21, 'NV': 21, 'OH': 21, 'RI': 21,
  
  // Social gaming: Mostly 18+, some states 19+ or 21+
  'TX': 18, 'CA': 18, 'FL': 18, 'GA': 18, 'NC': 18, 'OK': 18,
  'AL': 19, 'NE': 19, // 19+ states
  // Most other states default to 18+ for social gaming
};

export class GeolocationService {
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly HIGH_ACCURACY = true;

  /**
   * Get user's current location using HTML5 Geolocation API
   */
  static async getCurrentLocation(): Promise<GeolocationResult> {
    return new Promise((resolve, reject) => {
      // Check if Geolocation is supported
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      // Request position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocode to get state
            const locationData = await this.reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch (error) {
            // Return coordinates even if geocoding fails
            resolve({
              latitude,
              longitude,
              error: error instanceof Error ? error.message : 'Failed to determine state',
            });
          }
        },
        (error) => {
          let errorMessage = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: this.HIGH_ACCURACY,
          timeout: this.TIMEOUT,
          maximumAge: 60000, // Accept cached position up to 1 minute old
        }
      );
    });
  }

  /**
   * Reverse geocode coordinates to get state and city
   * Uses OpenStreetMap Nominatim API (free, no API key required)
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeolocationResult> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NovaTitanWidget/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      // Extract state from address
      const state = this.extractState(data.address);
      const city = data.address.city || data.address.town || data.address.village;
      const country = data.address.country_code?.toUpperCase();

      // Check if state is legal for betting
      const isLegalState = state ? LEGAL_BETTING_STATES.includes(state) : false;

      return {
        latitude,
        longitude,
        state,
        isLegalState,
        city,
        country,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to reverse geocode location'
      );
    }
  }

  /**
   * Extract two-letter state code from address data
   */
  private static extractState(address: any): string | undefined {
    if (!address) return undefined;

    // Try different fields that might contain state
    const stateField = address.state || address.region || address.province;
    if (!stateField) return undefined;

    // Convert state name to two-letter code
    return this.stateNameToCode(stateField);
  }

  /**
   * Convert full state name to two-letter code
   */
  private static stateNameToCode(stateName: string): string {
    const stateMap: Record<string, string> = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
    };

    // Check if already a two-letter code
    if (stateName.length === 2) {
      return stateName.toUpperCase();
    }

    // Convert full name to code
    return stateMap[stateName] || stateName.toUpperCase();
  }

  /**
   * Check if a state allows betting based on platform type
   */
  static isLegalBettingState(state: string, platformType: PlatformType = 'traditional'): boolean {
    const stateUpper = state.toUpperCase();
    
    if (platformType === 'traditional') {
      // Traditional sports betting (DraftKings, FanDuel, BetMGM, etc.)
      return LEGAL_BETTING_STATES.includes(stateUpper);
    } else {
      // Social gaming / sweepstakes (Stake.us, Underdog, PrizePicks)
      return SOCIAL_GAMING_STATES.includes(stateUpper) && 
             !SOCIAL_GAMING_RESTRICTED.includes(stateUpper);
    }
  }

  /**
   * Get age requirement for a specific state and platform type
   */
  static getAgeRequirement(state: string, platformType: PlatformType = 'traditional'): number {
    const stateUpper = state.toUpperCase();
    
    // If state-specific requirement exists, use it
    if (STATE_AGE_REQUIREMENTS[stateUpper]) {
      return STATE_AGE_REQUIREMENTS[stateUpper];
    }
    
    // Default age requirements
    if (platformType === 'traditional') {
      return 21; // Traditional sports betting always 21+
    } else {
      // Social gaming defaults
      if (['AL', 'NE'].includes(stateUpper)) {
        return 19; // Alabama, Nebraska = 19+
      }
      return 18; // Most states = 18+ for social gaming
    }
  }
  
  /**
   * Get platform type display name
   */
  static getPlatformTypeName(platformType: PlatformType): string {
    return platformType === 'traditional' ? 'Sports Betting' : 'Social Gaming';
  }
  
  /**
   * Get available platforms for a state
   */
  static getAvailablePlatforms(state: string): PlatformType[] {
    const platforms: PlatformType[] = [];
    
    if (this.isLegalBettingState(state, 'traditional')) {
      platforms.push('traditional');
    }
    
    if (this.isLegalBettingState(state, 'sweepstakes')) {
      platforms.push('sweepstakes');
    }
    
    return platforms;
  }

  /**
   * Watch position continuously (useful for mobile users)
   */
  static watchPosition(
    onSuccess: (result: GeolocationResult) => void,
    onError: (error: string) => void
  ): number | null {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by your browser');
      return null;
    }

    return navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationData = await this.reverseGeocode(latitude, longitude);
          onSuccess(locationData);
        } catch (error) {
          onSuccess({
            latitude,
            longitude,
            error: error instanceof Error ? error.message : 'Failed to determine state',
          });
        }
      },
      (error) => {
        let errorMessage = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        onError(errorMessage);
      },
      {
        enableHighAccuracy: this.HIGH_ACCURACY,
        timeout: this.TIMEOUT,
        maximumAge: 60000,
      }
    );
  }

  /**
   * Stop watching position
   */
  static clearWatch(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Get state-specific disclaimers based on platform type
   */
  static getStateDisclaimer(state: string, platformType: PlatformType = 'traditional'): string {
    const stateUpper = state.toUpperCase();
    const ageReq = this.getAgeRequirement(state, platformType);
    
    if (platformType === 'traditional') {
      // Traditional sports betting disclaimers
      const disclaimers: Record<string, string> = {
        'NY': `New York residents: Must be ${ageReq}+ and physically located within NY state borders to place bets.`,
        'NJ': `New Jersey residents: Must be ${ageReq}+ and physically located within NJ state borders to place bets.`,
        'PA': `Pennsylvania residents: Must be ${ageReq}+ and physically located within PA state borders to place bets.`,
        'IL': `Illinois residents: Must be ${ageReq}+ and physically located within IL state borders to place bets.`,
        'MI': `Michigan residents: Must be ${ageReq}+ and physically located within MI state borders to place bets.`,
        'CO': `Colorado residents: Must be ${ageReq}+ and physically located within CO state borders to place bets.`,
        'IN': `Indiana residents: Must be ${ageReq}+ and physically located within IN state borders to place bets.`,
        'TN': `Tennessee residents: Must be ${ageReq}+ and physically located within TN state borders to place bets.`,
        'VA': `Virginia residents: Must be ${ageReq}+ and physically located within VA state borders to place bets.`,
        'IA': `Iowa residents: Must be ${ageReq}+ and physically located within IA state borders to place bets.`,
      };

      return (
        disclaimers[stateUpper] ||
        `${state} residents: Must be ${ageReq}+ and physically located within state borders to place bets.`
      );
    } else {
      // Social gaming / sweepstakes disclaimers
      const disclaimers: Record<string, string> = {
        'TX': `Texas residents: Must be ${ageReq}+ to participate. Social gaming operates under sweepstakes model, not traditional gambling. No purchase necessary.`,
        'CA': `California residents: Must be ${ageReq}+ to participate. Operates as skill-based contests and sweepstakes.`,
        'FL': `Florida residents: Must be ${ageReq}+ to participate. Social gaming and daily fantasy sports available.`,
        'GA': `Georgia residents: Must be ${ageReq}+ to participate. Skill-based gaming and sweepstakes permitted.`,
        'NC': `North Carolina residents: Must be ${ageReq}+ to participate. Daily fantasy sports and social gaming available.`,
      };

      return (
        disclaimers[stateUpper] ||
        `${state} residents: Must be ${ageReq}+ to participate in social gaming. Operates under sweepstakes model.`
      );
    }
  }
}
