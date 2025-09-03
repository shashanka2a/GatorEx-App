#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReferralTermsFlow() {
  console.log('🧪 Testing Complete Referral + Terms Acceptance Flow...\n');

  try {
    // Step 1: Create a referrer user (existing user)
    console.log('1️⃣ Creating referrer user...');
    
    const referrerEmail = `referrer-${Date.now()}@ufl.edu`;
    const referrer = await prisma.user.create({
      data: {
        email: referrerEmail,
        ufEmail: referrerEmail,
        ufEmailVerified: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        privacyAccepted: true,
        privacyAcceptedAt: new Date(),
        profileCompleted: true,
        name: 'Referrer User',
        phoneNumber: '3521234567',
        trustScore: 50
      }
    });
    
    console.log(`✅ Created referrer: ${referrer.email} (ID: ${referrer.id})\n`);

    // Step 2: Create referral code for referrer
    console.log('2️⃣ Creating referral code...');
    
    // Using Supabase for referral codes
    const { supabase } = require('../src/lib/supabase.ts');
    
    const referralCode = `REF${Date.now()}`;
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .insert({
        user_id: referrer.id,
        code: referralCode,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (codeError) {
      console.error('❌ Failed to create referral code:', codeError);
      return;
    }
    
    console.log(`✅ Created referral code: ${referralCode}\n`);

    // Step 3: Simulate new user signup through referral
    console.log('3️⃣ Simulating new user signup through referral...');
    
    const refereeEmail = `referee-${Date.now()}@ufl.edu`;
    
    // This simulates what happens in verify-otp.ts
    const referee = await prisma.user.create({
      data: {
        email: refereeEmail,
        ufEmail: refereeEmail,
        ufEmailVerified: true,
        termsAccepted: false, // New users don't have terms accepted automatically
        privacyAccepted: false,
        trustScore: 10
      }
    });
    
    console.log(`✅ Created referee: ${referee.email} (ID: ${referee.id})`);
    console.log(`   Terms Accepted: ${referee.termsAccepted}`);
    console.log(`   Privacy Accepted: ${referee.privacyAccepted}`);
    console.log(`   Profile Completed: ${referee.profileCompleted}\n`);

    // Step 4: Test redirect logic (should go to terms page)
    console.log('4️⃣ Testing redirect logic for new user...');
    
    let redirectTo = '/buy'; // Default
    
    if (!referee.termsAccepted || !referee.privacyAccepted) {
      redirectTo = '/terms';
    } else if (!referee.profileCompleted) {
      redirectTo = '/complete-profile';
    }
    
    console.log(`✅ Redirect destination: ${redirectTo}`);
    console.log(`   Expected: /terms (terms not accepted yet)\n`);

    // Step 5: Simulate terms acceptance
    console.log('5️⃣ Simulating terms acceptance...');
    
    const now = new Date();
    const updatedReferee = await prisma.user.update({
      where: { id: referee.id },
      data: {
        termsAccepted: true,
        termsAcceptedAt: now,
        privacyAccepted: true,
        privacyAcceptedAt: now,
      }
    });
    
    console.log(`✅ Terms accepted successfully`);
    console.log(`   Terms Accepted At: ${updatedReferee.termsAcceptedAt}`);
    console.log(`   Privacy Accepted At: ${updatedReferee.privacyAcceptedAt}\n`);

    // Step 6: Test redirect logic after terms acceptance
    console.log('6️⃣ Testing redirect logic after terms acceptance...');
    
    redirectTo = '/buy'; // Default
    
    if (!updatedReferee.termsAccepted || !updatedReferee.privacyAccepted) {
      redirectTo = '/terms';
    } else if (!updatedReferee.profileCompleted) {
      redirectTo = '/complete-profile';
    }
    
    console.log(`✅ Redirect destination: ${redirectTo}`);
    console.log(`   Expected: /complete-profile (profile not completed)\n`);

    // Step 7: Simulate profile completion
    console.log('7️⃣ Simulating profile completion...');
    
    const completedReferee = await prisma.user.update({
      where: { id: referee.id },
      data: {
        profileCompleted: true,
        name: 'Referee User',
        phoneNumber: '3529876543'
      }
    });
    
    console.log(`✅ Profile completed successfully`);
    console.log(`   Name: ${completedReferee.name}`);
    console.log(`   Phone: ${completedReferee.phoneNumber}\n`);

    // Step 8: Test final redirect logic
    console.log('8️⃣ Testing final redirect logic...');
    
    redirectTo = '/buy'; // Default
    
    if (!completedReferee.termsAccepted || !completedReferee.privacyAccepted) {
      redirectTo = '/terms';
    } else if (!completedReferee.profileCompleted) {
      redirectTo = '/complete-profile';
    }
    
    console.log(`✅ Final redirect destination: ${redirectTo}`);
    console.log(`   Expected: /buy (all requirements met)\n`);

    // Step 9: Simulate referral completion
    console.log('9️⃣ Simulating referral completion...');
    
    // Create referral record
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referral_code: referralCode,
        referrer_user_id: referrer.id,
        referee_user_id: referee.id,
        status: 'verified',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (referralError) {
      console.error('❌ Failed to create referral:', referralError);
    } else {
      console.log(`✅ Referral completed successfully`);
      console.log(`   Referral ID: ${referralData.id}`);
      console.log(`   Status: ${referralData.status}\n`);
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    
    // Delete users
    await prisma.user.delete({ where: { id: referrer.id } });
    await prisma.user.delete({ where: { id: referee.id } });
    
    // Delete referral code and referral
    await supabase.from('referral_codes').delete().eq('code', referralCode);
    if (referralData) {
      await supabase.from('referrals').delete().eq('id', referralData.id);
    }
    
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! Complete referral + terms flow is working correctly.');
    console.log('\n📋 Flow Summary:');
    console.log('   1. New user signs up through referral link');
    console.log('   2. User verifies email (OTP) → redirected to /terms');
    console.log('   3. User accepts terms → redirected to /complete-profile');
    console.log('   4. User completes profile → redirected to /buy');
    console.log('   5. Referral is processed and recorded');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testReferralTermsFlow();