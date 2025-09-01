const { Pool } = require('pg');

async function test(name, url) {
  const pool = new Pool({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: false }
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
  console.log('🧪 Testing Alternative Supabase Connection Formats');
  console.log('=================================================\n');
  
  const projectRef = 'hxmanrgbkoojbambqvdn';
  const password = 'h0EDBeMcs3y9C9Cq';
  
  const formats = [
    {
      name: 'Direct (original region)',
      url: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`
    },
    {
      name: 'Pooled (aws-0-us-east-1)',
      url: `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require&options=project%3D${projectRef}`
    },
    {
      name: 'Pooled (aws-1-us-east-1)',
      url: `postgresql://postgres.${projectRef}:${password}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require`
    },
    {
      name: 'Pooled (dot notation aws-0)',
      url: `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    }
  ];
  
  let workingConnections = [];
  
  for (const format of formats) {
    const success = await test(format.name, format.url);
    if (success) {
      workingConnections.push(format);
    }
    console.log('');
  }
  
  if (workingConnections.length > 0) {
    console.log('🎉 WORKING CONNECTIONS FOUND:');
    console.log('============================\n');
    
    workingConnections.forEach((conn, index) => {
      console.log(`${index + 1}. ${conn.name}:`);
      console.log(`   ${conn.url}\n`);
    });
    
    console.log('💡 Use these connection strings in your .env file');
  } else {
    console.log('❌ No working connections found');
    console.log('💡 The project might still be initializing or there might be network issues');
  }
})();