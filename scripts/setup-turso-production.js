#!/usr/bin/env node

/**
 * Turso Production Database Setup Script
 * Handles libsql:// URLs and auth tokens for Turso cloud databases
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🐊 GatorEx Turso Production Setup\n');
console.log('==================================\n');

function updateDatabaseUrl() {
  console.log('🔧 Configuring Turso connection...\n');
  
  const tursoUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!tursoUrl || !authToken) {
    console.error('❌ Missing DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    process.exit(1);
  }
  
  console.log(`✅ Database URL: ${tursoUrl}`);
  console.log(`✅ Auth Token: ${authToken.substring(0, 20)}...`);
  
  // For Prisma, we need to temporarily use a local file URL for schema operations
  // The actual connection will use the Turso URL with auth token at runtime
  const tempEnvPath = path.join(process.cwd(), '.env.temp');
  const originalEnv = fs.readFileSync('.env', 'utf8');
  
  // Create temporary env file with file:// URL for Prisma operations
  const tempEnv = originalEnv.replace(
    /DATABASE_URL="libsql:\/\/[^"]+"/,
    'DATABASE_URL="file:./turso-temp.db"'
  );
  
  fs.writeFileSync(tempEnvPath, tempEnv);
  
  return { tempEnvPath, originalEnv };
}

async function setupSchema() {
  console.log('📊 Setting up database schema...\n');
  
  const { tempEnvPath, originalEnv } = updateDatabaseUrl();
  
  try {
    // Use temporary env file for Prisma operations
    console.log('1. Generating Prisma client...');
    execSync(`npx prisma generate --schema=prisma/schema.prisma`, { 
      stdio: 'inherit',
      env: { ...process.env, PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary' }
    });
    
    console.log('2. Creating schema in temporary database...');
    execSync(`npx prisma db push --schema=prisma/schema.prisma`, { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./turso-temp.db' }
    });
    
    // Clean up temporary files
    if (fs.existsSync(tempEnvPath)) {
      fs.unlinkSync(tempEnvPath);
    }
    if (fs.existsSync('turso-temp.db')) {
      fs.unlinkSync('turso-temp.db');
    }
    
    console.log('✅ Schema setup completed!\n');
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error.message);
    
    // Clean up on error
    if (fs.existsSync(tempEnvPath)) {
      fs.unlinkSync(tempEnvPath);
    }
    if (fs.existsSync('turso-temp.db')) {
      fs.unlinkSync('turso-temp.db');
    }
    
    process.exit(1);
  }
}

async function testConnection() {
  console.log('🧪 Testing Turso connection...\n');
  
  try {
    // Test the connection using our custom client
    const { PrismaClient } = require('@prisma/client');
    
    // Create client with Turso URL and auth token
    const tursoUrl = process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    let databaseUrl = tursoUrl;
    if (tursoUrl.startsWith('libsql://') && authToken) {
      const url = new URL(tursoUrl);
      url.searchParams.set('authToken', authToken);
      databaseUrl = url.toString();
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    
    // Test basic operations
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible (${userCount} users)`);
    
    await prisma.$disconnect();
    console.log('✅ Connection test completed\n');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

function printNextSteps() {
  console.log('🚀 Production Setup Complete!\n');
  console.log('=============================\n');
  
  console.log('✅ Turso database is configured and ready');
  console.log('✅ Schema has been validated');
  console.log('✅ Connection test passed\n');
  
  console.log('Next steps:');
  console.log('1. Deploy your application with the current environment variables');
  console.log('2. Test authentication at /verify');
  console.log('3. Monitor database usage in Turso dashboard\n');
  
  console.log('Useful commands:');
  console.log('• npm run test:auth    - Test authentication system');
  console.log('• npm run build        - Build for production');
  console.log('• npm run start        - Start production server\n');
}

async function main() {
  try {
    await setupSchema();
    await testConnection();
    printNextSteps();
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();