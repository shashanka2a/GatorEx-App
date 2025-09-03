import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing referrals API...');
    
    // Test session
    const session = await getServerSession(req, res, authOptions);
    console.log('👤 Session:', session ? 'Found' : 'Not found');
    console.log('🆔 User ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        debug: {
          session: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        }
      });
    }

    // Test environment variables
    const envCheck = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL
    };
    
    console.log('🔧 Environment:', envCheck);

    // Test database functions
    try {
      const { getReferralCode, createReferralCode } = await import('../../src/lib/referrals/database');
      
      console.log('📚 Database functions imported successfully');
      
      // Try to get or create referral code
      let referralCode = await getReferralCode(session.user.id);
      console.log('🔍 Existing referral code:', referralCode ? 'Found' : 'Not found');
      
      if (!referralCode) {
        console.log('🆕 Creating new referral code...');
        referralCode = await createReferralCode(session.user.id);
        console.log('✅ Created referral code:', referralCode?.code);
      }

      const referralLink = `${process.env.NEXTAUTH_URL}/login-otp?ref=${referralCode.code}`;
      
      return res.status(200).json({
        success: true,
        debug: {
          userId: session.user.id,
          userEmail: session.user.email,
          referralCode: referralCode.code,
          referralLink,
          environment: envCheck
        }
      });
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return res.status(500).json({ 
        error: 'Database error',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        debug: { environment: envCheck }
      });
    }

  } catch (error) {
    console.error('❌ Test API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}