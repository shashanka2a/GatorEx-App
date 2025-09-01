#!/usr/bin/env node

/**
 * Wait for Supabase project to be ready and test pooler connection
 */

const { PrismaClient } = require('@prisma/client');

async function waitForSupabase() {
  console.log('⏳ Waiting for Supabase Project to be Ready');
  console.log('==========================================\n');
  
  const poolerUrl = 'postgresql://postgres:B9UgmERUAEsDnD6g@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  console.log('🔄 Using pooler connection (recommended for production)');
  console.log('📍 URL: postgresql://postgres:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres\n');
  
  const maxAttempts = 10;
  const delayBetweenAttempts = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔍 Attempt ${attempt}/${maxAttempts} - Testing connection...`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: poolerUrl
          }
        }
      });
      
      await prisma.$connect();
      console.log('✅ Connection successful!');
      
      // Test basic query
      const result = await prisma.$queryRaw`SELECT NOW() as current_time, 'Pooler connection works!' as message`;
      console.log('✅ Query successful:', result[0]);
      
      // Check if we can create tables
      console.log('\n📊 Testing table creation...');
      await prisma.$queryRaw`CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())`;
      await prisma.$queryRaw`INSERT INTO connection_test DEFAULT VALUES`;
      const testResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM connection_test`;
      console.log('✅ Table operations successful:', testResult[0]);
      
      // Clean up test table
      await prisma.$queryRaw`DROP TABLE connection_test`;
      
      await prisma.$disconnect();
      
      console.log('\n🎉 Supabase pooler connection is working perfectly!');
      console.log('✅ Your database is ready for production use');
      console.log('📝 Pooler connection provides better performance and reliability');
      
      return true;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxAttempts) {
        console.log(`⏱️  Waiting ${delayBetweenAttempts/1000} seconds before next attempt...\n`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  console.log('\n❌ All attempts failed');
  console.log('🔧 The project might need more time to fully activate');
  console.log('💡 Try running this script again in a few minutes');
  
  return false;
}

waitForSupabase();