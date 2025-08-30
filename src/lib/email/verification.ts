import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // Store the token in the user record with 24-hour expiry
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);
  
  await prisma.user.updateMany({
    where: { ufEmail: email },
    data: { 
      verifyToken: token,
      verifyTokenExpiry: expiryDate
    }
  });

  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
  
  // In development, just log the link
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 Verification link for ${email}: ${verifyLink}`);
    return;
  }

  // Production email sending
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"GatorEx" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your UF email for GatorEx 🐊',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your UF Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF7A00, #0021FF); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GatorEx! 🐊</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">The official UF student marketplace</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #FF7A00; margin-top: 0;">Verify Your UF Email</h2>
            
            <p>Hi there! 👋</p>
            
            <p>You're just one click away from joining the GatorEx community. Click the button below to verify your UF email and start buying and selling with fellow Gators:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="background: linear-gradient(135deg, #FF7A00, #0021FF); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(255, 122, 0, 0.3);">
                ✅ Verify My Email
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verifyLink}" style="color: #FF7A00; word-break: break-all;">${verifyLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0021FF; margin-top: 0; font-size: 16px;">🔒 Why do we verify UF emails?</h3>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; color: #666;">
                <li>Ensures you're a real UF student</li>
                <li>Creates a trusted community</li>
                <li>Prevents spam and fraud</li>
                <li>Enables secure transactions</li>
              </ul>
            </div>
            
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              This link will expire in 24 hours for security reasons.<br>
              If you didn't request this verification, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
            <p>Go Gators! 🐊 | GatorEx - Built by students, for students</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to GatorEx! 🐊

You're just one click away from joining the GatorEx community. 

Verify your UF email by visiting: ${verifyLink}

Why do we verify UF emails?
• Ensures you're a real UF student
• Creates a trusted community  
• Prevents spam and fraud
• Enables secure transactions

This link will expire in 24 hours for security reasons.

Go Gators! 🐊
GatorEx - Built by students, for students
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function verifyEmailToken(token: string, email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    });

    if (!user) {
      return false;
    }

    // Check if token has expired
    if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
      return false;
    }

    // Update user with verified email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ufEmail: email,
        ufEmailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
        trustScore: { increment: 10 }
      }
    });

    // Publish any ready draft listings
    await publishReadyListings(user.id);

    return true;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return false;
  }
}

async function publishReadyListings(userId: string): Promise<void> {
  // Find draft listings that are ready to publish
  const readyListings = await prisma.listing.findMany({
    where: {
      userId,
      status: 'READY'
    }
  });

  // Publish them
  for (const listing of readyListings) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: 'PUBLISHED' }
    });
  }

  // TODO: Send notification to user about published listings
  if (readyListings.length > 0) {
    console.log(`Published ${readyListings.length} listings for user ${userId}`);
  }
}