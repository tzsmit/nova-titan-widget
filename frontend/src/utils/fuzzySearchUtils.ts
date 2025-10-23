/**
 * Fuzzy Search Utilities - Priority Fix #12
 * Enhanced search with fuzzy matching, alternate names, and canonical IDs
 */

// Simple fuzzy matching algorithm (Levenshtein distance based)
export function calculateFuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;
  
  query = query.toLowerCase().trim();
  target = target.toLowerCase().trim();
  
  // Exact match gets highest score
  if (target === query) return 100;
  
  // Starts with query gets high score
  if (target.startsWith(query)) return 90;
  
  // Contains query gets good score
  if (target.includes(query)) return 80;
  
  // Calculate Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(query, target);
  const maxLength = Math.max(query.length, target.length);
  
  // Convert distance to similarity score (0-70 range for fuzzy matches)
  const similarity = Math.max(0, (maxLength - distance) / maxLength * 70);
  
  return similarity;
}

// Levenshtein distance calculation
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

// Enhanced search result interface with fuzzy scoring
export interface EnhancedSearchResult {
  id: string;
  canonicalId?: string; // Unique identifier for entity matching
  type: 'team' | 'player' | 'game';
  title: string;
  alternateNames?: string[]; // Nicknames, abbreviations, etc.
  subtitle: string;
  image?: string;
  data?: any;
  fuzzyScore: number;
  matchedField: 'title' | 'alternate' | 'subtitle';
}

// Player alternate names database for better matching
export const PLAYER_ALTERNATE_NAMES: Record<string, string[]> = {
  // NFL Players
  'patrick-mahomes': ['Pat Mahomes', 'Mahomes II', 'PM15', 'The Showtime'],
  'josh-allen': ['Josh', 'JA17', 'Allen'],
  'joe-burrow': ['Joe Cool', 'JB9', 'Joey B'],
  'dak-prescott': ['Dak', 'DP4', 'Prescott'],
  'lamar-jackson': ['LJ8', 'Action Jackson', 'Lamar'],
  'jalen-hurts': ['JH1', 'Hurts', 'Jalen'],
  'travis-kelce': ['Kelce', 'TK87', 'Big Yachty'],
  'tyreek-hill': ['Cheetah', 'Reek', 'TH10'],
  'christian-mccaffrey': ['CMC', 'Run CMC', 'McCaffrey'],
  'derrick-henry': ['King Henry', 'The Tractor', 'DH22'],
  
  // NBA Players  
  'lebron-james': ['LBJ', 'The King', 'LeBron', 'King James', 'The Chosen One'],
  'stephen-curry': ['Steph', 'Chef Curry', 'SC30', 'The Baby Faced Assassin'],
  'kevin-durant': ['KD', 'The Slim Reaper', 'Durantula', 'KD35'],
  'giannis-antetokounmpo': ['The Greek Freak', 'Giannis', 'GA34'],
  'luka-doncic': ['Luka Magic', 'Wonder Boy', 'LD77'],
  'jayson-tatum': ['JT0', 'Tatum', 'JT'],
  'nikola-jokic': ['The Joker', 'Jokic', 'NJ15'],
  'victor-wembanyama': ['Wemby', 'The Alien', 'VW1'],
  
  // MLB Players
  'shohei-ohtani': ['Sho-Time', 'The Unicorn', 'Two-Way Ohtani'],
  'aaron-judge': ['Judge', 'AJ99', 'All Rise'],
  'mookie-betts': ['Mookie', 'MB50'],
  'juan-soto': ['Childish Bambino', 'Soto', 'JS22'],
  'bryce-harper': ['Harper', 'BH3', 'Hooper'],
  
  // NHL Players
  'connor-mcdavid': ['McDavid', 'CM97', 'McJesus'],
  'leon-draisaitl': ['Drai', 'LD29'],
  'david-pastrnak': ['Pasta', 'Pasternak', 'DP88'],
  'connor-bedard': ['Bedard', 'CB98', 'The Next One']
};

// Team alternate names database
export const TEAM_ALTERNATE_NAMES: Record<string, string[]> = {
  // NFL Teams
  'kansas-city-chiefs': ['Chiefs', 'KC', 'KC Chiefs', 'Kingdom'],
  'buffalo-bills': ['Bills', 'BUF', 'Buffalo'],
  'dallas-cowboys': ['Cowboys', 'DAL', "America's Team", 'Boys'],
  'green-bay-packers': ['Packers', 'GB', 'Pack', 'Cheeseheads'],
  'pittsburgh-steelers': ['Steelers', 'PIT', 'Steel Curtain'],
  'new-england-patriots': ['Patriots', 'Pats', 'NE', 'New England'],
  'san-francisco-49ers': ['49ers', 'Niners', 'SF', 'Forty Niners'],
  'philadelphia-eagles': ['Eagles', 'PHI', 'Birds', 'Philly'],
  
  // NBA Teams
  'los-angeles-lakers': ['Lakers', 'LAL', 'LA Lakers', 'Purple and Gold'],
  'boston-celtics': ['Celtics', 'BOS', 'C\'s', 'Green'],
  'golden-state-warriors': ['Warriors', 'GSW', 'Dubs', 'Golden State'],
  'miami-heat': ['Heat', 'MIA'],
  'chicago-bulls': ['Bulls', 'CHI'],
  'new-york-knicks': ['Knicks', 'NYK', 'NY Knicks'],
  
  // MLB Teams  
  'new-york-yankees': ['Yankees', 'NYY', 'Yanks', 'Bronx Bombers'],
  'los-angeles-dodgers': ['Dodgers', 'LAD', 'Boys in Blue'],
  'boston-red-sox': ['Red Sox', 'BOS', 'Sox'],
  'houston-astros': ['Astros', 'HOU'],
  
  // NHL Teams
  'new-york-rangers': ['Rangers', 'NYR', 'Broadway Blueshirts'],
  'boston-bruins': ['Bruins', 'BOS', 'B\'s'],
  'edmonton-oilers': ['Oilers', 'EDM'],
  'tampa-bay-lightning': ['Lightning', 'TBL', 'Bolts']
};

// Enhanced fuzzy search function
export function performEnhancedFuzzySearch(
  query: string,
  searchDatabase: any[],
  options: {
    minScore?: number;
    maxResults?: number;
    includeAlternates?: boolean;
  } = {}
): EnhancedSearchResult[] {
  const {
    minScore = 30,
    maxResults = 8,
    includeAlternates = true
  } = options;

  if (!query?.trim()) return [];

  const results: EnhancedSearchResult[] = [];
  const queryLower = query.toLowerCase().trim();

  for (const item of searchDatabase) {
    let bestScore = 0;
    let matchedField: 'title' | 'alternate' | 'subtitle' = 'title';

    // Score against main title
    const titleScore = calculateFuzzyScore(queryLower, item.title);
    if (titleScore > bestScore) {
      bestScore = titleScore;
      matchedField = 'title';
    }

    // Score against subtitle
    const subtitleScore = calculateFuzzyScore(queryLower, item.subtitle);
    if (subtitleScore > bestScore) {
      bestScore = subtitleScore;
      matchedField = 'subtitle';
    }

    // Score against alternate names if enabled
    if (includeAlternates) {
      const alternates = getAlternateNames(item);
      for (const alt of alternates) {
        const altScore = calculateFuzzyScore(queryLower, alt);
        if (altScore > bestScore) {
          bestScore = altScore;
          matchedField = 'alternate';
        }
      }
    }

    // Add to results if score meets minimum threshold
    if (bestScore >= minScore) {
      results.push({
        ...item,
        canonicalId: generateCanonicalId(item),
        fuzzyScore: bestScore,
        matchedField,
        alternateNames: getAlternateNames(item)
      });
    }
  }

  // Sort by fuzzy score (highest first) then by title
  results.sort((a, b) => {
    if (b.fuzzyScore !== a.fuzzyScore) {
      return b.fuzzyScore - a.fuzzyScore;
    }
    return a.title.localeCompare(b.title);
  });

  return results.slice(0, maxResults);
}

// Get alternate names for an item
function getAlternateNames(item: any): string[] {
  const alternates: string[] = [];
  
  if (item.type === 'player') {
    const playerKey = generateCanonicalId(item);
    if (PLAYER_ALTERNATE_NAMES[playerKey]) {
      alternates.push(...PLAYER_ALTERNATE_NAMES[playerKey]);
    }
  } else if (item.type === 'team') {
    const teamKey = generateCanonicalId(item);
    if (TEAM_ALTERNATE_NAMES[teamKey]) {
      alternates.push(...TEAM_ALTERNATE_NAMES[teamKey]);
    }
  }

  return alternates;
}

// Generate canonical ID for consistent entity matching
function generateCanonicalId(item: any): string {
  if (item.canonicalId) return item.canonicalId;
  
  // Generate from title by normalizing
  return item.title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
}

// Highlight matching text in search results
export function highlightMatch(text: string, query: string, matchType: 'exact' | 'fuzzy' = 'exact'): string {
  if (!query?.trim()) return text;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (matchType === 'exact') {
    const index = textLower.indexOf(queryLower);
    if (index >= 0) {
      const before = text.slice(0, index);
      const match = text.slice(index, index + query.length);
      const after = text.slice(index + query.length);
      return `${before}<mark class="bg-yellow-200 text-black px-1 rounded">${match}</mark>${after}`;
    }
  }
  
  return text;
}