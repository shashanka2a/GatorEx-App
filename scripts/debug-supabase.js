const { Pool } = require('pg');
const dns = require('dns').promises;

async function testDNS(hostname) {
  try {
    const addresses = await dns.lookup(hostname);
    console.log(`✅ DNS: ${hostname} → ${addresses.address}`);
    return true;
  } catch (error) {
    console.log(`❌ DNS: ${hostname} → ${error.message}`);
    return false;
  }
}

async function testConnection(name, url) {
  const pool = new Pool({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  
  try { 
    console.log(`🔍 Testing ${name}...`);
    const r = await pool.query('SELECT 1 as ok'); 
    console.log(`✅ ${name}: Connection successful!`);
    return true;
  } catch (e) { 
    console.log(`❌ ${name}: ${e.message}`); 
    return false;
  } finally { 
    await pool.end(); 
  }
}

(async () => {
  console.log('🔍 Debugging Supabase Connection Issues');
  console.log('======================================\n');
  
  const projectRef = 'hxmanrgbkoojbambqvdn';
  const password = 'h0EDBeMcs3y9C9Cq';
  
  console.log('1. Testing DNS Resolution:');
  console.log('-------------------------');
  await testDNS(`db.${projectRef}.supabase.co`);
  await testDNS('aws-0-us-east-1.pooler.supabase.com');
  await testDNS('aws-1-us-east-1.pooler.supabase.com');
  
  console.log('\n2. Testing Different Project Reference Formats:');
  console.log('-----------------------------------------------');
  
  // Test if project reference is wrong - try common variations
  const possibleRefs = [
    projectRef, // original
    projectRef.toLowerCase(),
    projectRef.toUpperCase(),
  ];
  
  for (const ref of possibleRefs) {
    console.log(`\nTesting with project ref: ${ref}`);
    
    const urls = [
      `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?options=project%3D${ref}`,
      `postgresql://postgres.${ref}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    ];
    
    for (let i = 0; i < urls.length; i++) {
      await testConnection(`Format ${i + 1}`, urls[i]);
    }
  }
  
  console.log('\n💡 If all tests fail:');
  console.log('1. Verify project reference in Supabase dashboard URL');
  console.log('2. Check if project is still initializing (wait 5-10 minutes)');
  console.log('3. Copy connection string directly from Settings → Database');
  console.log('4. Ensure project is in the correct region');
})();