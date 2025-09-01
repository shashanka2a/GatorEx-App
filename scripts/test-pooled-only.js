// Test pooled connection with proper SSL handling
const { Pool } = require('pg');
require('dotenv').config();

async function testPooledConnection() {
  console.log('🧪 Testing Pooled Connection Only');
  console.log('=================================\n');
  
  const pooledUrl = process.env.DATABASE_URL;
  console.log('🔗 Testing:', pooledUrl.replace(/:[^:@]*@/, ':***@'));
  
  // Test with SSL bypass (dev only)
  const pool = new Pool({ 
    connectionString: pooledUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting...');
    await pool.connect();
    console.log('✅ Connection successful!');
    
    console.log('🔍 Testing basic query...');
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Query successful!');
    console.log('📊 Database info:', {
      timestamp: result.rows[0].current_time,
      version: result.rows[0].db_version.split(' ')[0]
    });
    
    console.log('\n🔍 Testing table creation...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table creation successful!');
    
    console.log('🔍 Testing insert...');
    await pool.query(`
      INSERT INTO connection_test (test_message) 
      VALUES ('Pooled connection working!')
    `);
    console.log('✅ Insert successful!');
    
    console.log('🔍 Testing select...');
    const testResult = await pool.query('SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1');
    console.log('✅ Select successful!');
    console.log('📊 Latest record:', testResult.rows[0]);
    
    console.log('\n🎉 POOLED CONNECTION IS FULLY FUNCTIONAL!');
    console.log('💡 You can proceed with development using just the pooled connection');
    console.log('⚠️  For production, you\'ll need to fix the SSL certificate issue');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testPooledConnection();