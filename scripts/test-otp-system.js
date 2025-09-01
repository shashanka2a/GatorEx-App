// Test the OTP authentication system
require('dotenv').config();

async function testOTPSystem() {
  console.log('🔢 Testing OTP Authentication System');
  console.log('===================================\n');
  
  const testEmail = 'your-email@ufl.edu'; // Replace with your actual email
  
  console.log('⚠️  IMPORTANT: Replace testEmail with your actual UF email first!\n');
  
  if (testEmail === 'your-email@ufl.edu') {
    console.log('❌ Please update the testEmail variable with your real email address');
    console.log('   Then run this script again to test OTP sending\n');
    return;
  }
  
  try {
    console.log(`📧 Testing OTP send to: ${testEmail}`);
    
    // Test sending OTP
    const sendResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const sendData = await sendResponse.json();
    
    if (sendResponse.ok) {
      console.log('✅ OTP sent successfully!');
      console.log(`📬 Message: ${sendData.message}`);
      console.log('\n💡 Next steps:');
      console.log('1. Check your email for the 6-digit code');
      console.log('2. Go to: http://localhost:3000/login-otp');
      console.log('3. Enter your email and the code you received');
      console.log('4. Complete the login process');
    } else {
      console.log('❌ Failed to send OTP');
      console.log(`Error: ${sendData.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your dev server is running:');
      console.log('   npm run dev');
    }
  }
}

console.log('🚀 Starting OTP System Test');
console.log('Make sure your dev server is running: npm run dev\n');

testOTPSystem();