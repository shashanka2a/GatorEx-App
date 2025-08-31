#!/usr/bin/env node

/**
 * Database Connection Test
 * Tests if we can connect to the Supabase database
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function testDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables');
    return false;
  }
  
  console.log('🔍 Testing database connection...');
  console.log('📍 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':***@'));
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔌 Attempting to connect...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Database time:', result.rows[0].current_time);
    
    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('📋 Existing tables:', tablesResult.rows.map(row => row.table_name));
    
    await client.end();
    return true;
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Suggestion: Check if the database host is correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Suggestion: Database server might be down or port blocked');
    } else if (error.message.includes('password authentication failed')) {
      console.log('💡 Suggestion: Check your database password');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 Suggestion: Database might not exist, check database name');
    }
    
    await client.end().catch(() => {});
    return false;
  }
}

// Alternative connection strings to try
async function tryAlternativeConnections() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return;
  
  console.log('\n🔄 Trying alternative connection methods...');
  
  // Try with different SSL settings
  const alternatives = [
    { ssl: { rejectUnauthorized: false } },
    { ssl: true },
    { ssl: false },
  ];
  
  for (let i = 0; i < alternatives.length; i++) {
    const config = alternatives[i];
    console.log(`\n🧪 Test ${i + 1}: SSL config:`, config.ssl);
    
    const client = new Client({
      connectionString: baseUrl,
      ...config
    });
    
    try {
      await client.connect();
      console.log('✅ Connection successful with this config!');
      await client.end();
      return config;
    } catch (error) {
      console.log('❌ Failed:', error.message.substring(0, 100));
      await client.end().catch(() => {});
    }
  }
  
  return null;
}

async function main() {
  console.log('🗄️  GatorEx Database Connection Test');
  console.log('=====================================');
  
  const success = await testDatabaseConnection();
  
  if (!success) {
    await tryAlternativeConnections();
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check if your Supabase project is active (not paused)');
    console.log('2. Verify the DATABASE_URL in your .env file');
    console.log('3. Check if you have the correct password');
    console.log('4. Try accessing Supabase dashboard to wake up the database');
    console.log('5. Consider using the alternative password you provided');
  }
}

main().catch(console.error);