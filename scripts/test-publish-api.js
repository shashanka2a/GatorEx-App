#!/usr/bin/env node

console.log('🧪 Testing Publish API');
console.log('======================');

const testListing = {
  title: "Test iPhone 14",
  price: 500,
  images: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
  category: "Electronics",
  condition: "Good",
  meetingSpot: "Reitz Union",
  description: "Test listing from script"
};

console.log('📋 Test listing data:');
console.log(JSON.stringify(testListing, null, 2));

console.log('\n💡 To test manually:');
console.log('1. Start dev server: npm run dev');
console.log('2. Open browser dev tools');
console.log('3. Go to /sell and complete the flow');
console.log('4. Check console for any errors');
console.log('5. Check network tab for API calls');

console.log('\n🔍 Things to check:');
console.log('- Is the user authenticated?');
console.log('- Are all required fields present?');
console.log('- Is the API returning errors?');
console.log('- Are there any database connection issues?');

console.log('\n📊 Run this to check database:');
console.log('node scripts/test-listings-db.js');