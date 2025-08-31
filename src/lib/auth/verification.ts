import crypto from 'crypto';
import { sendOTPEmail } from '../email/otp';
import { prisma } from '../db/prisma';

// UF email domains
const UF_DOMAINS = ['ufl.edu', 'gators.ufl.edu'];

export function isValidUFEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return UF_DOMAINS.includes(domain);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function checkRateLimit(email: string, ipAddress: string): Promise<{ allowed: boolean; message?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Check email rate limit (3 per hour)
  const emailAttempts = await prisma.verificationAttempt.count({
    where: {
      email,
      createdAt: { gte: oneHourAgo }
    }
  });
  
  if (emailAttempts >= 3) {
    return { 
      allowed: false, 
      message: 'Too many verification attempts. Please wait 1 hour before trying again.' 
    };
  }
  
  // Check IP rate limit (3 per hour)
  const ipAttempts = await prisma.verificationAttempt.count({
    where: {
      ipAddress,
      createdAt: { gte: oneHourAgo }
    }
  });
  
  if (ipAttempts >= 3) {
    return { 
      allowed: false, 
      message: 'Too many verification attempts from this IP. Please wait 1 hour before trying again.' 
    };
  }
  
  return { allowed: true };
}

export async function sendVerificationOTP(email: string, ipAddress: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate UF email
    if (!isValidUFEmail(email)) {
      return { 
        success: false, 
        message: 'Please use a valid UF email address (@ufl.edu or @gators.ufl.edu)' 
      };
    }
    
    // Check rate limits
    const rateCheck = await checkRateLimit(email, ipAddress);
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.message! };
    }
    
    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        otpCode,
        otpExpiry,
        otpAttempts: 0
      },
      create: {
        email,
        otpCode,
        otpExpiry,
        otpAttempts: 0
      }
    });
    
    // Send OTP email
    await sendOTPEmail(email, otpCode);
    
    // Log attempt
    await prisma.verificationAttempt.create({
      data: {
        email,
        ipAddress,
        success: false // Will be updated to true on successful verification
      }
    });
    
    return { 
      success: true, 
      message: 'Verification code sent to your UF email. Please check your inbox.' 
    };
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      message: 'Failed to send verification code. Please try again.' 
    };
  }
}

export async function verifyOTP(email: string, otpCode: string, ipAddress: string): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return { success: false, message: 'Invalid verification code.' };
    }
    
    // Check if OTP is expired
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return { success: false, message: 'Verification code has expired. Please request a new one.' };
    }
    
    // Check attempt limit
    if (user.otpAttempts >= 5) {
      return { success: false, message: 'Too many failed attempts. Please request a new verification code.' };
    }
    
    // Verify OTP
    if (user.otpCode !== otpCode) {
      // Increment failed attempts
      await prisma.user.update({
        where: { email },
        data: { otpAttempts: user.otpAttempts + 1 }
      });
      
      return { success: false, message: 'Invalid verification code.' };
    }
    
    // Success - mark as verified
    await prisma.user.update({
      where: { email },
      data: {
        ufEmailVerified: true,
        otpCode: null,
        otpExpiry: null,
        otpAttempts: 0
      }
    });
    
    // Update verification attempt as successful
    await prisma.verificationAttempt.updateMany({
      where: {
        email,
        ipAddress,
        success: false
      },
      data: { success: true }
    });
    
    return { 
      success: true, 
      message: 'Email verified successfully!',
      userId: user.id
    };
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      message: 'Verification failed. Please try again.' 
    };
  }
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  });
}