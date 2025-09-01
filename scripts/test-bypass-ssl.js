const { Pool } = require('pg');

// Temporarily bypass SSL verification for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function test(name, url) {
  const pool = new Pool({ 
    connectionString: url,
    ssl: false // Disable SSL entirely for testing
  });
  
  try { 
    console.log(`🔍 Testing ${name}...`);
    const r = await pool.query('SELECT 1 as ok, NOW() as timestamp'); 
    console.log('✅', name, 'Connection successful!');
    console.log('📊 Result:', r.rows[0]);
    return true;
  } catch (e) { 
    console.error('❌', name, 'Error:', e.message); 
    return false;
  } finally { 
    await pool.end(); 
  }
}

(async () => {
  console.log('🧪 Testing Supabase Connections (SSL Bypassed)');
  console.log('==============================================\n');
  
  const projectRef = 'hxmanrgbkoojbambqvdn';
  const password = 'h0EDBeMcs3y9C9Cq';
  
  const formats = [
    {
      name: 'Pooled (aws-0-us-east-1)',
      url: `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?options=project%3D${projectRef}`
    },
    {
      name: 'Pooled (aws-1-us-east-1)',
      url: `postgresql://postgres.${projectRef}:${password}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`
    }
  ];
  
  for (const format of formats) {
    await test(format.name, format.url);
    console.log('');
  }
})();