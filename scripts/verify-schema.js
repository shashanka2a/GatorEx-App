#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function verifySchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verifying database schema...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if all tables exist by running simple queries
    const checks = [
      { name: 'users', query: () => prisma.user.count() },
      { name: 'listings', query: () => prisma.listing.count() },
      { name: 'giveaways', query: () => prisma.giveaway.count() },
      { name: 'giveaway_entries', query: () => prisma.giveawayEntry.count() },
      { name: 'accounts', query: () => prisma.account.count() },
      { name: 'sessions', query: () => prisma.session.count() },
      { name: 'images', query: () => prisma.image.count() },
      { name: 'otp_codes', query: () => prisma.oTP.count() }
    ];
    
    for (const check of checks) {
      try {
        const count = await check.query();
        console.log(`✅ Table '${check.name}': ${count} records`);
      } catch (error) {
        console.log(`❌ Table '${check.name}': ${error.message}`);
      }
    }
    
    console.log('🎉 Schema verification complete!');
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();