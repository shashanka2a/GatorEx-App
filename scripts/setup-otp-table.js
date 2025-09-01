// Create OTP table in Supabase
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function setupOTPTable() {
  console.log('🔢 Setting up OTP Table');
  console.log('======================\n');
  
  const pooledUrl = process.env.DATABASE_URL;
  console.log('🔗 Using pooled connection');
  
  // Read the SQL file
  const sqlScript = fs.readFileSync('./scripts/create-otp-table.sql', 'utf8');
  
  // Connect with SSL bypass for development
  const pool = new Pool({ 
    connectionString: pooledUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('🔍 Creating OTP table...');
    await client.query(sqlScript);
    console.log('✅ OTP table created successfully!\n');
    
    // Verify table was created
    console.log('🔍 Verifying table structure...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'otp_codes' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 OTP table structure:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    
    client.release();
    console.log('\n🎉 OTP system ready!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupOTPTable().catch(console.error);