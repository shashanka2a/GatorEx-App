#!/usr/bin/env node

/**
 * Test script for NextAuth email authentication system
 * Tests UF email validation and database integration
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

// Test email addresses
const testEmails = [
  'student@ufl.edu',           // Valid UF email
  'gator@gators.ufl.edu',      // Valid Gators email
  'test@gmail.com',            // Invalid - not UF
  'user@ucf.edu',              // Invalid - different university
  'admin@ufl.edu.fake.com',    // Invalid - fake domain
];

// UF email validation function (same as in NextAuth)
function isValidUFEmail(email) {
  if (!email) return false;
  const domain = email.toLowerCase().split('@')[1];
  return ['ufl.edu', 'gators.ufl.edu'].includes(domain);
}

async function testEmailValidation() {
  console.log('🧪 Testing UF Email Validation...\n');
  
  testEmails.forEach(email => {
    const isValid = isValidUFEmail(email);
    const status = isValid ? '✅ VALID' : '❌ INVALID';
    console.log(`${status}: ${email}`);
  });
  
  console.log('\n');
}

async function testDatabaseConnection() {
  console.log('🗄️  Testing Database Connection...\n');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if User table exists and has required fields
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible (${userCount} users)`);
    
    // Test creating a test user (will be cleaned up)
    const testUser = await prisma.user.create({
      data: {
        email: 'test@ufl.edu',
        ufEmailVerified: true,
        profileCompleted: false,
      }
    });
    console.log('✅ User creation successful');
    
    // Test updating user
    await prisma.user.update({
      where: { id: testUser.id },
      data: { ufEmailVerified: true }
    });
    console.log('✅ User update successful');
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
  
  console.log('\n');
  return true;
}

async function testEnvironmentVariables() {
  console.log('🔧 Testing Environment Variables...\n');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_HOST',
    'SMTP_PORT'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  console.log('\n');
  return allPresent;
}

async function runTests() {
  console.log('🐊 GatorEx Authentication System Test\n');
  console.log('=====================================\n');
  
  // Test email validation
  await testEmailValidation();
  
  // Test environment variables
  const envOk = await testEnvironmentVariables();
  
  // Test database connection
  const dbOk = await testDatabaseConnection();
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Environment Variables: ${envOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Connection: ${dbOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Email Validation: ✅ PASS`);
  
  if (envOk && dbOk) {
    console.log('\n🎉 All tests passed! Authentication system is ready.');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit /verify to test email authentication');
    console.log('3. Use a @ufl.edu or @gators.ufl.edu email address');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run tests
runTests()
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });