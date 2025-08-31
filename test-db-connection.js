const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set' : 'Not set');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    const count = await prisma.user.count();
    console.log('✅ Database connected successfully!');
    console.log('📊 User count:', count);
    
    // Test a simple query
    const users = await prisma.user.findMany({
      take: 1,
      select: { id: true, email: true }
    });
    console.log('👤 Sample user:', users[0] || 'No users found');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();