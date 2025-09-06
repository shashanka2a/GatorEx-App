#!/usr/bin/env node

// Test Cloudinary connection with proper configuration
require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');

console.log('🔧 Testing Cloudinary Configuration...\n');

// Display current config (without secrets)
console.log('Configuration:');
console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`API Key: ${process.env.CLOUDINARY_API_KEY}`);
console.log(`API Secret: ${process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET'}\n`);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testConnection() {
  try {
    console.log('🔍 Testing connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Connected Successfully!');
    console.log('Response:', result);
    
    // Test upload capabilities
    console.log('\n🔍 Testing upload capabilities...');
    const uploadResult = await cloudinary.api.resources({
      resource_type: 'image',
      max_results: 1
    });
    console.log('✅ Upload API accessible');
    console.log(`Found ${uploadResult.total_count} images in account`);
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary Connection Failed:');
    console.error('Full error object:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.http_code);
    console.error('Error stack:', error.stack);
    
    if (error.http_code === 401) {
      console.error('\n🔧 Authentication Error - Check:');
      console.error('1. Cloud name is correct (case-sensitive)');
      console.error('2. API key and secret are valid');
      console.error('3. No extra spaces in environment variables');
    } else if (error.http_code === 404) {
      console.error('\n🔧 Cloud Name Error - The cloud name "ddtctvybo" might be incorrect');
    }
    
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});