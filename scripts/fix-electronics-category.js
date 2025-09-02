#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixElectronicsCategory() {
  console.log('🔄 Fixing electronics category capitalization...');
  
  try {
    // First, let's see what categories we have
    console.log('📊 Checking current categories...');
    
    const categories = await prisma.listing.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        category: {
          not: null
        }
      }
    });
    
    console.log('Current categories:');
    categories.forEach(cat => {
      console.log(`   - "${cat.category}": ${cat._count.category} listings`);
    });
    
    // Find listings with lowercase "electronics"
    const electronicsListings = await prisma.listing.findMany({
      where: {
        category: 'electronics'
      },
      select: {
        id: true,
        title: true,
        category: true
      }
    });
    
    console.log(`\n📱 Found ${electronicsListings.length} listings with lowercase "electronics"`);
    
    if (electronicsListings.length > 0) {
      console.log('Listings to update:');
      electronicsListings.forEach(listing => {
        console.log(`   - ${listing.title} (ID: ${listing.id})`);
      });
      
      // Update all lowercase "electronics" to "Electronics"
      const updateResult = await prisma.listing.updateMany({
        where: {
          category: 'electronics'
        },
        data: {
          category: 'Electronics'
        }
      });
      
      console.log(`\n✅ Updated ${updateResult.count} listings from "electronics" to "Electronics"`);
    } else {
      console.log('\n✅ No listings found with lowercase "electronics" - already correct!');
    }
    
    // Show final categories
    console.log('\n📊 Final categories:');
    const finalCategories = await prisma.listing.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        category: {
          not: null
        }
      }
    });
    
    finalCategories.forEach(cat => {
      console.log(`   - "${cat.category}": ${cat._count.category} listings`);
    });
    
    console.log('\n🎉 Category capitalization fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixElectronicsCategory();