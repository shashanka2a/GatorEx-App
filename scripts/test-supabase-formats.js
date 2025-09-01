#!/usr/bin/env node

/**
 * Test different Supabase connection formats
 */

const { PrismaClient } = require('@prisma/client');

const projectRef = 'ftmkxxlrkiybvezbfmvb';
const password = 'rDB/SXnX?Z4iYM-';
const encodedPassword = encodeURIComponent(password);

const connectionStrings = [
  // Direct connection
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  
  // Pooler connection (port 6543)
  `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Direct database connection
  `postgresql://postgres.${projectRef}:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Alternative format
  `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
];

async function testConnections() {
  console.log('🧪 Testing Supabase Connection Formats');
  console.log('=====================================\n');
  
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
      console.log(`🎉 Working connection string: ${connectionString}\n`);
      break;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
}

testConnections();