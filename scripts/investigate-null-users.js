#!/usr/bin/env node

/**
 * Investigate why some users have null names in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function investigateNullUsers() {
  try {
    console.log('🔍 Investigating users with null names...\n');

    // Find users with null names
    const nullUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: null },
          { name: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        ufEmail: true,
        email: true,
        ufEmailVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${nullUsers.length} users with null/empty names\n`);

    if (nullUsers.length === 0) {
      console.log('✅ No users with null names found!');
      return;
    }

    // Analyze the null users
    nullUsers.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'NULL'}`);
      console.log(`   UF Email: ${user.ufEmail}`);
      console.log(`   Regular Email: ${user.email || 'NULL'}`);
      console.log(`   UF Email Verified: ${user.ufEmailVerified}`);
      console.log(`   Profile Completed: ${user.profileCompleted}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log(`   Accounts: ${user.accounts.length > 0 ? user.accounts.map(a => a.provider).join(', ') : 'None'}`);
      console.log('---');
    });

    // Check if these users have any activity
    console.log('\n🔍 Checking activity for null users...\n');
    
    for (const user of nullUsers.slice(0, 5)) { // Check first 5 to avoid too much output
      console.log(`👤 User: ${user.ufEmail}`);
      
      // Check listings
      const listings = await prisma.listing.count({
        where: { userId: user.id }
      });
      
      // Check referrals
      const referrals = await prisma.referral.count({
        where: { 
          OR: [
            { referrerUserId: user.id },
            { refereeUserId: user.id }
          ]
        }
      });
      
      // Check favorites
      const favorites = await prisma.favorite.count({
        where: { userId: user.id }
      });
      
      console.log(`   Listings: ${listings}`);
      console.log(`   Referrals: ${referrals}`);
      console.log(`   Favorites: ${favorites}`);
      console.log('---');
    }

    // Analyze patterns
    console.log('\n📈 Analysis:');
    
    const verifiedCount = nullUsers.filter(u => u.ufEmailVerified).length;
    const completedCount = nullUsers.filter(u => u.profileCompleted).length;
    const withAccountsCount = nullUsers.filter(u => u.accounts.length > 0).length;
    
    console.log(`   Verified UF Email: ${verifiedCount}/${nullUsers.length}`);
    console.log(`   Profile Completed: ${completedCount}/${nullUsers.length}`);
    console.log(`   Have Auth Accounts: ${withAccountsCount}/${nullUsers.length}`);
    
    // Check if this is related to the signup flow
    const recentNullUsers = nullUsers.filter(u => 
      new Date(u.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    console.log(`   Created in last 24h: ${recentNullUsers.length}/${nullUsers.length}`);
    
    // Possible causes
    console.log('\n🤔 Possible causes:');
    console.log('   1. Users signed up but never completed profile');
    console.log('   2. Name field not being set during OTP verification');
    console.log('   3. Database migration issue');
    console.log('   4. Frontend not sending name during signup');
    
    if (verifiedCount > 0 && completedCount === 0) {
      console.log('   ⚠️  Users are verified but profiles not completed - check complete-profile flow');
    }
    
    if (verifiedCount === 0) {
      console.log('   ⚠️  Users not verified - they might be stuck in signup flow');
    }

  } catch (error) {
    console.error('❌ Error investigating null users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  investigateNullUsers();
}

module.exports = { investigateNullUsers };