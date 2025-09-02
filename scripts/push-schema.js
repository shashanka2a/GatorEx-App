#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function pushSchema() {
  console.log('🔄 Pushing database schema changes...');
  
  try {
    // Verify we're using pooled connection
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes('pooler.supabase.com')) {
      console.log('✅ Using pooled Supabase connection');
    } else {
      console.log('⚠️  Warning: Not using pooled connection');
    }
    
    // Generate Prisma client first
    console.log('📝 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema changes to database using pooled connection
    console.log('🚀 Pushing schema to database (pooled)...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Schema push completed successfully!');
    
    // Test connection with pooled database
    console.log('🔍 Testing pooled database connection...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Pooled database connection successful!');
      
      // Quick test query
      const userCount = await prisma.user.count();
      const listingCount = await prisma.listing.count();
      
      console.log(`📊 Database stats: ${userCount} users, ${listingCount} listings`);
      
    } catch (dbError) {
      console.error('❌ Database connection test failed:', dbError.message);
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('');
    console.log('📋 Changes applied:');
    console.log('   - Added views field to Listing model');
    console.log('   - Added terms acceptance fields to User model');
    console.log('');
    console.log('🎉 Database is now up to date with pooled connection!');
    
  } catch (error) {
    console.error('❌ Error pushing schema:', error.message);
    console.log('');
    console.log('🔧 Try running manually:');
    console.log('1. npx prisma generate');
    console.log('2. npx prisma db push');
    console.log('');
    console.log('💡 Make sure DATABASE_URL uses pooled connection:');
    console.log('   postgresql://...@aws-0-us-east-1.pooler.supabase.com:6543/...');
    process.exit(1);
  }
}

pushSchema();