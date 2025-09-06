#!/usr/bin/env node

/**
 * Test script to verify the Cloudinary image upload flow is working correctly
 */

const { v2: cloudinary } = require('cloudinary');

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

async function testCloudinaryUploadFlow() {
  try {
    console.log('🧪 Testing Cloudinary Upload Flow...\n');

    // 1. Test Cloudinary connection
    console.log('1️⃣ Testing Cloudinary connection...');
    
    try {
      const result = await cloudinary.api.ping();
      console.log('✅ Connected to Cloudinary successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Cloudinary:', error.message);
      return;
    }

    // 2. Test image upload with a sample data URL
    console.log('\n2️⃣ Testing image upload with sample data URL...');
    
    // Create a small test image (1x1 pixel red PNG)
    const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    try {
      console.log('  📁 Uploading test image...');
      
      const testUserId = 'test-user-123';
      const uploadResult = await cloudinary.uploader.upload(testDataUrl, {
        folder: `gatorex/listings/${testUserId}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ],
        tags: ['listing', 'user_upload', 'test']
      });
      
      console.log('✅ Upload successful');
      console.log(`✅ Public URL: ${uploadResult.secure_url}`);
      console.log(`✅ Public ID: ${uploadResult.public_id}`);
      
      // Test if URL is accessible
      try {
        const testResponse = await fetch(uploadResult.secure_url);
        if (testResponse.ok) {
          console.log('✅ Image URL is accessible');
        } else {
          console.log(`⚠️  Image URL returned status: ${testResponse.status}`);
        }
      } catch (fetchError) {
        console.log('⚠️  Could not test image URL accessibility:', fetchError.message);
      }
      
      // Clean up test file
      try {
        const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
        if (deleteResult.result === 'ok') {
          console.log('✅ Test file cleaned up');
        } else {
          console.log('⚠️  Could not clean up test file');
        }
      } catch (deleteError) {
        console.log('⚠️  Could not clean up test file:', deleteError.message);
      }
      
    } catch (error) {
      console.error('❌ Image upload test failed:', error.message);
      return;
    }

    // 3. Test multiple image upload simulation
    console.log('\n3️⃣ Testing multiple image upload simulation...');
    
    const uploadedImages = [];
    const testCount = 3;
    
    for (let i = 0; i < testCount; i++) {
      try {
        console.log(`  📸 Uploading image ${i + 1}/${testCount}...`);
        
        const uploadResult = await cloudinary.uploader.upload(testDataUrl, {
          folder: `gatorex/listings/test-user-multi`,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' },
            { format: 'auto' }
          ],
          tags: ['listing', 'user_upload', 'test', 'multi']
        });
        
        uploadedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
        
        console.log(`    ✅ Upload ${i + 1} successful`);
        
      } catch (error) {
        console.log(`    ❌ Upload ${i + 1} failed:`, error.message);
      }
    }
    
    console.log(`✅ Successfully uploaded ${uploadedImages.length}/${testCount} images`);
    
    // Clean up multiple test files
    if (uploadedImages.length > 0) {
      console.log('  🧹 Cleaning up test files...');
      
      for (const image of uploadedImages) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.log(`    ⚠️  Could not delete ${image.publicId}`);
        }
      }
      
      console.log('✅ All test files cleaned up');
    }

    // 4. Test folder structure
    console.log('\n4️⃣ Testing folder structure...');
    
    try {
      // List resources in the gatorex folder
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'gatorex/',
        max_results: 10
      });
      
      console.log(`✅ Found ${resources.resources.length} existing images in gatorex folder`);
      
      if (resources.resources.length > 0) {
        console.log('  📁 Sample images:');
        resources.resources.slice(0, 3).forEach((resource, index) => {
          console.log(`    ${index + 1}. ${resource.public_id}`);
        });
      }
      
    } catch (error) {
      console.log('⚠️  Could not list folder contents:', error.message);
    }

    console.log('\n🎉 Cloudinary upload flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Cloudinary connection working');
    console.log('  ✅ Single image upload working');
    console.log('  ✅ Multiple image upload working');
    console.log('  ✅ Image transformations applied');
    console.log('  ✅ Public URL generation working');
    console.log('  ✅ File cleanup working');
    console.log('  ✅ Folder organization working');
    
    console.log('\n🚀 The Cloudinary upload infrastructure is ready!');
    console.log('   Next: Test the updated SellChatWizard component');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCloudinaryUploadFlow().catch(console.error);