#!/usr/bin/env node

/**
 * Test all possible connection formats with new password
 */

const { PrismaClient } = require('@prisma/client');

const projectRef = 'ftmkxxlrkiybvezbfmvb';
const password = 'B9UgmERUAEsDnD6g';

const connectionStrings = [
  // Standard pooler formats
  `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Alternative pooler port
  `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  
  // Direct connection attempts
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Alternative regions (in case it's not us-east-1)
  `postgresql://postgres:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
];

async function testAllFormats() {
  console.log('🧪 Testing All Connection Formats with New Password');
  console.log('==================================================\n');
  
  console.log(`📋 Project Reference: ${projectRef}`);
  console.log(`🔑 New Password: ${password}\n`);

  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`🔍 Test ${i + 1}: ${connectionString.replace(password, '***')}`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: connectionString
          }
        }
      });
      
      await prisma.$connect();
      console.log('✅ Connection successful!');
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
      console.log('✅ Query successful:', result[0]);
      
      await prisma.$disconnect();
      console.log(`\n🎉 WORKING CONNECTION STRING:`);
      console.log(`${connectionString}\n`);
      
      // Update the environment files with working connection
      console.log('📝 This connection string will be used for your environment files');
      return connectionString;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('❌ None of the connection formats worked');
  console.log('\n🔧 Possible issues:');
  console.log('1. Project might still be starting up (wait 1-2 minutes)');
  console.log('2. Project might be in a different region');
  console.log('3. Connection string format might be different');
  console.log('4. Project might need manual activation in dashboard');
  
  console.log('\n💡 Please check your Supabase dashboard and copy the exact connection string');
}

testAllFormats();