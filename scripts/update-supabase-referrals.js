#!/usr/bin/env node

/**
 * Update Supabase Database with Referrals Schema
 * This script updates the Supabase database with the latest referrals system schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  console.log('🚀 Starting Supabase database update for referrals system...\n');

  try {
    // Step 1: Update rewards table to include 'equity' type
    console.log('📝 Step 1: Updating rewards table to include equity type...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Update rewards table constraint to include 'equity' type
        ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_type_check;
        ALTER TABLE rewards ADD CONSTRAINT rewards_type_check 
        CHECK (type IN ('voucher', 'cash', 'sub', 'device', 'equity'));
      `
    });

    if (alterError) {
      console.log('⚠️  Constraint update failed (might already exist):', alterError.message);
    } else {
      console.log('✅ Rewards table updated successfully');
    }

    // Step 2: Ensure all tables exist with latest schema
    console.log('\n📝 Step 2: Creating/updating referrals tables...');
    const schemaSQL = `
      -- Create referral_codes table
      CREATE TABLE IF NOT EXISTS referral_codes (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          code TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create referral_clicks table
      CREATE TABLE IF NOT EXISTS referral_clicks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
          ip_hash TEXT NOT NULL,
          ua_hash TEXT NOT NULL,
          ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create referrals table
      CREATE TABLE IF NOT EXISTS referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
          referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          referee_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          status TEXT CHECK (status IN ('clicked', 'verified', 'rejected')) DEFAULT 'clicked',
          reason TEXT,
          ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create rewards table with equity type
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

      -- Create leaderboard_week table (materialized cache)
      CREATE TABLE IF NOT EXISTS leaderboard_week (
          week_id TEXT NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          points INTEGER NOT NULL DEFAULT 0,
          rank INTEGER NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (week_id, user_id)
      );
    `;

    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (schemaError) {
      console.error('❌ Schema creation failed:', schemaError.message);
      throw schemaError;
    }
    console.log('✅ Tables created/updated successfully');

    // Step 3: Create indexes
    console.log('\n📝 Step 3: Creating performance indexes...');
    const indexSQL = `
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(code);
      CREATE INDEX IF NOT EXISTS idx_referral_clicks_ts ON referral_clicks(ts);
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_user_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
      CREATE INDEX IF NOT EXISTS idx_rewards_user_status ON rewards(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_week_points ON leaderboard_week(week_id, points DESC);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL });
    
    if (indexError) {
      console.error('❌ Index creation failed:', indexError.message);
      throw indexError;
    }
    console.log('✅ Indexes created successfully');

    // Step 4: Enable RLS and create policies
    console.log('\n📝 Step 4: Setting up Row Level Security...');
    const rlsSQL = `
      -- Enable RLS
      ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
      ALTER TABLE leaderboard_week ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view their own referral code" ON referral_codes;
      DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
      DROP POLICY IF EXISTS "Users can view their own rewards" ON rewards;
      DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_week;

      -- Create RLS Policies
      CREATE POLICY "Users can view their own referral code" ON referral_codes
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can view their own referrals" ON referrals
          FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

      CREATE POLICY "Users can view their own rewards" ON rewards
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Anyone can view leaderboard" ON leaderboard_week
          FOR SELECT TO authenticated USING (true);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.error('❌ RLS setup failed:', rlsError.message);
      throw rlsError;
    }
    console.log('✅ Row Level Security configured successfully');

    // Step 5: Verify tables exist
    console.log('\n📝 Step 5: Verifying database setup...');
    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['referral_codes', 'referral_clicks', 'referrals', 'rewards', 'leaderboard_week']);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      throw verifyError;
    }

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
    console.log('   ✅ Row Level Security configured');
    console.log('   ✅ All tables verified');
    
    console.log('\n🚀 Your referrals system is ready to use!');
    console.log('   - Reward tiers: 5, 10, 25, 50, 75, 100, 200, 500 referrals');
    console.log('   - Ultimate reward: Marketing Lead + 5% Company Equity');

  } catch (error) {
    console.error('\n❌ Database update failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your Supabase credentials in .env.local');
    console.error('   2. Ensure SUPABASE_SERVICE_ROLE_KEY has admin permissions');
    console.error('   3. Verify your Supabase project is active');
    console.error('   4. Try running the SQL manually in Supabase SQL Editor');
    process.exit(1);
  }
}

// Run the update
updateDatabase();