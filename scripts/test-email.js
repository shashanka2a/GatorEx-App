#!/usr/bin/env node

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  // Check environment variables
  console.log('📧 Email Provider:', process.env.EMAIL_PROVIDER);
  console.log('👤 SMTP User:', process.env.SMTP_USER);
  console.log('🔑 SMTP Pass:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
  console.log('🌐 App URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('🏗️  Node ENV:', process.env.NODE_ENV);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n❌ Missing Gmail credentials. Please set SMTP_USER and SMTP_PASS in .env.local');
    return;
  }
  
  if (process.env.SMTP_PASS === 'YOUR_ACTUAL_16_CHAR_APP_PASSWORD_HERE') {
    console.log('\n❌ Please replace the placeholder password with your actual Gmail app password');
    return;
  }
  
  try {
    console.log('\n📨 Creating transporter...');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    console.log('✅ Transporter created');
    
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified!');
    
    // Send test email
    const testEmail = 'test@ufl.edu'; // Replace with your actual UF email for testing
    console.log(`📤 Sending test email to ${testEmail}...`);
    
    const info = await transporter.sendMail({
      from: `"GatorEx Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '🧪 GatorEx Email Test',
      html: `
        <h2>🐊 Email Test Successful!</h2>
        <p>If you're reading this, your GatorEx email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>Go Gators! 🐊</p>
      `,
      text: `🐊 Email Test Successful!\n\nIf you're reading this, your GatorEx email configuration is working correctly.\n\nTimestamp: ${new Date().toISOString()}\n\nGo Gators! 🐊`
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('\n🎉 Email configuration is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 This usually means:');
      console.log('   1. Wrong email or password');
      console.log('   2. 2-Factor Authentication not enabled');
      console.log('   3. App password not generated');
      console.log('   4. Using regular password instead of app password');
    }
  }
}

testEmail().catch(console.error);