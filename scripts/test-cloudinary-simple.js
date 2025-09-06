#!/usr/bin/env node

// Simple Cloudinary test with manual configuration
const { v2: cloudinary } = require('cloudinary');

console.log('🔧 Testing Cloudinary with manual configuration...\n');

// Try with the Root key from dashboard
const configs = [
  {
    name: 'GatorEx Key',
    cloud_name: 'ddtctvybo',
    api_key: '545624727647286',
    api_secret: 'YPjIuy0ierEwLnckb31oQsF8fzs'
  },
  {
    name: 'Root Key',
    cloud_name: 'ddtctvybo',
    api_key: '924255517586493',
    api_secret: 'YPjIuy0ierEwLnckb31oQsF8fzs'  // Assuming same secret
  }
];

async function testConfig(config) {
  console.log(`\n🔍 Testing ${config.name}:`);
  console.log(`Cloud Name: ${config.cloud_name}`);
  console.log(`API Key: ${config.api_key}`);
  console.log(`API Secret: ***${config.api_secret.slice(-4)}`);
  
  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
  });

  try {
    const result = await cloudinary.api.ping();
    console.log('✅ SUCCESS! Connection established');
    console.log('Response:', result);
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    if (error.error) {
      console.log('Error:', error.error.message);
      console.log('HTTP Code:', error.error.http_code);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function testAllConfigs() {
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
      console.log(`\n🎉 Working configuration found: ${config.name}`);
      console.log('\nUpdate your .env.local with:');
      console.log(`CLOUDINARY_CLOUD_NAME="${config.cloud_name}"`);
      console.log(`CLOUDINARY_API_KEY="${config.api_key}"`);
      console.log(`CLOUDINARY_API_SECRET="${config.api_secret}"`);
      return;
    }
  }
  
  console.log('\n❌ No working configuration found.');
  console.log('Please check your Cloudinary dashboard for the correct API secret.');
}

testAllConfigs();