#!/usr/bin/env node

/**
 * WhatsApp Bot Troubleshooting Script
 * Run this to diagnose WhatsApp bot issues
 */

const https = require('https');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name, required = true) {
  const value = process.env[name];
  if (!value) {
    if (required) {
      log(`❌ Missing required environment variable: ${name}`, 'red');
      return false;
    } else {
      log(`⚠️  Optional environment variable not set: ${name}`, 'yellow');
      return true;
    }
  }
  
  // Mask sensitive values
  const maskedValue = name.includes('TOKEN') || name.includes('KEY') || name.includes('SECRET') || name.includes('PASS')
    ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
    : value;
  
  log(`✅ ${name}: ${maskedValue}`, 'green');
  return true;
}

async function testWhatsAppAPI() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!accessToken || !phoneNumberId) {
    log('❌ Cannot test WhatsApp API - missing credentials', 'red');
    return false;
  }
  
  return new Promise((resolve) => {
    const data = JSON.stringify({
      messaging_product: 'whatsapp',
      to: process.env.WHATSAPP_BOT_NUMBER || '15558912275',
      type: 'text',
      text: { body: 'Test message from GatorEx bot' }
    });
    
    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v18.0/${phoneNumberId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          log('✅ WhatsApp API test successful', 'green');
          resolve(true);
        } else {
          log(`❌ WhatsApp API test failed: ${res.statusCode} - ${responseData}`, 'red');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ WhatsApp API connection error: ${error.message}`, 'red');
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

async function testDatabase() {
  try {
    // Try to run a simple Prisma command
    execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function testWebhookEndpoint() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    log('❌ Cannot test webhook - NEXT_PUBLIC_APP_URL not set', 'red');
    return false;
  }
  
  const webhookUrl = `${appUrl}/api/whatsapp/webhook`;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  
  return new Promise((resolve) => {
    const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123`;
    
    https.get(testUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data === 'test123') {
          log('✅ Webhook endpoint responding correctly', 'green');
          resolve(true);
        } else {
          log(`❌ Webhook test failed: ${res.statusCode} - ${data}`, 'red');
          resolve(false);
        }
      });
    }).on('error', (error) => {
      log(`❌ Webhook connection error: ${error.message}`, 'red');
      resolve(false);
    });
  });
}

async function main() {
  log('🔍 GatorEx WhatsApp Bot Diagnostics', 'blue');
  log('=====================================', 'blue');
  
  // Check environment variables
  log('\n📋 Checking Environment Variables:', 'blue');
  const envChecks = [
    checkEnvVar('NODE_ENV'),
    checkEnvVar('NEXT_PUBLIC_APP_URL'),
    checkEnvVar('DATABASE_URL'),
    checkEnvVar('WHATSAPP_ACCESS_TOKEN'),
    checkEnvVar('WHATSAPP_PHONE_NUMBER_ID'),
    checkEnvVar('WHATSAPP_BOT_NUMBER'),
    checkEnvVar('WHATSAPP_VERIFY_TOKEN'),
    checkEnvVar('OPENAI_API_KEY', false),
    checkEnvVar('CLOUDINARY_CLOUD_NAME', false),
    checkEnvVar('NEXTAUTH_SECRET')
  ];
  
  const envPassed = envChecks.every(check => check);
  
  // Test database connection
  log('\n🗄️  Testing Database Connection:', 'blue');
  const dbPassed = await testDatabase();
  
  // Test WhatsApp API
  log('\n📱 Testing WhatsApp API:', 'blue');
  const whatsappPassed = await testWhatsAppAPI();
  
  // Test webhook endpoint
  log('\n🔗 Testing Webhook Endpoint:', 'blue');
  const webhookPassed = await testWebhookEndpoint();
  
  // Summary
  log('\n📊 Diagnostic Summary:', 'blue');
  log('=====================', 'blue');
  
  if (envPassed && dbPassed && whatsappPassed && webhookPassed) {
    log('🎉 All tests passed! Your WhatsApp bot should be working.', 'green');
  } else {
    log('⚠️  Some issues detected. Please fix the failed items above.', 'yellow');
    
    if (!envPassed) {
      log('   • Check your .env.local file has all required variables', 'yellow');
    }
    if (!dbPassed) {
      log('   • Verify your DATABASE_URL and database is accessible', 'yellow');
    }
    if (!whatsappPassed) {
      log('   • Check your WhatsApp Business API credentials', 'yellow');
    }
    if (!webhookPassed) {
      log('   • Ensure your webhook URL is accessible and verify token matches', 'yellow');
    }
  }
  
  log('\n🔧 Next Steps:', 'blue');
  log('1. Update your .env.local file with correct values', 'reset');
  log('2. Restart your application: npm run dev or npm start', 'reset');
  log('3. Test sending "hi" to your WhatsApp bot number', 'reset');
  log('4. Check application logs for any errors', 'reset');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

main().catch(console.error);