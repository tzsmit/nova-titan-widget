const { nbaDataService } = require('./frontend/src/services/nbaDataService.ts');

async function testHoustonRockets() {
  console.log('🔍 Testing Houston Rockets NBA data...');
  
  try {
    const rocketData = await nbaDataService.getTeamData('Houston Rockets');
    
    if (rocketData) {
      console.log('✅ Successfully fetched Houston Rockets data:');
      console.log(`   Team: ${rocketData.name}`);
      console.log(`   Conference: ${rocketData.conference}`);
      console.log(`   Division: ${rocketData.division}`);
      console.log(`   Players: ${rocketData.players.length}`);
      console.log('   Top 3 players:');
      rocketData.players.slice(0, 3).forEach(player => {
        console.log(`     - ${player.fullName} (#${player.jersey}) - ${player.position}`);
      });
    } else {
      console.log('❌ No data returned for Houston Rockets');
    }
  } catch (error) {
    console.error('❌ Error testing Houston Rockets data:', error);
  }
}

testHoustonRockets();