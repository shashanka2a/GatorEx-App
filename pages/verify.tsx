import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { setEmailVerified, setVerifiedEmail } from '../src/lib/client/verification';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate UF email
    if (!email.toLowerCase().endsWith('@ufl.edu')) {
      setError('Please enter a valid UF email address (@ufl.edu)');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      // Store token for OTP verification
      setToken(data.token);
      
      // In development mode, show the OTP
      if (data.devMode && data.devOTP) {
        console.log('🔢 Development OTP:', data.devOTP);
        alert(`Development mode - Your OTP is: ${data.devOTP}`);
      }
      
      setIsSubmitted(true);
      
      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'email_verification_requested', {
          event_category: 'auth',
          event_label: 'verify_page'
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          otp,
          email 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      // Store verification status locally
      setEmailVerified(true);
      setVerifiedEmail(email);
      
      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'email_verified', {
          event_category: 'auth',
          event_label: 'verify_page'
        });
      }
      
      // Redirect to home after successful verification
      router.push('/?verified=true');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // No automatic token verification needed for OTP flow

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <Head>
        <title>Verify UF Email - GatorEx</title>
        <meta name="description" content="Verify your UF email to access GatorEx marketplace" />
      </Head>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your UF Email
              </h1>
              <p className="text-gray-600">
                Enter your UF email address to get started with GatorEx
              </p>
            </div>

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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Why do we need this?{' '}
                <button className="text-orange-600 hover:text-orange-700 underline">
                  Learn more
                </button>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Verification Code
            </h1>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit code to{' '}
              <span className="font-medium">{email}</span>
            </p>
            
            <form onSubmit={handleOTPVerification} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setOtp('');
                    setError('');
                  }}
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  Resend code
                </button>
              </p>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setOtp('');
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700 underline text-sm"
              >
                Use a different email
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                <strong>Dev Mode:</strong> Check browser alert or console for the OTP
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>🔒 Secure</span>
            <span>🎓 UF Students Only</span>
            <span>📧 One-time verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}