import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Test 1: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP: ${otp}`);

    // Test 2: Database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // Test 3: Store OTP
    console.log('Storing OTP in database...');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Clean up existing
    await prisma.oTP.deleteMany({
      where: { email }
    });

    // Create new
    const otpRecord = await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
        attempts: 0
      }
    });
    
    console.log(`OTP stored with ID: ${otpRecord.id}`);

    // Test 4: Environment variables
    const hasSmtp = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    console.log(`SMTP configured: ${hasSmtp}`);

    return res.status(200).json({
      success: true,
      message: 'Test completed successfully',
      data: {
        otp,
        otpId: otpRecord.id,
        email,
        expiresAt,
        smtpConfigured: hasSmtp,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}