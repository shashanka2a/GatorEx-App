// Apply Prisma schema to Supabase via pooler connection
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function applySchema() {
  console.log('🚀 Applying Prisma Schema to Supabase');
  console.log('====================================\n');
  
  const pooledUrl = process.env.DATABASE_URL;
  console.log('🔗 Using pooled connection:', pooledUrl.replace(/:[^:@]*@/, ':***@'));
  
  // Read the generated SQL
  const sqlScript = fs.readFileSync('./prisma/supabase_init.sql', 'utf8');
  console.log('📄 SQL script loaded:', sqlScript.split('\n').length, 'lines\n');
  
  // Connect with SSL bypass for development
  const pool = new Pool({ 
    connectionString: pooledUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('🔍 Executing schema creation...');
    
    // Execute the entire SQL script at once
    console.log('📄 Executing complete SQL script...');
    await client.query(sqlScript);
    
    console.log('✅ SQL script executed successfully!');
    
    console.log('\n🎉 Schema applied successfully!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

applySchema().catch(console.error);