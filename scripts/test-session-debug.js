#!/usr/bin/env node

console.log('🔍 Session Debug Test');
console.log('====================');

console.log('\n📋 What to check:');
console.log('1. After OTP login, check browser dev tools → Application → Cookies');
console.log('2. Look for "next-auth.session-token" cookie');
console.log('3. Check if the cookie value exists and is not empty');

console.log('\n🔧 Recent Changes:');
console.log('✅ Changed NextAuth back to database sessions');
console.log('✅ Simplified middleware to only check for session cookie');
console.log('✅ Custom OTP system creates database session + cookie');

console.log('\n🧪 Debug Steps:');
console.log('1. Clear all cookies/localStorage');
console.log('2. Go to /verify and complete OTP flow');
console.log('3. After successful login, check:');
console.log('   - Browser cookies for next-auth.session-token');
console.log('   - Network tab for any failed requests');
console.log('   - Console for any errors');
console.log('4. Try clicking "Sell" in navigation');

console.log('\n💡 Expected Behavior:');
console.log('- After OTP verification → redirected to /complete-profile or /buy');
console.log('- Session cookie should be set');
console.log('- Clicking "Sell" should work without redirect to login');

console.log('\n🚨 If still redirecting:');
console.log('- Check if session cookie is being set correctly');
console.log('- Verify cookie domain and path settings');
console.log('- Check if middleware is reading the cookie properly');