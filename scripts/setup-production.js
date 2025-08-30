#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupProduction() {
  console.log('🚀 GatorEx Production Setup\n');
  
  const config = {};
  
  // Database setup
  console.log('📊 Database Configuration');
  config.DATABASE_URL = await question('Enter your PostgreSQL connection string: ');
  
  // Email provider selection
  console.log('\n📧 Email Configuration');
  console.log('Choose email provider:');
  console.log('1. Gmail SMTP (easiest for testing)');
  console.log('2. SendGrid (recommended for production)');
  console.log('3. AWS SES (enterprise scale)');
  
  const emailChoice = await question('Enter choice (1-3): ');
  
  switch (emailChoice) {
    case '1':
      config.EMAIL_PROVIDER = 'gmail';
      config.SMTP_USER = await question('Gmail address: ');
      config.SMTP_PASS = await question('Gmail app password: ');
      break;
    case '2':
      config.EMAIL_PROVIDER = 'sendgrid';
      config.SENDGRID_API_KEY = await question('SendGrid API key: ');
      config.SENDGRID_FROM_EMAIL = await question('From email address: ');
      break;
    case '3':
      config.EMAIL_PROVIDER = 'ses';
      config.AWS_REGION = await question('AWS region (default: us-east-1): ') || 'us-east-1';
      config.AWS_ACCESS_KEY_ID = await question('AWS Access Key ID: ');
      config.AWS_SECRET_ACCESS_KEY = await question('AWS Secret Access Key: ');
      config.SES_FROM_EMAIL = await question('From email address: ');
      break;
    default:
      console.log('Invalid choice, defaulting to Gmail');
      config.EMAIL_PROVIDER = 'gmail';
  }
  
  // App configuration
  console.log('\n🌐 Application Configuration');
  config.NEXT_PUBLIC_APP_URL = await question('App URL (e.g., https://gatorex.com): ');
  config.NEXTAUTH_SECRET = await question('NextAuth secret (random string): ') || 
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Generate .env.local file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent + '\n');
  
  console.log('\n✅ Configuration saved to .env.local');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Test with: npm run dev');
  console.log('4. Deploy to your hosting platform');
  
  rl.close();
}

setupProduction().catch(console.error);