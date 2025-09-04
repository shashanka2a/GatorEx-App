#!/usr/bin/env node

/**
 * Test Draft Resume Functionality
 * 
 * This script tests the draft resume functionality to ensure it handles errors gracefully
 */

// Mock localStorage for testing
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
  get length() {
    return Object.keys(this.data).length;
  },
  key(index) {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }
};

// Mock window object
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

const { DraftManager } = require('../src/lib/drafts/draftManager');

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

async function testDraftResume() {
  log('\n🔄 Testing Draft Resume Functionality...', 'cyan');
  
  const userId = 'test-user-123';
  const draftManager = new DraftManager(userId);
  
  try {
    // Test 1: Load when no drafts exist
    logInfo('Test 1: Loading when no drafts exist');
    const result1 = await draftManager.loadMostRecentDraft();
    if (!result1.session && !result1.shouldResume && result1.messages.length === 0) {
      logSuccess('✓ Correctly handles no drafts');
    } else {
      logError('✗ Failed to handle no drafts correctly');
    }
    
    // Test 2: Create a valid draft
    logInfo('Test 2: Creating and loading valid draft');
    const validDraft = {
      title: 'Test Item',
      price: 50,
      images: ['test-image.jpg'],
      category: 'Electronics',
      condition: 'Good',
      meetingSpot: 'Reitz Union',
      description: 'Test description'
    };
    
    const messages = [
      {
        id: '1',
        text: 'Hello',
        isBot: false,
        timestamp: new Date()
      }
    ];
    
    await draftManager.save(validDraft, 2, messages);
    const result2 = await draftManager.loadMostRecentDraft();
    
    if (result2.session && result2.session.draft.title === 'Test Item') {
      logSuccess('✓ Successfully created and loaded valid draft');
    } else {
      logError('✗ Failed to create/load valid draft');
    }
    
    // Test 3: Create corrupted draft and test cleanup
    logInfo('Test 3: Testing corrupted draft cleanup');
    
    // Manually add corrupted data to localStorage
    localStorage.setItem('gatorex_draft_session_test-user-123_corrupted', 'invalid json');
    localStorage.setItem('gatorex_draft_session_test-user-123_missing_draft', JSON.stringify({
      id: 'missing-draft',
      userId: 'test-user-123',
      // missing draft property
      currentStep: 0
    }));
    
    // Test cleanup
    draftManager.cleanupCorruptedDrafts();
    
    const corruptedExists = localStorage.getItem('gatorex_draft_session_test-user-123_corrupted');
    const missingDraftExists = localStorage.getItem('gatorex_draft_session_test-user-123_missing_draft');
    
    if (!corruptedExists && !missingDraftExists) {
      logSuccess('✓ Successfully cleaned up corrupted drafts');
    } else {
      logError('✗ Failed to clean up corrupted drafts');
    }
    
    // Test 4: Load after cleanup
    logInfo('Test 4: Loading after cleanup');
    const result4 = await draftManager.loadMostRecentDraft();
    
    if (result4.session && result4.session.draft.title === 'Test Item') {
      logSuccess('✓ Valid draft still exists after cleanup');
    } else {
      logError('✗ Valid draft was incorrectly removed during cleanup');
    }
    
    // Test 5: Test error handling in loadMostRecentDraft
    logInfo('Test 5: Testing error handling');
    
    // Temporarily break localStorage
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => { throw new Error('Storage error'); };
    
    const result5 = await draftManager.loadMostRecentDraft();
    
    // Restore localStorage
    localStorage.getItem = originalGetItem;
    
    if (!result5.session && !result5.shouldResume && result5.messages.length === 0) {
      logSuccess('✓ Gracefully handles storage errors');
    } else {
      logError('✗ Failed to handle storage errors gracefully');
    }
    
    logSuccess('\n🎉 All draft resume tests completed!');
    
  } catch (error) {
    logError(`Test failed with error: ${error.message}`);
    console.error(error);
  } finally {
    draftManager.cleanup();
  }
}

async function main() {
  log('🔄 Draft Resume Functionality Test', 'bright');
  log('=' .repeat(50), 'cyan');

  try {
    await testDraftResume();
    log('\n🎯 Test completed!', 'green');
  } catch (error) {
    logError(`\nTest failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}