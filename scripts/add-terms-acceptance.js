#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function pushSchemaChanges() {
  console.log('🔄 Pushing database schema changes...');
  
  try {
    // Generate Prisma client first
    console.log('📝 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema changes to database
    console.log('🚀 Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Schema update completed successfully!');
    console.log('');
    console.log('📋 New fields added to User model:');
    console.log('   - termsAccepted: Boolean (default: false)');
    console.log('   - termsAcceptedAt: DateTime (nullable)');
    console.log('   - privacyAccepted: Boolean (default: false)');
    console.log('   - privacyAcceptedAt: DateTime (nullable)');
    console.log('');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      
      // Check if we can query users
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} users in database`);
      
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('');
    console.log('🎉 All done! Your app should now work with terms acceptance.');
    console.log('⚠️  Note: Existing users will need to accept terms on next login');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
    console.log('');
    console.log('🔧 Manual steps to fix:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma db push');
    console.log('3. Restart your development server');
    process.exit(1);
  }
}

pushSchemaChanges();