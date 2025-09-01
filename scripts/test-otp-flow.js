// Test the complete OTP authentication flow
const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function testOTPFlow() {
  console.log('🔐 Testing Complete OTP Authentication Flow');
  console.log('============================================\n');

  const testEmail = 'test@ufl.edu';

  try {
    // Test 1: Send OTP
    console.log('📧 Step 1: Sending OTP...');
    const sendResponse = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    if (!sendResponse.ok) {
      const error = await sendResponse.text();
      console.log('❌ Send OTP failed:', error);
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
      return;
    }

    const sendData = await sendResponse.json();
    console.log('✅ OTP sent successfully:', sendData.message);

    // In a real test, we'd get the OTP from email
    // For testing, let's check the database directly
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const otpRecord = await prisma.oTP.findFirst({
      where: { email: testEmail },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      console.log('❌ No OTP record found in database');
      return;
    }

    console.log(`✅ OTP code found: ${otpRecord.code}\n`);

    // Test 2: Verify OTP
    console.log('🔍 Step 2: Verifying OTP...');
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        code: otpRecord.code 
      }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.text();
      console.log('❌ Verify OTP failed:', error);
      return;
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ OTP verified successfully:', verifyData.message);

    // Clean up
    await prisma.oTP.deleteMany({
      where: { email: testEmail }
    });

    await prisma.$disconnect();

    console.log('\n📊 OTP Flow Test Summary');
    console.log('========================');
    console.log('Send OTP API: ✅ PASS');
    console.log('Verify OTP API: ✅ PASS');
    console.log('Database Integration: ✅ PASS');
    console.log('\n🎉 Complete OTP flow is working!');

  } catch (error) {
    console.error('❌ OTP flow test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

testOTPFlow();