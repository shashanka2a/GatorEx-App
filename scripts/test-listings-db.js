#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testListings() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Listings Database');
    console.log('============================');

    // Check total listings
    const totalListings = await prisma.listing.count();
    console.log(`📊 Total listings in database: ${totalListings}`);

    // Check published listings
    const publishedListings = await prisma.listing.count({
      where: { status: 'PUBLISHED' }
    });
    console.log(`✅ Published listings: ${publishedListings}`);

    // Check non-expired listings
    const activeListings = await prisma.listing.count({
      where: {
        status: 'PUBLISHED',
        expiresAt: { gt: new Date() }
      }
    });
    console.log(`⏰ Active (non-expired) listings: ${activeListings}`);

    // Get recent listings
    const recentListings = await prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        user: {
          select: { email: true }
        }
      }
    });

    console.log('\n📋 Recent listings:');
    recentListings.forEach((listing, i) => {
      console.log(`${i + 1}. "${listing.title}" - $${listing.price}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Created: ${listing.createdAt.toISOString()}`);
      console.log(`   Expires: ${listing.expiresAt.toISOString()}`);
      console.log(`   User: ${listing.user.email}`);
      console.log('');
    });

    // Check for any listings created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.listing.count({
      where: {
        createdAt: { gte: oneHourAgo }
      }
    });
    console.log(`🕐 Listings created in last hour: ${recentCount}`);

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testListings();