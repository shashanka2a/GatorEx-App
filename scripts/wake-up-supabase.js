#!/usr/bin/env node

/**
 * Wake up Supabase project and test connection
 */

const { PrismaClient } = require('@prisma/client');

async function wakeUpSupabase() {
  console.log('🌅 Waking up Supabase Project');
  console.log('=============================\n');
  
  console.log('📋 Project: ftmkxxlrkiybvezbfmvb');
  console.log('🌐 Dashboard: https://supabase.com/dashboard/project/ftmkxxlrkiybvezbfmvb/\n');
  
  // Try the pooler connection first (most reliable)
  const poolerUrl = 'postgresql://postgres:rDB%2FSXnX%3FZ4iYM-@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  console.log('🔍 Testing pooler connection...');
  console.log('📍 URL: postgresql://postgres:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres\n');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: poolerUrl
        }
      }
    });
    
    console.log('🔌 Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, 'Hello Supabase!' as message`;
    console.log('✅ Query successful:', result);
    
    // Check if tables exist
    console.log('\n📊 Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.table_name).join(', '));
    } else {
      console.log('📝 No tables found - database is empty and ready for setup');
    }
    
    await prisma.$disconnect();
    
    console.log('\n🎉 Supabase connection is working!');
    console.log('✅ Your database is ready to use');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 Troubleshooting "Tenant or user not found":');
      console.log('1. 🌐 Visit: https://supabase.com/dashboard/project/ftmkxxlrkiybvezbfmvb/');
      console.log('2. 👀 Check if project shows as "Paused" or "Inactive"');
      console.log('3. 🔄 Click on the project to wake it up');
      console.log('4. ⏱️  Wait 30-60 seconds for it to fully start');
      console.log('5. 🔄 Run this script again');
      console.log('\n💡 Free tier projects auto-pause after inactivity');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 DNS resolution failed - trying alternative...');
      console.log('🔄 The hostname might not be available yet');
    }
    
    return false;
  }
}

wakeUpSupabase();