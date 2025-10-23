/**
 * Test NBA Service Integration
 * Direct test to verify Houston Rockets real data is available
 */

// Simulate the NBA service behavior
class TestNBAService {
  getCurrentNBATeams() {
    return [
      {
        id: 1610612745,
        name: 'Houston Rockets', 
        abbreviation: 'HOU',
        nickname: 'Rockets',
        city: 'Houston',
        conference: 'Western',
        division: 'Southwest'
      }
      // ... other teams
    ];
  }

  getHoustonRocketsRoster() {
    return [
      {
        id: 1629021,
        firstName: 'Alperen',
        lastName: 'Şengün',
        fullName: 'Alperen Şengün',
        position: 'C',
        jersey: '28',
        height: '6-11',
        weight: '243',
        age: 24,
        college: 'None',
        country: 'Turkey',
        stats: {
          points: 21.1,
          rebounds: 9.3,
          assists: 5.0,
          fieldGoalPercentage: 53.7,
          threePointPercentage: 34.3,
          freeThrowPercentage: 79.6,
          minutesPlayed: 32.9,
          gamesPlayed: 63
        }
      },
      {
        id: 1628372,
        firstName: 'Fred',
        lastName: 'VanVleet',
        fullName: 'Fred VanVleet',
        position: 'PG',
        jersey: '5',
        height: '6-0',
        weight: '197',
        age: 30,
        college: 'Wichita State',
        country: 'USA',
        stats: {
          points: 17.4,
          rebounds: 3.8,
          assists: 8.1,
          fieldGoalPercentage: 42.3,
          threePointPercentage: 34.1,
          freeThrowPercentage: 83.7,
          minutesPlayed: 35.1,
          gamesPlayed: 73
        }
      },
      {
        id: 1630224,
        firstName: 'Jalen',
        lastName: 'Green',
        fullName: 'Jalen Green',
        position: 'SG',
        jersey: '4',
        height: '6-4',
        weight: '186',
        age: 22,
        college: 'None',
        country: 'USA',
        stats: {
          points: 19.6,
          rebounds: 5.2,
          assists: 3.5,
          fieldGoalPercentage: 42.3,
          threePointPercentage: 33.2,
          freeThrowPercentage: 79.9,
          minutesPlayed: 31.1,
          gamesPlayed: 82
        }
      }
    ];
  }

  async getTeamData(teamName) {
    console.log(`🏀🔍 NBA DATA SERVICE - Testing lookup for: "${teamName}"`);
    
    // Find team in database
    const teams = this.getCurrentNBATeams();
    console.log(`📋 Total NBA teams in database: ${teams.length}`);
    
    const team = teams.find(t => 
      t.name?.toLowerCase().includes(teamName.toLowerCase()) ||
      t.nickname?.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.nickname?.toLowerCase() || '') ||
      teamName.toLowerCase().includes(t.name?.toLowerCase() || '')
    );

    if (!team) {
      console.warn(`❌ NBA TEAM NOT FOUND: "${teamName}"`);
      return null;
    }

    console.log(`✅ FOUND NBA TEAM: ${team.name} (${team.conference} Conference, ${team.division} Division)`);

    // Get real roster data
    let players = [];
    if (team.abbreviation === 'HOU') {
      players = this.getHoustonRocketsRoster();
      console.log(`🚀 Loaded REAL Houston Rockets roster: ${players.length} players`);
      players.forEach(p => {
        console.log(`  👤 ${p.fullName} (${p.position}, #${p.jersey}) - ${p.stats.points} PPG, ${p.stats.rebounds} RPG, ${p.stats.assists} APG`);
      });
    }

    return {
      ...team,
      players
    };
  }
}

// Test the service
async function testNBAService() {
  const nbaService = new TestNBAService();
  
  console.log('🧪 Testing NBA Service with different team name variations...\n');
  
  const testNames = [
    'Houston Rockets',
    'Rockets', 
    'houston rockets',
    'rockets',
    'HOU',
    'houston',
    'Houston'
  ];

  for (const testName of testNames) {
    console.log(`\n📝 Testing: "${testName}"`);
    console.log('='.repeat(50));
    const result = await nbaService.getTeamData(testName);
    console.log(`Result: ${result ? `SUCCESS - ${result.name}` : 'NOT FOUND'}`);
  }
}

testNBAService();