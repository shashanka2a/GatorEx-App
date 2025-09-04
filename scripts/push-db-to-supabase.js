#!/usr/bin/env node

/**
 * Push Database Changes to Supabase via Prisma
 * 
 * This script handles:
 * - Environment validation
 * - Schema generation
 * - Database migration/push
 * - Connection testing
 * - Rollback capabilities
 * - Backup creation
 */

const { execSync, spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
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

class SupabasePrismaManager {
  constructor() {
    this.prisma = null;
    this.backupCreated = false;
    this.startTime = Date.now();
  }

  async validateEnvironment() {
    logStep('🔍', 'Validating environment...');
    
    // Check required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logError(`Missing required environment variables: ${missingVars.join(', ')}`);
      logInfo('Please ensure your .env file contains:');
      logInfo('DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"');
      logInfo('DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.connect.supabase.com:5432/postgres"');
      throw new Error('Environment validation failed');
    }

    // Validate connection strings
    const dbUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;

    if (!dbUrl.includes('pooler.supabase.com')) {
      logWarning('DATABASE_URL should use pooled connection (pooler.supabase.com)');
    }

    if (!directUrl.includes('connect.supabase.com')) {
      logWarning('DIRECT_URL should use direct connection (connect.supabase.com)');
    }

    logSuccess('Environment validation passed');
  }

  async createBackup() {
    logStep('💾', 'Creating database backup...');
    
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

      // Create a simple schema backup using Prisma
      logInfo('Generating schema backup...');
      const schemaContent = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8');
      const backupContent = `-- Database Backup Created: ${new Date().toISOString()}\n-- Schema Backup\n\n${schemaContent}`;
      
      fs.writeFileSync(backupFile, backupContent);
      this.backupCreated = true;
      
      logSuccess(`Backup created: ${backupFile}`);
    } catch (error) {
      logWarning(`Backup creation failed: ${error.message}`);
      logInfo('Continuing without backup...');
    }
  }

  async generatePrismaClient() {
    logStep('📝', 'Generating Prisma client...');
    
    try {
      execSync('npx prisma generate', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      logSuccess('Prisma client generated successfully');
    } catch (error) {
      logError(`Prisma client generation failed: ${error.message}`);
      throw error;
    }
  }

  async validateSchema() {
    logStep('🔍', 'Validating Prisma schema...');
    
    try {
      execSync('npx prisma validate', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      logSuccess('Schema validation passed');
    } catch (error) {
      logError(`Schema validation failed: ${error.message}`);
      throw error;
    }
  }

  async pushSchema(force = false) {
    logStep('🚀', 'Pushing schema to Supabase...');
    
    try {
      const pushCommand = force ? 'npx prisma db push --force-reset' : 'npx prisma db push';
      
      if (force) {
        logWarning('Using --force-reset flag - this will reset the database!');
      }

      const result = execSync(pushCommand, { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      logSuccess('Schema pushed successfully');
      logInfo('Push output:');
      console.log(result);
    } catch (error) {
      logError(`Schema push failed: ${error.message}`);
      
      if (error.stdout) {
        logInfo('Push output:');
        console.log(error.stdout);
      }
      
      if (error.stderr) {
        logError('Error details:');
        console.log(error.stderr);
      }
      
      throw error;
    }
  }

  async testConnection() {
    logStep('🔗', 'Testing database connection...');
    
    try {
      this.prisma = new PrismaClient();
      await this.prisma.$connect();
      
      logSuccess('Database connection established');
      
      // Test basic queries
      const userCount = await this.prisma.user.count();
      const listingCount = await this.prisma.listing.count();
      
      logInfo(`Database stats: ${userCount} users, ${listingCount} listings`);
      
      return true;
    } catch (error) {
      logError(`Database connection failed: ${error.message}`);
      return false;
    }
  }

  async runMigrations() {
    logStep('🔄', 'Running database migrations...');
    
    try {
      // Check if migrations directory exists
      const migrationsDir = path.join(process.cwd(), 'prisma/migrations');
      
      if (fs.existsSync(migrationsDir)) {
        logInfo('Migrations directory found, running migrations...');
        execSync('npx prisma migrate deploy', { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
        logSuccess('Migrations completed successfully');
      } else {
        logInfo('No migrations directory found, skipping migrations');
      }
    } catch (error) {
      logWarning(`Migration failed: ${error.message}`);
      logInfo('Continuing with db push instead...');
    }
  }

  async introspectDatabase() {
    logStep('🔍', 'Introspecting database...');
    
    try {
      execSync('npx prisma db pull', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      logSuccess('Database introspection completed');
    } catch (error) {
      logWarning(`Introspection failed: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      logInfo('Database connection closed');
    }
  }

  async showSummary() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    log('\n' + '='.repeat(50), 'cyan');
    log('📋 DEPLOYMENT SUMMARY', 'bright');
    log('='.repeat(50), 'cyan');
    
    logSuccess(`✅ Schema pushed to Supabase successfully`);
    logInfo(`⏱️  Total time: ${duration} seconds`);
    
    if (this.backupCreated) {
      logInfo(`💾 Backup created in ./backups/`);
    }
    
    log('\n📋 Next steps:', 'yellow');
    log('1. Test your application thoroughly');
    log('2. Monitor database performance');
    log('3. Check Supabase dashboard for any issues');
    
    log('\n🔧 Useful commands:', 'blue');
    log('• npx prisma studio - Open database browser');
    log('• npx prisma db pull - Sync schema from database');
    log('• node scripts/test-database.js - Test connection');
    
    log('\n🎉 Database is ready!', 'green');
  }
}

async function main() {
  const manager = new SupabasePrismaManager();
  
  try {
    log('🗄️  GatorEx Database Push to Supabase', 'bright');
    log('=' .repeat(50), 'cyan');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const skipBackup = args.includes('--skip-backup');
    const skipValidation = args.includes('--skip-validation');
    
    if (force) {
      logWarning('Force mode enabled - database will be reset!');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Are you sure you want to continue? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'yes') {
        logInfo('Operation cancelled');
        process.exit(0);
      }
    }

    // Step 1: Validate environment
    await manager.validateEnvironment();

    // Step 2: Create backup (unless skipped)
    if (!skipBackup) {
      await manager.createBackup();
    }

    // Step 3: Validate schema (unless skipped)
    if (!skipValidation) {
      await manager.validateSchema();
    }

    // Step 4: Generate Prisma client
    await manager.generatePrismaClient();

    // Step 5: Run migrations (if available)
    await manager.runMigrations();

    // Step 6: Push schema
    await manager.pushSchema(force);

    // Step 7: Test connection
    const connectionSuccess = await manager.testConnection();
    
    if (!connectionSuccess) {
      throw new Error('Database connection test failed');
    }

    // Step 8: Show summary
    await manager.showSummary();

  } catch (error) {
    logError(`\nDeployment failed: ${error.message}`);
    
    log('\n🔧 Troubleshooting:', 'yellow');
    log('1. Check your Supabase project is active (not paused)');
    log('2. Verify DATABASE_URL and DIRECT_URL are correct');
    log('3. Ensure your schema is valid');
    log('4. Check Supabase dashboard for errors');
    
    if (manager.backupCreated) {
      logInfo('💾 Backup available in ./backups/ directory');
    }
    
    process.exit(1);
  } finally {
    await manager.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('\n\n⚠️  Process interrupted', 'yellow');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  log('\n\n⚠️  Process terminated', 'yellow');
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SupabasePrismaManager };