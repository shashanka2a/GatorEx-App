import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // Store the token in the user record
  await prisma.user.updateMany({
    where: { ufEmail: email },
    data: { verifyToken: token }
  });

  // TODO: Implement actual email sending
  // For now, just log the verification link
  const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
  console.log(`Verification email for ${email}: ${verifyLink}`);
  
  // In production, use a service like SendGrid, AWS SES, or Nodemailer
  // await sendEmail({
  //   to: email,
  //   subject: 'Verify your UF email for GatorEx',
  //   html: `
  //     <h2>Welcome to GatorEx!</h2>
  //     <p>Click the link below to verify your UF email and start buying/selling:</p>
  //     <a href="${verifyLink}">Verify Email</a>
  //   `
  // });
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
        verifyToken: null,
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