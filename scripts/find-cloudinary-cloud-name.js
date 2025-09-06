#!/usr/bin/env node

// Script to help find the correct Cloudinary cloud name
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('🔍 Finding correct Cloudinary cloud name...\n');
console.log(`API Key: ${API_KEY}`);
console.log(`API Secret: ${API_SECRET ? '***' + API_SECRET.slice(-4) : 'NOT SET'}\n`);

// Common cloud name patterns to try
const possibleNames = [
  'ddtctvybo',
  'gatorex',
  'GatorEx',  // Key name from dashboard
  'gatorex-shop',
  'gatorex-mobile',
  'gatorex-app',
  'gator-ex',
  'gatorexshop'
];

async function testCloudName(cloudName) {
  return new Promise((resolve) => {
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/ping`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'CloudinaryNodeJS/2.7.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, cloudName, response: data });
        } else {
          resolve({ success: false, cloudName, statusCode: res.statusCode, response: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, cloudName, error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, cloudName, error: 'Timeout' });
    });

    req.end();
  });
}

async function findCorrectCloudName() {
  console.log('Testing possible cloud names...\n');
  
  for (const cloudName of possibleNames) {
    process.stdout.write(`Testing "${cloudName}"... `);
    const result = await testCloudName(cloudName);
    
    if (result.success) {
      console.log('✅ SUCCESS!');
      console.log(`\n🎉 Found correct cloud name: "${cloudName}"`);
      console.log('Response:', result.response);
      return cloudName;
    } else {
      console.log(`❌ Failed (${result.statusCode || result.error})`);
    }
  }
  
  console.log('\n❌ None of the common cloud names worked.');
  console.log('\n🔧 Next steps:');
  console.log('1. Log into your Cloudinary dashboard');
  console.log('2. Go to Account Details');
  console.log('3. Copy the exact "Cloud Name" (not username or email)');
  console.log('4. Update your .env.local file with the correct cloud name');
  
  return null;
}

findCorrectCloudName().then(cloudName => {
  if (cloudName) {
    console.log(`\n✅ Update your .env.local with: CLOUDINARY_CLOUD_NAME="${cloudName}"`);
  }
  process.exit(cloudName ? 0 : 1);
});