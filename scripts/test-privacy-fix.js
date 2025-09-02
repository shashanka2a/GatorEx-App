#!/usr/bin/env node

const fetch = require('node-fetch');

async function testPrivacyFix() {
  console.log('🔒 Testing privacy fix for listings API...');
  
  try {
    // Test the public listings endpoint
    const response = await fetch('http://localhost:3000/api/listings');
    
    if (!response.ok) {
      console.log('⚠️  API not available (server not running)');
      return;
    }
    
    const listings = await response.json();
    
    if (listings.length === 0) {
      console.log('ℹ️  No listings found to test');
      return;
    }
    
    const firstListing = listings[0];
    
    // Check if contact details are exposed
    const hasEmail = firstListing.user && firstListing.user.email;
    const hasPhone = firstListing.user && firstListing.user.phoneNumber;
    
    console.log('📊 Privacy Test Results:');
    console.log(`   - Email exposed: ${hasEmail ? '❌ YES (PRIVACY ISSUE!)' : '✅ NO'}`);
    console.log(`   - Phone exposed: ${hasPhone ? '❌ YES (PRIVACY ISSUE!)' : '✅ NO'}`);
    console.log(`   - Name available: ${firstListing.user?.name ? '✅ YES' : '❌ NO'}`);
    
    if (!hasEmail && !hasPhone) {
      console.log('🎉 Privacy fix successful! Contact details are protected.');
    } else {
      console.log('🚨 Privacy issue detected! Contact details are still exposed.');
    }
    
  } catch (error) {
    console.error('❌ Error testing privacy fix:', error.message);
  }
}

testPrivacyFix();