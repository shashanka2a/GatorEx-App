#!/usr/bin/env node

/**
 * Test script to debug multi-image handling issues
 * This will check each step of the multi-image flow
 */

const { PrismaClient } = require('@prisma/client');

async function testMultiImageFlow() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Multi-Image Flow...\n');
    
    // 1. Check if there are any listings with multiple images
    console.log('1️⃣ Checking listings with multiple images...');
    const listingsWithMultipleImages = await prisma.listing.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        images: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`Found ${listingsWithMultipleImages.length} published listings`);
    
    const multiImageListings = listingsWithMultipleImages.filter(listing => listing.images.length > 1);
    console.log(`Found ${multiImageListings.length} listings with multiple images`);
    
    if (multiImageListings.length > 0) {
      console.log('\n📸 Multi-image listings:');
      multiImageListings.forEach((listing, index) => {
        console.log(`  ${index + 1}. "${listing.title}" - ${listing.images.length} images`);
        listing.images.forEach((img, imgIndex) => {
          console.log(`     Image ${imgIndex + 1}: ${img.url.substring(0, 60)}...`);
        });
      });
    }
    
    // 2. Check for duplicate images in the same listing
    console.log('\n2️⃣ Checking for duplicate images...');
    let duplicatesFound = 0;
    
    for (const listing of listingsWithMultipleImages) {
      const imageUrls = listing.images.map(img => img.url);
      const uniqueUrls = [...new Set(imageUrls)];
      
      if (imageUrls.length !== uniqueUrls.length) {
        duplicatesFound++;
        console.log(`  ⚠️  Listing "${listing.title}" has ${imageUrls.length - uniqueUrls.length} duplicate images`);
      }
    }
    
    if (duplicatesFound === 0) {
      console.log('  ✅ No duplicate images found');
    }
    
    // 3. Check image URL validity
    console.log('\n3️⃣ Checking image URL validity...');
    let invalidUrls = 0;
    
    for (const listing of listingsWithMultipleImages) {
      for (const image of listing.images) {
        try {
          new URL(image.url);
          // Check if it's a data URL (base64) - these should be uploaded to storage
          if (image.url.startsWith('data:')) {
            console.log(`  ⚠️  Found data URL in listing "${listing.title}" - should be uploaded to storage`);
            invalidUrls++;
          }
        } catch (error) {
          console.log(`  ❌ Invalid URL in listing "${listing.title}": ${image.url.substring(0, 50)}...`);
          invalidUrls++;
        }
      }
    }
    
    if (invalidUrls === 0) {
      console.log('  ✅ All image URLs are valid');
    }
    
    // 4. Test API response format
    console.log('\n4️⃣ Testing API response format...');
    if (listingsWithMultipleImages.length > 0) {
      const testListing = listingsWithMultipleImages[0];
      
      // Simulate the API response format
      const apiResponse = {
        id: testListing.id,
        title: testListing.title,
        description: testListing.description,
        price: testListing.price,
        category: testListing.category,
        condition: testListing.condition,
        meetingSpot: testListing.meetingSpot,
        views: testListing.views,
        createdAt: testListing.createdAt,
        images: testListing.images.map(img => ({ url: img.url })),
        user: { name: testListing.user.name }
      };
      
      console.log(`  Sample API response for "${testListing.title}":`);
      console.log(`    Images count: ${apiResponse.images.length}`);
      console.log(`    First image: ${apiResponse.images[0]?.url.substring(0, 60)}...`);
      
      // Check for frontend deduplication logic
      const uniqueImages = apiResponse.images.filter((image, index, self) => 
        index === self.findIndex(img => img.url === image.url)
      );
      
      if (uniqueImages.length !== apiResponse.images.length) {
        console.log(`  ⚠️  Frontend deduplication would remove ${apiResponse.images.length - uniqueImages.length} duplicates`);
      } else {
        console.log(`  ✅ No duplicates to remove on frontend`);
      }
    }
    
    // 5. Check recent draft data
    console.log('\n5️⃣ Checking draft storage (localStorage simulation)...');
    
    // Simulate what might be in localStorage
    const sampleDraft = {
      title: 'Test Item',
      price: 50,
      images: [
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
      ],
      category: 'Electronics',
      condition: 'Good',
      meetingSpot: 'Reitz Union',
      description: 'Test description'
    };
    
    console.log(`  Sample draft has ${sampleDraft.images.length} images`);
    console.log(`  All images are data URLs: ${sampleDraft.images.every(img => img.startsWith('data:'))}`);
    
    // Check if images would be properly uploaded
    const totalSize = sampleDraft.images.reduce((total, img) => {
      // Rough estimate of base64 size
      return total + (img.length * 0.75); // base64 is ~33% larger than binary
    }, 0);
    
    const totalSizeMB = totalSize / (1024 * 1024);
    console.log(`  Estimated total size: ${totalSizeMB.toFixed(2)}MB`);
    
    if (totalSizeMB > 4) {
      console.log(`  ⚠️  Size exceeds 4MB API limit - would fail to publish`);
    } else {
      console.log(`  ✅ Size within API limits`);
    }
    
    // 6. Summary and recommendations
    console.log('\n📋 Summary and Recommendations:');
    
    if (multiImageListings.length === 0) {
      console.log('  ❌ ISSUE: No listings with multiple images found');
      console.log('     - Check if image upload is working in the chat wizard');
      console.log('     - Verify images are being saved to draft properly');
      console.log('     - Check if publish API is handling multiple images');
    } else {
      console.log('  ✅ Multiple image listings exist in database');
    }
    
    if (duplicatesFound > 0) {
      console.log('  ❌ ISSUE: Duplicate images found in database');
      console.log('     - Check deduplication logic in publish API');
      console.log('     - Verify frontend deduplication in SellChatWizard');
    }
    
    if (invalidUrls > 0) {
      console.log('  ❌ ISSUE: Invalid or data URLs found');
      console.log('     - Images should be uploaded to Supabase storage');
      console.log('     - Check image upload flow in SellChatWizard');
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Test image upload in chat wizard with multiple images');
    console.log('2. Check browser console for errors during upload');
    console.log('3. Verify draft auto-save is working with multiple images');
    console.log('4. Test publish flow with multiple images');
    console.log('5. Check if images display correctly on buy page');
    
  } catch (error) {
    console.error('❌ Error testing multi-image flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMultiImageFlow().catch(console.error);