#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTermsAcceptance() {
  console.log('🔄 Migrating database to add terms acceptance fields...');
  
  try {
    // Check if columns already exist
    console.log('🔍 Checking current database schema...');
    
    const checkColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('termsAccepted', 'termsAcceptedAt', 'privacyAccepted', 'privacyAcceptedAt')
    `;
    
    const existingColumns = checkColumns.map(row => row.column_name);
    console.log('📋 Existing columns:', existingColumns);
    
    // Add columns if they don't exist
    if (!existingColumns.includes('termsAccepted')) {
      console.log('➕ Adding termsAccepted column...');
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "termsAccepted" BOOLEAN NOT NULL DEFAULT false
      `;
    }
    
    if (!existingColumns.includes('termsAcceptedAt')) {
      console.log('➕ Adding termsAcceptedAt column...');
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "termsAcceptedAt" TIMESTAMP(3)
      `;
    }
    
    if (!existingColumns.includes('privacyAccepted')) {
      console.log('➕ Adding privacyAccepted column...');
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "privacyAccepted" BOOLEAN NOT NULL DEFAULT false
      `;
    }
    
    if (!existingColumns.includes('privacyAcceptedAt')) {
      console.log('➕ Adding privacyAcceptedAt column...');
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3)
      `;
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    const finalCheck = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('termsAccepted', 'termsAcceptedAt', 'privacyAccepted', 'privacyAcceptedAt')
      ORDER BY column_name
    `;
    
    console.log('✅ Migration completed! New columns:');
    finalCheck.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Test database operations
    console.log('🧪 Testing database operations...');
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    // Update existing users to have terms accepted (since they're already using the platform)
    if (userCount > 0) {
      console.log('🔄 Updating existing users to accept terms...');
      const now = new Date();
      const updatedUsers = await prisma.user.updateMany({
        where: {
          OR: [
            { termsAccepted: false },
            { privacyAccepted: false }
          ]
        },
        data: {
          termsAccepted: true,
          termsAcceptedAt: now,
          privacyAccepted: true,
          privacyAcceptedAt: now
        }
      });
      console.log(`✅ Updated ${updatedUsers.count} existing users`);
    }
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Added termsAccepted (Boolean, default: false)');
    console.log('   - Added termsAcceptedAt (DateTime, nullable)');
    console.log('   - Added privacyAccepted (Boolean, default: false)');
    console.log('   - Added privacyAcceptedAt (DateTime, nullable)');
    console.log('   - Updated existing users to accept terms');
    console.log('');
    console.log('🚀 Your app should now work with terms acceptance!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check database connection');
    console.log('2. Verify DATABASE_URL in .env');
    console.log('3. Ensure database is accessible');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTermsAcceptance();