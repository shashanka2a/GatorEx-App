import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { Logo } from '../src/components/ui/Logo';

export default function OTPLogin() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle URL parameters on component mount
  useEffect(() => {
    if (router.query.email && typeof router.query.email === 'string') {
      setEmail(router.query.email);
    }
    if (router.query.step === 'code') {
      setStep('code');
    }
  }, [router.query]);

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('code');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Force a page reload to pick up the new session
        setTimeout(() => {
          window.location.href = data.redirectTo || '/me';
        }, 1000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
              {step === 'email' ? 'Sign In with Code' : 'Enter Verification Code'}
            </h1>
            <p className="text-gray-600">
              {step === 'email' 
                ? 'Enter your UF email to get started' 
                : `We sent a 6-digit code to ${email}`
              }
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={sendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  UF Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@ufl.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be a valid @ufl.edu email address
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.includes('@ufl.edu')}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Check your email for the verification code
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                    setError('');
                    setMessage('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  ← Back to Email
                </button>
              </div>
            </form>
          )}
          {(error || message) && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message && !error
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {error || message}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>UF Students Only:</strong> This marketplace is exclusively for verified University of Florida students.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}