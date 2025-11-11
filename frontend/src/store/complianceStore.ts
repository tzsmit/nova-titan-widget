/**
 * Compliance Store
 * 
 * Manages compliance state for:
 * - Age verification (21+)
 * - Geolocation and state detection
 * - Responsible gaming limits
 * - Cookie consent
 * - Terms acceptance
 * 
 * Phase 4: Compliance & Legal
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AgeVerificationState {
  isVerified: boolean;
  verifiedAt?: Date;
  dateOfBirth?: Date;
  method?: 'self-declaration' | 'id-verification';
}

export interface GeolocationState {
  isDetected: boolean;
  state?: string; // Two-letter state code (e.g., "NY", "NJ")
  isLegalState?: boolean;
  latitude?: number;
  longitude?: number;
  detectedAt?: Date;
  error?: string;
}

export interface ResponsibleGamingLimits {
  dailyDepositLimit?: number;
  weeklyDepositLimit?: number;
  monthlyDepositLimit?: number;
  dailyLossLimit?: number;
  weeklyLossLimit?: number;
  monthlyLossLimit?: number;
  sessionTimeLimit?: number; // minutes
  coolOffPeriod?: Date; // When cool-off ends
  selfExclusionUntil?: Date; // When self-exclusion ends
}

export interface ComplianceState {
  // Age Verification
  ageVerification: AgeVerificationState;
  
  // Geolocation
  geolocation: GeolocationState;
  
  // Responsible Gaming
  responsibleGaming: {
    limits: ResponsibleGamingLimits;
    currentSession: {
      startTime?: Date;
      totalBets: number;
      totalWagered: number;
      totalWon: number;
      totalLost: number;
    };
    warnings: string[];
  };
  
  // Legal Agreements
  agreements: {
    termsAccepted: boolean;
    termsAcceptedAt?: Date;
    privacyAccepted: boolean;
    privacyAcceptedAt?: Date;
    cookieConsent: boolean;
    cookieConsentAt?: Date;
  };
  
  // Actions
  setAgeVerified: (dob: Date, method: 'self-declaration' | 'id-verification') => void;
  setGeolocation: (state: string, latitude: number, longitude: number, isLegal: boolean) => void;
  setGeolocationError: (error: string) => void;
  setResponsibleGamingLimit: (limit: Partial<ResponsibleGamingLimits>) => void;
  startSession: () => void;
  endSession: () => void;
  recordBet: (amount: number) => void;
  recordWin: (amount: number) => void;
  recordLoss: (amount: number) => void;
  setSelfExclusion: (days: number) => void;
  setCoolOffPeriod: (hours: number) => void;
  acceptTerms: () => void;
  acceptPrivacy: () => void;
  acceptCookies: () => void;
  clearCompliance: () => void;
  
  // Computed
  isCompliant: () => boolean;
  canPlaceBet: (amount: number) => { allowed: boolean; reason?: string };
  getRemainingLimits: () => {
    dailyDeposit?: number;
    weeklyDeposit?: number;
    monthlyDeposit?: number;
    sessionTime?: number;
  };
}

export const useComplianceStore = create<ComplianceState>()(
  persist(
    (set, get) => ({
      // Initial State
      ageVerification: {
        isVerified: false,
      },
      
      geolocation: {
        isDetected: false,
      },
      
      responsibleGaming: {
        limits: {},
        currentSession: {
          totalBets: 0,
          totalWagered: 0,
          totalWon: 0,
          totalLost: 0,
        },
        warnings: [],
      },
      
      agreements: {
        termsAccepted: false,
        privacyAccepted: false,
        cookieConsent: false,
      },
      
      // Actions
      setAgeVerified: (dob: Date, method: 'self-declaration' | 'id-verification') => {
        // Verify age is 21+
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age >= 21) {
          set({
            ageVerification: {
              isVerified: true,
              verifiedAt: new Date(),
              dateOfBirth: dob,
              method,
            },
          });
        }
      },
      
      setGeolocation: (state: string, latitude: number, longitude: number, isLegal: boolean) => {
        set({
          geolocation: {
            isDetected: true,
            state,
            isLegalState: isLegal,
            latitude,
            longitude,
            detectedAt: new Date(),
            error: undefined,
          },
        });
      },
      
      setGeolocationError: (error: string) => {
        set({
          geolocation: {
            isDetected: false,
            error,
          },
        });
      },
      
      setResponsibleGamingLimit: (limit: Partial<ResponsibleGamingLimits>) => {
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            limits: {
              ...state.responsibleGaming.limits,
              ...limit,
            },
          },
        }));
      },
      
      startSession: () => {
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            currentSession: {
              startTime: new Date(),
              totalBets: 0,
              totalWagered: 0,
              totalWon: 0,
              totalLost: 0,
            },
          },
        }));
      },
      
      endSession: () => {
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            currentSession: {
              startTime: undefined,
              totalBets: 0,
              totalWagered: 0,
              totalWon: 0,
              totalLost: 0,
            },
          },
        }));
      },
      
      recordBet: (amount: number) => {
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            currentSession: {
              ...state.responsibleGaming.currentSession,
              totalBets: state.responsibleGaming.currentSession.totalBets + 1,
              totalWagered: state.responsibleGaming.currentSession.totalWagered + amount,
            },
          },
        }));
      },
      
      recordWin: (amount: number) => {
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            currentSession: {
              ...state.responsibleGaming.currentSession,
              totalWon: state.responsibleGaming.currentSession.totalWon + amount,
            },
          },
        }));
      },
      
      recordLoss: (amount: number) => {
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            currentSession: {
              ...state.responsibleGaming.currentSession,
              totalLost: state.responsibleGaming.currentSession.totalLost + amount,
            },
          },
        }));
      },
      
      setSelfExclusion: (days: number) => {
        const exclusionDate = new Date();
        exclusionDate.setDate(exclusionDate.getDate() + days);
        
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            limits: {
              ...state.responsibleGaming.limits,
              selfExclusionUntil: exclusionDate,
            },
          },
        }));
      },
      
      setCoolOffPeriod: (hours: number) => {
        const coolOffEnd = new Date();
        coolOffEnd.setHours(coolOffEnd.getHours() + hours);
        
        set((state) => ({
          responsibleGaming: {
            ...state.responsibleGaming,
            limits: {
              ...state.responsibleGaming.limits,
              coolOffPeriod: coolOffEnd,
            },
          },
        }));
      },
      
      acceptTerms: () => {
        set((state) => ({
          agreements: {
            ...state.agreements,
            termsAccepted: true,
            termsAcceptedAt: new Date(),
          },
        }));
      },
      
      acceptPrivacy: () => {
        set((state) => ({
          agreements: {
            ...state.agreements,
            privacyAccepted: true,
            privacyAcceptedAt: new Date(),
          },
        }));
      },
      
      acceptCookies: () => {
        set((state) => ({
          agreements: {
            ...state.agreements,
            cookieConsent: true,
            cookieConsentAt: new Date(),
          },
        }));
      },
      
      clearCompliance: () => {
        set({
          ageVerification: { isVerified: false },
          geolocation: { isDetected: false },
          responsibleGaming: {
            limits: {},
            currentSession: {
              totalBets: 0,
              totalWagered: 0,
              totalWon: 0,
              totalLost: 0,
            },
            warnings: [],
          },
          agreements: {
            termsAccepted: false,
            privacyAccepted: false,
            cookieConsent: false,
          },
        });
      },
      
      // Computed
      isCompliant: () => {
        const state = get();
        
        // Check age verification
        if (!state.ageVerification.isVerified) return false;
        
        // Check geolocation (must be in legal state)
        if (!state.geolocation.isDetected || !state.geolocation.isLegalState) return false;
        
        // Check self-exclusion
        if (state.responsibleGaming.limits.selfExclusionUntil) {
          if (new Date() < state.responsibleGaming.limits.selfExclusionUntil) return false;
        }
        
        // Check cool-off period
        if (state.responsibleGaming.limits.coolOffPeriod) {
          if (new Date() < state.responsibleGaming.limits.coolOffPeriod) return false;
        }
        
        // Check agreements
        if (!state.agreements.termsAccepted || !state.agreements.privacyAccepted) return false;
        
        return true;
      },
      
      canPlaceBet: (amount: number) => {
        const state = get();
        
        // Check compliance
        if (!state.isCompliant()) {
          return { allowed: false, reason: 'Compliance requirements not met' };
        }
        
        // Check daily loss limit
        if (state.responsibleGaming.limits.dailyLossLimit) {
          if (state.responsibleGaming.currentSession.totalLost + amount > state.responsibleGaming.limits.dailyLossLimit) {
            return { allowed: false, reason: 'Daily loss limit exceeded' };
          }
        }
        
        // Check session time limit
        if (state.responsibleGaming.limits.sessionTimeLimit && state.responsibleGaming.currentSession.startTime) {
          const sessionMinutes = Math.floor((Date.now() - state.responsibleGaming.currentSession.startTime.getTime()) / 60000);
          if (sessionMinutes >= state.responsibleGaming.limits.sessionTimeLimit) {
            return { allowed: false, reason: 'Session time limit exceeded' };
          }
        }
        
        return { allowed: true };
      },
      
      getRemainingLimits: () => {
        const state = get();
        const limits: any = {};
        
        if (state.responsibleGaming.limits.dailyDepositLimit) {
          limits.dailyDeposit = state.responsibleGaming.limits.dailyDepositLimit - state.responsibleGaming.currentSession.totalWagered;
        }
        
        if (state.responsibleGaming.limits.sessionTimeLimit && state.responsibleGaming.currentSession.startTime) {
          const sessionMinutes = Math.floor((Date.now() - state.responsibleGaming.currentSession.startTime.getTime()) / 60000);
          limits.sessionTime = state.responsibleGaming.limits.sessionTimeLimit - sessionMinutes;
        }
        
        return limits;
      },
    }),
    {
      name: 'nova-titan-compliance-storage',
    }
  )
);
