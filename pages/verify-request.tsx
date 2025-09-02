import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '../src/components/ui/Logo';

export default function VerifyRequestPage() {
  return (
    <>
      <Head>
        <title>Check Your Email - GatorEx</title>
        <meta name="description" content="Check your email for the magic sign-in link" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Logo variant="svg" className="mx-auto mb-6" />
          
          <div className="text-6xl mb-6">📧</div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h1>
          
          <p className="text-gray-600 mb-6">
            We've sent a 6-digit verification code to your UF email address. Enter the code to sign in securely.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The verification code expires in 10 minutes for security.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/verify"
              className="block w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Try a Different Email
            </Link>
            
            <button
              onClick={() => window.location.href = '/login-otp'}
              className="block w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors mb-4"
            >
              Enter Verification Code
            </button>
            
            <p className="text-sm text-gray-500">
              Didn't receive the code? Check your spam folder or try again with a different UF email address.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}