import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function findOrCreateUser(userId: string) {
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: `temp_${userId}@temp.com`, // Temporary email, will be updated
        ufEmailVerified: true, // Auto-verified since only UF students can access the system
        trustScore: 10, // Start with higher trust score for verified UF students
        profileCompleted: false
      }
    });
  }

  return user;
}

export async function verifyUserEmail(userId: string, ufEmail: string) {
  // Validate UF email format
  if (!ufEmail.endsWith('@ufl.edu')) {
    throw new Error('Invalid UF email address');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ufEmail,
      ufEmailVerified: true,
      verifyToken: null,
      trustScore: { increment: 10 } // Boost trust score for verification
    }
  });

  return user;
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  await prisma.user.update({
    where: { id: userId },
    data: { verifyToken: token }
  });
  
  return token;
}

export async function getUserByVerificationToken(token: string) {
  return await prisma.user.findFirst({
    where: { verifyToken: token }
  });
}

export async function incrementUserTrustScore(userId: string, points: number = 1) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      trustScore: { increment: points }
    }
  });

  // Update trust level based on score
  await updateTrustLevel(user);
  
  return user;
}

export async function decrementUserTrustScore(userId: string, points: number = 5) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      trustScore: { decrement: points }
    }
  });

  // Update trust level based on score
  await updateTrustLevel(user);
  
  return user;
}

async function updateTrustLevel(user: any) {
  // Simple trust level logic based on score
  // This can be expanded later with more sophisticated rules
  
  if (user.trustScore <= -20) {
    console.log(`🚨 User ${user.id} has very low trust score: ${user.trustScore}`);
  } else if (user.trustScore >= 50 && user.ufEmailVerified) {
    console.log(`✅ User ${user.id} has high trust score: ${user.trustScore}`);
  }
}

export async function generateContactLink(userId: string, listingTitle?: string): Promise<string> {
  // Get the user's phone number from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneNumber: true, name: true }
  });

  if (!user?.phoneNumber) {
    // Fallback to email if no phone number
    const message = listingTitle 
      ? `Hi! I'm interested in your "${listingTitle}" listing on GatorEx.`
      : 'Hi! I saw your listing on GatorEx and I\'m interested.';
    
    const encodedMessage = encodeURIComponent(message);
    return `mailto:${userId}?subject=${encodeURIComponent('GatorEx Listing Inquiry')}&body=${encodedMessage}`;
  }

  // Create iMessage/SMS link
  const message = listingTitle 
    ? `Hi ${user.name || ''}! I'm interested in your "${listingTitle}" listing on GatorEx.`
    : `Hi ${user.name || ''}! I saw your listing on GatorEx and I'm interested.`;
  
  const encodedMessage = encodeURIComponent(message);
  
  // Format phone number for SMS link (remove formatting)
  const phoneDigits = user.phoneNumber.replace(/\D/g, '');
  
  // Use sms: protocol for cross-platform compatibility
  return `sms:+1${phoneDigits}?body=${encodedMessage}`;
}