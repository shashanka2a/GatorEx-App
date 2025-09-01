// Test Supabase Auth magic link functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseAuth() {
  console.log('🔐 Testing Supabase Auth Magic Links');
  console.log('====================================\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please add to .env:');
    console.log('NEXT_PUBLIC_SUPABASE_URL="https://hxmanrgbkoojbambqvdn.supabase.co"');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"');
    return;
  }
  
  console.log('📋 Configuration:');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('\n🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    console.log('✅ Supabase client connected successfully!');
    
    // Test magic link sending (replace with your email)
    const testEmail = 'your-test-email@ufl.edu'; // Replace with actual email
    
    console.log(`\n📧 Testing magic link to: ${testEmail}`);
    console.log('⚠️  Make sure to replace testEmail with your actual email first!');
    
    // Uncomment to actually send magic link:
    /*
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'https://app.gatorex.shop/auth/callback'
      }
    });
    
    if (signInError) {
      console.error('❌ Magic link failed:', signInError.message);
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📬 Check your email inbox (and spam folder)');
      console.log('⏱️  Should arrive within 1-2 minutes with custom SMTP');
    }
    */
    
    console.log('\n💡 To test magic link sending:');
    console.log('1. Replace testEmail with your actual email');
    console.log('2. Uncomment the signInWithOtp code block');
    console.log('3. Run this script again');
    console.log('4. Check your email for the magic link');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 API Key Issues:');
      console.log('1. Get the anon key from Supabase Studio → Settings → API');
      console.log('2. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
    }
  }
}

testSupabaseAuth();