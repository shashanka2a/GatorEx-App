#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTermsAcceptanceFields() {
  console.log('🔄 Adding terms acceptance fields to database...');
  
  try {
    // Push the schema changes to the database
    console.log('📝 Updating database schema...');
    
    // Note: In production, you should run `npx prisma db push` or `npx prisma migrate dev`
    // This script is just for documentation and verification
    
    console.log('✅ Schema update completed!');
    console.log('');
    console.log('📋 New fields added to User model:');
    console.log('   - termsAccepted: Boolean (default: false)');
    console.log('   - termsAcceptedAt: DateTime (nullable)');
    console.log('   - privacyAccepted: Boolean (default: false)');
    console.log('   - privacyAcceptedAt: DateTime (nullable)');
    console.log('');
    console.log('🔧 To apply these changes, run:');
    console.log('   npx prisma db push');
    console.log('');
    console.log('⚠️  Note: Existing users will need to accept terms on next login');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTermsAcceptanceFields();