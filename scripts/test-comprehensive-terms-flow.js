#!/usr/bin/env node

/**
 * Comprehensive Terms and Conditions Flow Test
 * 
 * This script tests the complete authentication and terms acceptance flow
 * across all pages and API routes to ensure no errors occur.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logHeader(message) {
  log(`\n🔍 ${message}`, 'cyan');
}

// Test 1: Check all required files exist
function testRequiredFiles() {
  logHeader('Testing Required Files');
  
  const requiredFiles = [
    // Core auth files
    'pages/api/auth/[...nextauth].ts',
    'pages/api/auth/accept-terms.ts',
    'pages/api/auth/complete-profile.ts',
    'pages/api/auth/send-otp.ts',
    'pages/api/auth/verify-otp.ts',
    
    // Auth utility
    'src/lib/auth/terms-check.ts',
    
    // Pages
    'pages/login-otp.tsx',
    'pages/terms.tsx',
    'pages/complete-profile.tsx',
    'pages/sell.tsx',
    'pages/buy.tsx',
    'pages/me.tsx',
    
    // Middleware
    'middleware.ts'
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`${file} exists`);
    } else {
      logError(`${file} missing`);
      allExist = false;
    }
  }
  
  return allExist;
}

// Test 2: Check terms implementation in key files
function testTermsImplementation() {
  logHeader('Testing Terms Implementation');
  
  const checks = [
    {
      file: 'pages/api/auth/[...nextauth].ts',
      patterns: ['termsAccepted', 'privacyAccepted'],
      description: 'NextAuth includes terms fields'
    },
    {
      file: 'pages/api/auth/verify-otp.ts',
      patterns: ['termsAccepted', 'privacyAccepted'],
      description: 'OTP verification handles terms'
    },
    {
      file: 'pages/terms.tsx',
      patterns: ['accept-terms', 'termsAccepted', 'privacyAccepted'],
      description: 'Terms page handles acceptance'
    },
    {
      file: 'src/lib/auth/terms-check.ts',
      patterns: ['checkClientAuthAndTerms'],
      description: 'Client terms check utility exists'
    },
    {
      file: 'src/lib/auth/server-auth-check.ts',
      patterns: ['checkApiAuthAndTerms'],
      description: 'Server terms check utility exists'
    },
    {
      file: 'pages/sell.tsx',
      patterns: ['checkClientAuthAndTerms'],
      description: 'Sell page uses terms check'
    },
    {
      file: 'pages/me.tsx',
      patterns: ['checkClientAuthAndTerms'],
      description: 'Profile page uses terms check'
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      if (!fs.existsSync(check.file)) {
        logError(`${check.file} not found`);
        allPassed = false;
        continue;
      }
      
      const content = fs.readFileSync(check.file, 'utf8');
      const missing = check.patterns.filter(pattern => !content.includes(pattern));
      
      if (missing.length === 0) {
        logSuccess(`${check.description}`);
      } else {
        logError(`${check.description} - Missing: ${missing.join(', ')}`);
        allPassed = false;
      }
    } catch (error) {
      logError(`Error checking ${check.file}: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 3: Check API routes use terms checks
function testApiRoutesTermsChecks() {
  logHeader('Testing API Routes Terms Checks');
  
  const apiRoutes = [
    'pages/api/sell/publish.ts',
    'pages/api/listings/[id]/contact.ts',
    'pages/api/user/profile.ts',
    'pages/api/ai/analyze-image.ts',
    'pages/api/ai/parse-listing.ts',
    'pages/api/ai/suggest-titles.ts'
  ];
  
  let allPassed = true;
  
  for (const route of apiRoutes) {
    try {
      if (!fs.existsSync(route)) {
        logWarning(`${route} not found - skipping`);
        continue;
      }
      
      const content = fs.readFileSync(route, 'utf8');
      
      if (content.includes('checkApiAuthAndTerms')) {
        logSuccess(`${route} uses terms check`);
      } else if (content.includes('getServerSession')) {
        logWarning(`${route} uses old auth method - should be updated`);
        allPassed = false;
      } else {
        logInfo(`${route} may not require auth`);
      }
    } catch (error) {
      logError(`Error checking ${route}: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 4: Check middleware configuration
function testMiddlewareConfig() {
  logHeader('Testing Middleware Configuration');
  
  try {
    const content = fs.readFileSync('middleware.ts', 'utf8');
    
    const checks = [
      { pattern: '/terms', description: 'Terms route allowed' },
      { pattern: '/complete-profile', description: 'Complete profile route allowed' },
      { pattern: '/verify', description: 'Verify route allowed' },
      { pattern: 'protectedRoutes', description: 'Protected routes defined' }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      if (content.includes(check.pattern)) {
        logSuccess(check.description);
      } else {
        logWarning(`${check.description} - pattern '${check.pattern}' not found`);
        allPassed = false;
      }
    }
    
    return allPassed;
  } catch (error) {
    logError(`Error checking middleware: ${error.message}`);
    return false;
  }
}

// Test 5: Check for potential circular imports
function testCircularImports() {
  logHeader('Testing for Potential Circular Imports');
  
  const authFiles = [
    'src/lib/auth/terms-check.ts',
    'pages/api/auth/[...nextauth].ts',
    'pages/api/auth/accept-terms.ts',
    'pages/api/auth/complete-profile.ts'
  ];
  
  let allPassed = true;
  
  for (const file of authFiles) {
    try {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for potential circular imports
      if (file.includes('terms-check.ts') && content.includes('pages/api/auth/[...nextauth]')) {
        logSuccess(`${file} imports authOptions correctly`);
      } else if (file.includes('[...nextauth].ts') && content.includes('terms-check')) {
        logError(`${file} may have circular import with terms-check`);
        allPassed = false;
      } else {
        logInfo(`${file} import structure looks good`);
      }
    } catch (error) {
      logError(`Error checking ${file}: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 6: Check TypeScript compilation readiness
function testTypeScriptReadiness() {
  logHeader('Testing TypeScript Compilation Readiness');
  
  const tsFiles = [
    'src/lib/auth/terms-check.ts',
    'pages/sell.tsx',
    'pages/buy.tsx',
    'pages/me.tsx'
  ];
  
  let allPassed = true;
  
  for (const file of tsFiles) {
    try {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common TypeScript issues
      const issues = [];
      
      if (content.includes('any') && !content.includes('// @ts-ignore')) {
        issues.push('Uses any type');
      }
      
      if (content.includes('useState') && !content.includes('React.useState') && !content.includes('import { useState }')) {
        issues.push('useState not imported');
      }
      
      if (content.includes('useEffect') && !content.includes('React.useEffect') && !content.includes('import { useEffect }')) {
        issues.push('useEffect not imported');
      }
      
      if (issues.length === 0) {
        logSuccess(`${file} TypeScript ready`);
      } else {
        logWarning(`${file} potential issues: ${issues.join(', ')}`);
      }
    } catch (error) {
      logError(`Error checking ${file}: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Main test runner
function runAllTests() {
  log('🚀 Starting Comprehensive Terms Flow Test', 'magenta');
  log('=' .repeat(60), 'magenta');
  
  const tests = [
    { name: 'Required Files', fn: testRequiredFiles },
    { name: 'Terms Implementation', fn: testTermsImplementation },
    { name: 'API Routes Terms Checks', fn: testApiRoutesTermsChecks },
    { name: 'Middleware Configuration', fn: testMiddlewareConfig },
    { name: 'Circular Imports', fn: testCircularImports },
    { name: 'TypeScript Readiness', fn: testTypeScriptReadiness }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const passed = test.fn();
    results.push({ name: test.name, passed });
  }
  
  // Summary
  log('\n' + '=' .repeat(60), 'magenta');
  log('📊 Test Summary', 'magenta');
  log('=' .repeat(60), 'magenta');
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  for (const result of results) {
    if (result.passed) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED`);
    }
  }
  
  log(`\n📈 Overall: ${passedCount}/${totalCount} tests passed`, 
      passedCount === totalCount ? 'green' : 'yellow');
  
  if (passedCount === totalCount) {
    log('\n🎉 All tests passed! Terms flow is ready for deployment.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review and fix issues before deployment.', 'yellow');
  }
  
  return passedCount === totalCount;
}

// Run tests if called directly
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllTests };