#!/usr/bin/env node

/**
 * Create Database Migration for Supabase
 * 
 * This script helps create and manage database migrations
 * for Supabase using Prisma
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function createMigration() {
  log('🗄️  GatorEx Migration Creator', 'bright');
  log('=' .repeat(50), 'cyan');

  try {
    // Get migration name from user
    const migrationName = await askQuestion('Enter migration name (e.g., "add_user_preferences"): ');
    
    if (!migrationName || migrationName.trim().length === 0) {
      logError('Migration name is required');
      process.exit(1);
    }

    const cleanName = migrationName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    log(`\n🔍 Creating migration: ${cleanName}`, 'cyan');

    // Check if schema has changes
    logInfo('Checking for schema changes...');
    
    try {
      execSync('npx prisma format', { stdio: 'pipe' });
      logSuccess('Schema formatted');
    } catch (error) {
      logWarning('Schema formatting failed, continuing...');
    }

    // Create migration
    logInfo('Creating migration...');
    
    const migrationCommand = `npx prisma migrate dev --name ${cleanName}`;
    
    try {
      const result = execSync(migrationCommand, { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      logSuccess('Migration created successfully');
      logInfo('Migration output:');
      console.log(result);
      
    } catch (error) {
      if (error.stdout && error.stdout.includes('No schema changes found')) {
        logWarning('No schema changes detected');
        logInfo('Make sure you have modified your schema.prisma file');
        return;
      }
      
      logError(`Migration creation failed: ${error.message}`);
      
      if (error.stdout) {
        logInfo('Output:');
        console.log(error.stdout);
      }
      
      throw error;
    }

    // List created migration files
    const migrationsDir = path.join(process.cwd(), 'prisma/migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir)
        .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
        .sort()
        .reverse()
        .slice(0, 5); // Show last 5 migrations

      log('\n📁 Recent migrations:', 'blue');
      migrations.forEach(migration => {
        const isNew = migration.includes(cleanName);
        log(`  ${isNew ? '→' : ' '} ${migration}`, isNew ? 'green' : 'reset');
      });
    }

    // Show next steps
    log('\n📋 Next steps:', 'yellow');
    log('1. Review the generated migration file');
    log('2. Test the migration locally');
    log('3. Deploy to production with: node scripts/push-db-to-supabase.js');
    
    logSuccess('\n🎉 Migration created successfully!');

  } catch (error) {
    logError(`\nMigration creation failed: ${error.message}`);
    
    log('\n🔧 Common issues:', 'yellow');
    log('1. No changes in schema.prisma file');
    log('2. Invalid schema syntax');
    log('3. Database connection issues');
    log('4. Conflicting migration names');
    
    process.exit(1);
  }
}

async function listMigrations() {
  log('📁 Listing existing migrations...', 'cyan');
  
  const migrationsDir = path.join(process.cwd(), 'prisma/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    logInfo('No migrations directory found');
    return;
  }

  const migrations = fs.readdirSync(migrationsDir)
    .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    .sort();

  if (migrations.length === 0) {
    logInfo('No migrations found');
    return;
  }

  log(`\nFound ${migrations.length} migration(s):`, 'blue');
  migrations.forEach((migration, index) => {
    log(`  ${index + 1}. ${migration}`);
  });
}

async function resetMigrations() {
  logWarning('⚠️  This will reset all migrations and recreate the database!');
  
  const confirm = await askQuestion('Are you sure you want to reset? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    logInfo('Reset cancelled');
    return;
  }

  try {
    log('\n🔄 Resetting migrations...', 'cyan');
    
    execSync('npx prisma migrate reset --force', { 
      stdio: 'inherit'
    });
    
    logSuccess('Migrations reset successfully');
    
  } catch (error) {
    logError(`Reset failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
    case 'new':
      await createMigration();
      break;
      
    case 'list':
    case 'ls':
      await listMigrations();
      break;
      
    case 'reset':
      await resetMigrations();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      log('🗄️  GatorEx Migration Helper', 'bright');
      log('Usage: node scripts/create-migration.js <command>', 'blue');
      log('\nCommands:');
      log('  create, new    Create a new migration');
      log('  list, ls       List existing migrations');
      log('  reset          Reset all migrations (dangerous!)');
      log('  help           Show this help message');
      break;
      
    default:
      if (!command) {
        await createMigration();
      } else {
        logError(`Unknown command: ${command}`);
        logInfo('Use "help" to see available commands');
        process.exit(1);
      }
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}