#!/usr/bin/env node

/**
 * WhatsApp Bot Setup Helper
 * Interactive script to help configure WhatsApp environment variables
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function log(message, color = 'reset') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('🚀 GatorEx WhatsApp Bot Setup', 'blue');
  log('==============================', 'blue');
  
  log('\nThis script will help you configure your WhatsApp bot environment variables.', 'reset');
  log('You\'ll need your WhatsApp Business API credentials from Meta for Developers.\n', 'yellow');
  
  // Check if .env.local exists
  const envPath = '.env.local';
  let existingEnv = {};
  
  if (fs.existsSync(envPath)) {
    log('📄 Found existing .env.local file. We\'ll update it with new values.', 'green');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse existing environment variables
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        existingEnv[key] = valueParts.join('=').replace(/"/g, '');
      }
    });
  } else {
    log('📄 No .env.local file found. We\'ll create a new one.', 'yellow');
  }
  
  // Collect WhatsApp configuration
  log('\n📱 WhatsApp Business API Configuration:', 'blue');
  log('--------------------------------------', 'blue');
  
  const whatsappToken = await question(`WhatsApp Access Token (current: ${existingEnv.WHATSAPP_ACCESS_TOKEN ? '***set***' : 'not set'}): `);
  const phoneNumberId = await question(`Phone Number ID (current: ${existingEnv.WHATSAPP_PHONE_NUMBER_ID || 'not set'}): `);
  const botNumber = await question(`Bot Phone Number (current: ${existingEnv.WHATSAPP_BOT_NUMBER || '15558912275'}): `);
  const verifyToken = await question(`Webhook Verify Token (current: ${existingEnv.WHATSAPP_VERIFY_TOKEN || 'gatorex_verify_2024'}): `);
  
  // Collect app configuration
  log('\n🌐 App Configuration:', 'blue');
  log('--------------------', 'blue');
  
  const appUrl = await question(`App URL (current: ${existingEnv.NEXT_PUBLIC_APP_URL || 'https://app.gatorex.shop'}): `);
  
  // Collect database configuration
  log('\n🗄️  Database Configuration:', 'blue');
  log('---------------------------', 'blue');
  
  const databaseUrl = await question(`Database URL (current: ${existingEnv.DATABASE_URL ? '***set***' : 'not set'}): `);
  
  // Optional: OpenAI configuration
  log('\n🤖 AI Configuration (Optional):', 'blue');
  log('-------------------------------', 'blue');
  
  const openaiKey = await question(`OpenAI API Key (current: ${existingEnv.OPENAI_API_KEY ? '***set***' : 'not set'}, press Enter to skip): `);
  
  // Build new environment configuration
  const newEnv = {
    ...existingEnv,
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_URL: appUrl || existingEnv.NEXT_PUBLIC_APP_URL || 'https://app.gatorex.shop',
    DATABASE_URL: databaseUrl || existingEnv.DATABASE_URL,
    WHATSAPP_ACCESS_TOKEN: whatsappToken || existingEnv.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: phoneNumberId || existingEnv.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BOT_NUMBER: botNumber || existingEnv.WHATSAPP_BOT_NUMBER || '15558912275',
    WHATSAPP_VERIFY_TOKEN: verifyToken || existingEnv.WHATSAPP_VERIFY_TOKEN || 'gatorex_verify_2024',
    NEXTAUTH_SECRET: existingEnv.NEXTAUTH_SECRET || 'gatorex-secret-key-2024-super-secure',
    CRON_SECRET: existingEnv.CRON_SECRET || 'gatorex-cron-secret'
  };
  
  if (openaiKey) {
    newEnv.OPENAI_API_KEY = openaiKey;
  }
  
  // Generate .env.local content
  const envContent = Object.entries(newEnv)
    .filter(([key, value]) => value && value.trim() !== '')
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  // Write to file
  fs.writeFileSync(envPath, envContent);
  
  log('\n✅ Configuration saved to .env.local', 'green');
  
  // Show next steps
  log('\n🔧 Next Steps:', 'blue');
  log('1. Restart your application:', 'reset');
  log('   npm run dev  (for development)', 'yellow');
  log('   npm start    (for production)', 'yellow');
  
  log('\n2. Test your WhatsApp bot:', 'reset');
  log('   node scripts/test-whatsapp-bot.js', 'yellow');
  
  log('\n3. Configure your WhatsApp webhook URL:', 'reset');
  log(`   Webhook URL: ${newEnv.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`, 'yellow');
  log(`   Verify Token: ${newEnv.WHATSAPP_VERIFY_TOKEN}`, 'yellow');
  
  log('\n4. Test by sending "hi" to your bot number:', 'reset');
  log(`   Bot Number: ${newEnv.WHATSAPP_BOT_NUMBER}`, 'yellow');
  
  log('\n📚 Need help? Check these files:', 'blue');
  log('   • WHATSAPP_SETUP.md - WhatsApp configuration guide', 'reset');
  log('   • PRODUCTION_SETUP.md - Full production setup', 'reset');
  
  rl.close();
}

main().catch(console.error);