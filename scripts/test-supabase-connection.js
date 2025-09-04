#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * 
 * This script tests both pooled and direct connections to Supabase
 * and provides detailed diagnostics
 */

const { PrismaClient } = require('@prisma/client');

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

async function testConnection(connectionName, databaseUrl) {
  log(`\n🔗 Testing ${connectionName} connection...`, 'cyan');
  
  if (!databaseUrl) {
    logError(`${connectionName} URL not found in environment`);
    return false;
  }

  // Parse connection string for info (without exposing password)
  const urlParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (urlParts) {
    const [, username, , host, port, database] = urlParts;
    logInfo(`Host: ${host}`);
    logInfo(`Port: ${port}`);
    logInfo(`Database: ${database}`);
    logInfo(`Username: ${username}`);
  }

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

    // Test basic connection
    await prisma.$connect();
    logSuccess(`${connectionName} connection established`);

    // Test query performance
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - startTime;
    
    logSuccess(`Query executed in ${queryTime}ms`);

    // Test table access
    try {
      const userCount = await prisma.user.count();
      const listingCount = await prisma.listing.count();
      
      logInfo(`Users: ${userCount}`);
      logInfo(`Listings: ${listingCount}`);
    } catch (error) {
      logWarning(`Table access test failed: ${error.message}`);
    }

    await prisma.$disconnect();
    return true;

  } catch (error) {
    logError(`${connectionName} connection failed: ${error.message}`);
    
    // Provide specific error guidance
    if (error.message.includes('ENOTFOUND')) {
      logWarning('DNS resolution failed - check your internet connection');
    } else if (error.message.includes('ECONNREFUSED')) {
      logWarning('Connection refused - check if Supabase project is active');
    } else if (error.message.includes('authentication failed')) {
      logWarning('Authentication failed - check your password');
    } else if (error.message.includes('timeout')) {
      logWarning('Connection timeout - check your network or Supabase status');
    }
    
    return false;
  }
}

async function checkSupabaseStatus() {
  log('\n🌐 Checking Supabase project status...', 'cyan');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logError('DATABASE_URL not found');
    return;
  }

  // Extract project reference from URL
  const projectMatch = databaseUrl.match(/postgres\.([^.]+)\./);
  if (projectMatch) {
    const projectRef = projectMatch[1];
    logInfo(`Project reference: ${projectRef}`);
    logInfo(`Dashboard: https://supabase.com/dashboard/project/${projectRef}`);
  }
}

async function runDiagnostics() {
  log('🔍 Running connection diagnostics...', 'cyan');
  
  // Check environment variables
  const envVars = ['DATABASE_URL', 'DIRECT_URL'];
  const missingVars = envVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logError(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  logSuccess('All required environment variables present');

  // Validate URL formats
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (dbUrl.includes('pooler.supabase.com')) {
    logSuccess('DATABASE_URL uses pooled connection');
  } else {
    logWarning('DATABASE_URL should use pooled connection (pooler.supabase.com)');
  }

  if (directUrl.includes('connect.supabase.com')) {
    logSuccess('DIRECT_URL uses direct connection');
  } else {
    logWarning('DIRECT_URL should use direct connection (connect.supabase.com)');
  }

  return true;
}

async function main() {
  log('🗄️  GatorEx Supabase Connection Test', 'bright');
  log('=' .repeat(50), 'cyan');

  try {
    // Run diagnostics
    const diagnosticsPass = await runDiagnostics();
    if (!diagnosticsPass) {
      throw new Error('Diagnostics failed');
    }

    // Check Supabase status
    await checkSupabaseStatus();

    // Test pooled connection
    const pooledSuccess = await testConnection('Pooled', process.env.DATABASE_URL);

    // Test direct connection
    const directSuccess = await testConnection('Direct', process.env.DIRECT_URL);

    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log('📋 CONNECTION TEST SUMMARY', 'bright');
    log('='.repeat(50), 'cyan');

    if (pooledSuccess) {
      logSuccess('✅ Pooled connection: WORKING');
    } else {
      logError('❌ Pooled connection: FAILED');
    }

    if (directSuccess) {
      logSuccess('✅ Direct connection: WORKING');
    } else {
      logError('❌ Direct connection: FAILED');
    }

    if (pooledSuccess && directSuccess) {
      log('\n🎉 All connections working! Your database is ready.', 'green');
    } else {
      log('\n⚠️  Some connections failed. Check the errors above.', 'yellow');
      
      log('\n🔧 Common solutions:', 'blue');
      log('1. Wake up your Supabase project (free tier auto-pauses)');
      log('2. Check your connection strings in .env file');
      log('3. Verify your database password');
      log('4. Ensure your IP is not blocked');
    }

  } catch (error) {
    logError(`\nConnection test failed: ${error.message}`);
    
    log('\n🔧 Troubleshooting steps:', 'yellow');
    log('1. Visit your Supabase dashboard');
    log('2. Check if project is paused');
    log('3. Verify connection strings');
    log('4. Reset database password if needed');
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}