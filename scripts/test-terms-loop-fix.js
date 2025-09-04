#!/usr/bin/env node

/**
 * Test script to verify the terms loop fix
 */

const fs = require('fs');
const path = require('path');

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

console.log('🔍 Testing Terms Loop Fix');
console.log('============================================================');

let allPassed = true;

// Test 1: Check terms page has session update
console.log('\n🔍 Testing Terms Page Session Update');
const termsPath = path.join(process.cwd(), 'pages/terms.tsx');
if (fs.existsSync(termsPath)) {
  const content = fs.readFileSync(termsPath, 'utf8');
  
  if (content.includes('const { data: session, update } = useSession();')) {
    logSuccess('Terms page imports session update function');
  } else {
    logError('Terms page missing session update import');
    allPassed = false;
  }
  
  if (content.includes('await update();')) {
    logSuccess('Terms page calls session update after accepting');
  } else {
    logError('Terms page missing session update call');
    allPassed = false;
  }
  
  if (content.includes('setTimeout(')) {
    logSuccess('Terms page has delay for session update');
  } else {
    logError('Terms page missing delay for session update');
    allPassed = false;
  }
} else {
  logError('Terms page not found');
  allPassed = false;
}

// Test 2: Check API routes use correct server-side auth
console.log('\n🔍 Testing API Routes Server-Side Auth');
const apiRoutes = [
  'pages/api/ai/parse-listing.ts',
  'pages/api/ai/suggest-titles.ts'
];

for (const route of apiRoutes) {
  const routePath = path.join(process.cwd(), route);
  if (fs.existsSync(routePath)) {
    const content = fs.readFileSync(routePath, 'utf8');
    
    if (content.includes("from '../../../src/lib/auth/server-auth-check'")) {
      logSuccess(`${route} uses correct server-side auth import`);
    } else {
      logError(`${route} uses wrong auth import`);
      allPassed = false;
    }
  } else {
    logError(`${route} not found`);
    allPassed = false;
  }
}

// Test 3: Check accept-terms API returns success
console.log('\n🔍 Testing Accept Terms API');
const acceptTermsPath = path.join(process.cwd(), 'pages/api/auth/accept-terms.ts');
if (fs.existsSync(acceptTermsPath)) {
  const content = fs.readFileSync(acceptTermsPath, 'utf8');
  
  if (content.includes('termsAccepted: true') && content.includes('privacyAccepted: true')) {
    logSuccess('Accept terms API updates both terms and privacy');
  } else {
    logError('Accept terms API missing proper updates');
    allPassed = false;
  }
  
  if (content.includes('return res.status(200).json')) {
    logSuccess('Accept terms API returns success response');
  } else {
    logError('Accept terms API missing success response');
    allPassed = false;
  }
} else {
  logError('Accept terms API not found');
  allPassed = false;
}

// Test 4: Check NextAuth session callback includes terms
console.log('\n🔍 Testing NextAuth Session Callback');
const nextAuthPath = path.join(process.cwd(), 'pages/api/auth/[...nextauth].ts');
if (fs.existsSync(nextAuthPath)) {
  const content = fs.readFileSync(nextAuthPath, 'utf8');
  
  if (content.includes('termsAccepted: true') && content.includes('privacyAccepted: true')) {
    logSuccess('NextAuth session includes terms fields');
  } else {
    logError('NextAuth session missing terms fields');
    allPassed = false;
  }
  
  if (content.includes('const dbUser = await prisma.user.findUnique')) {
    logSuccess('NextAuth fetches fresh user data in session callback');
  } else {
    logError('NextAuth not fetching fresh user data');
    allPassed = false;
  }
} else {
  logError('NextAuth config not found');
  allPassed = false;
}

console.log('\n============================================================');
console.log('📊 Test Summary');
console.log('============================================================');

if (allPassed) {
  logSuccess('All tests passed! Terms loop should be fixed.');
  console.log('\n🎉 The terms acceptance flow should now work correctly:');
  console.log('   1. User accepts terms');
  console.log('   2. API updates database');
  console.log('   3. Session is refreshed');
  console.log('   4. User is redirected to next step');
  process.exit(0);
} else {
  logError('Some tests failed. Please review and fix issues.');
  process.exit(1);
}