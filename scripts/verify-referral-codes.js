#!/usr/bin/env node

/**
 * Verify that referral codes were successfully inserted into the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyReferralCodes() {
  try {
    console.log('🔍 Checking referral codes in database...');
    
    // Get total count of users
    const totalUsers = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users
    `;
    
    // Get total count of referral codes
    const totalCodes = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM referral_codes
    `;
    
    // Get users without referral codes
    const usersWithoutCodes = await prisma.$queryRaw`
      SELECT u.id, u.email 
      FROM users u 
      LEFT JOIN referral_codes rc ON u.id = rc.user_id 
      WHERE rc.user_id IS NULL
    `;
    
    // Get some sample referral codes
    const sampleCodes = await prisma.$queryRaw`
      SELECT rc.code, u.email 
      FROM referral_codes rc
      JOIN users u ON rc.user_id = u.id
      LIMIT 5
    `;
    
    console.log('\n📊 Database Status:');
    console.log(`👥 Total users: ${Array.isArray(totalUsers) ? totalUsers[0].count : totalUsers.count}`);
    console.log(`🔗 Total referral codes: ${Array.isArray(totalCodes) ? totalCodes[0].count : totalCodes.count}`);
    console.log(`❌ Users without codes: ${usersWithoutCodes.length}`);
    
    if (usersWithoutCodes.length > 0) {
      console.log('\n⚠️  Users still missing referral codes:');
      usersWithoutCodes.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    } else {
      console.log('\n✅ All users have referral codes!');
    }
    
    console.log('\n🔗 Sample referral codes:');
    sampleCodes.forEach(item => {
      console.log(`   ${item.code} -> ${item.email}`);
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
if (require.main === module) {
  verifyReferralCodes()
    .then(() => {
      console.log('\n🎉 Verification completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyReferralCodes };