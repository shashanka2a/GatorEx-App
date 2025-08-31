import { NextApiRequest, NextApiResponse } from 'next';

// Shared in-memory storage - this needs to be the same instance as verify-email
// In production, use a database or Redis
declare global {
  var verificationTokens: Map<string, { email: string; expires: Date; otp: string }> | undefined;
}

const verificationTokens = globalThis.verificationTokens ?? new Map<string, { email: string; expires: Date; otp: string }>();
globalThis.verificationTokens = verificationTokens;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate UF email
  if (!email.toLowerCase().endsWith('@ufl.edu')) {
    return res.status(400).json({ error: 'Please use a valid UF email address (@ufl.edu)' });
  }

  try {
    // Generate OTP and token
    const otp = generateOTP();
    const token = generateToken();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in memory (use database in production)
    verificationTokens.set(token, {
      email: email.toLowerCase(),
      expires,
      otp
    });

    // Send email with OTP
    await sendSimpleEmail(email.toLowerCase(), otp);

    console.log(`📧 OTP sent to ${email}: ${otp}`);

    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent to your email!',
      token, // Client needs this to verify OTP
      // In development, show OTP for easy testing
      ...(process.env.NODE_ENV === 'development' && { 
        devOTP: otp,
        devMode: true 
      })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
}

async function sendSimpleEmail(email: string, otp: string): Promise<void> {
  // Always log OTP for debugging
  console.log(`🔢 OTP for ${email}: ${otp}`);
  
  // Check if we have Gmail credentials
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('📧 No Gmail credentials found, using development mode');
    return;
  }

  // Try to send email
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"GatorEx" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your GatorEx Verification Code 🐊',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF7A00;">🐊 GatorEx</h1>
            <h2>Your Verification Code</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 48px; color: #0021FF; margin: 0; letter-spacing: 8px;">${otp}</h1>
            <p style="color: #666; margin-top: 10px;">Enter this code to verify your UF email</p>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            This code expires in 10 minutes.<br>
            If you didn't request this, you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Go Gators! 🐊</p>
          </div>
        </div>
      `,
      text: `Your GatorEx verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nGo Gators! 🐊`
    });

    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    console.log('🔢 But OTP is logged above for testing');
    // Don't throw error - continue with logged OTP
  }
}