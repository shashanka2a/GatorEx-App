import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Logo } from '../src/components/ui/Logo';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - GatorEx</title>
        <meta name="description" content="GatorEx Terms of Service and User Agreement" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <Logo className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using GatorEx ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2>2. Eligibility</h2>
              <p>
                GatorEx is exclusively available to current University of Florida students with valid @ufl.edu or @gators.ufl.edu email addresses. 
                You must be at least 18 years old or have parental consent to use this service.
              </p>

              <h2>3. User Responsibilities</h2>
              <ul>
                <li>Provide accurate and truthful information in your listings</li>
                <li>Comply with all applicable laws and University of Florida policies</li>
                <li>Respect other users and maintain appropriate communication</li>
                <li>Not engage in fraudulent, misleading, or illegal activities</li>
                <li>Not sell prohibited items (weapons, drugs, alcohol, etc.)</li>
              </ul>

              <h2>4. Prohibited Content</h2>
              <p>Users may not post content that:</p>
              <ul>
                <li>Violates any laws or regulations</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains hate speech, harassment, or discriminatory content</li>
                <li>Promotes illegal activities or substances</li>
                <li>Contains explicit or inappropriate material</li>
              </ul>

              <h2>5. Privacy and Data</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. By using GatorEx, you consent to our data practices as described in our Privacy Policy.
              </p>

              <h2>6. Transactions</h2>
              <p>
                GatorEx facilitates connections between buyers and sellers but is not party to any transactions. 
                All transactions are between users directly. We recommend meeting in safe, public locations on campus.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                GatorEx is provided "as is" without warranties. We are not liable for any damages arising from your use of the service, 
                including but not limited to direct, indirect, incidental, or consequential damages.
              </p>

              <h2>8. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms or engage in inappropriate behavior. 
                Users may delete their accounts at any time.
              </p>

              <h2>9. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>

              <h2>10. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us through the app or at our support channels.
              </p>

              <h2>11. Governing Law</h2>
              <p>
                These terms are governed by the laws of the State of Florida and the policies of the University of Florida.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <TermsAcceptanceForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TermsAcceptanceForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept both Terms of Service and Privacy Policy to continue');
      return;
    }

    if (!session?.user?.email) {
      router.push('/verify');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/accept-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      if (response.ok) {
        // After accepting terms, check if profile needs completion
        if (session?.user?.profileCompleted === false) {
          router.push('/complete-profile');
        } else {
          // Redirect back to where they came from or to buy page
          const returnUrl = router.query.returnUrl as string || '/buy';
          router.push(returnUrl);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to accept terms');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center">
        <Link 
          href="/verify" 
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I have read and agree to the <strong>Terms of Service</strong>
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
            I have read and agree to the <strong>Privacy Policy</strong>
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleAccept}
          disabled={loading || !termsAccepted || !privacyAccepted}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Accepting...' : 'Accept and Continue'}
        </button>
      </div>
    </div>
  );
}