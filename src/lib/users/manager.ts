import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function findOrCreateUser(whatsappId: string) {
  let user = await prisma.user.findUnique({
    where: { whatsappId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        whatsappId,
        ufEmailVerified: false,
        trustScore: 0,
        trustLevel: 'BASIC'
      }
    });
  }

  return user;
}

export async function verifyUserEmail(whatsappId: string, ufEmail: string) {
  // Validate UF email format
  if (!ufEmail.endsWith('@ufl.edu')) {
    throw new Error('Invalid UF email address');
  }

  const user = await prisma.user.update({
    where: { whatsappId },
    data: {
      ufEmail,
      ufEmailVerified: true,
      verifyToken: null,
      trustScore: { increment: 10 } // Boost trust score for verification
    }
  });

  return user;
}

export async function createVerificationToken(whatsappId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  await prisma.user.update({
    where: { whatsappId },
    data: { verifyToken: token }
  });
  
  return token;
}

export async function getUserByVerificationToken(token: string) {
  return await prisma.user.findFirst({
    where: { verifyToken: token }
  });
}

export async function incrementUserTrustScore(whatsappId: string, points: number = 1) {
  const user = await prisma.user.update({
    where: { whatsappId },
    data: {
      trustScore: { increment: points }
    }
  });

  // Update trust level based on score
  await updateTrustLevel(user);
  
  return user;
}

export async function decrementUserTrustScore(whatsappId: string, points: number = 5) {
  const user = await prisma.user.update({
    where: { whatsappId },
    data: {
      trustScore: { decrement: points },
      spamAttempts: { increment: 1 }
    }
  });

  // Update trust level based on score
  await updateTrustLevel(user);
  
  return user;
}

async function updateTrustLevel(user: any) {
  let newTrustLevel = user.trustLevel;
  
  // Upgrade to trusted (score >= 50, verified, low spam)
  if (user.trustScore >= 50 && user.ufEmailVerified && user.spamAttempts <= 1) {
    newTrustLevel = 'TRUSTED';
  }
  
  // Shadow ban (score <= -20 or spam attempts >= 3)
  if (user.trustScore <= -20 || user.spamAttempts >= 3) {
    newTrustLevel = 'SHADOW_BANNED';
  }
  
  if (newTrustLevel !== user.trustLevel) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        trustLevel: newTrustLevel,
        shadowBanned: newTrustLevel === 'SHADOW_BANNED'
      }
    });
  }
}

export function generateWhatsAppContactLink(whatsappId: string, listingTitle?: string): string {
  const message = listingTitle 
    ? `Hi! I'm interested in your "${listingTitle}" listing on GatorEx.`
    : 'Hi! I saw your listing on GatorEx and I\'m interested.';
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappId}?text=${encodedMessage}`;
}