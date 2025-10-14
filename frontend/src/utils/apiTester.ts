/**
 * API Testing Utility - For debugging production API calls
 */

export const testOddsAPI = async () => {
  const API_KEY = 'effdb0775abef82ff5dd944ae2180cae';
  const BASE_URL = 'https://api.the-odds-api.com/v4';
  
  console.log('🧪 Testing Odds API Connection...');
  
  try {
    // Test sports endpoint
    const sportsUrl = `${BASE_URL}/sports/?apiKey=${API_KEY}`;
    console.log('📡 Fetching available sports...');
    const sportsResponse = await fetch(sportsUrl);
    
    if (sportsResponse.ok) {
      const sports = await sportsResponse.json();
      console.log('✅ Sports API working. Available sports:', sports.slice(0, 5));
    }
    
    // Test NFL odds
    const nflUrl = `${BASE_URL}/sports/americanfootball_nfl/odds/?apiKey=${API_KEY}&regions=us&markets=h2h,spreads,totals`;
    console.log('🏈 Testing NFL odds endpoint...');
    const nflResponse = await fetch(nflUrl);
    
    if (nflResponse.ok) {
      const nflData = await nflResponse.json();
      console.log('✅ NFL API working. Games found:', nflData.length);
      if (nflData.length > 0) {
        console.log('📊 Sample game data:', nflData[0]);
      }
    } else {
      console.error('❌ NFL API failed:', nflResponse.status, nflResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
};