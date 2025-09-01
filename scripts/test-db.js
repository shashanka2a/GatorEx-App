const { Pool } = require('pg');

async function test(name, url) {
  const pool = new Pool({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: true } 
  });
  
  try { 
    const r = await pool.query('select 1 as ok'); 
    console.log('✅', name, r.rows[0]); 
  } catch (e) { 
    console.error('❌', name, e.message); 
  } finally { 
    await pool.end(); 
  }
}

(async () => {
  require('dotenv').config();
  await test('DIRECT_URL', process.env.DIRECT_URL);
  await test('DATABASE_URL', process.env.DATABASE_URL);
})();