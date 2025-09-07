import { getEmailProvider } from './providers';
import { prisma } from '../db/prisma';
import { incrementUserTrustScore } from '../users/manager';

// Rate limiting for email sending
const emailRateLimit = new Map<string, number[]>();

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  const attempts = emailRateLimit.get(email) || [];
  const recentAttempts = attempts.filter(time => now - time < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return false;
  }

  emailRateLimit.set(email, [...recentAttempts, now]);
  return true;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // Check rate limit
  if (!checkRateLimit(email)) {
    throw new Error('Too many verification attempts. Please try again later.');
  }
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;
  
  // In development, just log the link
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 Magic link for ${email}: ${verifyLink}`);
    return;
  }

  // Production email sending
  try {
    const emailProvider = getEmailProvider();
    
    const subject = 'Verify your UF email for GatorEx 🐊';
    const html = `
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
      `;
      
    const text = `
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
    `;

    await emailProvider.sendEmail(email, subject, html, text);
    console.log(`✅ Magic link sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send magic link:', error);
    throw new Error('Failed to send magic link');
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

    // Update user with verified email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ufEmail: email,
        ufEmailVerified: true,
        verifyToken: null
      }
    });

    // Increment trust score for email verification (capped at 100)
    await incrementUserTrustScore(user.id, 10);

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