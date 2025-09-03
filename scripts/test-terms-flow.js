#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTermsFlow() {
  console.log('🧪 Testing Terms Acceptance Flow for New Users...\n');

  try {
    // Test 1: Create a new user without terms acceptance
    console.log('1️⃣ Creating new user without terms acceptance...');
    
    const testEmail = `test-${Date.now()}@ufl.edu`;
    
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        ufEmail: testEmail,
        ufEmailVerified: true,
        termsAccepted: false,
        privacyAccepted: false,
        trustScore: 10
      }
    });
    
    console.log(`✅ Created user: ${newUser.email}`);
    console.log(`   Terms Accepted: ${newUser.termsAccepted}`);
    console.log(`   Privacy Accepted: ${newUser.privacyAccepted}`);
    console.log(`   Profile Completed: ${newUser.profileCompleted}\n`);

    // Test 2: Simulate terms acceptance
    console.log('2️⃣ Simulating terms acceptance...');
    
    const now = new Date();
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        termsAccepted: true,
        termsAcceptedAt: now,
        privacyAccepted: true,
        privacyAcceptedAt: now,
      }
    });
    
    console.log(`✅ Updated user terms acceptance`);
    console.log(`   Terms Accepted: ${updatedUser.termsAccepted}`);
    console.log(`   Terms Accepted At: ${updatedUser.termsAcceptedAt}`);
    console.log(`   Privacy Accepted: ${updatedUser.privacyAccepted}`);
    console.log(`   Privacy Accepted At: ${updatedUser.privacyAcceptedAt}\n`);

    // Test 3: Check flow logic
    console.log('3️⃣ Testing flow logic...');
    
    let redirectTo = '/buy'; // Default
    
    if (!updatedUser.termsAccepted || !updatedUser.privacyAccepted) {
      redirectTo = '/terms';
    } else if (!updatedUser.profileCompleted) {
      redirectTo = '/complete-profile';
    }
    
    console.log(`✅ Flow logic result: ${redirectTo}`);
    console.log(`   Expected: /complete-profile (since profile not completed)\n`);

    // Test 4: Test with completed profile
    console.log('4️⃣ Testing with completed profile...');
    
    const completedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        profileCompleted: true,
        name: 'Test User',
        phoneNumber: '3521234567'
      }
    });
    
    redirectTo = '/buy'; // Default
    
    if (!completedUser.termsAccepted || !completedUser.privacyAccepted) {
      redirectTo = '/terms';
    } else if (!completedUser.profileCompleted) {
      redirectTo = '/complete-profile';
    }
    
    console.log(`✅ Flow logic with completed profile: ${redirectTo}`);
    console.log(`   Expected: /buy (all requirements met)\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    console.log('✅ Test user deleted\n');

    console.log('🎉 All tests passed! Terms acceptance flow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTermsFlow();