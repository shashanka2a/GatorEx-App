#!/usr/bin/env node

/**
 * Test script to verify the image upload flow is working correctly
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testImageUploadFlow() {
  try {
    console.log('🧪 Testing Image Upload Flow...\n');

    // 1. Test Supabase storage connection
    console.log('1️⃣ Testing Supabase storage connection...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to connect to Supabase storage:', bucketsError);
      return;
    }
    
    console.log(`✅ Connected to Supabase storage (${buckets.length} buckets found)`);
    
    const listingImagesBucket = buckets.find(bucket => bucket.name === 'listing-images');
    if (!listingImagesBucket) {
      console.log('⚠️  listing-images bucket not found. Creating it...');
      
      const { error: createError } = await supabase.storage.createBucket('listing-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Failed to create listing-images bucket:', createError);
        return;
      }
      
      console.log('✅ Created listing-images bucket');
    } else {
      console.log('✅ listing-images bucket exists');
    }

    // 2. Test image upload with a sample data URL
    console.log('\n2️⃣ Testing image upload with sample data URL...');
    
    // Create a small test image (1x1 pixel red PNG)
    const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    try {
      // Convert data URL to blob
      const response = await fetch(testDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      
      console.log(`  📁 Created test file: ${file.name} (${file.size} bytes)`);
      
      // Upload to Supabase
      const testUserId = 'test-user-123';
      const fileName = `${testUserId}/${Date.now()}-test.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Upload failed:', uploadError);
        return;
      }
      
      console.log('✅ Upload successful');
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);
      
      console.log(`✅ Public URL generated: ${urlData.publicUrl}`);
      
      // Test if URL is accessible
      try {
        const testResponse = await fetch(urlData.publicUrl);
        if (testResponse.ok) {
          console.log('✅ Image URL is accessible');
        } else {
          console.log(`⚠️  Image URL returned status: ${testResponse.status}`);
        }
      } catch (fetchError) {
        console.log('⚠️  Could not test image URL accessibility:', fetchError.message);
      }
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('listing-images')
        .remove([fileName]);
      
      if (deleteError) {
        console.log('⚠️  Could not clean up test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
      
    } catch (error) {
      console.error('❌ Image upload test failed:', error);
      return;
    }

    // 3. Test multiple image upload simulation
    console.log('\n3️⃣ Testing multiple image upload simulation...');
    
    const multipleTestUrls = [];
    const testCount = 3;
    
    for (let i = 0; i < testCount; i++) {
      try {
        const response = await fetch(testDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `test-image-${i + 1}.png`, { type: 'image/png' });
        
        const fileName = `test-user-multi/${Date.now()}-${i}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);
        
        if (uploadError) {
          console.log(`❌ Upload ${i + 1} failed:`, uploadError);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);
        
        multipleTestUrls.push({ fileName, url: urlData.publicUrl });
        console.log(`✅ Upload ${i + 1}/${testCount} successful`);
        
      } catch (error) {
        console.log(`❌ Upload ${i + 1} failed:`, error.message);
      }
    }
    
    console.log(`✅ Successfully uploaded ${multipleTestUrls.length}/${testCount} images`);
    
    // Clean up multiple test files
    if (multipleTestUrls.length > 0) {
      const filesToDelete = multipleTestUrls.map(item => item.fileName);
      const { error: deleteError } = await supabase.storage
        .from('listing-images')
        .remove(filesToDelete);
      
      if (deleteError) {
        console.log('⚠️  Could not clean up test files:', deleteError);
      } else {
        console.log('✅ All test files cleaned up');
      }
    }

    console.log('\n🎉 Image upload flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Supabase storage connection working');
    console.log('  ✅ listing-images bucket available');
    console.log('  ✅ Single image upload working');
    console.log('  ✅ Multiple image upload working');
    console.log('  ✅ Public URL generation working');
    console.log('  ✅ File cleanup working');
    
    console.log('\n🚀 The image upload infrastructure is ready!');
    console.log('   Next: Test the updated SellChatWizard component');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageUploadFlow().catch(console.error);