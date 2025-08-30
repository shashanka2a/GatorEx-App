import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
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
        throw new Error(data.error || 'Failed to send verification email');
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

  const handleTokenVerification = async () => {
    const { token } = router.query;
    
    if (token) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token: token as string,
            email: router.query.email || email 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }
        
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
        setError(error instanceof Error ? error.message : 'Invalid or expired verification link.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle token verification on page load
  useEffect(() => {
    if (router.query.token) {
      handleTokenVerification();
    }
  }, [router.query.token]);

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
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to{' '}
              <span className="font-medium">{email}</span>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-800 space-y-1 text-left">
                <li>1. Check your UF email inbox</li>
                <li>2. Click the verification link</li>
                <li>3. Start buying and selling!</li>
              </ol>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-orange-600 hover:text-orange-700 underline text-sm"
            >
              Use a different email
            </button>
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