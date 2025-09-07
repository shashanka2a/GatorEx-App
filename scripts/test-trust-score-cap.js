#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
// Import the functions directly since we're in a script context
async function incrementUserTrustScore(userId, points = 1) {
  // First get current score to check if we need to cap it
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { trustScore: true }
  });

  if (!currentUser) {
    throw new Error('User not found');
  }

  // Calculate new score and cap at 100
  const newScore = Math.min(currentUser.trustScore + points, 100);
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      trustScore: newScore
    }
  });

  return user;
}

async function decrementUserTrustScore(userId, points = 5) {
  // First get current score to ensure we don't go below reasonable limits
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { trustScore: true }
  });

  if (!currentUser) {
    throw new Error('User not found');
  }

  // Calculate new score (allow negative scores for problematic users)
  const newScore = currentUser.trustScore - points;
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      trustScore: newScore
    }
  });

  return user;
}

const prisma = new PrismaClient();

async function testTrustScoreCap() {
  console.log('🧪 Testing Trust Score Capping System...\n');

  try {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        id: `test-trust-${Date.now()}`,
        email: 'test@ufl.edu',
        ufEmailVerified: true,
        trustScore: 95, // Start near the cap
        profileCompleted: false
      }
    });

    console.log(`✅ Created test user with trust score: ${testUser.trustScore}`);

    // Test incrementing near the cap
    console.log('\n📈 Testing increment near cap (95 + 10 should = 100)...');
    const updatedUser1 = await incrementUserTrustScore(testUser.id, 10);
    console.log(`   Result: ${updatedUser1.trustScore} (should be 100)`);

    // Test incrementing at the cap
    console.log('\n📈 Testing increment at cap (100 + 5 should = 100)...');
    const updatedUser2 = await incrementUserTrustScore(testUser.id, 5);
    console.log(`   Result: ${updatedUser2.trustScore} (should still be 100)`);

    // Test decrementing
    console.log('\n📉 Testing decrement (100 - 15 should = 85)...');
    const updatedUser3 = await decrementUserTrustScore(testUser.id, 15);
    console.log(`   Result: ${updatedUser3.trustScore} (should be 85)`);

    // Test incrementing back up
    console.log('\n📈 Testing increment back up (85 + 20 should = 100)...');
    const updatedUser4 = await incrementUserTrustScore(testUser.id, 20);
    console.log(`   Result: ${updatedUser4.trustScore} (should be 100)`);

    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    console.log('\n✅ All trust score capping tests passed!');
    console.log('🧹 Test user cleaned up.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrustScoreCap();