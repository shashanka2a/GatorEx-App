import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Send OTP email
async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">🐊 GatorEx</h1>
          <p style="color: #666; margin: 5px 0;">University of Florida Marketplace</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Login Code</h2>
          <p style="color: #666; margin-bottom: 25px;">
            Enter this 6-digit code to sign in to GatorEx:
          </p>
          
          <div style="background: white; border: 2px solid #FF6B35; border-radius: 8px; 
                      padding: 20px; margin: 20px 0; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #FF6B35; 
                         letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This code expires in 10 minutes for security.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <p>© 2024 GatorEx - University of Florida Student Marketplace</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `GatorEx <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your GatorEx Login Code 🐊',
      html: emailHtml,
    });

    return true;
  } catch (error: any) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

// Store OTP in database
async function storeOTP(email: string, otp: string): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email first
    await prisma.oTP.deleteMany({
      where: { email }
    });

    // Create new OTP record
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
        attempts: 0
      }
    });

    return true;
  } catch (error: any) {
    console.error('Failed to store OTP:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, termsAccepted, privacyAccepted } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!termsAccepted || !privacyAccepted) {
    return res.status(400).json({ error: 'Terms of Service and Privacy Policy must be accepted' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if it's a UF email (optional - remove if you want to allow all emails)
  const ufDomains = ['ufl.edu', 'gators.ufl.edu'];
  const domain = email.toLowerCase().split('@')[1];
  if (!ufDomains.includes(domain)) {
    return res.status(400).json({ 
      error: 'Please use your UF email address (@ufl.edu or @gators.ufl.edu)' 
    });
  }

  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in database
    const stored = await storeOTP(email, otp);
    if (!stored) {
      return res.status(500).json({ error: 'Failed to generate code. Please try again.' });
    }

    // Send OTP email (in development, just log it)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 OTP for ${email}: ${otp}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Verification code generated! Check console for code.',
        otp // Include OTP in development mode for testing
      });
    } else {
      const sent = await sendOTPEmail(email, otp);
      if (!sent) {
        return res.status(500).json({ error: 'Failed to send code. Please try again.' });
      }
      return res.status(200).json({ 
        success: true, 
        message: 'Verification code sent! Check your email.' 
      });
    }

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}