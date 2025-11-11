/**
 * Unit Tests for GeolocationService
 * Tests state validation, platform type checking, and legal compliance
 */

import { 
  GeolocationService,
  LEGAL_BETTING_STATES,
  SOCIAL_GAMING_STATES,
  SOCIAL_GAMING_RESTRICTED,
  STATE_AGE_REQUIREMENTS,
  PlatformType
} from '../../../services/GeolocationService';

describe('GeolocationService', () => {
  describe('State Constants', () => {
    it('should have 22 traditional sports betting states', () => {
      expect(LEGAL_BETTING_STATES).toHaveLength(22);
    });

    it('should have 46+ social gaming states', () => {
      expect(SOCIAL_GAMING_STATES.length).toBeGreaterThanOrEqual(46);
    });

    it('should have 4 social gaming restricted states', () => {
      expect(SOCIAL_GAMING_RESTRICTED).toEqual(['WA', 'ID', 'NV', 'MT']);
    });

    it('should include Texas in social gaming states', () => {
      expect(SOCIAL_GAMING_STATES).toContain('TX');
    });

    it('should not include Texas in traditional betting states', () => {
      expect(LEGAL_BETTING_STATES).not.toContain('TX');
    });

    it('should have no overlap between legal betting and restricted social gaming', () => {
      const overlap = LEGAL_BETTING_STATES.filter(state => 
        SOCIAL_GAMING_RESTRICTED.includes(state)
      );
      // NV is an exception - has traditional betting but restricts social gaming
      expect(overlap).toEqual(['NV']);
    });
  });

  describe('State Age Requirements', () => {
    it('should require 21+ for all traditional betting states', () => {
      LEGAL_BETTING_STATES.forEach(state => {
        expect(STATE_AGE_REQUIREMENTS[state]).toBe(21);
      });
    });

    it('should have 18+ age requirement for Texas', () => {
      expect(STATE_AGE_REQUIREMENTS['TX']).toBe(18);
    });

    it('should have 19+ for AL and NE', () => {
      expect(STATE_AGE_REQUIREMENTS['AL']).toBe(19);
      expect(STATE_AGE_REQUIREMENTS['NE']).toBe(19);
    });

    it('should default to 18+ for most social gaming states', () => {
      const texasAge = STATE_AGE_REQUIREMENTS['TX'];
      const californiaAge = STATE_AGE_REQUIREMENTS['CA'];
      const floridaAge = STATE_AGE_REQUIREMENTS['FL'];

      expect(texasAge).toBe(18);
      expect(californiaAge).toBe(18);
      expect(floridaAge).toBe(18);
    });
  });

  describe('isLegalBettingState', () => {
    describe('Traditional Platform', () => {
      it('should return true for legal betting states', () => {
        LEGAL_BETTING_STATES.forEach(state => {
          expect(GeolocationService.isLegalBettingState(state, 'traditional')).toBe(true);
        });
      });

      it('should return false for Texas on traditional platform', () => {
        expect(GeolocationService.isLegalBettingState('TX', 'traditional')).toBe(false);
      });

      it('should return false for California on traditional platform', () => {
        expect(GeolocationService.isLegalBettingState('CA', 'traditional')).toBe(false);
      });

      it('should return false for restricted states', () => {
        expect(GeolocationService.isLegalBettingState('WA', 'traditional')).toBe(false);
        expect(GeolocationService.isLegalBettingState('ID', 'traditional')).toBe(false);
      });
    });

    describe('Sweepstakes Platform', () => {
      it('should return true for social gaming states', () => {
        SOCIAL_GAMING_STATES.forEach(state => {
          expect(GeolocationService.isLegalBettingState(state, 'sweepstakes')).toBe(true);
        });
      });

      it('should return true for Texas on sweepstakes platform', () => {
        expect(GeolocationService.isLegalBettingState('TX', 'sweepstakes')).toBe(true);
      });

      it('should return true for California on sweepstakes platform', () => {
        expect(GeolocationService.isLegalBettingState('CA', 'sweepstakes')).toBe(true);
      });

      it('should return false for restricted states on sweepstakes platform', () => {
        SOCIAL_GAMING_RESTRICTED.forEach(state => {
          expect(GeolocationService.isLegalBettingState(state, 'sweepstakes')).toBe(false);
        });
      });

      it('should return false for Washington on sweepstakes platform', () => {
        expect(GeolocationService.isLegalBettingState('WA', 'sweepstakes')).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle lowercase state codes', () => {
        expect(GeolocationService.isLegalBettingState('tx', 'sweepstakes')).toBe(true);
        expect(GeolocationService.isLegalBettingState('ny', 'traditional')).toBe(true);
      });

      it('should handle invalid state codes', () => {
        expect(GeolocationService.isLegalBettingState('XX', 'traditional')).toBe(false);
        expect(GeolocationService.isLegalBettingState('ZZ', 'sweepstakes')).toBe(false);
      });

      it('should handle null/undefined state codes gracefully', () => {
        expect(GeolocationService.isLegalBettingState(null as any, 'traditional')).toBe(false);
        expect(GeolocationService.isLegalBettingState(undefined as any, 'sweepstakes')).toBe(false);
      });

      it('should handle empty string state codes', () => {
        expect(GeolocationService.isLegalBettingState('', 'traditional')).toBe(false);
      });
    });
  });

  describe('getAvailablePlatforms', () => {
    it('should return both platforms for dual-legal states', () => {
      // States like NY, NJ, PA that have both traditional and social gaming
      const nyPlatforms = GeolocationService.getAvailablePlatforms('NY');
      expect(nyPlatforms).toContain('traditional');
      expect(nyPlatforms).toContain('sweepstakes');
      expect(nyPlatforms).toHaveLength(2);
    });

    it('should return only sweepstakes for Texas', () => {
      const txPlatforms = GeolocationService.getAvailablePlatforms('TX');
      expect(txPlatforms).toEqual(['sweepstakes']);
    });

    it('should return only sweepstakes for California', () => {
      const caPlatforms = GeolocationService.getAvailablePlatforms('CA');
      expect(caPlatforms).toEqual(['sweepstakes']);
    });

    it('should return empty array for restricted states', () => {
      SOCIAL_GAMING_RESTRICTED.forEach(state => {
        const platforms = GeolocationService.getAvailablePlatforms(state);
        expect(platforms).toHaveLength(0);
      });
    });

    it('should return empty array for Washington', () => {
      const waPlatforms = GeolocationService.getAvailablePlatforms('WA');
      expect(waPlatforms).toHaveLength(0);
    });

    it('should handle lowercase state codes', () => {
      const txPlatforms = GeolocationService.getAvailablePlatforms('tx');
      expect(txPlatforms).toEqual(['sweepstakes']);
    });

    it('should return empty array for invalid states', () => {
      expect(GeolocationService.getAvailablePlatforms('XX')).toEqual([]);
      expect(GeolocationService.getAvailablePlatforms('')).toEqual([]);
    });
  });

  describe('getMinimumAge', () => {
    it('should return 21 for traditional betting states', () => {
      LEGAL_BETTING_STATES.forEach(state => {
        expect(GeolocationService.getMinimumAge(state, 'traditional')).toBe(21);
      });
    });

    it('should return 18 for Texas on sweepstakes', () => {
      expect(GeolocationService.getMinimumAge('TX', 'sweepstakes')).toBe(18);
    });

    it('should return 19 for Alabama on sweepstakes', () => {
      expect(GeolocationService.getMinimumAge('AL', 'sweepstakes')).toBe(19);
    });

    it('should return 19 for Nebraska on sweepstakes', () => {
      expect(GeolocationService.getMinimumAge('NE', 'sweepstakes')).toBe(19);
    });

    it('should return 18 as default for unlisted social gaming states', () => {
      // States in social gaming list but not in age requirements should default to 18
      expect(GeolocationService.getMinimumAge('SD', 'sweepstakes')).toBe(18);
    });

    it('should return 21 as default for unlisted traditional states', () => {
      // Any state queried for traditional should return 21
      expect(GeolocationService.getMinimumAge('CA', 'traditional')).toBe(21);
    });

    it('should handle lowercase state codes', () => {
      expect(GeolocationService.getMinimumAge('tx', 'sweepstakes')).toBe(18);
    });
  });

  describe('Platform Compatibility Matrix', () => {
    it('should correctly identify Texas as sweepstakes-only', () => {
      expect(GeolocationService.isLegalBettingState('TX', 'traditional')).toBe(false);
      expect(GeolocationService.isLegalBettingState('TX', 'sweepstakes')).toBe(true);
      expect(GeolocationService.getAvailablePlatforms('TX')).toEqual(['sweepstakes']);
      expect(GeolocationService.getMinimumAge('TX', 'sweepstakes')).toBe(18);
    });

    it('should correctly identify New York as dual-platform', () => {
      expect(GeolocationService.isLegalBettingState('NY', 'traditional')).toBe(true);
      expect(GeolocationService.isLegalBettingState('NY', 'sweepstakes')).toBe(true);
      expect(GeolocationService.getAvailablePlatforms('NY')).toContain('traditional');
      expect(GeolocationService.getAvailablePlatforms('NY')).toContain('sweepstakes');
      expect(GeolocationService.getMinimumAge('NY', 'traditional')).toBe(21);
      expect(GeolocationService.getMinimumAge('NY', 'sweepstakes')).toBe(21);
    });

    it('should correctly identify Washington as fully restricted', () => {
      expect(GeolocationService.isLegalBettingState('WA', 'traditional')).toBe(false);
      expect(GeolocationService.isLegalBettingState('WA', 'sweepstakes')).toBe(false);
      expect(GeolocationService.getAvailablePlatforms('WA')).toEqual([]);
    });

    it('should correctly identify Nevada as traditional-only', () => {
      expect(GeolocationService.isLegalBettingState('NV', 'traditional')).toBe(true);
      expect(GeolocationService.isLegalBettingState('NV', 'sweepstakes')).toBe(false);
      expect(GeolocationService.getAvailablePlatforms('NV')).toEqual(['traditional']);
      expect(GeolocationService.getMinimumAge('NV', 'traditional')).toBe(21);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should support Stake.us/Underdog/PrizePicks in Texas', () => {
      // These platforms operate as sweepstakes in Texas
      const isLegal = GeolocationService.isLegalBettingState('TX', 'sweepstakes');
      const minAge = GeolocationService.getMinimumAge('TX', 'sweepstakes');
      
      expect(isLegal).toBe(true);
      expect(minAge).toBe(18);
    });

    it('should support DraftKings/FanDuel in New York', () => {
      // Traditional sports betting is legal in NY
      const isLegal = GeolocationService.isLegalBettingState('NY', 'traditional');
      const minAge = GeolocationService.getMinimumAge('NY', 'traditional');
      
      expect(isLegal).toBe(true);
      expect(minAge).toBe(21);
    });

    it('should block both platforms in Washington', () => {
      // Washington restricts both traditional and social gaming
      const traditionalLegal = GeolocationService.isLegalBettingState('WA', 'traditional');
      const sweepstakesLegal = GeolocationService.isLegalBettingState('WA', 'sweepstakes');
      
      expect(traditionalLegal).toBe(false);
      expect(sweepstakesLegal).toBe(false);
    });

    it('should support sweepstakes but not traditional in California', () => {
      const traditionalLegal = GeolocationService.isLegalBettingState('CA', 'traditional');
      const sweepstakesLegal = GeolocationService.isLegalBettingState('CA', 'sweepstakes');
      
      expect(traditionalLegal).toBe(false);
      expect(sweepstakesLegal).toBe(true);
    });
  });

  describe('Compliance Validation', () => {
    it('should ensure all restricted states are blocked for sweepstakes', () => {
      const restrictedStates = ['WA', 'ID', 'NV', 'MT'];
      
      restrictedStates.forEach(state => {
        const isLegal = GeolocationService.isLegalBettingState(state, 'sweepstakes');
        expect(isLegal).toBe(false);
      });
    });

    it('should ensure all legal betting states require 21+', () => {
      LEGAL_BETTING_STATES.forEach(state => {
        const minAge = GeolocationService.getMinimumAge(state, 'traditional');
        expect(minAge).toBeGreaterThanOrEqual(21);
      });
    });

    it('should ensure sweepstakes age is 18+ or 19+ only', () => {
      SOCIAL_GAMING_STATES.forEach(state => {
        const minAge = GeolocationService.getMinimumAge(state, 'sweepstakes');
        expect([18, 19]).toContain(minAge);
      });
    });

    it('should have proper coverage of US states', () => {
      // Total unique states covered (traditional + social - restricted)
      const allStates = new Set([...LEGAL_BETTING_STATES, ...SOCIAL_GAMING_STATES]);
      
      // Should cover most US states (50 states + DC = 51)
      expect(allStates.size).toBeGreaterThanOrEqual(46);
    });
  });
});
