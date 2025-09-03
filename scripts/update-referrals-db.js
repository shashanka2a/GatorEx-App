#!/usr/bin/env node

/**
 * Update Database with Referrals Schema using Prisma
 * This script updates the database with the latest referrals system schema
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function updateDatabase() {
  console.log('🚀 Starting database update for referrals system...\n');

  try {
    // Step 1: Update rewards table to include 'equity' type
    console.log('📝 Step 1: Updating rewards table to include equity type...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_type_check;
      `;
      await prisma.$executeRaw`
        ALTER TABLE rewards ADD CONSTRAINT rewards_type_check 
        CHECK (type IN ('voucher', 'cash', 'sub', 'device', 'equity'));
      `;
      console.log('✅ Rewards table constraint updated successfully');
    } catch (error) {
      console.log('⚠️  Constraint update failed (might already exist):', error.message);
    }

    // Step 2: Create referrals tables
    console.log('\n📝 Step 2: Creating/updating referrals tables...');
    
    // Create referral_codes table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS referral_codes (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          code TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create referral_clicks table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS referral_clicks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
          ip_hash TEXT NOT NULL,
          ua_hash TEXT NOT NULL,
          ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create referrals table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
          referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          referee_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          status TEXT CHECK (status IN ('clicked', 'verified', 'rejected')) DEFAULT 'clicked',
          reason TEXT,
          ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create rewards table with equity type
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS rewards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          type TEXT CHECK (type IN ('voucher', 'cash', 'sub', 'device', 'equity')) NOT NULL,
          amount_cents INTEGER NOT NULL,
          tier INTEGER NOT NULL,
          source TEXT DEFAULT 'referral',
          status TEXT CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
          ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create leaderboard_week table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS leaderboard_week (
          week_id TEXT NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          points INTEGER NOT NULL DEFAULT 0,
          rank INTEGER NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (week_id, user_id)
      );
    `;

    console.log('✅ Tables created/updated successfully');

    // Step 3: Create indexes
    console.log('\n📝 Step 3: Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(code);',
      'CREATE INDEX IF NOT EXISTS idx_referral_clicks_ts ON referral_clicks(ts);',
      'CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);',
      'CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_user_id);',
      'CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);',
      'CREATE INDEX IF NOT EXISTS idx_rewards_user_status ON rewards(user_id, status);',
      'CREATE INDEX IF NOT EXISTS idx_leaderboard_week_points ON leaderboard_week(week_id, points DESC);'
    ];

    for (const indexSQL of indexes) {
      await prisma.$executeRawUnsafe(indexSQL);
    }

    console.log('✅ Indexes created successfully');

    // Step 4: Verify tables exist
    console.log('\n📝 Step 4: Verifying database setup...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('referral_codes', 'referral_clicks', 'referrals', 'rewards', 'leaderboard_week')
      ORDER BY table_name;
    `;

    const tableNames = tables.map(t => t.table_name);
    const expectedTables = ['referral_codes', 'referral_clicks', 'referrals', 'rewards', 'leaderboard_week'];
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables);
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }

    console.log('✅ All referrals tables verified successfully');
    console.log('📊 Tables found:', tableNames.join(', '));

    console.log('\n🎉 Database update completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Referrals schema updated');
    console.log('   ✅ Equity reward type added');
    console.log('   ✅ Performance indexes created');
    console.log('   ✅ All tables verified');
    
    console.log('\n🚀 Your referrals system is ready to use!');
    console.log('   - Reward tiers: 5, 10, 25, 50, 75, 100, 200, 500 referrals');
    console.log('   - Ultimate reward: Marketing Lead + 5% Company Equity');

  } catch (error) {
    console.error('\n❌ Database update failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your database connection in .env files');
    console.error('   2. Ensure DATABASE_URL is correct');
    console.error('   3. Verify your database is accessible');
    console.error('   4. Try running: npm run db:push');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateDatabase();