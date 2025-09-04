#!/usr/bin/env node

/**
 * Test the title polishing functionality
 */

const { ListingParser } = require('../src/lib/ai/listingParser');

const testCases = [
  "Selling this apple mouse, DM for price!",
  "Apple Watch for",
  "iphone 13 pro max 256gb",
  "samsung galaxy s23 ultra like new condition",
  "macbook air 13 inch 2022",
  "nintendo switch oled, message me",
  "airpods pro 2nd gen - serious buyers only",
  "instant pot 6qt, cash only",
  "gaming chair obo",
  "textbook for chemistry class",
  "Tool Kit 401",
  "Samsung Z Flip 4",
  "Keyboard",
  "Digital Weight Scale",
  "Air Fryer",
  "Instant Pot",
  "Monitor",
  "Twin Mattress With Bedframe",
  "iPhone 14",
  "Mechanical Keyboard"
];

async function testTitlePolishing() {
  console.log('🧪 Testing title polishing functionality...\n');
  
  for (const testCase of testCases) {
    try {
      // Test AI version (will fallback to basic if no API key)
      const polishedAI = await ListingParser.polishTitleWithAI(testCase);
      
      // Test basic version
      const polishedBasic = ListingParser.polishTitleBasic(testCase);
      
      console.log(`Original: "${testCase}"`);
      console.log(`AI Polish: "${polishedAI}"`);
      console.log(`Basic Polish: "${polishedBasic}"`);
      console.log('---');
    } catch (error) {
      console.error(`Error polishing "${testCase}":`, error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testTitlePolishing();
}

module.exports = { testTitlePolishing };