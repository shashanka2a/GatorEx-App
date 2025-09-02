#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Starting database push...');

try {
  // Run db push with timeout
  console.log('📤 Pushing schema to database...');
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    timeout: 30000 // 30 second timeout
  });
  
  console.log('✅ Database push completed successfully!');
  
} catch (error) {
  if (error.signal === 'SIGTERM') {
    console.log('⏰ Database push timed out - this might be normal for large schemas');
  } else {
    console.error('❌ Database push failed:', error.message);
  }
  process.exit(1);
}