// scripts/db-diagnose.js
const { Pool } = require('pg');
const dns = require('dns').promises;
const fs = require('fs');
require('dotenv').config();

function h(u){ try { return new URL(u).hostname; } catch { return ''; } }

async function resolveHost(host){
  try {
    const a = await dns.lookup(host);
    console.log('🧭 DNS', host, '→', a.address);
  } catch(e) {
    console.error('❌ DNS', host, e.code || e.message);
  }
}

async function run(name, url, sslConfig){
  const pool = new (require('pg').Pool)({ connectionString: url, ssl: sslConfig });
  try { 
    const r = await pool.query('select 1 as ok'); 
    console.log(`✅ ${name}`, r.rows[0]); 
  } catch(e){ 
    console.error(`❌ ${name}`, e.message); 
  } finally { 
    await pool.end().catch(()=>{}); 
  }
}

(async () => {
  const direct = process.env.DIRECT_URL;
  const pooled = process.env.DATABASE_URL;
  
  console.log('🔍 DIRECT_URL host:', h(direct));
  console.log('🔍 DATABASE_URL host:', h(pooled), 'user should be postgres.<ref>');
  
  await resolveHost(h(direct));
  await resolveHost(h(pooled));
  
  // Try with system trust first
  console.log('\n🔐 Tests with system CA');
  await run('DIRECT_URL (system CA)', direct, { rejectUnauthorized: true });
  await run('DATABASE_URL (system CA)', pooled, { rejectUnauthorized: true });
  
  // If you have the Supabase CA, try with it
  let ca = null;
  try { ca = fs.readFileSync('./certs/supabase-ca.crt'); } catch {}
  if (ca) {
    console.log('\n🔐 Tests with Supabase CA');
    await run('DIRECT_URL (supabase CA)', direct, { ca });
    await run('DATABASE_URL (supabase CA)', pooled, { ca });
  } else {
    console.log('\nℹ️ No ./certs/supabase-ca.crt found; skip CA tests.');
  }
  
  // Dev-only diagnostic (no verify) — do NOT use in prod
  console.log('\n🧪 Dev-only diagnostic (no verify)');
  await run('DIRECT_URL (NO VERIFY)', direct, { rejectUnauthorized: false });
  await run('DATABASE_URL (NO VERIFY)', pooled, { rejectUnauthorized: false });
})();