#!/usr/bin/env node

/**
 * Supabase Setup Helper
 * Helps you configure Supabase database connection
 */

console.log('🗄️  GatorEx Supabase Setup Helper');
console.log('=====================================\n');

console.log('📋 To set up Supabase database connection:');
console.log('');
console.log('1. 🌐 Go to https://supabase.com');
console.log('2. 🔑 Sign in or create account');
console.log('3. ➕ Create new project or select existing');
console.log('4. ⚙️  Go to Settings → Database');
console.log('5. 📋 Copy the connection string');
console.log('');
console.log('📝 Connection string format:');
console.log('   postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
console.log('');
console.log('🔧 Current connection string in .env:');
console.log('   DATABASE_URL="postgresql://postgres.ftmkxxlrkiybvezbfmvb:rDB%2FSXnX%3FZ4iYM-@aws-0-us-east-1.pooler.supabase.com:6543/postgres"');
console.log('');
console.log('⚠️  Common issues:');
console.log('   • Project might be paused (free tier auto-pauses after inactivity)');
console.log('   • Password might have changed');
console.log('   • Project reference might be incorrect');
console.log('');
console.log('💡 Solutions:');
console.log('   • Visit Supabase dashboard to wake up paused project');
console.log('   • Reset database password if needed');
console.log('   • Copy fresh connection string from dashboard');
console.log('');
console.log('🧪 After updating credentials, test with:');
console.log('   node scripts/test-database.js');