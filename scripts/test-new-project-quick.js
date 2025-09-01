#!/usr/bin/env node

/**
 * Quick test for new Supabase project
 */

const { PrismaClient } = require('@prisma/client');

async function testNewProject() {
  console.log('🧪 Testing New Supabase Project (Quick Test)');
  console.log('===========================================\n');
  
  const projectRef = 'hxmanrgbkoojbambqvdn';
  const password = 'h0EDBeMcs3y9C9Cq';
  
  // Test the most likely working format
  const connectionUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  
  console.log(`📋 Project: ${projectRef}`);
  console.log(`🔗 Testing: ${connectionUrl.replace(password, '***')}\n`);
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl
        }
      }
    });
    
    console.log('🔌 Attempting connection...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    console.log('🔍 Testing query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Query successful!');
    console.log('📊 Result:', result[0]);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 SUCCESS! New project is working!');
    console.log(`✅ Working connection string: ${connectionUrl}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n💡 This error suggests:');
      console.log('1. Project is still initializing (wait 2-3 minutes)');
      console.log('2. Project reference might be incorrect');
      console.log('3. Password might be incorrect');
      console.log('\n🔍 Please verify in Supabase dashboard:');
      console.log('- Settings → General → Project Reference');
      console.log('- Settings → Database → Connection string');
    }
    
    return false;
  }
}

testNewProject();