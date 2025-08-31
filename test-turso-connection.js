const { PrismaClient } = require('@prisma/client');

async function testTursoConnection() {
  console.log('🔍 Testing Turso database connection...');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    // Test basic connection
    console.log('📡 Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');

    // Test a simple query
    console.log('🔍 Testing database query...');
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);

    // Test creating a test user (if none exist)
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
      console.log('✅ Test user created:', testUser.id);
    }

    // Test listing count
    const listingCount = await prisma.listing.count();
    console.log(`📋 Found ${listingCount} listings in database`);

    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error details:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.message.includes('SQLITE_CANTOPEN')) {
      console.log('💡 Tip: Make sure the database file exists and is accessible');
    } else if (error.message.includes('libsql')) {
      console.log('💡 Tip: Check your TURSO_AUTH_TOKEN and DATABASE_URL');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testTursoConnection();