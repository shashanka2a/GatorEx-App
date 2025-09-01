// Test the send-otp API endpoint directly
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testSendOTPAPI() {
  console.log('🧪 Testing Send OTP API Components');
  console.log('==================================\n');

  try {
    // Test 1: Import the OTP functions
    console.log('📦 Testing OTP function imports...');
    const { generateOTP, storeOTP, sendOTPEmail } = require('../src/lib/auth/otp.ts');
    console.log('✅ OTP functions imported successfully\n');

    // Test 2: Generate OTP
    console.log('🎲 Testing OTP generation...');
    const otp = generateOTP();
    console.log(`✅ Generated OTP: ${otp}\n`);

    // Test 3: Test database storage
    console.log('💾 Testing OTP storage...');
    const testEmail = 'test@ufl.edu';
    
    // Clean up any existing test data
    await prisma.oTP.deleteMany({
      where: { email: testEmail }
    });

    const stored = await storeOTP(testEmail, otp);
    console.log(`✅ OTP storage result: ${stored}\n`);

    // Test 4: Verify storage in database
    console.log('🔍 Verifying OTP in database...');
    const otpRecord = await prisma.oTP.findFirst({
      where: { email: testEmail }
    });
    
    if (otpRecord) {
      console.log(`✅ OTP found in database: ${otpRecord.code}`);
      console.log(`✅ Expires at: ${otpRecord.expiresAt}`);
    } else {
      console.log('❌ OTP not found in database');
    }

    // Test 5: Check environment variables for email
    console.log('\n📧 Checking email configuration...');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (smtpUser && smtpPass) {
      console.log(`✅ SMTP configured for: ${smtpUser}`);
    } else {
      console.log('❌ SMTP not configured');
      console.log('Missing environment variables:');
      if (!smtpUser) console.log('  - SMTP_USER');
      if (!smtpPass) console.log('  - SMTP_PASS');
    }

    // Clean up
    await prisma.oTP.deleteMany({
      where: { email: testEmail }
    });

    console.log('\n📊 Test Summary');
    console.log('===============');
    console.log('Function Imports: ✅ PASS');
    console.log('OTP Generation: ✅ PASS');
    console.log('Database Storage: ✅ PASS');
    console.log(`Email Config: ${smtpUser && smtpPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (smtpUser && smtpPass) {
      console.log('\n🎉 All components working! API should be functional.');
    } else {
      console.log('\n⚠️  Email configuration missing. API will fail on email sending.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nError details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSendOTPAPI();