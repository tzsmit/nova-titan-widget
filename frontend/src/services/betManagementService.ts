interface BetLeg {
  id: string;
  type: 'spread' | 'moneyline' | 'total' | 'player_prop';
  gameId?: string;
  playerId?: string;
  playerName?: string;
  team: string;
  opponent?: string;
  description: string;
  selection: string; // 'over', 'under', 'home', 'away', team name
  line?: number;
  odds: number;
  sport: string;
  propType?: string; // for player props: 'points', 'rebounds', 'assists', etc.
  added: Date;
}

interface Parlay {
  id: string;
  legs: BetLeg[];
  stake: number;
  potentialPayout: number;
  combinedOdds: number;
  created: Date;
  status: 'pending' | 'placed' | 'won' | 'lost';
  betSlipId?: string;
}

interface BetSlip {
  id: string;
  parlays: Parlay[];
  singleBets: BetLeg[];
  totalStake: number;
  totalPotentialPayout: number;
  created: Date;
  updated: Date;
  status: 'building' | 'placed' | 'settled';
}

class BetManagementService {
  private currentBetSlip: BetSlip | null = null;
  private betHistory: BetSlip[] = [];
  private activeParlays: Parlay[] = [];
  private storageKey = 'nova_titan_bets';

  constructor() {
    this.loadFromStorage();
  }

  // Initialize or get current bet slip
  getCurrentBetSlip(): BetSlip {
    if (!this.currentBetSlip) {
      this.currentBetSlip = {
        id: this.generateId(),
        parlays: [],
        singleBets: [],
        totalStake: 0,
        totalPotentialPayout: 0,
        created: new Date(),
        updated: new Date(),
        status: 'building'
      };
    }
    return this.currentBetSlip;
  }

  // Add a leg to the current parlay being built
  addLegToParlay(leg: Omit<BetLeg, 'id' | 'added'>): string {
    const betLeg: BetLeg = {
      ...leg,
      id: this.generateId(),
      added: new Date()
    };

    const betSlip = this.getCurrentBetSlip();
    
    // Check if we have an active parlay being built
    let activeParlay = betSlip.parlays.find(p => p.status === 'pending');
    
    if (!activeParlay) {
      // Create new parlay
      activeParlay = {
        id: this.generateId(),
        legs: [],
        stake: 0,
        potentialPayout: 0,
        combinedOdds: 0,
        created: new Date(),
        status: 'pending'
      };
      betSlip.parlays.push(activeParlay);
    }

    // Check for duplicate legs
    const isDuplicate = activeParlay.legs.some(existing => 
      existing.gameId === betLeg.gameId && 
      existing.type === betLeg.type &&
      existing.playerId === betLeg.playerId
    );

    if (isDuplicate) {
      throw new Error('This selection is already in your parlay');
    }

    activeParlay.legs.push(betLeg);
    this.updateParlayOdds(activeParlay);
    this.updateBetSlipTotals(betSlip);
    this.saveToStorage();

    return activeParlay.id;
  }

  // Remove a leg from parlay
  removeLegFromParlay(parlayId: string, legId: string): void {
    const betSlip = this.getCurrentBetSlip();
    const parlay = betSlip.parlays.find(p => p.id === parlayId);
    
    if (parlay) {
      parlay.legs = parlay.legs.filter(leg => leg.id !== legId);
      
      if (parlay.legs.length === 0) {
        betSlip.parlays = betSlip.parlays.filter(p => p.id !== parlayId);
      } else {
        this.updateParlayOdds(parlay);
      }
      
      this.updateBetSlipTotals(betSlip);
      this.saveToStorage();
    }
  }

  // Add a single bet (not part of parlay)
  addSingleBet(leg: Omit<BetLeg, 'id' | 'added'>): string {
    const betLeg: BetLeg = {
      ...leg,
      id: this.generateId(),
      added: new Date()
    };

    const betSlip = this.getCurrentBetSlip();
    
    // Check for duplicates
    const isDuplicate = betSlip.singleBets.some(existing => 
      existing.gameId === betLeg.gameId && 
      existing.type === betLeg.type &&
      existing.playerId === betLeg.playerId
    );

    if (isDuplicate) {
      throw new Error('This selection is already in your bet slip');
    }

    betSlip.singleBets.push(betLeg);
    this.updateBetSlipTotals(betSlip);
    this.saveToStorage();

    return betLeg.id;
  }

  // Remove single bet
  removeSingleBet(betId: string): void {
    const betSlip = this.getCurrentBetSlip();
    betSlip.singleBets = betSlip.singleBets.filter(bet => bet.id !== betId);
    this.updateBetSlipTotals(betSlip);
    this.saveToStorage();
  }

  // Update parlay stake
  updateParlayStake(parlayId: string, stake: number): void {
    const betSlip = this.getCurrentBetSlip();
    const parlay = betSlip.parlays.find(p => p.id === parlayId);
    
    if (parlay) {
      parlay.stake = stake;
      parlay.potentialPayout = this.calculateParlayPayout(parlay);
      this.updateBetSlipTotals(betSlip);
      this.saveToStorage();
    }
  }

  // Calculate combined odds for parlay
  private updateParlayOdds(parlay: Parlay): void {
    if (parlay.legs.length === 0) {
      parlay.combinedOdds = 0;
      parlay.potentialPayout = 0;
      return;
    }

    // Convert American odds to decimal odds and multiply
    let combinedDecimalOdds = 1;
    
    parlay.legs.forEach(leg => {
      const decimalOdds = this.americanToDecimal(leg.odds);
      combinedDecimalOdds *= decimalOdds;
    });

    parlay.combinedOdds = this.decimalToAmerican(combinedDecimalOdds);
    parlay.potentialPayout = this.calculateParlayPayout(parlay);
  }

  // Calculate parlay payout
  private calculateParlayPayout(parlay: Parlay): number {
    if (parlay.stake === 0 || parlay.legs.length === 0) return 0;
    
    const decimalOdds = this.americanToDecimal(parlay.combinedOdds);
    return parlay.stake * decimalOdds;
  }

  // Convert American odds to decimal
  private americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    } else {
      return (100 / Math.abs(americanOdds)) + 1;
    }
  }

  // Convert decimal odds to American
  private decimalToAmerican(decimalOdds: number): number {
    if (decimalOdds >= 2) {
      return Math.round((decimalOdds - 1) * 100);
    } else {
      return Math.round(-100 / (decimalOdds - 1));
    }
  }

  // Update bet slip totals
  private updateBetSlipTotals(betSlip: BetSlip): void {
    betSlip.totalStake = 0;
    betSlip.totalPotentialPayout = 0;

    // Add parlay stakes and payouts
    betSlip.parlays.forEach(parlay => {
      betSlip.totalStake += parlay.stake;
      betSlip.totalPotentialPayout += parlay.potentialPayout;
    });

    // Single bets would need individual stakes (not implemented in this demo)
    betSlip.updated = new Date();
  }

  // Place bet slip
  placeBetSlip(): string {
    const betSlip = this.getCurrentBetSlip();
    
    if (betSlip.parlays.length === 0 && betSlip.singleBets.length === 0) {
      throw new Error('No bets in slip to place');
    }

    if (betSlip.totalStake === 0) {
      throw new Error('Please set stake amounts for your bets');
    }

    betSlip.status = 'placed';
    betSlip.parlays.forEach(parlay => {
      parlay.status = 'placed';
      parlay.betSlipId = betSlip.id;
    });

    this.betHistory.push(betSlip);
    this.activeParlays.push(...betSlip.parlays);
    
    // Clear current bet slip
    this.currentBetSlip = null;
    
    this.saveToStorage();
    return betSlip.id;
  }

  // Clear current bet slip
  clearBetSlip(): void {
    this.currentBetSlip = null;
    this.saveToStorage();
  }

  // Get bet history
  getBetHistory(): BetSlip[] {
    return [...this.betHistory];
  }

  // Get active parlays
  getActiveParlays(): Parlay[] {
    return [...this.activeParlays];
  }

  // Delete active parlay
  deleteActiveParlay(parlayId: string): boolean {
    const initialLength = this.activeParlays.length;
    this.activeParlays = this.activeParlays.filter(parlay => parlay.id !== parlayId);
    
    const wasDeleted = this.activeParlays.length < initialLength;
    if (wasDeleted) {
      console.log('🗑️ Active parlay deleted from betManagementService:', parlayId);
      this.saveToStorage();
    } else {
      console.warn('⚠️ Parlay not found for deletion:', parlayId);
    }
    
    return wasDeleted;
  }

  // Create parlay from current pending parlay
  createParlay(): string {
    const betSlip = this.getCurrentBetSlip();
    const pendingParlay = betSlip.parlays.find(p => p.status === 'pending');
    
    if (!pendingParlay || pendingParlay.legs.length === 0) {
      throw new Error('No pending parlay to create');
    }
    
    if (pendingParlay.stake === 0) {
      throw new Error('Please set a stake amount for the parlay');
    }

    // Convert pending parlay to placed
    pendingParlay.status = 'placed';
    pendingParlay.betSlipId = betSlip.id;
    
    // Add to active parlays
    this.activeParlays.push(pendingParlay);
    
    console.log(`New parlay placed: ${pendingParlay.id}`);
    this.saveToStorage();
    
    return pendingParlay.id;
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      const data = {
        currentBetSlip: this.currentBetSlip,
        betHistory: this.betHistory,
        activeParlays: this.activeParlays
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save bet data to storage:', error);
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.currentBetSlip = parsed.currentBetSlip;
        this.betHistory = parsed.betHistory || [];
        this.activeParlays = parsed.activeParlays || [];
        
        // Convert date strings back to Date objects
        if (this.currentBetSlip) {
          this.currentBetSlip.created = new Date(this.currentBetSlip.created);
          this.currentBetSlip.updated = new Date(this.currentBetSlip.updated);
          this.currentBetSlip.parlays.forEach(parlay => {
            parlay.created = new Date(parlay.created);
            parlay.legs.forEach(leg => {
              leg.added = new Date(leg.added);
            });
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load bet data from storage:', error);
    }
  }

  // Search bets by criteria
  searchBets(query: string): (BetLeg | Parlay)[] {
    const results: (BetLeg | Parlay)[] = [];
    
    // Search current bet slip
    const currentSlip = this.getCurrentBetSlip();
    
    // Search parlay legs
    currentSlip.parlays.forEach(parlay => {
      const matchingLegs = parlay.legs.filter(leg =>
        leg.team.toLowerCase().includes(query.toLowerCase()) ||
        leg.playerName?.toLowerCase().includes(query.toLowerCase()) ||
        leg.description.toLowerCase().includes(query.toLowerCase())
      );
      
      if (matchingLegs.length > 0) {
        results.push(parlay);
      }
    });

    // Search single bets
    const matchingSingleBets = currentSlip.singleBets.filter(bet =>
      bet.team.toLowerCase().includes(query.toLowerCase()) ||
      bet.playerName?.toLowerCase().includes(query.toLowerCase()) ||
      bet.description.toLowerCase().includes(query.toLowerCase())
    );
    
    results.push(...matchingSingleBets);
    
    return results;
  }

  // Get bet slip summary
  getBetSlipSummary(): {
    totalBets: number;
    totalParlays: number;
    totalStake: number;
    potentialPayout: number;
    isEmpty: boolean;
  } {
    const betSlip = this.getCurrentBetSlip();
    
    return {
      totalBets: betSlip.singleBets.length + betSlip.parlays.length,
      totalParlays: betSlip.parlays.length,
      totalStake: betSlip.totalStake,
      potentialPayout: betSlip.totalPotentialPayout,
      isEmpty: betSlip.parlays.length === 0 && betSlip.singleBets.length === 0
    };
  }
}

export const betManagementService = new BetManagementService();
export type { BetLeg, Parlay, BetSlip };