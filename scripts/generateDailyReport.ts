#!/usr/bin/env ts-node
/**
 * Daily Report Generator
 * Generates beautiful HTML reports with today's safest picks
 * Run: npm run generate-report or node scripts/generateDailyReport.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

interface DailyPick {
  rank: number;
  medal: string;
  player: string;
  prop: string;
  line: number;
  pick: 'HIGHER' | 'LOWER';
  safetyScore: number;
  confidence: number;
  reasoning: string;
  team: string;
  opponent: string;
  gameTime: string;
}

interface DailyReport {
  date: string;
  title: string;
  sport: 'NBA' | 'NFL';
  picks: DailyPick[];
  topCombo: {
    name: string;
    picks: string[];
    safetyScore: number;
    expectedHitRate: number;
  };
  disclaimer: string;
}

class DailyReportGenerator {
  private readonly REPORTS_DIR = path.join(__dirname, '../reports');
  private readonly TEMPLATE_PATH = path.join(__dirname, '../templates/daily-report-template.html');

  constructor() {
    this.ensureReportsDirectory();
  }

  /**
   * Generate today's report
   */
  async generateTodayReport(sport: 'NBA' | 'NFL' = 'NBA'): Promise<string> {
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log(`📊 Generating ${sport} report for ${today}...`);

    // In production, fetch real data from analytics engines
    // For now, generate demo data
    const reportData = this.generateDemoReportData(today, sport);

    // Generate HTML
    const html = this.generateHTML(reportData);

    // Save to file
    const filename = `${sport.toLowerCase()}-${today}.html`;
    const filepath = path.join(this.REPORTS_DIR, filename);
    fs.writeFileSync(filepath, html, 'utf8');

    console.log(`✅ Report saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate reports for both NBA and NFL
   */
  async generateAllReports(): Promise<string[]> {
    const reports = [];
    
    // NBA Report
    try {
      const nbaReport = await this.generateTodayReport('NBA');
      reports.push(nbaReport);
    } catch (error) {
      console.error('Error generating NBA report:', error);
    }

    // NFL Report
    try {
      const nflReport = await this.generateTodayReport('NFL');
      reports.push(nflReport);
    } catch (error) {
      console.error('Error generating NFL report:', error);
    }

    return reports;
  }

  // ============ PRIVATE METHODS ============

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.REPORTS_DIR)) {
      fs.mkdirSync(this.REPORTS_DIR, { recursive: true });
    }
  }

  private generateDemoReportData(date: string, sport: 'NBA' | 'NFL'): DailyReport {
    const picks: DailyPick[] = sport === 'NBA' ? [
      {
        rank: 1,
        medal: '🥇',
        player: 'Luka Doncic',
        prop: 'points',
        line: 27.5,
        pick: 'HIGHER',
        safetyScore: 92,
        confidence: 88,
        reasoning: 'Elite safety profile, 85% consistency rate, Strong upward trend',
        team: 'DAL',
        opponent: 'LAL',
        gameTime: '7:30 PM ET'
      },
      {
        rank: 2,
        medal: '🥈',
        player: 'Nikola Jokic',
        prop: 'rebounds',
        line: 10.5,
        pick: 'HIGHER',
        safetyScore: 90,
        confidence: 86,
        reasoning: 'Excellent consistency, Low variance = predictable',
        team: 'DEN',
        opponent: 'GSW',
        gameTime: '10:00 PM ET'
      },
      {
        rank: 3,
        medal: '🥉',
        player: 'Giannis Antetokounmpo',
        prop: 'points',
        line: 29.5,
        pick: 'HIGHER',
        safetyScore: 88,
        confidence: 84,
        reasoning: 'Solid track record, 82% consistency rate',
        team: 'MIL',
        opponent: 'BOS',
        gameTime: '7:00 PM ET'
      }
    ] : [
      {
        rank: 1,
        medal: '🥇',
        player: 'Patrick Mahomes',
        prop: 'passing_yards',
        line: 275.5,
        pick: 'HIGHER',
        safetyScore: 91,
        confidence: 87,
        reasoning: 'Elite safety profile, Favorable matchup history',
        team: 'KC',
        opponent: 'LV',
        gameTime: '1:00 PM ET'
      },
      {
        rank: 2,
        medal: '🥈',
        player: 'Christian McCaffrey',
        prop: 'rushing_yards',
        line: 85.5,
        pick: 'HIGHER',
        safetyScore: 89,
        confidence: 85,
        reasoning: 'Excellent consistency, Strong recent form',
        team: 'SF',
        opponent: 'SEA',
        gameTime: '4:05 PM ET'
      }
    ];

    return {
      date,
      title: `Nova Titan ${sport} Daily Report`,
      sport,
      picks,
      topCombo: {
        name: 'Ultra Safe 2-Pick',
        picks: picks.slice(0, 2).map(p => `${p.player} ${p.pick} ${p.line} ${p.prop}`),
        safetyScore: Math.round((picks[0].safetyScore + picks[1].safetyScore) / 2),
        expectedHitRate: 0.75
      },
      disclaimer: 'For entertainment purposes only. Gambling involves risk. Please bet responsibly.'
    };
  }

  private generateHTML(data: DailyReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - ${data.date}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f1b3c 0%, #1e3a5f 50%, #2d5a87 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4a90e2 0%, #2d5a87 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header .date {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .content {
            padding: 40px 20px;
        }
        .section-title {
            font-size: 1.8rem;
            color: #1a365d;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #4a90e2;
        }
        .picks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .pick-card {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .pick-card:hover {
            border-color: #4a90e2;
            box-shadow: 0 8px 25px rgba(74, 144, 226, 0.2);
            transform: translateY(-2px);
        }
        .pick-header {
            display: flex;
            justify-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .pick-medal {
            font-size: 2rem;
        }
        .pick-safety {
            background: #10b981;
            color: white;
            padding: 5px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.9rem;
        }
        .pick-player {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .pick-details {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        .pick-action {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4a90e2;
        }
        .pick-line {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
        }
        .pick-prop {
            font-size: 0.9rem;
            color: #6b7280;
            text-transform: uppercase;
        }
        .pick-reasoning {
            font-size: 0.9rem;
            color: #4b5563;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        .pick-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: #6b7280;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
        }
        .combo-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 40px;
        }
        .combo-card h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
        }
        .combo-picks {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .combo-pick-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            font-size: 1.1rem;
        }
        .combo-pick-num {
            background: white;
            color: #667eea;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
        }
        .combo-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .combo-stat {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .combo-stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        .combo-stat-value {
            font-size: 2rem;
            font-weight: bold;
        }
        .disclaimer {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin-top: 40px;
            border-radius: 4px;
        }
        .disclaimer strong {
            color: #92400e;
        }
        .footer {
            text-align: center;
            padding: 30px 20px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            .picks-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 ${data.title}</h1>
            <div class="date">${format(new Date(data.date), 'EEEE, MMMM d, yyyy')}</div>
            <p style="margin-top: 15px; opacity: 0.95;">AI-Powered Betting Intelligence • Secure • Optimize • Innovate</p>
        </div>

        <div class="content">
            <h2 class="section-title">🎯 Top Safe Picks Today</h2>
            <div class="picks-grid">
                ${data.picks.map(pick => `
                    <div class="pick-card">
                        <div class="pick-header">
                            <span class="pick-medal">${pick.medal}</span>
                            <span class="pick-safety">Safety: ${pick.safetyScore}</span>
                        </div>
                        <div class="pick-player">${pick.player}</div>
                        <div class="pick-details">
                            <span class="pick-action">${pick.pick}</span>
                            <span class="pick-line">${pick.line}</span>
                            <span class="pick-prop">${pick.prop.replace('_', ' ')}</span>
                        </div>
                        <div class="pick-reasoning">${pick.reasoning}</div>
                        <div class="pick-meta">
                            <span>${pick.team} vs ${pick.opponent}</span>
                            <span>${pick.gameTime}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="combo-card">
                <h2>🔥 ${data.topCombo.name}</h2>
                <div class="combo-picks">
                    ${data.topCombo.picks.map((pick, i) => `
                        <div class="combo-pick-item">
                            <span class="combo-pick-num">${i + 1}</span>
                            <span>${pick}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="combo-stats">
                    <div class="combo-stat">
                        <div class="combo-stat-label">Combined Safety</div>
                        <div class="combo-stat-value">${data.topCombo.safetyScore}</div>
                    </div>
                    <div class="combo-stat">
                        <div class="combo-stat-label">Expected Hit Rate</div>
                        <div class="combo-stat-value">${(data.topCombo.expectedHitRate * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>

            <div class="disclaimer">
                <strong>⚠️ Disclaimer:</strong> ${data.disclaimer}
            </div>
        </div>

        <div class="footer">
            <p><strong>Nova Titan AI Prestine</strong></p>
            <p>Secure. Optimize. Innovate.</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Nova Titan Sports. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// CLI execution
if (require.main === module) {
  const generator = new DailyReportGenerator();
  
  const sport = process.argv[2]?.toUpperCase() as 'NBA' | 'NFL' | undefined;
  
  if (sport && ['NBA', 'NFL'].includes(sport)) {
    generator.generateTodayReport(sport)
      .then((filepath) => {
        console.log(`\n✅ Report generated successfully!`);
        console.log(`📄 File: ${filepath}\n`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Error generating report:', error);
        process.exit(1);
      });
  } else {
    generator.generateAllReports()
      .then((reports) => {
        console.log(`\n✅ ${reports.length} reports generated successfully!`);
        reports.forEach(r => console.log(`📄 ${r}`));
        console.log('');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Error generating reports:', error);
        process.exit(1);
      });
  }
}

export { DailyReportGenerator };
