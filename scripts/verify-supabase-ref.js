#!/usr/bin/env node

/**
 * Verify Supabase Project Reference
 */

console.log('🔍 Supabase Project Reference Verification');
console.log('==========================================\n');

console.log('📋 Steps to get the correct project reference:');
console.log('1. 🌐 Go to: https://supabase.com/dashboard/project/ftmkxxlrkiybvezbfmvb/');
console.log('2. 🔧 Click on Settings (gear icon in left sidebar)');
console.log('3. 📝 Click on General');
console.log('4. 📋 Find "Project Reference" and copy it exactly');
console.log('');
console.log('🔍 Current project reference we\'re using: ftmkxxlrkiybvezbfmvb');
console.log('');
console.log('🧪 Testing DNS resolution for current reference:');

const { execSync } = require('child_process');

try {
  const result = execSync('nslookup db.ftmkxxlrkiybvezbfmvb.supabase.co 1.1.1.1', { encoding: 'utf8' });
  console.log('✅ DNS resolves - reference is correct');
  console.log(result);
} catch (error) {
  console.log('❌ DNS does not resolve - reference might be incorrect');
  console.log('');
  console.log('💡 Please check your Supabase dashboard and verify:');
  console.log('   • Project Reference in Settings → General');
  console.log('   • Make sure you\'re looking at the right project');
  console.log('   • Copy the reference exactly (case-sensitive)');
  console.log('');
  console.log('🔄 Once you have the correct reference, update this script and run again');
}

console.log('');
console.log('📝 Alternative: Check the URL in your browser');
console.log('   The project reference is in the URL:');
console.log('   https://supabase.com/dashboard/project/[PROJECT-REFERENCE]/');
console.log('');
console.log('🎯 Expected format: lowercase letters and numbers, like: abc123def456');