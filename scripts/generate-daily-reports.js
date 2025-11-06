/**
 * Daily Report Generator
 * Generates beautiful HTML reports for NBA/NFL with AI analysis
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sports: ['NBA', 'NFL'],
  reportDir: path.join(__dirname, '../reports'),
  date: new Date().toISOString().split('T')[0]
};

/**
 * Generate HTML Report
 */
function generateReport(sport, data) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Titan AI - ${sport} ${CONFIG.date}</title>
    <style>
        ${getReportStyles()}
    </style>
</head>
<body>
    <div class="container">
        ${renderHeader(sport, CONFIG.date)}
        ${renderTopPicks(data.topPicks)}
        ${renderCombos(data.combos)}
        ${renderAllProps(data.allProps)}
        ${renderFooter()}
    </div>
</body>
</html>
  `;
  
  return html;
}

/**
 * Premium Report Styles
 */
function getReportStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0e27;
      color: #ffffff;
      line-height: 1.6;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px;
      border-radius: 20px;
      margin-bottom: 40px;
      text-align: center;
    }
    
    .logo {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .header .date {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    /* Section */
    .section {
      background: #141830;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 40px;
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 2rem;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    /* Top Picks */
    .picks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    
    .pick-card {
      background: #1a1f3a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
    }
    
    .pick-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    }
    
    .pick-card.elite {
      border-left: 3px solid #ffd700;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    
    .pick-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    
    .player-name {
      font-size: 1.3rem;
      font-weight: 600;
    }
    
    .safety-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2));
      border: 1px solid rgba(255, 215, 0, 0.5);
      color: #ffd700;
    }
    
    .prop-line {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 15px 0;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .rec-btn {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 10px;
    }
    
    .rec-btn.higher {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    
    .rec-btn.lower {
      background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
    }
    
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
    }
    
    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 4px;
    }
    
    /* Combo Cards */
    .combo-card {
      background: #1a1f3a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
    }
    
    .combo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .combo-title {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .combo-safety {
      font-size: 2rem;
      font-weight: 700;
      color: #4caf50;
    }
    
    .combo-picks {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .combo-pick {
      padding: 15px;
      background: #141830;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    /* Table */
    .ranking-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .ranking-table th {
      background: #1a1f3a;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }
    
    .ranking-table td {
      padding: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .ranking-table tr:hover {
      background: #1a1f3a;
    }
    
    .rank-icon {
      font-size: 1.5rem;
      margin-right: 10px;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 40px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      body { padding: 20px 10px; }
      .header { padding: 40px 20px; }
      .logo { font-size: 2rem; }
      .header h1 { font-size: 1.8rem; }
      .picks-grid { grid-template-columns: 1fr; }
      .section { padding: 20px; }
    }
  `;
}

/**
 * Render Header
 */
function renderHeader(sport, date) {
  return `
    <div class="header">
      <div class="logo">🏆 NOVA TITAN AI</div>
      <h1>${sport} Daily Intelligence Report</h1>
      <div class="date">${date}</div>
    </div>
  `;
}

/**
 * Render Top Picks
 */
function renderTopPicks(picks) {
  if (!picks || picks.length === 0) {
    return '<div class="section"><p>No picks available for today.</p></div>';
  }
  
  const pickCards = picks.slice(0, 6).map((pick, i) => `
    <div class="pick-card ${pick.safetyScore >= 90 ? 'elite' : ''}">
      <div class="pick-header">
        <div>
          <div class="player-name">${pick.player}</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">${pick.team} vs ${pick.opponent}</div>
        </div>
        <div class="safety-badge">
          ${pick.safetyScore >= 90 ? '🏆' : '✅'} ${pick.safetyScore}
        </div>
      </div>
      
      <div>
        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem; text-transform: uppercase;">${pick.prop}</div>
        <div class="prop-line">${pick.line}</div>
        <div class="rec-btn ${pick.recommendation.toLowerCase()}">
          ${pick.recommendation === 'HIGHER' ? '▲' : '▼'} ${pick.recommendation}
        </div>
      </div>
      
      <div class="quick-stats">
        <div class="stat">
          <div class="stat-label">Hit Rate</div>
          <div class="stat-value">${(pick.metrics.hitRate * 100).toFixed(0)}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">Consistency</div>
          <div class="stat-value">${(pick.metrics.consistency * 100).toFixed(0)}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">Recent Avg</div>
          <div class="stat-value">${pick.metrics.recentAvg.toFixed(1)}</div>
        </div>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="section">
      <h2 class="section-title">🎯 Today's Top Picks</h2>
      <div class="picks-grid">
        ${pickCards}
      </div>
    </div>
  `;
}

/**
 * Render Combos
 */
function renderCombos(combos) {
  if (!combos || combos.length === 0) {
    return '';
  }
  
  const comboCards = combos.map(combo => `
    <div class="combo-card">
      <div class="combo-header">
        <div class="combo-title">${combo.size}-Pick Combo</div>
        <div class="combo-safety">${combo.combinedSafety}</div>
      </div>
      <div class="combo-picks">
        ${combo.picks.map(pick => `
          <div class="combo-pick">
            <span><strong>${pick.player}</strong> - ${pick.prop} ${pick.recommendation === 'HIGHER' ? 'Over' : 'Under'} ${pick.line}</span>
            <span style="color: #4caf50;">${pick.safetyScore}</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.875rem; color: rgba(255,255,255,0.6);">
        ${combo.reasoning}
      </div>
    </div>
  `).join('');
  
  return `
    <div class="section">
      <h2 class="section-title">🔥 Safe Streak Combos</h2>
      ${comboCards}
    </div>
  `;
}

/**
 * Render All Props Table
 */
function renderAllProps(props) {
  if (!props || props.length === 0) {
    return '';
  }
  
  const rows = props.map((pick, i) => `
    <tr>
      <td><strong>#${i + 1}</strong></td>
      <td>
        <strong>${pick.player}</strong><br>
        <span style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">${pick.team} vs ${pick.opponent}</span>
      </td>
      <td>${pick.prop} ${pick.recommendation === 'HIGHER' ? 'Over' : 'Under'} ${pick.line}</td>
      <td style="color: ${pick.safetyScore >= 90 ? '#ffd700' : pick.safetyScore >= 80 ? '#4caf50' : '#ff9800'};">
        <strong>${pick.safetyScore}</strong>
      </td>
      <td>${(pick.metrics.hitRate * 100).toFixed(0)}%</td>
    </tr>
  `).join('');
  
  return `
    <div class="section">
      <h2 class="section-title">📊 All Props (Ranked by Safety)</h2>
      <table class="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Prop</th>
            <th>Safety</th>
            <th>Hit Rate</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render Footer
 */
function renderFooter() {
  return `
    <div class="footer">
      <p><strong>Nova Titan AI</strong> - Advanced Sports Betting Analytics</p>
      <p>Generated on ${new Date().toLocaleString()}</p>
      <p><a href="https://novatitansports.netlify.app">Visit Dashboard</a></p>
    </div>
  `;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Generating daily reports...');
  
  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
  }
  
  // Generate sample data (in production, this would fetch real data)
  const sampleData = {
    topPicks: [
      {
        player: 'LeBron James',
        team: 'LAL',
        opponent: 'BOS',
        prop: 'points',
        line: 25.5,
        recommendation: 'HIGHER',
        safetyScore: 92,
        metrics: { hitRate: 0.85, consistency: 0.88, recentAvg: 27.4 }
      }
    ],
    combos: [],
    allProps: []
  };
  
  for (const sport of CONFIG.sports) {
    try {
      console.log(`Generating ${sport} report...`);
      const html = generateReport(sport, sampleData);
      
      const filename = `${sport.toLowerCase()}-${CONFIG.date}.html`;
      const filepath = path.join(CONFIG.reportDir, filename);
      
      fs.writeFileSync(filepath, html);
      console.log(`✅ ${sport} report saved: ${filename}`);
    } catch (error) {
      console.error(`❌ Error generating ${sport} report:`, error);
    }
  }
  
  // Generate index page
  generateIndexPage();
  
  console.log('🎉 All reports generated successfully!');
}

/**
 * Generate index page
 */
function generateIndexPage() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Nova Titan AI - Daily Reports</title>
    <style>
        body { 
          font-family: Inter, sans-serif; 
          background: #0a0e27; 
          color: white; 
          padding: 40px; 
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        .reports { display: grid; gap: 20px; margin-top: 40px; }
        .report-card { 
          background: #141830; 
          padding: 30px; 
          border-radius: 12px; 
          border: 1px solid rgba(255,255,255,0.1); 
          transition: all 0.3s ease;
        }
        .report-card:hover { 
          background: #1a1f3a; 
          transform: translateY(-2px); 
        }
        a { 
          color: #42a5f5; 
          text-decoration: none; 
          font-size: 1.5rem; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 Nova Titan AI - Daily Reports</h1>
        <p>Generated: ${CONFIG.date}</p>
        
        <div class="reports">
            <div class="report-card">
                <a href="./nba-${CONFIG.date}.html">🏀 NBA Report →</a>
            </div>
            <div class="report-card">
                <a href="./nfl-${CONFIG.date}.html">🏈 NFL Report →</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
  
  const filepath = path.join(CONFIG.reportDir, 'index.html');
  fs.writeFileSync(filepath, html);
  console.log('✅ Index page generated');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateReport };
