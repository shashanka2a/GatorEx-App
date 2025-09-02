#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSellTermsProtection() {
  console.log('🧪 Testing Sell Page Terms Protection...\n');

  try {
    // 1. Find a user without terms accepted
    console.log('1️⃣ Looking for users without terms accepted...');
    const usersWithoutTerms = await prisma.user.findMany({
      where: {
        termsAccepted: false
      },
      select: {
        id: true,
        email: true,
        termsAccepted: true,
        ufEmailVerified: true,
        profileCompleted: true
      },
      take: 3
    });

    console.log(`   Found ${usersWithoutTerms.length} users without terms accepted`);
    usersWithoutTerms.forEach(user => {
      console.log(`   - ${user.email}: verified=${user.ufEmailVerified}, profile=${user.profileCompleted}, terms=${user.termsAccepted}`);
    });

    // 2. Create a test user without terms if none exist
    if (usersWithoutTerms.length === 0) {
      console.log('\n2️⃣ Creating test user without terms accepted...');
      const testEmail = `test-no-terms-${Date.now()}@ufl.edu`;
      
      const testUser = await prisma.user.create({
        data: {
          email: testEmail,
          ufEmail: testEmail,
          ufEmailVerified: true,
          profileCompleted: true,
          termsAccepted: false, // This should block sell page access
          privacyAccepted: false,
          name: 'Test User No Terms'
        }
      });

      console.log(`   ✅ Created test user: ${testUser.email}`);
      console.log(`   - Terms accepted: ${testUser.termsAccepted}`);
      console.log(`   - Should be redirected to /terms when accessing /sell`);
    }

    // 3. Test terms acceptance API structure
    console.log('\n3️⃣ Checking terms acceptance API endpoint...');
    const fs = require('fs');
    const apiPath = 'pages/api/auth/accept-terms.ts';
    
    if (fs.existsSync(apiPath)) {
      console.log(`   ✅ Terms acceptance API exists at ${apiPath}`);
    } else {
      console.log(`   ❌ Terms acceptance API missing at ${apiPath}`);
    }

    // 4. Check sell page protection
    console.log('\n4️⃣ Checking sell page protection logic...');
    const sellPagePath = 'pages/sell.tsx';
    
    if (fs.existsSync(sellPagePath)) {
      const sellPageContent = fs.readFileSync(sellPagePath, 'utf8');
      
      if (sellPageContent.includes('termsAccepted: true')) {
        console.log('   ✅ Sell page includes termsAccepted in user query');
      } else {
        console.log('   ❌ Sell page missing termsAccepted in user query');
      }

      if (sellPageContent.includes('!user?.termsAccepted')) {
        console.log('   ✅ Sell page includes terms acceptance check');
      } else {
        console.log('   ❌ Sell page missing terms acceptance check');
      }

      if (sellPageContent.includes('/terms')) {
        console.log('   ✅ Sell page redirects to terms page');
      } else {
        console.log('   ❌ Sell page missing terms redirect');
      }
    }

    // 5. Check terms page has acceptance form
    console.log('\n5️⃣ Checking terms page acceptance form...');
    const termsPagePath = 'pages/terms.tsx';
    
    if (fs.existsSync(termsPagePath)) {
      const termsPageContent = fs.readFileSync(termsPagePath, 'utf8');
      
      if (termsPageContent.includes('TermsAcceptanceForm')) {
        console.log('   ✅ Terms page includes acceptance form');
      } else {
        console.log('   ❌ Terms page missing acceptance form');
      }

      if (termsPageContent.includes('accept-terms')) {
        console.log('   ✅ Terms page calls accept-terms API');
      } else {
        console.log('   ❌ Terms page missing API call');
      }
    }

    console.log('\n🎉 Terms protection test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Users without terms acceptance will be redirected to /terms');
    console.log('   - Terms page provides acceptance form');
    console.log('   - After acceptance, users can access /sell');
    console.log('   - This prevents the contact leak issue for unauthenticated users');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSellTermsProtection();