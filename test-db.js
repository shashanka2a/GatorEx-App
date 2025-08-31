const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database query successful:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1. Check if your Supabase project is active');
      console.log('2. Verify the project reference in the URL');
      console.log('3. Ensure the database password is correct');
      console.log('4. Check if your IP is allowed (Supabase → Settings → Database → Network restrictions)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();