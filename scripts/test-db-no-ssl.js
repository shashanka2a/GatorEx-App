const { Pool } = require('pg');

async function test(name, url) {
  const pool = new Pool({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: false } // Disable SSL verification for testing
  });
  
  try { 
    console.log(`🔍 Testing ${name}...`);
    const r = await pool.query('SELECT 1 as ok, NOW() as timestamp, version() as db_version'); 
    console.log('✅', name, 'Connection successful!');
    console.log('📊 Result:', r.rows[0]);
  } catch (e) { 
    console.error('❌', name, 'Error:', e.message); 
  } finally { 
    await pool.end(); 
  }
}

(async () => {
  console.log('🧪 Testing Supabase Database Connections');
  console.log('========================================\n');
  
  require('dotenv').config();
  
  console.log('📋 Project: hxmanrgbkoojbambqvdn');
  console.log('🔑 Testing with SSL verification disabled\n');
  
  await test('DIRECT_URL', process.env.DIRECT_URL);
  console.log('');
  await test('DATABASE_URL', process.env.DATABASE_URL);
})();