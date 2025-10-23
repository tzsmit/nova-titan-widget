/**
 * Search Bar Component
 * Advanced search functionality for teams, players, and games
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Zap } from 'lucide-react';
import { 
  performEnhancedFuzzySearch, 
  EnhancedSearchResult, 
  highlightMatch 
} from '../../utils/fuzzySearchUtils';
import { aiEntityExtraction, QueryAnalysis, ExtractedEntity } from '../../services/aiEntityExtraction';

interface SearchResult {
  id: string;
  type: 'team' | 'player' | 'game';
  title: string;
  subtitle: string;
  image?: string;
  data?: any;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilters) => void;
  onResultSelect?: (result: SearchResult | EnhancedSearchResult) => void;
  className?: string;
  enableFuzzySearch?: boolean; // Priority Fix #12: Enable enhanced fuzzy search
}

interface SearchFilters {
  type: 'all' | 'teams' | 'players' | 'games';
  sport: 'all' | 'nfl' | 'cfb' | 'nba' | 'mlb' | 'nhl';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search teams, players, or games...",
  onSearch,
  onResultSelect,
  className = '',
  enableFuzzySearch = true // Priority Fix #12: Default to fuzzy search enabled
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sport: 'all'
  });
  const [results, setResults] = useState<EnhancedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fuzzyEnabled, setFuzzyEnabled] = useState(enableFuzzySearch);
  const [queryAnalysis, setQueryAnalysis] = useState<QueryAnalysis | null>(null); // Priority Fix #13

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comprehensive search database - Updated 2024-2025 Season
  const searchDatabase: SearchResult[] = [
    // NFL Teams - All 32 Teams
    { id: 'chiefs', type: 'team', title: 'Kansas City Chiefs', subtitle: 'NFL • AFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png' },
    { id: 'bills', type: 'team', title: 'Buffalo Bills', subtitle: 'NFL • AFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png' },
    { id: 'bengals', type: 'team', title: 'Cincinnati Bengals', subtitle: 'NFL • AFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png' },
    { id: 'steelers', type: 'team', title: 'Pittsburgh Steelers', subtitle: 'NFL • AFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png' },
    { id: 'cowboys', type: 'team', title: 'Dallas Cowboys', subtitle: 'NFL • NFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png' },
    { id: 'eagles', type: 'team', title: 'Philadelphia Eagles', subtitle: 'NFL • NFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png' },
    { id: 'packers', type: 'team', title: 'Green Bay Packers', subtitle: 'NFL • NFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png' },
    { id: 'lions', type: 'team', title: 'Detroit Lions', subtitle: 'NFL • NFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png' },
    { id: 'ravens', type: 'team', title: 'Baltimore Ravens', subtitle: 'NFL • AFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png' },
    { id: 'browns', type: 'team', title: 'Cleveland Browns', subtitle: 'NFL • AFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png' },
    { id: 'dolphins', type: 'team', title: 'Miami Dolphins', subtitle: 'NFL • AFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png' },
    { id: 'jets', type: 'team', title: 'New York Jets', subtitle: 'NFL • AFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png' },
    { id: 'patriots', type: 'team', title: 'New England Patriots', subtitle: 'NFL • AFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png' },
    { id: 'chargers', type: 'team', title: 'Los Angeles Chargers', subtitle: 'NFL • AFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png' },
    { id: 'raiders', type: 'team', title: 'Las Vegas Raiders', subtitle: 'NFL • AFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png' },
    { id: 'broncos', type: 'team', title: 'Denver Broncos', subtitle: 'NFL • AFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png' },
    { id: 'titans', type: 'team', title: 'Tennessee Titans', subtitle: 'NFL • AFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png' },
    { id: 'jaguars', type: 'team', title: 'Jacksonville Jaguars', subtitle: 'NFL • AFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png' },
    { id: 'colts', type: 'team', title: 'Indianapolis Colts', subtitle: 'NFL • AFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png' },
    { id: 'texans', type: 'team', title: 'Houston Texans', subtitle: 'NFL • AFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png' },
    { id: '49ers', type: 'team', title: 'San Francisco 49ers', subtitle: 'NFL • NFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png' },
    { id: 'seahawks', type: 'team', title: 'Seattle Seahawks', subtitle: 'NFL • NFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png' },
    { id: 'rams', type: 'team', title: 'Los Angeles Rams', subtitle: 'NFL • NFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png' },
    { id: 'cardinals', type: 'team', title: 'Arizona Cardinals', subtitle: 'NFL • NFC West', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png' },
    { id: 'vikings', type: 'team', title: 'Minnesota Vikings', subtitle: 'NFL • NFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png' },
    { id: 'bears', type: 'team', title: 'Chicago Bears', subtitle: 'NFL • NFC North', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
    { id: 'giants', type: 'team', title: 'New York Giants', subtitle: 'NFL • NFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png' },
    { id: 'commanders', type: 'team', title: 'Washington Commanders', subtitle: 'NFL • NFC East', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png' },
    { id: 'saints', type: 'team', title: 'New Orleans Saints', subtitle: 'NFL • NFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png' },
    { id: 'falcons', type: 'team', title: 'Atlanta Falcons', subtitle: 'NFL • NFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png' },
    { id: 'panthers', type: 'team', title: 'Carolina Panthers', subtitle: 'NFL • NFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png' },
    { id: 'buccaneers', type: 'team', title: 'Tampa Bay Buccaneers', subtitle: 'NFL • NFC South', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png' },
    
    // College Football Teams - Top CFB Programs
    { id: 'georgia', type: 'team', title: 'Georgia Bulldogs', subtitle: 'CFB • SEC', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/61.png' },
    { id: 'michigan', type: 'team', title: 'Michigan Wolverines', subtitle: 'CFB • Big Ten', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/130.png' },
    { id: 'alabama', type: 'team', title: 'Alabama Crimson Tide', subtitle: 'CFB • SEC', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/333.png' },
    { id: 'texas', type: 'team', title: 'Texas Longhorns', subtitle: 'CFB • SEC', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/251.png' },
    { id: 'oregon', type: 'team', title: 'Oregon Ducks', subtitle: 'CFB • Big Ten', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/2483.png' },
    { id: 'ohio-state', type: 'team', title: 'Ohio State Buckeyes', subtitle: 'CFB • Big Ten', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/194.png' },
    { id: 'penn-state', type: 'team', title: 'Penn State Nittany Lions', subtitle: 'CFB • Big Ten', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/213.png' },
    { id: 'notre-dame', type: 'team', title: 'Notre Dame Fighting Irish', subtitle: 'CFB • Independent', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/87.png' },
    { id: 'clemson', type: 'team', title: 'Clemson Tigers', subtitle: 'CFB • ACC', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/228.png' },
    { id: 'lsu', type: 'team', title: 'LSU Tigers', subtitle: 'CFB • SEC', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/99.png' },
    
    // NBA Teams - All 30 Teams
    { id: 'lakers', type: 'team', title: 'Los Angeles Lakers', subtitle: 'NBA • Pacific Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
    { id: 'warriors', type: 'team', title: 'Golden State Warriors', subtitle: 'NBA • Pacific Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png' },
    { id: 'celtics', type: 'team', title: 'Boston Celtics', subtitle: 'NBA • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
    { id: 'heat', type: 'team', title: 'Miami Heat', subtitle: 'NBA • Southeast Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png' },
    { id: 'mavericks', type: 'team', title: 'Dallas Mavericks', subtitle: 'NBA • Southwest Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png' },
    { id: 'nuggets', type: 'team', title: 'Denver Nuggets', subtitle: 'NBA • Northwest Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png' },
    { id: 'bucks', type: 'team', title: 'Milwaukee Bucks', subtitle: 'NBA • Central Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png' },
    { id: 'suns', type: 'team', title: 'Phoenix Suns', subtitle: 'NBA • Pacific Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png' },
    { id: 'sixers', type: 'team', title: 'Philadelphia 76ers', subtitle: 'NBA • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png' },
    { id: 'nets', type: 'team', title: 'Brooklyn Nets', subtitle: 'NBA • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png' },
    { id: 'knicks', type: 'team', title: 'New York Knicks', subtitle: 'NBA • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png' },
    { id: 'clippers', type: 'team', title: 'LA Clippers', subtitle: 'NBA • Pacific Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png' },
    { id: 'kings', type: 'team', title: 'Sacramento Kings', subtitle: 'NBA • Pacific Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png' },
    { id: 'timberwolves', type: 'team', title: 'Minnesota Timberwolves', subtitle: 'NBA • Northwest Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png' },
    { id: 'thunder', type: 'team', title: 'Oklahoma City Thunder', subtitle: 'NBA • Northwest Division', image: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png' },
    
    // MLB Teams - Major Teams
    { id: 'dodgers', type: 'team', title: 'Los Angeles Dodgers', subtitle: 'MLB • NL West', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png' },
    { id: 'yankees', type: 'team', title: 'New York Yankees', subtitle: 'MLB • AL East', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png' },
    { id: 'astros', type: 'team', title: 'Houston Astros', subtitle: 'MLB • AL West', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png' },
    { id: 'braves', type: 'team', title: 'Atlanta Braves', subtitle: 'MLB • NL East', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png' },
    { id: 'mets', type: 'team', title: 'New York Mets', subtitle: 'MLB • NL East', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png' },
    { id: 'phillies', type: 'team', title: 'Philadelphia Phillies', subtitle: 'MLB • NL East', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png' },
    { id: 'padres', type: 'team', title: 'San Diego Padres', subtitle: 'MLB • NL West', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png' },
    { id: 'red-sox', type: 'team', title: 'Boston Red Sox', subtitle: 'MLB • AL East', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png' },
    
    // NHL Teams - Major Teams
    { id: 'rangers', type: 'team', title: 'New York Rangers', subtitle: 'NHL • Metropolitan Division', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png' },
    { id: 'panthers-nhl', type: 'team', title: 'Florida Panthers', subtitle: 'NHL • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png' },
    { id: 'oilers', type: 'team', title: 'Edmonton Oilers', subtitle: 'NHL • Pacific Division', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png' },
    { id: 'bruins', type: 'team', title: 'Boston Bruins', subtitle: 'NHL • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png' },
    { id: 'lightning', type: 'team', title: 'Tampa Bay Lightning', subtitle: 'NHL • Atlantic Division', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png' },
    { id: 'avalanche', type: 'team', title: 'Colorado Avalanche', subtitle: 'NHL • Central Division', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png' },
    
    // NFL Players - 2025 Season Current Rosters
    { id: 'mahomes', type: 'player', title: 'Patrick Mahomes', subtitle: 'QB • Kansas City Chiefs', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=PM' },
    { id: 'allen', type: 'player', title: 'Josh Allen', subtitle: 'QB • Buffalo Bills', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JA' },
    { id: 'burrow', type: 'player', title: 'Joe Burrow', subtitle: 'QB • Cincinnati Bengals', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JB' },
    { id: 'dak', type: 'player', title: 'Dak Prescott', subtitle: 'QB • Dallas Cowboys', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=DP' },
    { id: 'lamar', type: 'player', title: 'Lamar Jackson', subtitle: 'QB • Baltimore Ravens', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=LJ' },
    { id: 'hurts', type: 'player', title: 'Jalen Hurts', subtitle: 'QB • Philadelphia Eagles', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JH' },
    { id: 'herbert', type: 'player', title: 'Justin Herbert', subtitle: 'QB • Los Angeles Chargers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JH' },
    { id: 'tua', type: 'player', title: 'Tua Tagovailoa', subtitle: 'QB • Miami Dolphins', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=TT' },
    { id: 'daniels', type: 'player', title: 'Jayden Daniels', subtitle: 'QB • Washington Commanders', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JD' },
    { id: 'williams', type: 'player', title: 'Caleb Williams', subtitle: 'QB • Chicago Bears', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CW' },
    { id: 'maye', type: 'player', title: 'Drake Maye', subtitle: 'QB • New England Patriots', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=DM' },
    { id: 'hill', type: 'player', title: 'Tyreek Hill', subtitle: 'WR • Miami Dolphins', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=TH' },
    { id: 'jefferson', type: 'player', title: 'Justin Jefferson', subtitle: 'WR • Minnesota Vikings', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JJ' },
    { id: 'chase', type: 'player', title: 'Ja\'Marr Chase', subtitle: 'WR • Cincinnati Bengals', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JC' },
    { id: 'adams', type: 'player', title: 'Davante Adams', subtitle: 'WR • Las Vegas Raiders', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=DA' },
    { id: 'brown', type: 'player', title: 'A.J. Brown', subtitle: 'WR • Philadelphia Eagles', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=AB' },
    { id: 'lamb', type: 'player', title: 'CeeDee Lamb', subtitle: 'WR • Dallas Cowboys', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CL' },
    { id: 'kelce', type: 'player', title: 'Travis Kelce', subtitle: 'TE • Kansas City Chiefs', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=TK' },
    { id: 'mccaffrey', type: 'player', title: 'Christian McCaffrey', subtitle: 'RB • San Francisco 49ers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CM' },
    { id: 'henry', type: 'player', title: 'Derrick Henry', subtitle: 'RB • Baltimore Ravens', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=DH' },
    { id: 'barkley', type: 'player', title: 'Saquon Barkley', subtitle: 'RB • Philadelphia Eagles', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=SB' },
    { id: 'jacobs', type: 'player', title: 'Josh Jacobs', subtitle: 'RB • Green Bay Packers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JJ' },
    
    // CFB Players - 2025 Season
    { id: 'manning', type: 'player', title: 'Arch Manning', subtitle: 'QB • Texas Longhorns', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=AM' },
    { id: 'beck', type: 'player', title: 'Carson Beck', subtitle: 'QB • Georgia Bulldogs', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CB' },
    { id: 'raiola', type: 'player', title: 'Dylan Raiola', subtitle: 'QB • Nebraska Cornhuskers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=DR' },
    { id: 'ward', type: 'player', title: 'Cam Ward', subtitle: 'QB • Miami Hurricanes', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CW' },
    { id: 'milroe', type: 'player', title: 'Jalen Milroe', subtitle: 'QB • Alabama Crimson Tide', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JM' },
    { id: 'hunter', type: 'player', title: 'Travis Hunter', subtitle: 'WR/CB • Colorado Buffaloes', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=TH' },
    
    // NBA Players - 2025-26 Season
    { id: 'lebron', type: 'player', title: 'LeBron James', subtitle: 'SF • Los Angeles Lakers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=LJ' },
    { id: 'bronny', type: 'player', title: 'Bronny James', subtitle: 'PG • Los Angeles Lakers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=BJ' },
    { id: 'curry', type: 'player', title: 'Stephen Curry', subtitle: 'PG • Golden State Warriors', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=SC' },
    { id: 'tatum', type: 'player', title: 'Jayson Tatum', subtitle: 'SF • Boston Celtics', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JT' },
    { id: 'brown', type: 'player', title: 'Jaylen Brown', subtitle: 'SG • Boston Celtics', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JB' },
    { id: 'luka', type: 'player', title: 'Luka Dončić', subtitle: 'PG • Dallas Mavericks', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=LD' },
    { id: 'jokic', type: 'player', title: 'Nikola Jokić', subtitle: 'C • Denver Nuggets', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=NJ' },
    { id: 'giannis', type: 'player', title: 'Giannis Antetokounmpo', subtitle: 'PF • Milwaukee Bucks', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=GA' },
    { id: 'edwards', type: 'player', title: 'Anthony Edwards', subtitle: 'SG • Minnesota Timberwolves', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=AE' },
    { id: 'sga', type: 'player', title: 'Shai Gilgeous-Alexander', subtitle: 'PG • Oklahoma City Thunder', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=SG' },
    { id: 'wembanyama', type: 'player', title: 'Victor Wembanyama', subtitle: 'C • San Antonio Spurs', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=VW' },
    { id: 'cooper-flagg', type: 'player', title: 'Cooper Flagg', subtitle: 'SF • Portland Trail Blazers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CF' },
    
    // MLB Players - 2025 Season
    { id: 'betts', type: 'player', title: 'Mookie Betts', subtitle: 'RF • Los Angeles Dodgers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=MB' },
    { id: 'judge', type: 'player', title: 'Aaron Judge', subtitle: 'RF • New York Yankees', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=AJ' },
    { id: 'ohtani', type: 'player', title: 'Shohei Ohtani', subtitle: 'DH/P • Los Angeles Dodgers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=SO' },
    { id: 'soto', type: 'player', title: 'Juan Soto', subtitle: 'RF • New York Mets', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=JS' },
    { id: 'acuna', type: 'player', title: 'Ronald Acuña Jr.', subtitle: 'OF • Atlanta Braves', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=RA' },
    { id: 'tatis', type: 'player', title: 'Fernando Tatis Jr.', subtitle: 'SS • San Diego Padres', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=FT' },
    { id: 'harper', type: 'player', title: 'Bryce Harper', subtitle: '1B • Philadelphia Phillies', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=BH' },
    
    // NHL Players - 2025-26 Season  
    { id: 'mcdavid', type: 'player', title: 'Connor McDavid', subtitle: 'C • Edmonton Oilers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CM' },
    { id: 'draisaitl', type: 'player', title: 'Leon Draisaitl', subtitle: 'C • Edmonton Oilers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=LD' },
    { id: 'pastrnak', type: 'player', title: 'David Pastrňák', subtitle: 'RW • Boston Bruins', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=DP' },
    { id: 'shesterkin', type: 'player', title: 'Igor Shesterkin', subtitle: 'G • New York Rangers', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=IS' },
    { id: 'bedard', type: 'player', title: 'Connor Bedard', subtitle: 'C • Chicago Blackhawks', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=CB' },
    { id: 'celebrini', type: 'player', title: 'Macklin Celebrini', subtitle: 'C • San Jose Sharks', image: 'https://via.placeholder.com/48x48/1e293b/ffffff?text=MC' },
    
    // Sample Games - 2025 Season
    { id: 'game1', type: 'game', title: 'Chiefs vs Bills', subtitle: 'Sunday 8:20 PM CST • NBC', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png' },
    { id: 'game2', type: 'game', title: 'Lakers vs Celtics', subtitle: 'Thursday 8:00 PM CST • TNT', image: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
    { id: 'game3', type: 'game', title: 'Cowboys vs Eagles', subtitle: 'Sunday 1:00 PM CST • FOX', image: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png' },
    { id: 'game4', type: 'game', title: 'Texas vs Georgia', subtitle: 'Saturday 8:00 PM CST • ABC', image: 'https://a.espncdn.com/i/teamlogos/ncf/500/251.png' },
    { id: 'game5', type: 'game', title: 'Rangers vs Panthers', subtitle: 'Tuesday 7:30 PM CST • ESPN+', image: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png' },
    { id: 'game6', type: 'game', title: 'Dodgers vs Mets', subtitle: 'Friday 8:10 PM CST • FOX', image: 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png' }
  ];

  // Enhanced search function with fuzzy matching - Priority Fix #12
  const performSearch = async (searchQuery: string, searchFilters: SearchFilters): Promise<EnhancedSearchResult[]> => {
    if (!searchQuery.trim()) return [];
    
    setIsSearching(true);
    
    // Simulate realistic search delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let searchResults: EnhancedSearchResult[];

    if (fuzzyEnabled) {
      // Use enhanced fuzzy search with alternate names
      searchResults = performEnhancedFuzzySearch(searchQuery, searchDatabase, {
        minScore: 25, // Lower threshold for more inclusive results
        maxResults: 10,
        includeAlternates: true
      });
      
      console.log(`🔍 Fuzzy Search: "${searchQuery}" found ${searchResults.length} results with scores:`, 
        searchResults.map(r => ({ title: r.title, score: r.fuzzyScore, field: r.matchedField })));
    } else {
      // Fallback to original exact search
      const filtered = searchDatabase.filter(result => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = result.title.toLowerCase().includes(query) ||
                            result.subtitle.toLowerCase().includes(query) ||
                            result.title.toLowerCase().startsWith(query);
        
        const matchesType = searchFilters.type === 'all' || 
                           (searchFilters.type === 'teams' && result.type === 'team') ||
                           (searchFilters.type === 'players' && result.type === 'player') ||
                           (searchFilters.type === 'games' && result.type === 'game');

        const matchesSport = searchFilters.sport === 'all' || 
                            result.subtitle.toLowerCase().includes(searchFilters.sport);

        return matchesQuery && matchesType && matchesSport;
      });

      searchResults = filtered.map(item => ({
        ...item,
        fuzzyScore: 100,
        matchedField: 'title' as const,
        alternateNames: []
      })).slice(0, 8);
    }

    // Apply filter constraints to fuzzy results
    const filteredResults = searchResults.filter(result => {
      const matchesType = searchFilters.type === 'all' || 
                         (searchFilters.type === 'teams' && result.type === 'team') ||
                         (searchFilters.type === 'players' && result.type === 'player') ||
                         (searchFilters.type === 'games' && result.type === 'game');

      const matchesSport = searchFilters.sport === 'all' || 
                          result.subtitle.toLowerCase().includes(searchFilters.sport);

      return matchesType && matchesSport;
    });

    setIsSearching(false);
    return filteredResults.slice(0, 8);
  };

  // Handle enhanced search with AI entity extraction - Priority Fix #13
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        // Priority Fix #13: AI-powered entity extraction
        const analysis = await aiEntityExtraction.extractEntities(query);
        setQueryAnalysis(analysis);
        
        const searchResults = await performSearch(query, filters);
        setResults(searchResults);
        onSearch(query, filters);
      } else {
        setResults([]);
        setQueryAnalysis(null);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, filters, fuzzyEnabled, onSearch]);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.title);
    setResults([]);
    setIsExpanded(false);
    
    console.log(`🔍 Search result selected: ${result.type} - ${result.title}`);
    
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team': return '🏆';
      case 'player': return '👤';
      case 'game': return '🎮';
      default: return '🔍';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className={`relative transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="relative bg-slate-800/50 rounded-xl border border-slate-600 overflow-hidden">
          <div className="flex items-center">
            <div className="pl-4">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={placeholder}
              className="w-full bg-transparent py-3 px-4 text-slate-200 placeholder-slate-400 focus:outline-none"
            />

            <div className="flex items-center pr-2">
              {query && (
                <button
                  onClick={clearSearch}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 ml-1 rounded-lg transition-colors ${
                  showFilters ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-slate-600 bg-slate-800/80 p-3"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-2 block">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="teams">Teams</option>
                      <option value="players">Players</option>
                      <option value="games">Games</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-2 block">Sport</label>
                    <select
                      value={filters.sport}
                      onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value as any }))}
                      className="w-full bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Sports</option>
                      <option value="nfl">NFL</option>
                      <option value="cfb">CFB</option>
                      <option value="nba">NBA</option>
                      <option value="mlb">MLB</option>
                      <option value="nhl">NHL</option>
                    </select>
                  </div>
                </div>

                {/* Priority Fix #12: Fuzzy Search Toggle */}
                <div className="border-t border-slate-600 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fuzzyEnabled}
                      onChange={(e) => {
                        setFuzzyEnabled(e.target.checked);
                        console.log(`🔍 Fuzzy Search: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-medium text-slate-300">
                        Smart Search (nicknames, fuzzy matching)
                      </span>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isExpanded && (query.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
          >
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Analyzing query...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Priority Fix #13: AI Entity Extraction Results */}
                {queryAnalysis && queryAnalysis.entities.length > 0 && (
                  <div className="p-3 border-b border-slate-600 bg-slate-800/50">
                    <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1">
                      🧠 AI Analysis ({queryAnalysis.confidence}% confidence)
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {queryAnalysis.entities.slice(0, 4).map((entity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          {entity.type === 'player' ? '👤' : entity.type === 'team' ? '🏆' : entity.type === 'bet_type' ? '💰' : '🏈'} {entity.value}
                        </span>
                      ))}
                    </div>
                    {queryAnalysis.suggestedActions.length > 0 && (
                      <div className="text-xs text-slate-400">
                        💡 Try: {queryAnalysis.suggestedActions.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-700 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg relative">
                        {result.image ? (
                          <img 
                            src={result.image} 
                            alt={result.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <span>{getTypeIcon(result.type)}</span>
                        )}
                        
                        {/* Fuzzy match indicator - Priority Fix #12 */}
                        {fuzzyEnabled && result.fuzzyScore < 90 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                            <Zap className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-slate-200">
                          {result.title}
                          {/* Show matched alternate name if applicable */}
                          {result.matchedField === 'alternate' && result.alternateNames && (
                            <span className="ml-2 text-xs text-amber-400">
                              (matches "{result.alternateNames.find(alt => 
                                alt.toLowerCase().includes(query.toLowerCase())
                              )}")
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-2">
                          {result.subtitle}
                          {/* Fuzzy score indicator for debugging */}
                          {fuzzyEnabled && result.fuzzyScore < 90 && (
                            <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                              {Math.round(result.fuzzyScore)}% match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
                ) : query.trim() ? (
                  <div className="p-4 text-center text-slate-400">
                    No results found for "{query}"
                    {queryAnalysis && queryAnalysis.enhancedQuery && (
                      <div className="text-xs mt-1 text-slate-500">
                        Try searching: "{queryAnalysis.enhancedQuery}"
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};