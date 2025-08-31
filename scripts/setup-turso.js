#!/usr/bin/env node

/**
 * Turso Database Setup Script for GatorEx
 * Sets up local SQLite database and provides instructions for Turso cloud setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐊 GatorEx Turso Database Setup\n');
console.log('================================\n');

async function setupLocalDatabase() {
  console.log('📁 Setting up local SQLite database...\n');
  
  try {
    // Generate Prisma client
    console.log('1. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema to create local database
    console.log('2. Creating local database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Local SQLite database created successfully!\n');
    
    // Check if database file was created
    const dbPath = path.join(process.cwd(), 'dev.db');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 Database file: ${dbPath}`);
      console.log(`📏 Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to setup local database:', error.message);
    return false;
  }
}

function printTursoCloudInstructions() {
  console.log('☁️  Turso Cloud Setup Instructions\n');
  console.log('==================================\n');
  
  console.log('For production deployment, follow these steps:\n');
  
  console.log('1. Install Turso CLI:');
  console.log('   curl -sSfL https://get.tur.so/install.sh | bash\n');
  
  console.log('2. Sign up and login:');
  console.log('   turso auth signup');
  console.log('   turso auth login\n');
  
  console.log('3. Create a database:');
  console.log('   turso db create gatorex-prod\n');
  
  console.log('4. Get database URL and auth token:');
  console.log('   turso db show gatorex-prod --url');
  console.log('   turso db tokens create gatorex-prod\n');
  
  console.log('5. Update your production environment variables:');
  console.log('   DATABASE_URL="libsql://gatorex-prod-[your-org].turso.io"');
  console.log('   TURSO_AUTH_TOKEN="your-auth-token"\n');
  
  console.log('6. Push schema to production:');
  console.log('   npx prisma db push\n');
}

function printNextSteps() {
  console.log('🚀 Next Steps\n');
  console.log('=============\n');
  
  console.log('✅ Your local development database is ready!');
  console.log('✅ You can now run: npm run dev');
  console.log('✅ Visit /verify to test authentication\n');
  
  console.log('Development commands:');
  console.log('• npm run db:studio    - Open Prisma Studio');
  console.log('• npm run test:auth    - Test authentication system');
  console.log('• npm run dev          - Start development server\n');
}

async function main() {
  const localSuccess = await setupLocalDatabase();
  
  if (localSuccess) {
    printNextSteps();
    printTursoCloudInstructions();
  } else {
    console.log('⚠️  Local database setup failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Setup script error:', error);
  process.exit(1);
});