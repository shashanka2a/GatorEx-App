#!/usr/bin/env node

/**
 * Push schema to Turso using SQL commands
 * This bypasses Prisma's URL validation by using direct SQL
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🐊 Pushing Schema to Turso Database\n');
console.log('===================================\n');

// SQL schema for NextAuth + GatorEx
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
    ufEmailVerified BOOLEAN DEFAULT FALSE,
    profileCompleted BOOLEAN DEFAULT FALSE,
    phoneNumber TEXT,
    dailyListingCount INTEGER DEFAULT 0,
    lastListingDate DATETIME,
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
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    meetingSpot TEXT NOT NULL,
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_sessionToken ON sessions(sessionToken);
CREATE INDEX IF NOT EXISTS idx_listings_userId ON listings(userId);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_images_listingId ON images(listingId);
`;

async function pushSchemaToTurso() {
  try {
    console.log('📝 Writing schema to temporary file...');
    fs.writeFileSync('schema.sql', schema);
    
    console.log('🚀 Pushing schema to Turso database...');
    
    // Use turso CLI to execute the schema
    const tursoUrl = process.env.DATABASE_URL;
    if (!tursoUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }
    
    // Extract database name from URL
    const dbName = tursoUrl.split('//')[1].split('.')[0];
    console.log(`📊 Database: ${dbName}`);
    
    // Execute schema using turso CLI
    execSync(`turso db shell ${dbName} < schema.sql`, { stdio: 'inherit' });
    
    console.log('✅ Schema pushed successfully!');
    
    // Clean up
    fs.unlinkSync('schema.sql');
    
    console.log('\n🎉 Database is ready!');
    console.log('Next steps:');
    console.log('1. Test the connection: npm run test:auth');
    console.log('2. Start your application: npm run dev');
    
  } catch (error) {
    console.error('❌ Failed to push schema:', error.message);
    
    // Clean up on error
    if (fs.existsSync('schema.sql')) {
      fs.unlinkSync('schema.sql');
    }
    
    console.log('\n💡 Alternative: Use Turso dashboard to create tables manually');
    console.log('Or check if turso CLI is installed: turso --version');
    
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

pushSchemaToTurso();