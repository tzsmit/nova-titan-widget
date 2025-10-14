/**
 * API Testing Utility - For debugging production API calls
 */

export const testOddsAPI = async () => {
  console.log('🧪 Basic Odds API Connectivity Check...');
  
  try {
    // Only test basic connectivity without using API calls
    const API_KEY = 'effdb0775abef82ff5dd944ae2180cae';
    const BASE_URL = 'https://api.the-odds-api.com/v4';
    
    // Just test sports endpoint once to check connectivity
    const sportsUrl = `${BASE_URL}/sports/?apiKey=${API_KEY}`;
    const sportsResponse = await fetch(sportsUrl);
    
    if (sportsResponse.ok) {
      const remaining = sportsResponse.headers.get('x-requests-remaining');
      console.log(`✅ Odds API Connected | API calls remaining: ${remaining}`);
    } else {
      console.error('❌ Odds API Connection failed:', sportsResponse.status);
    }
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
  }
};