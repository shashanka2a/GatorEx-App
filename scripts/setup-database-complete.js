#!/usr/bin/env node

/**
 * Complete Database Setup Script
 * Sets up Supabase database with all required tables
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  console.log('🗄️  GatorEx Complete Database Setup');
  console.log('====================================\n');

  const prisma = new PrismaClient();

  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Check if tables exist
    console.log('🔍 Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`📊 Found ${tables.length} existing tables:`, tables.map(t => t.table_name));

    if (tables.length === 0) {
      console.log('\n🚀 No tables found. Running Prisma migrations...');
      
      // Generate Prisma client
      console.log('📦 Generating Prisma client...');
      const { execSync } = require('child_process');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Push schema to database
      console.log('🔄 Pushing schema to database...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      
      console.log('✅ Database schema created successfully!');
    } else {
      console.log('✅ Database tables already exist');
    }

    // Test basic operations
    console.log('\n🧪 Testing basic database operations...');
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test listing count
    const listingCount = await prisma.listing.count();
    console.log(`📝 Listings in database: ${listingCount}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Your database is ready for production');
    console.log('2. Deploy to Vercel with these environment variables');
    console.log('3. Test the application functionality');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Visit https://supabase.com and sign in');
      console.log('2. Check if your project is paused (wake it up)');
      console.log('3. Get fresh connection string from Settings → Database');
      console.log('4. Update DATABASE_URL in your .env file');
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();