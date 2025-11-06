/**
 * Token Refresh Testing Utility
 * 
 * USAGE:
 * 1. Open your app in the browser (make sure you're logged in)
 * 2. Open DevTools Console (F12)
 * 3. Copy and paste the functions below into the console
 * 4. Run: testTokenRefresh()
 * 
 * Note: This script is meant to be pasted in the console, not loaded as a module.
 * The dynamic imports don't work from public folder.
 */

// Helper function to test token refresh
window.testTokenRefresh = async function() {
  console.log('🧪 Starting Token Refresh Test...\n');
  
  try {
    // Get the backendApi module from the global scope (injected by your app)
    // Or use fetch directly to test
    
    console.log('✅ Test 1: Checking current token status');
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken || !refreshToken) {
      console.error('❌ No tokens found. Please login first!');
      return;
    }
    
    console.log('✅ Tokens found in localStorage');
    console.log('---\n');
    
    // Test 2: Make a normal request
    console.log('✅ Test 2: Making normal API request...');
    const response1 = await fetch('http://localhost:8000/api/salons/public', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('Response status:', response1.status);
    if (response1.ok) {
      console.log('✅ Normal request successful');
    }
    console.log('---\n');
    
    // Test 3: Expire token and test auto-refresh
    console.log('🔧 Test 3: Expiring access token manually...');
    localStorage.setItem('access_token', 'expired_token_for_testing');
    console.log('Token expired. Now navigate to any page in the app...');
    console.log('📝 Watch the Network tab:');
    console.log('   1. API call → 401');
    console.log('   2. POST /api/auth/refresh → 200');
    console.log('   3. API call retry → 200');
    console.log('---\n');
    
    console.log('✅ Test setup complete!');
    console.log('💡 Now navigate around your app (e.g., go to Salons page)');
    console.log('💡 The token will auto-refresh seamlessly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Helper function to simulate multiple users scenario
window.testMultipleUsersScenario = function() {
  console.log('🧪 Testing Multiple Users Scenario...\n');
  console.log('🔧 Expiring token...');
  localStorage.setItem('access_token', 'expired_token');
  console.log('✅ Token expired!');
  console.log('');
  console.log('💡 Now open a page that makes multiple API calls (like Dashboard)');
  console.log('📝 Watch Network tab - you should see:');
  console.log('   - Multiple API calls fail with 401');
  console.log('   - Only ONE /api/auth/refresh call');
  console.log('   - All API calls retry and succeed with 200');
}

// Helper to check current token status
window.checkTokenStatus = function() {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  console.log('🔍 Current Token Status:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : '❌ Not found');
  console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : '❌ Not found');
  
  if (accessToken) {
    try {
      // Try to decode JWT (basic validation)
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const exp = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = exp < now;
        
        console.log('Token Expiry:', exp.toLocaleString());
        console.log('Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
        console.log('Time remaining:', isExpired ? '0s' : `${Math.floor((exp - now) / 1000)}s`);
      }
    } catch (e) {
      console.log('⚠️ Could not decode token (might be opaque token)');
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Auto-run setup message
console.log(`
╔══════════════════════════════════════════════════╗
║  Token Refresh Testing Utility Loaded           ║
╚══════════════════════════════════════════════════╝

Available commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. testTokenRefresh()          - Set up token expiry test
2. testMultipleUsersScenario()  - Set up multiple requests test  
3. checkTokenStatus()           - Check current token status

Quick Start:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Make sure you're logged in
2. Run: testTokenRefresh()
3. Navigate to any page (e.g., Salons)
4. Watch Network tab for automatic token refresh!

Expected Network Flow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When token expires:
  1. API call → 401 Unauthorized
  2. Token refresh → 200 OK
  3. API call retry → 200 OK (with new token)

Only ONE refresh should happen, even with multiple requests!
`);
