import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '../src/components/ui/Logo';

export default function SignUp() {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Get referral code from URL
    if (router.query.ref && typeof router.query.ref === 'string') {
      setReferralCode(router.query.ref);
      
      // Set referral cookie for 30 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `gex_ref=${router.query.ref}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      
      // Also log the referral click
      fetch('/api/referrals/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: router.query.ref })
      }).catch(err => console.error('Failed to log referral click:', err));
    }
  }, [router.query]);

  const handleContinue = () => {
    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept both Terms of Service and Privacy Policy to continue');
      return;
    }

    // Store terms acceptance in localStorage temporarily
    localStorage.setItem('termsAccepted', 'true');
    localStorage.setItem('privacyAccepted', 'true');

    // Redirect to verify page with referral code
    const loginUrl = referralCode 
      ? `/verify?ref=${referralCode}`
      : '/verify';
    
    router.push(loginUrl);
  };

  return (
    <>
      <Head>
        <title>Join GatorEx - UF Student Marketplace</title>
        <meta name="description" content="Join GatorEx, the exclusive marketplace for University of Florida students" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Logo variant="svg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to GatorEx! 🐊
            </h1>
            {referralCode ? (
              <p className="text-gray-600">
                You've been invited to join the UF student marketplace
              </p>
            ) : (
              <p className="text-gray-600">
                Join the exclusive University of Florida student marketplace
              </p>
            )}
          </div>

          {referralCode && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 text-center">
                🎉 <strong>You're invited!</strong> Join through a referral and start buying and selling with fellow Gators.
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Before you continue:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I have read and agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-orange-500 hover:text-orange-600 underline">
                      Terms of Service
                    </Link>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700">
                    I have read and agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-orange-500 hover:text-orange-600 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!termsAccepted || !privacyAccepted}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Sign Up
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login-otp" className="text-orange-500 hover:text-orange-600 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>UF Students Only:</strong> This marketplace is exclusively for verified University of Florida students with @ufl.edu email addresses.
              </p>
            </div>
            
            {referralCode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700">
                  <strong>Referral Bonus:</strong> By joining through this invitation, you and your friend will both earn rewards when you complete your first transaction!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}