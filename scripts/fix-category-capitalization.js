#!/usr/bin/env node

/**
 * Fix category capitalization in existing listings
 * This script normalizes categories like "electronics" to "Electronics"
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Category normalization mapping
const CATEGORY_FIXES = {
  'electronics': 'Electronics',
  'textbooks': 'Textbooks',
  'books': 'Textbooks',
  'furniture': 'Furniture',
  'clothing': 'Clothing',
  'sports': 'Sports & Recreation',
  'sports & recreation': 'Sports & Recreation',
  'home': 'Home & Garden',
  'home & garden': 'Home & Garden',
  'transportation': 'Transportation',
  'services': 'Services',
  'food': 'Food & Beverages',
  'food & beverages': 'Food & Beverages',
  'beauty': 'Beauty & Personal Care',
  'beauty & personal care': 'Beauty & Personal Care',
  'art': 'Art & Crafts',
  'art & crafts': 'Art & Crafts',
  'music': 'Music & Instruments',
  'music & instruments': 'Music & Instruments',
  'pets': 'Pet Supplies',
  'pet supplies': 'Pet Supplies',
  'office': 'Office & School Supplies',
  'office & school supplies': 'Office & School Supplies',
  'health': 'Health & Wellness',
  'health & wellness': 'Health & Wellness',
  'party': 'Party & Events',
  'party & events': 'Party & Events',
  'storage': 'Storage & Organization',
  'storage & organization': 'Storage & Organization',
  'seasonal': 'Seasonal Items',
  'seasonal items': 'Seasonal Items',
  'other': 'Other'
};

async function fixCategoryCapitalization() {
  try {
    console.log('🔍 Checking for listings with incorrect category capitalization...');
    
    // Get all listings
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        category: true
      }
    });
    
    console.log(`📊 Found ${listings.length} total listings`);
    
    let fixedCount = 0;
    const fixes = [];
    
    for (const listing of listings) {
      const currentCategory = listing.category;
      const normalizedCategory = CATEGORY_FIXES[currentCategory.toLowerCase()] || currentCategory;
      
      if (currentCategory !== normalizedCategory) {
        fixes.push({
          id: listing.id,
          title: listing.title,
          oldCategory: currentCategory,
          newCategory: normalizedCategory
        });
        fixedCount++;
      }
    }
    
    if (fixes.length === 0) {
      console.log('✅ All categories are already properly capitalized!');
      return;
    }
    
    console.log(`\n🔧 Found ${fixes.length} listings that need category fixes:`);
    fixes.forEach(fix => {
      console.log(`  • "${fix.title}" (ID: ${fix.id})`);
      console.log(`    ${fix.oldCategory} → ${fix.newCategory}`);
    });
    
    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('\n❓ Do you want to apply these fixes? (y/N): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      return;
    }
    
    // Apply fixes
    console.log('\n🔄 Applying category fixes...');
    
    for (const fix of fixes) {
      await prisma.listing.update({
        where: { id: fix.id },
        data: { category: fix.newCategory }
      });
      console.log(`✅ Fixed: ${fix.title}`);
    }
    
    console.log(`\n🎉 Successfully fixed ${fixes.length} listings!`);
    
    // Show summary of categories
    const updatedListings = await prisma.listing.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    
    console.log('\n📈 Updated category distribution:');
    updatedListings.forEach(group => {
      console.log(`  ${group.category}: ${group._count.category} listings`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixCategoryCapitalization();
}

module.exports = { fixCategoryCapitalization };