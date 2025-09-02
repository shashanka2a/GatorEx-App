#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTermsAcceptance() {
  console.log('🧪 Testing terms acceptance functionality...');
  
  try {
    // Test 1: Check if we can query users with new fields
    console.log('1️⃣ Testing user query with terms fields...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        privacyAccepted: true,
        privacyAcceptedAt: true
      },
      take: 3
    });
    
    console.log(`✅ Found ${users.length} users with terms data`);
    users.forEach(user => {
      console.log(`   - ${user.email}: terms=${user.termsAccepted}, privacy=${user.privacyAccepted}`);
    });
    
    // Test 2: Test creating a new user with terms acceptance
    console.log('2️⃣ Testing new user creation with terms...');
    const testEmail = `test-${Date.now()}@ufl.edu`;
    const now = new Date();
    
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        ufEmail: testEmail,
        ufEmailVerified: true,
        termsAccepted: true,
        termsAcceptedAt: now,
        privacyAccepted: true,
        privacyAcceptedAt: now
      }
    });
    
    console.log(`✅ Created test user: ${newUser.email}`);
    console.log(`   - Terms accepted: ${newUser.termsAccepted} at ${newUser.termsAcceptedAt}`);
    console.log(`   - Privacy accepted: ${newUser.privacyAccepted} at ${newUser.privacyAcceptedAt}`);
    
    // Test 3: Clean up test user
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    console.log('✅ Cleaned up test user');
    
    // Test 4: Check terms acceptance statistics
    console.log('3️⃣ Checking terms acceptance statistics...');
    const stats = await prisma.user.groupBy({
      by: ['termsAccepted', 'privacyAccepted'],
      _count: true
    });
    
    console.log('📊 Terms acceptance statistics:');
    stats.forEach(stat => {
      console.log(`   - Terms: ${stat.termsAccepted}, Privacy: ${stat.privacyAccepted} → ${stat._count} users`);
    });
    
    console.log('');
    console.log('🎉 All tests passed! Terms acceptance is working correctly.');
    console.log('');
    console.log('🚀 Ready to test in your app:');
    console.log('   1. Go to /verify page');
    console.log('   2. Check that terms checkboxes are required');
    console.log('   3. Verify terms acceptance is recorded in database');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testTermsAcceptance();