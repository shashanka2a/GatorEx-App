#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Testing Routing and Session Management');
console.log('========================================');

// Start the development server
console.log('🚀 Starting development server...');
const server = execSync('npm run dev > /dev/null 2>&1 &', { stdio: 'inherit' });

// Wait for server to start
console.log('⏳ Waiting for server to start...');
setTimeout(async () => {
  try {
    // Test public routes
    console.log('\n📍 Testing public routes...');
    const publicRoutes = ['/', '/buy', '/sublease'];
    
    for (const route of publicRoutes) {
      try {
        const response = await fetch(`http://localhost:3000${route}`);
        console.log(`✅ ${route}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${route}: Failed to connect`);
      }
    }

    // Test protected routes (should redirect to login)
    console.log('\n🔒 Testing protected routes (should redirect)...');
    const protectedRoutes = ['/sell', '/me', '/share'];
    
    for (const route of protectedRoutes) {
      try {
        const response = await fetch(`http://localhost:3000${route}`, {
          redirect: 'manual'
        });
        if (response.status === 307 || response.status === 302) {
          console.log(`✅ ${route}: Redirected (${response.status})`);
        } else {
          console.log(`⚠️  ${route}: ${response.status} (expected redirect)`);
        }
      } catch (error) {
        console.log(`❌ ${route}: Failed to connect`);
      }
    }

    console.log('\n✅ Routing test completed!');
    console.log('\n💡 To test full authentication flow:');
    console.log('   1. Go to http://localhost:3000/verify');
    console.log('   2. Enter your UF email');
    console.log('   3. Check email and click magic link');
    console.log('   4. Complete profile');
    console.log('   5. Verify you can access /sell and /me');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}, 3000);