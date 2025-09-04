#!/usr/bin/env node

/**
 * Test Draft Cleanup After Publishing
 * 
 * This script tests that drafts are properly cleaned up after publishing
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

async function testDraftCleanup() {
  log('\n🧹 Testing Draft Cleanup After Publishing...', 'cyan');
  
  const userId = 'test-user-123';
  const draftManager = new DraftManager(userId);
  
  try {
    // Test 1: Create multiple drafts
    logInfo('Test 1: Creating multiple drafts');
    
    const draft1 = {
      title: 'iPhone 13',
      price: 600,
      images: ['image1.jpg'],
      category: 'Electronics',
      condition: 'Good',
      meetingSpot: 'Reitz Union',
      description: 'Great phone'
    };
    
    const draft2 = {
      title: 'Textbook',
      price: 50,
      images: ['book.jpg'],
      category: 'Textbooks',
      condition: 'Like New',
      meetingSpot: 'Library',
      description: 'Calculus book'
    };
    
    const messages = [
      { id: '1', text: 'Hello', isBot: false, timestamp: new Date() },
      { id: '2', text: 'Hi there!', isBot: true, timestamp: new Date() }
    ];
    
    // Save first draft
    await draftManager.save(draft1, 3, messages);
    
    // Create second draft manager (simulating different session)
    const draftManager2 = new DraftManager(userId);
    await draftManager2.save(draft2, 2, messages);
    
    // Check that drafts exist
    const beforeCleanup = Object.keys(localStorage.data).filter(key => 
      key.includes(userId) && (key.includes('gatorex_draft_session_') || key.includes('gatorex_messages_'))
    );
    
    if (beforeCleanup.length >= 4) { // At least 2 sessions + 2 message sets
      logSuccess(`✓ Created ${beforeCleanup.length} draft-related items`);
    } else {
      logError(`✗ Expected at least 4 items, got ${beforeCleanup.length}`);
    }
    
    // Test 2: Simulate publishing (cleanup all drafts)
    logInfo('Test 2: Simulating publish cleanup');
    
    draftManager.markSessionComplete();
    draftManager.cleanupAllUserDrafts();
    
    // Check that all drafts are cleaned up
    const afterCleanup = Object.keys(localStorage.data).filter(key => 
      key.includes(userId) && (key.includes('gatorex_draft_session_') || key.includes('gatorex_messages_'))
    );
    
    if (afterCleanup.length === 0) {
      logSuccess('✓ All drafts cleaned up after publishing');
    } else {
      logError(`✗ ${afterCleanup.length} draft items still remain: ${afterCleanup.join(', ')}`);
    }
    
    // Test 3: Verify no drafts are available for resume
    logInfo('Test 3: Verifying no drafts available for resume');
    
    const { session, shouldResume } = await draftManager.loadMostRecentDraft();
    
    if (!session && !shouldResume) {
      logSuccess('✓ No drafts available for resume after cleanup');
    } else {
      logError('✗ Drafts still available for resume after cleanup');
    }
    
    // Test 4: Test selective cleanup (current session only)
    logInfo('Test 4: Testing selective cleanup');
    
    // Create new drafts
    await draftManager.save(draft1, 1, messages);
    const draftManager3 = new DraftManager(userId);
    await draftManager3.save(draft2, 2, messages);
    
    // Clean up only current session
    draftManager.cleanupCurrentSession();
    
    const afterSelectiveCleanup = Object.keys(localStorage.data).filter(key => 
      key.includes(userId) && (key.includes('gatorex_draft_session_') || key.includes('gatorex_messages_'))
    );
    
    if (afterSelectiveCleanup.length === 2) { // Should have 1 session + 1 message set remaining
      logSuccess('✓ Selective cleanup works correctly');
    } else {
      logError(`✗ Expected 2 items after selective cleanup, got ${afterSelectiveCleanup.length}`);
    }
    
    logSuccess('\n🎉 All draft cleanup tests completed!');
    
  } catch (error) {
    logError(`Test failed with error: ${error.message}`);
    console.error(error);
  } finally {
    draftManager.cleanup();
  }
}

async function main() {
  log('🧹 Draft Cleanup Test', 'bright');
  log('=' .repeat(50), 'cyan');

  try {
    await testDraftCleanup();
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