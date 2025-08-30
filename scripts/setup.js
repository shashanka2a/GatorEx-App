const { execSync } = require('child_process');

console.log('🚀 Setting up GatorEx WhatsApp Integration...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Generate Prisma client
  console.log('🗄️  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('✅ Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Set up your PostgreSQL database');
  console.log('2. Copy .env.example to .env and fill in your credentials');
  console.log('3. Run: npx prisma db push');
  console.log('4. Configure your WhatsApp Business API webhook');
  console.log('5. Test with: npm run dev');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}