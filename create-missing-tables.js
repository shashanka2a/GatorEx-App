const { createClient } = require('@libsql/client');

async function createMissingTables() {
  console.log('🔧 Creating missing tables...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!databaseUrl || !authToken) {
    console.error('❌ Missing DATABASE_URL or TURSO_AUTH_TOKEN');
    return;
  }

  try {
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });

    console.log('✅ Connected to Turso database');

    // Create accounts table
    console.log('📝 Creating accounts table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          providerAccountId TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(provider, providerAccountId)
      )
    `);
    console.log('✅ Created accounts table');

    // Create listings table
    console.log('📝 Creating listings table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS listings (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          category TEXT,
          condition TEXT,
          meetingSpot TEXT,
          status TEXT DEFAULT 'DRAFT',
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          userId TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created listings table');

    // Create missing indexes
    console.log('📝 Creating missing indexes...');
    
    await client.execute('CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId)');
    console.log('✅ Created index: idx_accounts_userId');
    
    await client.execute('CREATE INDEX IF NOT EXISTS idx_listings_userId ON listings(userId)');
    console.log('✅ Created index: idx_listings_userId');
    
    await client.execute('CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)');
    console.log('✅ Created index: idx_listings_status');

    // Verify all tables exist
    console.log('\n🔍 Verifying all tables...');
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);
    
    console.log('\n📊 All tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.name}`);
    });

    console.log('\n🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create missing tables:', error.message);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

createMissingTables();