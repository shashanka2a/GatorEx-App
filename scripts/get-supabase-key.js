// Helper to verify your Supabase API key
require('dotenv').config();

function verifySupabaseKey() {
  console.log('🔑 Supabase API Key Verification');
  console.log('================================\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('📋 Current Configuration:');
  console.log(`URL: ${url || '❌ NOT SET'}`);
  console.log(`Key: ${key ? key.substring(0, 50) + '...' : '❌ NOT SET'}\n`);
  
  if (!url || !key) {
    console.log('❌ Missing Supabase configuration\n');
    console.log('🔍 To get your API key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/hxmanrgbkoojbambqvdn');
    console.log('2. Click: Settings → API');
    console.log('3. Copy the "anon" key (under Project API keys)');
    console.log('4. Replace the placeholder in your .env file\n');
    return;
  }
  
  if (key.includes('placeholder')) {
    console.log('⚠️  Still using placeholder key\n');
    console.log('🔍 To get your real API key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/hxmanrgbkoojbambqvdn');
    console.log('2. Click: Settings → API');
    console.log('3. Copy the "anon" key');
    console.log('4. Replace the placeholder in your .env file\n');
    return;
  }
  
  // Basic JWT validation
  try {
    const parts = key.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('✅ API Key looks valid!');
    console.log('📊 Key Details:');
    console.log(`   Project: ${payload.ref || 'unknown'}`);
    console.log(`   Role: ${payload.role || 'unknown'}`);
    console.log(`   Issued: ${payload.iat ? new Date(payload.iat * 1000).toLocaleDateString() : 'unknown'}`);
    console.log(`   Expires: ${payload.exp ? new Date(payload.exp * 1000).toLocaleDateString() : 'unknown'}\n`);
    
    if (payload.ref !== 'hxmanrgbkoojbambqvdn') {
      console.log('⚠️  Project reference mismatch!');
      console.log(`   Expected: hxmanrgbkoojbambqvdn`);
      console.log(`   Got: ${payload.ref}`);
    }
    
    if (payload.role !== 'anon') {
      console.log('⚠️  Wrong key type!');
      console.log(`   Expected: anon`);
      console.log(`   Got: ${payload.role}`);
      console.log('   Make sure to use the "anon" key, not the "service_role" key');
    }
    
  } catch (error) {
    console.log('❌ Invalid API key format');
    console.log('   Make sure you copied the complete key from Supabase Studio');
  }
}

verifySupabaseKey();