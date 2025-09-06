#!/usr/bin/env node

/**
 * Migration script to convert existing data URL images to proper Supabase storage URLs
 */

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

// Initialize clients
const prisma = new PrismaClient();

// Cloudinary config using existing environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary environment variables');
  console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});



async function uploadImageToCloudinary(dataUrl, userId) {
  try {
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: `GatorEX/listings/${userId}`,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ],
      tags: ['listing', 'user_upload', 'migrated']
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

async function migrateDataUrlsToStorage() {
  try {
    console.log('🔄 Starting migration of data URLs to Cloudinary storage...\n');

    // Find all listings with data URL images
    const listings = await prisma.listing.findMany({
      include: {
        images: true,
        user: {
          select: { id: true, name: true }
        }
      }
    });

    console.log(`Found ${listings.length} total listings`);

    let migratedListings = 0;
    let migratedImages = 0;
    let errors = 0;

    for (const listing of listings) {
      const dataUrlImages = listing.images.filter(img => img.url.startsWith('data:'));
      
      if (dataUrlImages.length === 0) {
        continue; // No data URLs to migrate
      }

      console.log(`\n📦 Migrating "${listing.title}" (${dataUrlImages.length} data URL images)`);
      
      const newImageUrls = [];
      let listingHasErrors = false;

      for (let i = 0; i < dataUrlImages.length; i++) {
        const image = dataUrlImages[i];
        console.log(`  📸 Uploading image ${i + 1}/${dataUrlImages.length}...`);

        try {
          // Upload data URL directly to Cloudinary
          const uploadedUrl = await uploadImageToCloudinary(image.url, listing.userId);
          if (!uploadedUrl) {
            console.log(`    ❌ Failed to upload to Cloudinary`);
            errors++;
            listingHasErrors = true;
            continue;
          }

          // Update the image record
          await prisma.image.update({
            where: { id: image.id },
            data: { url: uploadedUrl }
          });

          newImageUrls.push(uploadedUrl);
          console.log(`    ✅ Uploaded successfully`);
          migratedImages++;

        } catch (error) {
          console.log(`    ❌ Error: ${error.message}`);
          errors++;
          listingHasErrors = true;
        }
      }

      if (!listingHasErrors) {
        migratedListings++;
        console.log(`  ✅ Successfully migrated all images for "${listing.title}"`);
      } else {
        console.log(`  ⚠️  Partial migration for "${listing.title}"`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Listings fully migrated: ${migratedListings}`);
    console.log(`  📸 Images migrated: ${migratedImages}`);
    console.log(`  ❌ Errors: ${errors}`);

    if (errors === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Check the logs above.');
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const remainingDataUrls = await prisma.image.count({
      where: {
        url: {
          startsWith: 'data:'
        }
      }
    });

    if (remainingDataUrls === 0) {
      console.log('✅ No data URLs remaining in database');
    } else {
      console.log(`⚠️  ${remainingDataUrls} data URLs still remain in database`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateDataUrlsToStorage().catch(console.error);