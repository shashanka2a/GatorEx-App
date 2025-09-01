// Test email sending to debug magic link delays
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailSending() {
  console.log('📧 Testing Email Configuration');
  console.log('==============================\n');
  
  console.log('📋 SMTP Configuration:');
  console.log(`Host: smtp.gmail.com`);
  console.log(`Port: 587`);
  console.log(`User: ${process.env.SMTP_USER}`);
  console.log(`Pass: ${process.env.SMTP_PASS ? '***' : 'NOT SET'}\n`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials not configured');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  try {
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    console.log('📤 Sending test email...');
    const testEmail = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'GatorEx Email Test - ' + new Date().toLocaleTimeString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🧪 Email Test Successful!</h2>
          <p>This is a test email from your GatorEx app.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Purpose:</strong> Testing magic link email delivery</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📊 Delivery Info:</h3>
            <ul>
              <li>SMTP: Gmail (smtp.gmail.com:587)</li>
              <li>From: ${process.env.SMTP_USER}</li>
              <li>Test Time: ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <p>If you received this quickly, magic links should work fine!</p>
        </div>
      `
    };
    
    const startTime = Date.now();
    const info = await transporter.sendMail(testEmail);
    const sendTime = Date.now() - startTime;
    
    console.log('✅ Test email sent successfully!');
    console.log(`⏱️  Send time: ${sendTime}ms`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox: ${process.env.SMTP_USER}\n`);
    
    console.log('💡 Next steps:');
    console.log('1. Check your inbox (including spam folder)');
    console.log('2. Note the delivery time');
    console.log('3. If delayed, try a different email provider or check Gmail settings');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Gmail App Password Issues:');
      console.log('1. Enable 2FA on your Google account');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Use the 16-character app password in SMTP_PASS');
    }
  }
}

testEmailSending();