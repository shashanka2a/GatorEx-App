const { createClient } = require('@libsql/client');

async function testTursoDirectConnection() {
  console.log('🔍 Testing Turso database connection (direct libsql client)...');
  
  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log(`📡 Database URL: ${databaseUrl}`);
  console.log(`🔑 Auth Token: ${authToken ? authToken.substring(0, 20) + '...' : 'Not provided'}`);
  
  if (!databaseUrl || !authToken) {
    console.error('❌ Missing DATABASE_URL or TURSO_AUTH_TOKEN');
    return;
  }

  try {
    // Create Turso client
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });

    console.log('✅ Turso client created successfully');

    // Test basic connection with a simple query
    console.log('🔍 Testing database query...');
    
    // First, let's see what tables exist
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);
    
    console.log('📊 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.name}`);
    });

    // Test if users table exists and count users
    try {
      const userCountResult = await client.execute('SELECT COUNT(*) as count FROM users');
      const userCount = userCountResult.rows[0].count;
      console.log(`👥 Found ${userCount} users in database`);
    } catch (error) {
      console.log('⚠️  Users table might not exist yet:', error.message);
    }

    // Test if listings table exists and count listings
    try {
      const listingCountResult = await client.execute('SELECT COUNT(*) as count FROM listings');
      const listingCount = listingCountResult.rows[0].count;
      console.log(`📋 Found ${listingCount} listings in database`);
    } catch (error) {
      console.log('⚠️  Listings table might not exist yet:', error.message);
    }

    console.log('🎉 Turso database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Turso connection failed:');
    console.error('Error details:', error.message);
    
    if (error.message.includes('UNAUTHORIZED')) {
      console.log('💡 Tip: Check your TURSO_AUTH_TOKEN - it might be expired or invalid');
    } else if (error.message.includes('NOT_FOUND')) {
      console.log('💡 Tip: Check your DATABASE_URL - the database might not exist');
    } else if (error.message.includes('network')) {
      console.log('💡 Tip: Check your internet connection');
    }
  }
}

// Load environment variables
require('dotenv').config();

testTursoDirectConnection();