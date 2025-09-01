#!/usr/bin/env node

/**
 * Test direct database connection format
 */

const { PrismaClient } = require('@prisma/client');

async function testDirectConnection() {
  console.log('🧪 Testing Direct Database Connection');
  console.log('====================================\n');
  
  const directUrl = 'postgresql://postgres:B9UgmERUAEsDnD6g@db.ftmkxxlrkiybvezbfmvb.supabase.co:5432/postgres';
  
  console.log('🔍 Testing: postgresql://postgres:***@db.ftmkxxlrkiybvezbfmvb.supabase.co:5432/postgres\n');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: directUrl
        }
      }
    });
    
    console.log('🔌 Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, 'Hello from Supabase!' as message`;
    console.log('✅ Query successful:', result[0]);
    
    // Check database info
    console.log('\n📊 Database information:');
    const dbInfo = await prisma.$queryRaw`SELECT version() as postgres_version`;
    console.log('PostgreSQL Version:', dbInfo[0].postgres_version);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 Direct connection works perfectly!');
    console.log('📝 This connection string will be used in your environment files');
    
    return directUrl;
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 DNS resolution failed for direct connection');
      console.log('💡 The direct database hostname might not be available yet');
      console.log('⏱️  Try again in a few minutes, or use the pooler connection');
    }
    
    return null;
  }
}

testDirectConnection();