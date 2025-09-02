import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { Logo } from '../src/components/ui/Logo';

export default function VerifyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const router = useRouter();

  const validateUFEmail = (email: string): boolean => {
    const ufDomains = ['@ufl.edu', '@gators.ufl.edu'];
    return ufDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!validateUFEmail(email)) {
      setMessage('Please use a valid UF email address (@ufl.edu or @gators.ufl.edu)');
      setLoading(false);
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setMessage('Please accept the Terms of Service and Privacy Policy to continue');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          termsAccepted: true,
          privacyAccepted: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to send verification code. Please try again.');
      } else {
        setEmailSent(true);
        setMessage('Check your email for a verification code!');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - GatorEx</title>
        <meta name="description" content="Sign in to GatorEx with your UF email" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Logo className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In to GatorEx
            </h1>
            <p className="text-gray-600">
              Enter your UF email to get a verification code
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  UF Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@ufl.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only @ufl.edu and @gators.ufl.edu emails accepted
                </p>
              </div>

              {/* Terms and Privacy Acceptance */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-orange-500 hover:text-orange-600 underline">
                      Terms of Service
                    </Link>
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-orange-500 hover:text-orange-600 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !termsAccepted || !privacyAccepted}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900">Check Your Email</h2>
              <p className="text-gray-600">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Enter the code to sign in. The code expires in 10 minutes.
              </p>
              
              <button
                onClick={() => {
                  // Pass the email to login-otp page
                  const url = new URL('/login-otp', window.location.origin);
                  url.searchParams.set('email', email);
                  url.searchParams.set('step', 'code');
                  window.location.href = url.toString();
                }}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors mt-4"
              >
                Enter Verification Code
              </button>
              
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setMessage('');
                }}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Use a different email
              </button>
            </div>
          )}

          {message && !emailSent && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('Check your email')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>UF Students Only:</strong> GatorEx is exclusively for verified University of Florida students. Your email domain confirms your student status.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  // If user is already signed in, redirect to appropriate page
  if (session?.user) {
    // Check if profile is completed
    if (session.user.profileCompleted) {
      return {
        redirect: {
          destination: '/buy',
          permanent: false,
        },
      };
    } else {
      return {
        redirect: {
          destination: '/complete-profile',
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
};