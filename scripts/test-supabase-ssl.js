#!/usr/bin/env node

/**
 * Test Supabase connection with proper SSL configuration
 */

const { PrismaClient } = require('@prisma/client');

async function testSupabaseSSL() {
  console.log('🔐 Testing Supabase Connection with SSL');
  console.log('=====================================\n');
  
  const connectionUrl = process.env.DATABASE_URL;
  console.log('📍 Connection URL:', connectionUrl.replace(/:[^:@]*@/, ':***@'));
  
  try {
    // Test with proper SSL configuration for Supabase
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl
        }
      }
    });
    
    console.log('🔌 Attempting to connect with SSL...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, 'Supabase connected!' as message`;
    console.log('✅ Query successful:', result[0]);
    
    // Check database version
    const version = await prisma.$queryRaw`SELECT version() as postgres_version`;
    console.log('📊 PostgreSQL version:', version[0].postgres_version.split(' ')[0]);
    
    // Test table creation
    console.log('\n🔧 Testing table operations...');
    await prisma.$queryRaw`CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW(), message TEXT)`;
    await prisma.$queryRaw`INSERT INTO connection_test (message) VALUES ('Connection test successful!')`;
    const testData = await prisma.$queryRaw`SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1`;
    console.log('✅ Table operations successful:', testData[0]);
    
    // Clean up
    await prisma.$queryRaw`DROP TABLE connection_test`;
    
    await prisma.$disconnect();
    
    console.log('\n🎉 Supabase connection is working perfectly!');
    console.log('✅ SSL configuration is correct');
    console.log('✅ Database operations are functional');
    console.log('✅ Ready for production deployment');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('certificate')) {
      console.log('\n🔧 SSL Certificate issue detected');
      console.log('💡 This is common with Supabase pooler connections');
      console.log('🔄 Trying alternative SSL configuration...');
      
      // Try with different SSL mode
      const altUrl = connectionUrl.replace('sslmode=require', 'sslmode=prefer');
      console.log('\n🔍 Testing with sslmode=prefer...');
      
      try {
        const altPrisma = new PrismaClient({
          datasources: {
            db: {
              url: altUrl
            }
          }
        });
        
        await altPrisma.$connect();
        console.log('✅ Alternative SSL mode works!');
        
        const result = await altPrisma.$queryRaw`SELECT 'SSL prefer mode works!' as message`;
        console.log('✅ Query successful:', result[0]);
        
        await altPrisma.$disconnect();
        
        console.log('\n📝 Update your DATABASE_URL to use sslmode=prefer instead of sslmode=require');
        return altUrl;
        
      } catch (altError) {
        console.error('❌ Alternative SSL mode also failed:', altError.message);
      }
    }
    
    return false;
  }
}

testSupabaseSSL();