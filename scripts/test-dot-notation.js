#!/usr/bin/env node

/**
 * Test connection with dot notation format
 */

const { PrismaClient } = require('@prisma/client');

async function testDotNotation() {
  console.log('🧪 Testing Dot Notation Format');
  console.log('==============================\n');
  
  // Try with dot notation (postgres.ref:password format)
  const dotNotationUrl = 'postgresql://postgres.ftmkxxlrkiybvezbfmvb:rDB%2FSXnX%3FZ4iYM-@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  console.log('🔍 Testing: postgresql://postgres.ftmkxxlrkiybvezbfmvb:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres\n');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dotNotationUrl
        }
      }
    });
    
    console.log('🔌 Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful with dot notation!');
    
    const result = await prisma.$queryRaw`SELECT 'Connected!' as status`;
    console.log('✅ Query successful:', result);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 Dot notation format works!');
    console.log('📝 Use this format in your .env files');
    
  } catch (error) {
    console.error('❌ Dot notation failed:', error.message);
    
    console.log('\n💡 Next steps:');
    console.log('1. Visit your Supabase dashboard');
    console.log('2. Go to Settings → Database');
    console.log('3. Copy the exact connection string format');
    console.log('4. Check if you need to reset the database password');
  }
}

testDotNotation();