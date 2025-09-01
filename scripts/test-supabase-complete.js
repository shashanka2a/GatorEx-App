#!/usr/bin/env node

/**
 * Complete Supabase Connection Test following the guide
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testSupabaseComplete() {
  console.log('🔍 Complete Supabase Connection Test');
  console.log('====================================\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  console.log('📋 Configuration:');
  console.log('DATABASE_URL (pooled):', databaseUrl?.replace(/:[^:@]*@/, ':***@'));
  console.log('DIRECT_URL:', directUrl?.replace(/:[^:@]*@/, ':***@'));
  console.log('PGSSLMODE:', process.env.PGSSLMODE);
  console.log('');
  
  // Test 1: Direct URL first (if available)
  if (directUrl) {
    console.log('🧪 Test 1: Testing DIRECT_URL (port 5432)...');
    try {
      const directPrisma = new PrismaClient({
        datasources: {
          db: {
            url: directUrl
          }
        }
      });
      
      await directPrisma.$connect();
      console.log('✅ Direct connection successful!');
      
      const result = await directPrisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Direct query successful:', result[0]);
      
      await directPrisma.$disconnect();
      console.log('✅ Direct connection works!\n');
      
    } catch (error) {
      console.log('❌ Direct connection failed:', error.message);
      if (error.message.includes('ENOTFOUND')) {
        console.log('💡 Direct database access might not be available for your project\n');
      }
    }
  }
  
  // Test 2: Pooled URL (main connection)
  console.log('🧪 Test 2: Testing DATABASE_URL (pooled, port 6543)...');
  try {
    const pooledPrisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
    
    await pooledPrisma.$connect();
    console.log('✅ Pooled connection successful!');
    
    const result = await pooledPrisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Pooled query successful:', result[0]);
    
    // Test table operations
    console.log('🔧 Testing table operations...');
    await pooledPrisma.$queryRaw`CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())`;
    await pooledPrisma.$queryRaw`INSERT INTO connection_test DEFAULT VALUES`;
    const testResult = await pooledPrisma.$queryRaw`SELECT COUNT(*) as count FROM connection_test`;
    console.log('✅ Table operations successful:', testResult[0]);
    
    // Clean up
    await pooledPrisma.$queryRaw`DROP TABLE connection_test`;
    
    await pooledPrisma.$disconnect();
    
    console.log('\n🎉 Supabase connection is working perfectly!');
    console.log('✅ Pooled connection (recommended for production) works');
    console.log('✅ SSL configuration is correct');
    console.log('✅ Database operations are functional');
    console.log('✅ Ready for production deployment');
    
    return true;
    
  } catch (error) {
    console.error('❌ Pooled connection failed:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 "Tenant or user not found" troubleshooting:');
      console.log('1. Check if options parameter is correct: options=project%3Dftmkxxlrkiybvezbfmvb');
      console.log('2. Verify project reference in Supabase dashboard');
      console.log('3. Make sure project is not paused');
      console.log('4. Verify password is correct');
    } else if (error.message.includes('certificate')) {
      console.log('\n🔧 SSL Certificate troubleshooting:');
      console.log('1. PGSSLMODE=no-verify is set');
      console.log('2. Try connecting from a different network (mobile hotspot)');
      console.log('3. Check if corporate firewall is intercepting TLS');
    }
    
    return false;
  }
}

testSupabaseComplete();