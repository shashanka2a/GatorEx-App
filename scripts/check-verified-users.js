#!/usr/bin/env node

/**
 * Check how many verified users are in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVerifiedUsers() {
  try {
    console.log('🔍 Analyzing user verification status...');
    
    // Get total count of users
    const totalUsers = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users
    `;
    
    // Get count of UF email verified users
    const ufVerifiedUsers = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users WHERE "ufEmailVerified" = true
    `;
    
    // Get count of users with completed profiles
    const completedProfileUsers = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users WHERE "profileCompleted" = true
    `;
    
    // Get count of users who are both UF verified AND have completed profiles
    const fullyVerifiedUsers = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users 
      WHERE "ufEmailVerified" = true AND "profileCompleted" = true
    `;
    
    // Get breakdown by verification status
    const verificationBreakdown = await prisma.$queryRaw`
      SELECT 
        "ufEmailVerified",
        "profileCompleted",
        COUNT(*) as count
      FROM users 
      GROUP BY "ufEmailVerified", "profileCompleted"
      ORDER BY "ufEmailVerified" DESC, "profileCompleted" DESC
    `;
    
    // Get some sample verified users
    const sampleVerifiedUsers = await prisma.$queryRaw`
      SELECT email, name, "ufEmailVerified", "profileCompleted", "createdAt"
      FROM users 
      WHERE "ufEmailVerified" = true AND "profileCompleted" = true
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;
    
    console.log('\n📊 User Verification Status:');
    console.log(`👥 Total users: ${Array.isArray(totalUsers) ? totalUsers[0].count : totalUsers.count}`);
    console.log(`🎓 UF email verified: ${Array.isArray(ufVerifiedUsers) ? ufVerifiedUsers[0].count : ufVerifiedUsers.count}`);
    console.log(`✅ Profile completed: ${Array.isArray(completedProfileUsers) ? completedProfileUsers[0].count : completedProfileUsers.count}`);
    console.log(`🏆 Fully verified (UF + Profile): ${Array.isArray(fullyVerifiedUsers) ? fullyVerifiedUsers[0].count : fullyVerifiedUsers.count}`);
    
    console.log('\n📈 Verification Breakdown:');
    verificationBreakdown.forEach(row => {
      const ufStatus = row.ufEmailVerified ? '✅ UF Verified' : '❌ UF Not Verified';
      const profileStatus = row.profileCompleted ? '✅ Profile Complete' : '❌ Profile Incomplete';
      console.log(`   ${ufStatus} + ${profileStatus}: ${row.count} users`);
    });
    
    if (sampleVerifiedUsers.length > 0) {
      console.log('\n🏆 Sample Fully Verified Users:');
      sampleVerifiedUsers.forEach(user => {
        const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
        console.log(`   ${user.email} (${user.name || 'No name'}) - Joined: ${date}`);
      });
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
if (require.main === module) {
  checkVerifiedUsers()
    .then(() => {
      console.log('\n🎉 Analysis completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { checkVerifiedUsers };