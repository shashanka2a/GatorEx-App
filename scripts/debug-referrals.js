#!/usr/bin/env node

/**
 * Debug referral system - check clicks, completions, and identify issues
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugReferrals() {
  try {
    console.log('🔍 Debugging referral system...\n');

    // Get all referral codes and their stats
    const referralCodes = await prisma.referralCode.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            ufEmail: true
          }
        }
      }
    });

    console.log(`📊 Found ${referralCodes.length} referral codes\n`);

    for (const code of referralCodes) {
      console.log(`👤 User: ${code.user.name} (${code.user.ufEmail})`);
      console.log(`🔗 Code: ${code.code}`);
      
      // Get clicks for this code
      const clicks = await prisma.referralClick.findMany({
        where: { code: code.code },
        orderBy: { ts: 'desc' }
      });
      
      // Get completed referrals
      const referrals = await prisma.referral.findMany({
        where: { code: code.code },
        include: {
          referee: {
            select: {
              id: true,
              name: true,
              ufEmail: true,
              ufEmailVerified: true,
              createdAt: true
            }
          }
        },
        orderBy: { ts: 'desc' }
      });
      
      console.log(`📈 Clicks: ${clicks.length}`);
      console.log(`✅ Completed Referrals: ${referrals.length}`);
      
      if (clicks.length > 0) {
        console.log(`   Latest click: ${clicks[0].ts}`);
      }
      
      if (referrals.length > 0) {
        console.log(`   Referrals:`);
        referrals.forEach(ref => {
          console.log(`     • ${ref.referee.name} (${ref.referee.ufEmail}) - Status: ${ref.status} - Verified: ${ref.referee.ufEmailVerified}`);
        });
      }
      
      // Check for recent signups that might be missing referral attribution
      if (clicks.length > 0 && referrals.length === 0) {
        const recentSignups = await prisma.user.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            },
            ufEmailVerified: true
          },
          select: {
            id: true,
            name: true,
            ufEmail: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        });
        
        if (recentSignups.length > 0) {
          console.log(`   ⚠️  Recent verified signups (might be missing attribution):`);
          recentSignups.forEach(user => {
            console.log(`     • ${user.name} (${user.ufEmail}) - ${user.createdAt}`);
          });
        }
      }
      
      console.log('---\n');
    }

    // Check for orphaned referral clicks (clicks without completions)
    const orphanedClicks = await prisma.referralClick.findMany({
      where: {
        ts: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        referral_codes: {
          include: {
            user: {
              select: {
                name: true,
                ufEmail: true
              }
            }
          }
        }
      }
    });

    console.log(`🔍 Recent clicks (last 7 days): ${orphanedClicks.length}`);
    
    for (const click of orphanedClicks) {
      const hasCompletion = await prisma.referral.findFirst({
        where: {
          code: click.code,
          ts: {
            gte: click.ts
          }
        }
      });
      
      if (!hasCompletion) {
        console.log(`   ⚠️  Orphaned click: ${click.code} (${click.referral_codes.user.name}) - ${click.ts}`);
      }
    }

    // Summary
    const totalClicks = await prisma.referralClick.count();
    const totalReferrals = await prisma.referral.count();
    const verifiedReferrals = await prisma.referral.count({
      where: { status: 'verified' }
    });

    console.log('\n📊 Summary:');
    console.log(`   Total clicks: ${totalClicks}`);
    console.log(`   Total referrals: ${totalReferrals}`);
    console.log(`   Verified referrals: ${verifiedReferrals}`);
    console.log(`   Conversion rate: ${totalClicks > 0 ? ((verifiedReferrals / totalClicks) * 100).toFixed(1) : 0}%`);

  } catch (error) {
    console.error('❌ Error debugging referrals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  debugReferrals();
}

module.exports = { debugReferrals };