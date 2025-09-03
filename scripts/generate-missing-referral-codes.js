#!/usr/bin/env node

/**
 * Generate referral codes for existing users who don't have them
 * This fixes the issue where users registered before the referral system
 * don't have referral codes generated.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate a random referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateMissingReferralCodes() {
  try {
    console.log('🔍 Finding users without referral codes...');
    
    // Get all users who don't have referral codes
    const usersWithoutCodes = await prisma.$queryRaw`
      SELECT u.id, u.email, u.name 
      FROM users u 
      LEFT JOIN referral_codes rc ON u.id = rc.user_id 
      WHERE rc.user_id IS NULL
    `;

    console.log(`📊 Found ${usersWithoutCodes.length} users without referral codes`);

    if (usersWithoutCodes.length === 0) {
      console.log('✅ All users already have referral codes!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutCodes) {
      try {
        const code = generateReferralCode();
        
        // Check if code already exists (very unlikely but let's be safe)
        const existingCode = await prisma.$queryRaw`
          SELECT code FROM referral_codes WHERE code = ${code} LIMIT 1
        `;

        if (Array.isArray(existingCode) && existingCode.length > 0) {
          // Generate a new code if collision
          const newCode = generateReferralCode() + Math.floor(Math.random() * 10);
          await prisma.$executeRaw`
            INSERT INTO referral_codes (user_id, code) 
            VALUES (${user.id}, ${newCode})
          `;
          console.log(`✅ Generated code ${newCode} for user ${user.email}`);
        } else {
          await prisma.$executeRaw`
            INSERT INTO referral_codes (user_id, code) 
            VALUES (${user.id}, ${code})
          `;
          console.log(`✅ Generated code ${code} for user ${user.email}`);
        }
        
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to generate code for user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Successfully generated: ${successCount} codes`);
    console.log(`❌ Failed: ${errorCount} codes`);
    console.log(`📊 Total processed: ${usersWithoutCodes.length} users`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  generateMissingReferralCodes()
    .then(() => {
      console.log('🎉 Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { generateMissingReferralCodes };