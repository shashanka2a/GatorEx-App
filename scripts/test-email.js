#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { sendVerificationEmail } = require('../src/lib/email/verification');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testEmail() {
  console.log('📧 Email Service Test\n');
  
  // Check environment variables
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  console.log(`Using email provider: ${emailProvider}`);
  
  const requiredVars = {
    gmail: ['SMTP_USER', 'SMTP_PASS'],
    sendgrid: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
    ses: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'SES_FROM_EMAIL']
  };
  
  const missing = requiredVars[emailProvider]?.filter(varName => !process.env[varName]) || [];
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('Please check your .env.local file');
    process.exit(1);
  }
  
  const email = await question('Enter UF email to test: ');
  
  if (!email.endsWith('@ufl.edu')) {
    console.error('❌ Please enter a valid UF email address');
    process.exit(1);
  }
  
  console.log('\n🚀 Sending test email...');
  
  try {
    await sendVerificationEmail(email, 'test-token-' + Date.now());
    console.log('✅ Email sent successfully!');
    console.log('📬 Check your inbox (and spam folder)');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your email provider credentials');
    console.log('2. Verify sender email is authenticated');
    console.log('3. Check firewall/network settings');
    console.log('4. Review email provider documentation');
  }
  
  rl.close();
}

testEmail().catch(console.error);