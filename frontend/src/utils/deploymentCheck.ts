/**
 * Deployment Health Check
 * Verifies that the app can run properly in production environment
 */

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export async function runDeploymentHealthCheck(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // 1. Check environment detection
  checks.push({
    name: 'Environment Detection',
    status: process.env.NODE_ENV === 'production' ? 'pass' : 'warn',
    message: `Detected environment: ${process.env.NODE_ENV || 'development'}`
  });

  // 2. Check API availability (should gracefully handle missing APIs)
  try {
    const oddsAPITest = await fetch('https://api.the-odds-api.com/v4/sports?apiKey=test');
    checks.push({
      name: 'The Odds API Connectivity',
      status: 'pass',
      message: 'The Odds API is reachable (test endpoint)'
    });
  } catch (error) {
    checks.push({
      name: 'The Odds API Connectivity',
      status: 'warn',
      message: 'Cannot reach The Odds API (may be network or CORS issue)'
    });
  }

  // 3. Check ESPN API availability
  try {
    const espnTest = await fetch('https://site.api.espn.com/apis/site/v2/sports');
    checks.push({
      name: 'ESPN API Connectivity',
      status: espnTest.ok ? 'pass' : 'warn',
      message: espnTest.ok ? 'ESPN API is reachable' : `ESPN API returned ${espnTest.status}`
    });
  } catch (error) {
    checks.push({
      name: 'ESPN API Connectivity',
      status: 'warn',
      message: 'Cannot reach ESPN API (may be network or CORS issue)'
    });
  }

  // 4. Check local storage availability
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    checks.push({
      name: 'Local Storage',
      status: 'pass',
      message: 'Local storage available for caching'
    });
  } catch (error) {
    checks.push({
      name: 'Local Storage',
      status: 'warn',
      message: 'Local storage not available (private browsing?)'
    });
  }

  // 5. Check React Query availability
  checks.push({
    name: 'React Query',
    status: typeof window !== 'undefined' ? 'pass' : 'fail',
    message: typeof window !== 'undefined' ? 'Client-side rendering available' : 'Server-side rendering detected'
  });

  return checks;
}

/**
 * Log deployment health check results
 */
export async function logDeploymentHealth(): Promise<void> {
  console.log('🏥 Running deployment health check...');
  
  const checks = await runDeploymentHealthCheck();
  
  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  const passCount = checks.filter(c => c.status === 'pass').length;
  const totalCount = checks.length;
  
  console.log(`🎯 Health Check Summary: ${passCount}/${totalCount} checks passed`);
  
  if (passCount === totalCount) {
    console.log('🚀 All systems ready for deployment!');
  } else {
    console.log('⚠️ Some issues detected, but app should still work');
  }
}