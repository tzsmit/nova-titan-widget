/**
 * API Testing Utility - For debugging production API calls
 */

export const testOddsAPI = async () => {
  const API_KEY = 'effdb0775abef82ff5dd944ae2180cae';
  const BASE_URL = 'https://api.the-odds-api.com/v4';
  
  console.log('🧪 Testing Odds API Connection for October 2025...');
  
  try {
    // Test sports endpoint
    const sportsUrl = `${BASE_URL}/sports/?apiKey=${API_KEY}`;
    console.log('📡 Fetching available sports in 2025...');
    const sportsResponse = await fetch(sportsUrl);
    
    if (sportsResponse.ok) {
      const sports = await sportsResponse.json();
      console.log('✅ Sports API working. Available sports in 2025:', sports.length);
      console.log('🏆 Active sports:', sports.filter((s: any) => s.active).map((s: any) => s.title).slice(0, 10));
    } else {
      console.error('❌ Sports API failed:', sportsResponse.status, sportsResponse.statusText);
    }
    
    // Test ALL major sports for October 2025
    const sportsToTest = [
      { key: 'americanfootball_nfl', name: 'NFL' },
      { key: 'basketball_nba', name: 'NBA' }, 
      { key: 'icehockey_nhl', name: 'NHL' },
      { key: 'americanfootball_ncaaf', name: 'College Football' }
    ];
    
    for (const sport of sportsToTest) {
      const sportUrl = `${BASE_URL}/sports/${sport.key}/odds/?apiKey=${API_KEY}&regions=us&markets=h2h,spreads,totals`;
      console.log(`🏈 Testing ${sport.name} endpoint for October 2025...`);
      
      const sportResponse = await fetch(sportUrl);
      const remaining = sportResponse.headers.get('x-requests-remaining');
      
      if (sportResponse.ok) {
        const sportData = await sportResponse.json();
        console.log(`✅ ${sport.name} API: ${sportData.length} games found | API calls remaining: ${remaining}`);
        
        if (sportData.length > 0) {
          const sampleGame = sportData[0];
          console.log(`📊 Sample ${sport.name} game:`, {
            teams: `${sampleGame.away_team} @ ${sampleGame.home_team}`,
            date: new Date(sampleGame.commence_time).toLocaleDateString(),
            time: new Date(sampleGame.commence_time).toLocaleTimeString(),
            bookmakers: sampleGame.bookmakers?.length || 0
          });
        }
      } else {
        console.error(`❌ ${sport.name} API failed:`, sportResponse.status, sportResponse.statusText);
        const errorText = await sportResponse.text();
        console.error(`📄 Error details:`, errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
};