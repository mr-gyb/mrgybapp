#!/usr/bin/env node

/**
 * Test script to verify all OAuth authentication routes
 * Run with: node test-auth-routes.js
 */

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testRoute(name, endpoint, method = 'GET') {
  logInfo(`Testing ${name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));

    if (response.ok && data.success && data.authUrl) {
      logSuccess(`${name}: Route exists and returns valid OAuth URL`);
      
      // Validate URL format
      try {
        const url = new URL(data.authUrl);
        if (url.hostname.includes('google.com') || url.hostname.includes('facebook.com')) {
          logSuccess(`${name}: OAuth URL format is valid (${url.hostname})`);
        } else {
          logWarning(`${name}: OAuth URL hostname is unexpected: ${url.hostname}`);
        }
        
        // Check for required parameters
        const params = url.searchParams;
        if (params.has('client_id') || params.has('client_id')) {
          logSuccess(`${name}: OAuth URL contains client_id parameter`);
        } else {
          logWarning(`${name}: OAuth URL missing client_id parameter`);
        }
        
        if (params.has('redirect_uri') || params.has('redirect_uri')) {
          logSuccess(`${name}: OAuth URL contains redirect_uri parameter`);
          const redirectUri = params.get('redirect_uri') || params.get('redirect_uri');
          logInfo(`  Redirect URI: ${redirectUri}`);
        } else {
          logWarning(`${name}: OAuth URL missing redirect_uri parameter`);
        }
        
        if (params.has('scope') || params.has('scope')) {
          logSuccess(`${name}: OAuth URL contains scope parameter`);
        } else {
          logWarning(`${name}: OAuth URL missing scope parameter`);
        }
        
        if (params.has('state')) {
          logSuccess(`${name}: OAuth URL contains state parameter (CSRF protection)`);
        } else {
          logWarning(`${name}: OAuth URL missing state parameter`);
        }
        
      } catch (urlError) {
        logError(`${name}: OAuth URL is not a valid URL: ${data.authUrl}`);
      }
      
      // Check response structure
      if (data.state) {
        logSuccess(`${name}: Response includes state for CSRF protection`);
      }
      
      if (data.requestId) {
        logSuccess(`${name}: Response includes requestId for tracking`);
      }
      
      return { success: true, data };
    } else {
      logError(`${name}: Route returned error`);
      logError(`  Status: ${response.status} ${response.statusText}`);
      logError(`  Error: ${data.error || data.message || 'Unknown error'}`);
      
      if (data.error && data.error.includes('not configured')) {
        logWarning(`  This is expected if OAuth credentials are not set in .env file`);
        logWarning(`  Required: ${name === 'YouTube' ? 'YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET' : 'FACEBOOK_APP_ID, FACEBOOK_APP_SECRET'}`);
      }
      
      return { success: false, error: data.error || data.message };
    }
  } catch (error) {
    logError(`${name}: Failed to connect to backend`);
    logError(`  Error: ${error.message}`);
    logError(`  Make sure the backend server is running on ${BASE_URL}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('OAuth Authentication Routes Test Suite', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  logInfo(`Backend URL: ${BASE_URL}\n`);
  
  const results = {
    youtube: await testRoute('YouTube OAuth', '/api/youtube/auth-url'),
    facebook: await testRoute('Facebook OAuth', '/api/facebook/auth/url'),
    instagram: await testRoute('Instagram OAuth', '/api/instagram/auth/url'),
  };
  
  log('\n' + '='.repeat(60), 'cyan');
  log('Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  log(`\nTotal Routes Tested: ${totalCount}`);
  log(`Successful: ${successCount}`, successCount === totalCount ? 'green' : 'yellow');
  log(`Failed: ${totalCount - successCount}`, successCount === totalCount ? 'green' : 'red');
  
  if (successCount === totalCount) {
    logSuccess('\n🎉 All OAuth routes are working correctly!');
  } else {
    logWarning('\n⚠️  Some routes failed. Check the errors above.');
    logInfo('\nNext steps:');
    logInfo('1. Ensure backend server is running: npm start (in backend directory)');
    logInfo('2. Check .env file has required OAuth credentials');
    logInfo('3. Verify redirect URIs match your OAuth app settings');
  }
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
  
  process.exit(successCount === totalCount ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});

