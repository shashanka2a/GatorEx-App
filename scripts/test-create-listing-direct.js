#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testCreateListing() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Direct Listing Creation');
    console.log('==================================');

    // First, check if we have any users
    const users = await prisma.user.findMany({
      take: 1,
      select: { id: true, email: true }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database. You need to sign up first.');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Using test user: ${testUser.email}`);

    // Create a test listing
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const listing = await prisma.listing.create({
      data: {
        title: 'Test Listing from Script',
        description: 'This is a test listing created directly via script',
        price: 25.99,
        category: 'Electronics',
        condition: 'Good',
        meetingSpot: 'Reitz Union',
        status: 'PUBLISHED',
        expiresAt: expiresAt,
        userId: testUser.id
      }
    });

    console.log('✅ Listing created successfully!');
    console.log(`📋 Listing ID: ${listing.id}`);
    console.log(`📝 Title: ${listing.title}`);
    console.log(`💰 Price: $${listing.price}`);
    console.log(`📅 Expires: ${listing.expiresAt}`);

    // Now check if it shows up in the buy page query
    const buyPageListings = await prisma.listing.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { gt: new Date() }
      },
      include: {
        images: { select: { url: true } },
        user: { select: { email: true, name: true, phoneNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n🛒 Buy page would show ${buyPageListings.length} listings`);
    buyPageListings.forEach((listing, i) => {
      console.log(`${i + 1}. "${listing.title}" - $${listing.price}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateListing();