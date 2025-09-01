#!/usr/bin/env node

/**
 * Test the correct Supabase connection formats based on dashboard
 */

const { PrismaClient } = require('@prisma/client');

const projectRef = 'ftmkxxlrkiybvezbfmvb';
const password = 'rDB/SXnX?Z4iYM-';
const encodedPassword = encodeURIComponent(password);

const connectionStrings = [
  // Pooler connection with postgres: format
  `postgresql://postgres:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Pooler connection with postgres.ref: format  
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Direct connection (if it exists)
  `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Alternative pooler port
  `postgresql://postgres:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
];

async function testConnections() {
  console.log('🧪 Testing Correct Supabase Connection Formats');
  console.log('==============================================\n');
  
  console.log(`📋 Project Reference: ${projectRef}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`🔐 Encoded Password: ${encodedPassword}\n`);

  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`🔍 Test ${i + 1}: ${connectionString.replace(encodedPassword, '***')}`);
    
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
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Query test successful:', result);
      
      await prisma.$disconnect();
      console.log(`🎉 WORKING CONNECTION STRING:`);
      console.log(`${connectionString}\n`);
      return connectionString;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('❌ None of the connection strings worked');
  console.log('💡 Please double-check your Supabase dashboard for the exact connection string');
}

testConnections();