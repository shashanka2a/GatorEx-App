const { createClient } = require('@libsql/client');

// SQL schema for NextAuth + GatorEx (from the push-schema script)
const schema = `
-- NextAuth required tables
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
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    emailVerified DATETIME,
    image TEXT,
    ufEmail TEXT,
    ufEmailVerified BOOLEAN DEFAULT FALSE,
    profileCompleted BOOLEAN DEFAULT FALSE,
    phoneNumber TEXT,
    dailyListingCount INTEGER DEFAULT 0,
    lastListingDate DATETIME,
    otpCode TEXT,
    otpExpiry DATETIME,
    otpAttempts INTEGER DEFAULT 0,
    verifyToken TEXT,
    verifyTokenExpiry DATETIME,
    trustScore INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verificationtokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires DATETIME NOT NULL,
    UNIQUE(identifier, token)
);

-- GatorEx specific tables
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
);

CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    filename TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    listingId TEXT NOT NULL,
    FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_attempts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    ipAddress TEXT NOT NULL,
    success BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions(sessionToken);
CREATE INDEX IF NOT EXISTS idx_listings_userId ON listings(userId);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_images_listingId ON images(listingId);
`;

async function createTursoTables() {
  console.log('🐊 Creating Turso Database Tables\n');
  console.log('=================================\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!databaseUrl || !authToken) {
    console.error('❌ Missing DATABASE_URL or TURSO_AUTH_TOKEN');
    return;
  }

  try {
    // Create Turso client
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });

    console.log('✅ Connected to Turso database');

    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.execute(statement);
          
          // Extract table name for logging
          const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
          if (tableMatch) {
            console.log(`✅ Created table: ${tableMatch[1]}`);
          } else if (statement.includes('CREATE INDEX')) {
            const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
            if (indexMatch) {
              console.log(`✅ Created index: ${indexMatch[1]}`);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to execute statement: ${statement.substring(0, 50)}...`);
          console.error(`   Error: ${error.message}`);
        }
      }
    }

    console.log('\n🔍 Verifying tables were created...');
    
    // Verify tables exist
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);
    
    console.log('\n📊 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.name}`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the connection: node test-turso-direct.js');
    console.log('2. Start your application: npm run dev');
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

createTursoTables();