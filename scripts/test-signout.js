// Test script to verify signout functionality
import fetch from 'node-fetch';

async function testSignout() {
  console.log('🧪 Testing signout functionality...');
  
  try {
    // Test the signout API endpoint
    const response = await fetch('http://localhost:3000/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 307 || response.status === 302) {
      console.log('✅ Signout redirect working correctly');
      console.log('📍 Redirect location:', response.headers.get('location'));
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing signout:', error.message);
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSignout();
}

export { testSignout };
