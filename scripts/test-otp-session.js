#!/usr/bin/env node

/**
 * Test script to verify OTP login and session creation
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test@ufl.edu';

async function testOTPFlow() {
  console.log('🧪 Testing OTP Login Flow...\n');

  try {
    // Step 1: Send OTP
    console.log('📧 Step 1: Sending OTP...');
    const sendResponse = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    const sendData = await sendResponse.json();
    console.log('Send OTP Response:', sendData);

    if (!sendResponse.ok) {
      console.error('❌ Failed to send OTP:', sendData.error);
      return;
    }

    console.log('✅ OTP sent successfully\n');

    // Step 2: Get the OTP from database (for testing)
    console.log('🔍 Step 2: Getting OTP from database...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const otpRecord = await prisma.oTP.findFirst({
      where: { email: TEST_EMAIL },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      console.error('❌ No OTP found in database');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Found OTP:', otpRecord.code);

    // Step 3: Verify OTP
    console.log('\n🔐 Step 3: Verifying OTP...');
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: TEST_EMAIL, 
        code: otpRecord.code 
      })
    });

    const verifyData = await verifyResponse.json();
    console.log('Verify OTP Response:', verifyData);

    if (!verifyResponse.ok) {
      console.error('❌ Failed to verify OTP:', verifyData.error);
      await prisma.$disconnect();
      return;
    }

    console.log('✅ OTP verified successfully');

    // Step 4: Check if session was created
    console.log('\n🍪 Step 4: Checking session creation...');
    const cookies = verifyResponse.headers.get('set-cookie');
    console.log('Session cookies:', cookies);

    if (cookies && cookies.includes('next-auth.session-token')) {
      console.log('✅ Session cookie created successfully');
    } else {
      console.log('⚠️  No session cookie found');
    }

    // Step 5: Test authenticated endpoint
    console.log('\n🔒 Step 5: Testing authenticated endpoint...');
    
    // Extract session token from cookies
    let sessionToken = null;
    if (cookies) {
      const tokenMatch = cookies.match(/next-auth\.session-token=([^;]+)/);
      if (tokenMatch) {
        sessionToken = tokenMatch[1];
      }
    }

    if (sessionToken) {
      const profileResponse = await fetch(`${BASE_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': `next-auth.session-token=${sessionToken}`
        },
        body: JSON.stringify({ 
          name: 'Test User', 
          phoneNumber: '3521234567' 
        })
      });

      const profileData = await profileResponse.json();
      console.log('Complete Profile Response:', profileData);

      if (profileResponse.ok) {
        console.log('✅ Authenticated request successful');
      } else {
        console.log('❌ Authenticated request failed:', profileData.error);
      }
    } else {
      console.log('⚠️  No session token to test with');
    }

    await prisma.$disconnect();
    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOTPFlow();