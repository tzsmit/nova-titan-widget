// Simple manual build script
const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy index.html
fs.copyFileSync(
  path.join(__dirname, 'index.html'),
  path.join(distDir, 'index.html')
);

// Create a simple bundled version
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nova Titan Sports Widget</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 p-4">
      <div class="max-w-6xl mx-auto">
        <div class="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden min-h-96">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <img src="https://page.gensparksite.com/v1/base64_upload/b12f5870654d8f0d2849b96fdb25cab2" alt="Nova Titan Logo" class="h-14 w-auto max-w-40 drop-shadow-lg">
                <div>
                  <h1 class="text-xl font-extrabold">Nova Titan <span class="text-yellow-400">Sports</span></h1>
                  <p class="text-sm text-blue-200">Secure. Optimize. Innovate.</p>
                </div>
              </div>
              <div class="text-green-300 flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-xs font-bold">LIVE</span>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">🏈 Today's Games</h2>
            
            <!-- Game Cards -->
            <div class="grid gap-6">
              <!-- Game 1 -->
              <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="font-semibold text-gray-900">NBA • 8:00 PM</span>
                  </div>
                  <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">LIVE ODDS</span>
                </div>
                
                <!-- Teams -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">LAL</div>
                      <div>
                        <div class="font-semibold text-gray-900">Los Angeles Lakers</div>
                        <div class="text-sm text-gray-500">38-27</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">BOS</div>
                    <div>
                      <div class="font-semibold text-gray-900">Boston Celtics</div>
                      <div class="text-sm text-gray-500">45-20</div>
                    </div>
                  </div>
                </div>
                
                <!-- Odds -->
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">Moneyline</div>
                    <div class="font-semibold text-gray-900">-150</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">Spread</div>
                    <div class="font-semibold text-gray-900">-3.5</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">Total</div>
                    <div class="font-semibold text-gray-900">O/U 218.5</div>
                  </div>
                </div>
                
                <!-- AI Prediction -->
                <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="flex items-center space-x-2">
                        <span>🤖</span>
                        <span class="font-semibold text-gray-900">AI Prediction: BOS Win</span>
                      </div>
                      <div class="text-sm text-gray-600 mt-1">67.5% probability • 78.2% confidence</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-lg text-blue-600">+8.3% EV</div>
                      <div class="text-sm text-gray-600">Recommended</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Demo Message -->
            <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center space-x-2 text-yellow-800">
                <span>⚠️</span>
                <span class="font-semibold">Demo Version</span>
              </div>
              <p class="text-sm text-yellow-700 mt-1">This is a demo with mock data. Connect to a live sports API for real-time data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log('✅ Manual build complete! Files created in /dist directory');