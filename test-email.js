const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify connection
    await transport.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test email
    const info = await transport.sendMail({
      from: process.env.SMTP_USER,
      to: 'sjagannatham@ufl.edu', // Your test email
      subject: 'GatorEx Test Email',
      text: 'This is a test email from GatorEx to verify SMTP is working.',
      html: '<h1>GatorEx Test Email</h1><p>This is a test email to verify SMTP is working.</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication failed. Check:');
      console.log('1. Gmail App Password is correct');
      console.log('2. 2-Factor Authentication is enabled on Gmail');
      console.log('3. App Password was generated recently');
    }
  }
}

testEmail();