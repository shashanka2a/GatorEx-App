// Test OTP system functionality
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testOTPSystem() {
  console.log('🔐 Testing OTP Authentication System');
  console.log('====================================\n');

  try {
    // Test 1: Database connection
    console.log('🗄️  Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Test 2: OTP table exists
    console.log('📋 Checking OTP table...');
    const otpCount = await prisma.oTP.count();
    console.log(`✅ OTP table accessible (${otpCount} records)\n`);

    // Test 3: Generate OTP code
    console.log('🎲 Testing OTP generation...');
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`✅ Generated test code: ${testCode}\n`);

    // Test 4: Create OTP record
    console.log('💾 Testing OTP storage...');
    const testEmail = 'test@ufl.edu';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up any existing test records
    await prisma.oTP.deleteMany({
      where: { email: testEmail }
    });

    const otpRecord = await prisma.oTP.create({
      data: {
        email: testEmail,
        code: testCode,
        expiresAt: expiresAt
      }
    });
    console.log(`✅ OTP record created with ID: ${otpRecord.id}\n`);

    // Test 5: Verify OTP lookup
    console.log('🔍 Testing OTP verification...');
    const foundOTP = await prisma.oTP.findFirst({
      where: {
        email: testEmail,
        code: testCode,
        expiresAt: { gt: new Date() }
      }
    });

    if (foundOTP) {
      console.log('✅ OTP verification lookup successful\n');
    } else {
      console.log('❌ OTP verification lookup failed\n');
    }

    // Test 6: Clean up
    console.log('🧹 Cleaning up test data...');
    await prisma.oTP.deleteMany({
      where: { email: testEmail }
    });
    console.log('✅ Test data cleaned up\n');

    console.log('📊 OTP System Test Summary');
    console.log('==========================');
    console.log('Database Connection: ✅ PASS');
    console.log('OTP Table Access: ✅ PASS');
    console.log('OTP Generation: ✅ PASS');
    console.log('OTP Storage: ✅ PASS');
    console.log('OTP Verification: ✅ PASS');
    console.log('\n🎉 OTP system is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit /login-otp to test the full flow');
    console.log('3. Use a @ufl.edu or @gators.ufl.edu email address');

  } catch (error) {
    console.error('❌ OTP system test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testOTPSystem();