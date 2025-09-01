// Test the API directly without imports
const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Testing OTP API Endpoint');
  console.log('============================\n');

  try {
    console.log('🔌 Testing server connection...');
    
    const response = await fetch('http://localhost:3000/api/auth/send-otp-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@ufl.edu'
      })
    });

    console.log(`📊 Response status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📄 Response body: ${responseText}`);

    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
      
      // Try to parse as JSON for better error info
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

testAPI();