#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function createGiveawayTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Creating giveaway tables...');
    
    // Create giveaways table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "giveaways" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "prize" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ Created giveaways table');
    
    // Create giveaway_entries table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "giveaway_entries" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "giveawayId" TEXT NOT NULL,
        "instagramFollowed" BOOLEAN NOT NULL DEFAULT false,
        "ufEmailVerified" BOOLEAN NOT NULL DEFAULT false,
        "hasPostedListing" BOOLEAN NOT NULL DEFAULT false,
        "isEligible" BOOLEAN NOT NULL DEFAULT false,
        "instagramUsername" TEXT,
        "verifiedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "giveaway_entries_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ Created giveaway_entries table');
    
    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "giveaway_entries" 
      ADD CONSTRAINT "giveaway_entries_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "giveaway_entries" 
      ADD CONSTRAINT "giveaway_entries_giveawayId_fkey" 
      FOREIGN KEY ("giveawayId") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    console.log('✅ Added foreign key constraints');
    
    // Add unique constraint
    await prisma.$executeRaw`
      ALTER TABLE "giveaway_entries" 
      ADD CONSTRAINT "giveaway_entries_userId_giveawayId_key" 
      UNIQUE ("userId", "giveawayId");
    `;
    console.log('✅ Added unique constraint');
    
    console.log('🎉 Giveaway tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createGiveawayTables();