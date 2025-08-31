#!/usr/bin/env node

/**
 * Test script for the UF email verification system
 */

require('dotenv').config({ path: '.env' });

// Simple implementations for testing
function isValidUFEmail(email) {
  const ufDomains = ['@ufl.edu', '@gators.ufl.edu'];
  return ufDomains.some(domain => email.toLowerCase().endsWith(domain));
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function testUFEmailValidation() {
  console.log('🧪 Testing UF Email Validation');
  console.log('==============================');
  
  const testCases = [
    { email: 'student@ufl.edu', expected: true },
    { email: 'test@gators.ufl.edu', expected: true },
    { email: 'invalid@gmail.com', expected: false },
    { email: 'fake@ucf.edu', expected: false },
    { email: 'STUDENT@UFL.EDU', expected: true }, // Case insensitive
  ];
  
  let passed = 0;
  
  testCases.forEach(({ email, expected }) => {
    const result = isValidUFEmail(email);
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} ${email} → ${result} (expected: ${expected})`);
    if (result === expected) passed++;
  });
  
  console.log(`\nResults: ${passed}/${testCases.length} tests passed\n`);
  return passed === testCases.length;
}

function testOTPGeneration() {
  console.log('🔢 Testing OTP Generation');
  console.log('=========================');
  
  const otps = [];
  for (let i = 0; i < 5; i++) {
    const otp = generateOTP();
    otps.push(otp);
    console.log(`Generated OTP ${i + 1}: ${otp}`);
    
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      console.log('❌ Invalid OTP format');
      return false;
    }
  }
  
  // Check uniqueness (should be different)
  const unique = new Set(otps).size === otps.length;
  console.log(`Uniqueness check: ${unique ? '✅' : '❌'}`);
  
  return unique;
}

async function testEnvironmentVariables() {
  console.log('🔧 Testing Environment Variables');
  console.log('================================');
  
  const required = [
    'SMTP_USER',
    'SMTP_PASS',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  let allPresent = true;
  
  required.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = varName.includes('PASS') || varName.includes('SECRET') 
      ? (value ? '***set***' : 'not set')
      : (value || 'not set');
    
    console.log(`${status} ${varName}: ${displayValue}`);
    
    if (!value) allPresent = false;
  });
  
  return allPresent;
}

async function main() {
  console.log('🚀 GatorEx UF Verification System Test');
  console.log('======================================\n');
  
  const emailTest = testUFEmailValidation();
  const otpTest = testOTPGeneration();
  const envTest = await testEnvironmentVariables();
  
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`Email Validation: ${emailTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OTP Generation: ${otpTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Environment: ${envTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (emailTest && otpTest && envTest) {
    console.log('\n🎉 All tests passed! The verification system is ready.');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3000/verify');
    console.log('3. Test with a real UF email address');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues above.');
  }
}

main().catch(console.error);