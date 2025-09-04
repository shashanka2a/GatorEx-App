#!/usr/bin/env node

/**
 * Test Comprehensive Student Marketplace Categorization
 * 
 * This script tests ALL categories for student marketplace items
 */

const { ListingParser } = require('../src/lib/ai/listingParser');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testAllStudentCategories() {
  log('\n🎓 Testing ALL Student Marketplace Categories...', 'cyan');
  
  const comprehensiveTestCases = [
    // Electronics
    { input: "Air fryer, $45, like new", expectedCategory: "Electronics" },
    { input: "iPhone 13, $600, good condition", expectedCategory: "Electronics" },
    { input: "MacBook Pro, $1200, 2 years old", expectedCategory: "Electronics" },
    { input: "Coffee maker Keurig, $30", expectedCategory: "Electronics" },
    { input: "Bluetooth speaker JBL, $80", expectedCategory: "Electronics" },
    { input: "Nintendo Switch, $250, barely used", expectedCategory: "Electronics" },
    { input: "Apple Watch Series 8, $300", expectedCategory: "Electronics" },
    { input: "Gaming headset, $60, excellent", expectedCategory: "Electronics" },
    
    // Textbooks
    { input: "Calculus textbook Stewart 8th edition, $150", expectedCategory: "Textbooks" },
    { input: "Organic Chemistry book, $200, good condition", expectedCategory: "Textbooks" },
    { input: "Psychology textbook Myers, $100", expectedCategory: "Textbooks" },
    { input: "Java programming book, $80", expectedCategory: "Textbooks" },
    { input: "Nursing fundamentals textbook, $120", expectedCategory: "Textbooks" },
    
    // Furniture
    { input: "IKEA desk, $60, white", expectedCategory: "Furniture" },
    { input: "Gaming chair, $120, excellent", expectedCategory: "Furniture" },
    { input: "Twin mattress, $100, clean", expectedCategory: "Furniture" },
    { input: "Bookshelf 5-tier, $35", expectedCategory: "Furniture" },
    { input: "Futon couch, $150, converts to bed", expectedCategory: "Furniture" },
    { input: "Nightstand with drawer, $40", expectedCategory: "Furniture" },
    
    // Clothing
    { input: "Nike Air Force 1, size 9, $90", expectedCategory: "Clothing" },
    { input: "North Face jacket, medium, $80", expectedCategory: "Clothing" },
    { input: "Levi's jeans 32x30, $25", expectedCategory: "Clothing" },
    { input: "Backpack Jansport, $20", expectedCategory: "Clothing" },
    { input: "Adidas hoodie, large, $35", expectedCategory: "Clothing" },
    
    // Sports & Recreation
    { input: "Yoga mat, $15, barely used", expectedCategory: "Sports & Recreation" },
    { input: "Dumbbells 20lb set, $40", expectedCategory: "Sports & Recreation" },
    { input: "Basketball, $10, good condition", expectedCategory: "Sports & Recreation" },
    { input: "Skateboard, $60, complete setup", expectedCategory: "Sports & Recreation" },
    { input: "Tennis racket Wilson, $45", expectedCategory: "Sports & Recreation" },
    
    // Home & Garden
    { input: "String lights, $12, warm white", expectedCategory: "Home & Garden" },
    { input: "Area rug 5x7, $45", expectedCategory: "Home & Garden" },
    { input: "Desk lamp LED, $25", expectedCategory: "Home & Garden" },
    { input: "Kitchen utensil set, $20", expectedCategory: "Home & Garden" },
    { input: "Succulent plants, $8 each", expectedCategory: "Home & Garden" },
    
    // Transportation
    { input: "Mountain bike Trek, $300", expectedCategory: "Transportation" },
    { input: "Electric scooter, $200, works great", expectedCategory: "Transportation" },
    { input: "Honda Civic 2015, $12000", expectedCategory: "Transportation" },
    { input: "Longboard, $80, good wheels", expectedCategory: "Transportation" },
    
    // Services
    { input: "Math tutoring, $25/hour", expectedCategory: "Services" },
    { input: "Moving help, $15/hour", expectedCategory: "Services" },
    { input: "Photography services, $50/session", expectedCategory: "Services" },
    { input: "Guitar lessons, $30/hour", expectedCategory: "Services" },
    
    // Food & Beverages
    { input: "Protein bars box, $20, unopened", expectedCategory: "Food & Beverages" },
    { input: "Energy drinks case, $15", expectedCategory: "Food & Beverages" },
    { input: "Dining plan credits, $200", expectedCategory: "Food & Beverages" },
    { input: "Starbucks gift card, $25", expectedCategory: "Food & Beverages" },
    
    // Beauty & Personal Care
    { input: "Makeup palette, $30, barely used", expectedCategory: "Beauty & Personal Care" },
    { input: "Hair straightener, $40, works great", expectedCategory: "Beauty & Personal Care" },
    { input: "Perfume bottle, $25, half full", expectedCategory: "Beauty & Personal Care" },
    { input: "Skincare routine set, $50", expectedCategory: "Beauty & Personal Care" },
    
    // Art & Crafts
    { input: "Acrylic paint set, $15, new", expectedCategory: "Art & Crafts" },
    { input: "Canvas boards pack, $10", expectedCategory: "Art & Crafts" },
    { input: "Sewing machine, $80, works well", expectedCategory: "Art & Crafts" },
    { input: "Yarn bundle, $20, various colors", expectedCategory: "Art & Crafts" },
    
    // Music & Instruments
    { input: "Acoustic guitar, $120, good condition", expectedCategory: "Music & Instruments" },
    { input: "Keyboard piano, $200, 88 keys", expectedCategory: "Music & Instruments" },
    { input: "Microphone USB, $60, for recording", expectedCategory: "Music & Instruments" },
    { input: "Ukulele, $40, beginner friendly", expectedCategory: "Music & Instruments" },
    
    // Pet Supplies
    { input: "Dog food bag, $30, unopened", expectedCategory: "Pet Supplies" },
    { input: "Cat litter box, $15, clean", expectedCategory: "Pet Supplies" },
    { input: "Fish tank 20 gallon, $50", expectedCategory: "Pet Supplies" },
    { input: "Pet carrier, $25, medium size", expectedCategory: "Pet Supplies" },
    
    // Office & School Supplies
    { input: "Notebooks pack, $8, college ruled", expectedCategory: "Office & School Supplies" },
    { input: "Scientific calculator, $35, TI-84", expectedCategory: "Office & School Supplies" },
    { input: "Binders set, $12, 3-ring", expectedCategory: "Office & School Supplies" },
    { input: "Highlighter set, $5, various colors", expectedCategory: "Office & School Supplies" },
    
    // Health & Wellness
    { input: "Vitamins bottle, $15, unopened", expectedCategory: "Health & Wellness" },
    { input: "Protein powder, $40, chocolate flavor", expectedCategory: "Health & Wellness" },
    { input: "First aid kit, $20, complete", expectedCategory: "Health & Wellness" },
    { input: "Essential oils set, $30", expectedCategory: "Health & Wellness" },
    
    // Party & Events
    { input: "Halloween costume, $25, size medium", expectedCategory: "Party & Events" },
    { input: "Party decorations, $15, birthday theme", expectedCategory: "Party & Events" },
    { input: "Christmas lights, $10, LED", expectedCategory: "Party & Events" },
    { input: "Photo booth props, $20, fun set", expectedCategory: "Party & Events" },
    
    // Storage & Organization
    { input: "Storage bins, $20, set of 4", expectedCategory: "Storage & Organization" },
    { input: "Closet organizer, $35, hanging", expectedCategory: "Storage & Organization" },
    { input: "Drawer dividers, $8, adjustable", expectedCategory: "Storage & Organization" },
    { input: "Shoe rack, $25, holds 12 pairs", expectedCategory: "Storage & Organization" },
    
    // Seasonal Items
    { input: "Winter coat, $60, warm and cozy", expectedCategory: "Seasonal Items" },
    { input: "Beach umbrella, $30, portable", expectedCategory: "Seasonal Items" },
    { input: "Christmas tree, $40, artificial", expectedCategory: "Seasonal Items" },
    { input: "Snow boots, $45, waterproof", expectedCategory: "Seasonal Items" }
  ];

  let correctCount = 0;
  let totalCount = comprehensiveTestCases.length;
  let categoryStats = {};
  
  for (const testCase of comprehensiveTestCases) {
    try {
      logInfo(`\nTesting: "${testCase.input}"`);
      logInfo(`Expected: ${testCase.expectedCategory}`);
      
      const result = await ListingParser.parseListingText(testCase.input);
      
      // Track category stats
      if (!categoryStats[testCase.expectedCategory]) {
        categoryStats[testCase.expectedCategory] = { correct: 0, total: 0 };
      }
      categoryStats[testCase.expectedCategory].total++;
      
      if (result.category === testCase.expectedCategory) {
        logSuccess(`✓ Correct: ${result.category}`);
        correctCount++;
        categoryStats[testCase.expectedCategory].correct++;
      } else {
        logError(`✗ Wrong: Got "${result.category}", expected "${testCase.expectedCategory}"`);
      }
      
      console.log(`  Title: ${result.title}`);
      console.log(`  Price: ${result.price ? `$${result.price}` : 'Not specified'}`);
      console.log(`  Condition: ${result.condition}`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
    } catch (error) {
      logError(`Failed to parse: ${error.message}`);
      if (!categoryStats[testCase.expectedCategory]) {
        categoryStats[testCase.expectedCategory] = { correct: 0, total: 0 };
      }
      categoryStats[testCase.expectedCategory].total++;
    }
  }
  
  // Overall Summary
  const accuracy = (correctCount / totalCount * 100).toFixed(1);
  log(`\n📊 Overall Categorization Accuracy: ${correctCount}/${totalCount} (${accuracy}%)`, 'cyan');
  
  // Category-specific stats
  log(`\n📈 Category Performance:`, 'cyan');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const categoryAccuracy = (stats.correct / stats.total * 100).toFixed(1);
    const color = categoryAccuracy >= 90 ? 'green' : categoryAccuracy >= 70 ? 'yellow' : 'red';
    log(`  ${category}: ${stats.correct}/${stats.total} (${categoryAccuracy}%)`, color);
  });
  
  if (accuracy >= 90) {
    logSuccess('🎉 Excellent categorization performance across ALL categories!');
  } else if (accuracy >= 80) {
    log('👍 Good categorization performance', 'yellow');
  } else {
    logError('⚠️  Categorization needs improvement');
  }
}

async function main() {
  log('🎓 Comprehensive Student Marketplace Categorization Test', 'bright');
  log('=' .repeat(60), 'cyan');

  try {
    // Check environment
    if (!process.env.OPENAI_API_KEY) {
      logError('OPENAI_API_KEY not found in environment');
      process.exit(1);
    }

    await testAllStudentCategories();

    log('\n🎯 Comprehensive test completed!', 'green');
    log('All 18 student marketplace categories tested!', 'cyan');
    
  } catch (error) {
    logError(`\nTest failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}