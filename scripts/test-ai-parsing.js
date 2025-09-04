#!/usr/bin/env node

/**
 * Test AI Listing Parser
 * 
 * This script tests the OpenAI integration for parsing listing text
 * and analyzing images
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

async function testTextParsing() {
  log('\n🔍 Testing Text Parsing...', 'cyan');
  
  const testCases = [
    "iPhone 14 Pro Max, $850, Like New",
    "Calculus textbook by Stewart, $120, good condition",
    "IKEA desk chair, $45, fair condition",
    "MacBook Air M1, $800, excellent",
    "Chemistry lab goggles, $15, new",
    "Used Toyota Camry 2018, $15000, good condition",
    "Organic chemistry textbook, barely used, $180"
  ];

  for (const testCase of testCases) {
    try {
      logInfo(`\nTesting: "${testCase}"`);
      
      const result = await ListingParser.parseListingText(testCase);
      
      logSuccess('Parsed successfully:');
      console.log(`  Title: ${result.title}`);
      console.log(`  Price: ${result.price ? `$${result.price}` : 'Not specified'}`);
      console.log(`  Category: ${result.category}`);
      console.log(`  Condition: ${result.condition}`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`  Suggestions:`);
        result.suggestions.forEach((suggestion, index) => {
          console.log(`    ${index + 1}. ${suggestion}`);
        });
      }
      
    } catch (error) {
      logError(`Failed to parse: ${error.message}`);
    }
  }
}

async function testEnvironment() {
  log('🔍 Testing Environment...', 'cyan');
  
  // Check OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    logError('OPENAI_API_KEY not found in environment');
    logInfo('Please add OPENAI_API_KEY to your .env file');
    return false;
  }
  
  logSuccess('OpenAI API key found');
  
  // Test basic API connectivity
  try {
    logInfo('Testing API connectivity...');
    const result = await ListingParser.parseListingText('iPhone, $100, good');
    logSuccess('API connectivity test passed');
    return true;
  } catch (error) {
    logError(`API connectivity test failed: ${error.message}`);
    
    if (error.message.includes('API key')) {
      logInfo('Check that your OpenAI API key is valid');
    } else if (error.message.includes('rate limit')) {
      logInfo('Rate limit reached - try again later');
    } else if (error.message.includes('quota')) {
      logInfo('API quota exceeded - check your OpenAI billing');
    }
    
    return false;
  }
}

async function showUsageStats() {
  log('\n📊 Usage Information', 'cyan');
  
  logInfo('Text Parsing:');
  console.log('  • Model: gpt-4o-mini');
  console.log('  • Cost: ~$0.0001 per request');
  console.log('  • Speed: ~1-2 seconds');
  
  logInfo('Image Analysis:');
  console.log('  • Model: gpt-4o (vision)');
  console.log('  • Cost: ~$0.01 per image');
  console.log('  • Speed: ~3-5 seconds');
  
  logInfo('Rate Limits:');
  console.log('  • Text: 500 requests/minute');
  console.log('  • Images: 100 requests/minute');
}

async function main() {
  log('🤖 GatorEx AI Listing Parser Test', 'bright');
  log('=' .repeat(50), 'cyan');

  try {
    // Test environment
    const envOk = await testEnvironment();
    if (!envOk) {
      process.exit(1);
    }

    // Test text parsing
    await testTextParsing();

    // Show usage stats
    await showUsageStats();

    log('\n🎉 All tests completed!', 'green');
    
    log('\n📋 Next steps:', 'yellow');
    log('1. Test the API endpoints: /api/ai/parse-listing');
    log('2. Test image analysis: /api/ai/analyze-image');
    log('3. Try the smart input in the sell flow');
    
  } catch (error) {
    logError(`\nTest failed: ${error.message}`);
    
    log('\n🔧 Troubleshooting:', 'yellow');
    log('1. Check your OpenAI API key');
    log('2. Verify your API quota/billing');
    log('3. Check network connectivity');
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}