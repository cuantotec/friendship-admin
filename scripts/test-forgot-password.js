// Test script to verify forgot password functionality
import fetch from 'node-fetch';

async function testForgotPassword() {
  console.log('🧪 Testing forgot password functionality...');
  
  try {
    // Test the forgot password page loads
    const response = await fetch('http://localhost:3000/forgot-password');
    
    console.log('📊 Forgot password page status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Forgot password page loads correctly');
    } else {
      console.log('❌ Forgot password page failed to load');
    }
    
    // Test the reset password page loads
    const resetResponse = await fetch('http://localhost:3000/reset-password');
    
    console.log('📊 Reset password page status:', resetResponse.status);
    
    if (resetResponse.status === 200) {
      console.log('✅ Reset password page loads correctly');
    } else {
      console.log('❌ Reset password page failed to load');
    }
    
  } catch (error) {
    console.error('❌ Error testing forgot password:', error.message);
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testForgotPassword();
}

export { testForgotPassword };
