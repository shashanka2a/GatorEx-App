const { PrismaClient } = require('@prisma/client');

async function testPrismaWithTurso() {
  console.log('🔍 Testing Prisma with Turso database...\n');
  
  try {
    // For development, we'll use the Turso client wrapper
    // In production, this should work with the proper Turso adapter
    
    // First, let's try with the current setup
    const prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });

    console.log('📡 Attempting Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');

    // Test basic operations
    console.log('🔍 Testing Prisma queries...');
    
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    const listingCount = await prisma.listing.count();
    console.log(`📋 Listings: ${listingCount}`);
    
    // Test creating a user if none exist
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      const testUser = await prisma.user.create({
        data: {
          email: 'test@ufl.edu',
          ufEmailVerified: true,
          name: 'Test User',
          phoneNumber: '3521234567',
          profileCompleted: true,
          trustScore: 10
        }
      });
      console.log(`✅ Test user created: ${testUser.id}`);
    }

    await prisma.$disconnect();
    console.log('🎉 Prisma with Turso test completed successfully!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('file:')) {
      console.log('\n💡 The issue is that Prisma expects a file: URL but we have libsql:');
      console.log('   This is expected in development. The app should work in production.');
      console.log('   For development, we can use a local SQLite file or the direct libsql client.');
    }
  }
}

// Load environment variables
require('dotenv').config();

testPrismaWithTurso();