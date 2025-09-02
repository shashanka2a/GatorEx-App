import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Check, Instagram, Mail, Package, Gift, ExternalLink } from 'lucide-react';
import { Card } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';

interface GiveawayStatus {
  instagramFollowed: boolean;
  ufEmailVerified: boolean;
  hasPostedListing: boolean;
  isEligible: boolean;
  instagramUsername?: string;
}

export default function GiveawayPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<GiveawayStatus>({
    instagramFollowed: false,
    ufEmailVerified: false,
    hasPostedListing: false,
    isEligible: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [instagramUsername, setInstagramUsername] = useState('');

  useEffect(() => {
    if (session?.user) {
      checkGiveawayStatus();
    } else {
      setLoading(false);
    }
  }, [session]);

  const checkGiveawayStatus = async () => {
    try {
      const response = await fetch('/api/giveaway/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setInstagramUsername(data.instagramUsername || '');
      }
    } catch (error) {
      console.error('Error checking giveaway status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramVerification = async () => {
    if (!instagramUsername.trim()) {
      alert('Please enter your Instagram username');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/giveaway/verify-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: instagramUsername })
      });

      if (response.ok) {
        await checkGiveawayStatus();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to verify Instagram follow');
      }
    } catch (error) {
      console.error('Error verifying Instagram:', error);
      alert('Failed to verify Instagram follow');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGiveawayEntry = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/giveaway/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('🎉 Congratulations! You\'re entered in the iPhone 14 giveaway!');
        await checkGiveawayStatus();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to enter giveaway');
      }
    } catch (error) {
      console.error('Error entering giveaway:', error);
      alert('Failed to enter giveaway');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold mb-4">iPhone 14 Launch Giveaway 🎉</h1>
          <p className="text-gray-600 mb-6">Sign in with your UF email to participate in our launch giveaway!</p>
          <Button 
            onClick={() => router.push('/verify')}
            className="w-full bg-uf-gradient text-white"
          >
            Sign In to Enter
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const completedSteps = [
    status.instagramFollowed,
    status.ufEmailVerified,
    status.hasPostedListing
  ].filter(Boolean).length;

  return (
    <>
      <Head>
        <title>iPhone 14 Giveaway - GatorEx</title>
        <meta name="description" content="Enter our iPhone 14 launch giveaway! Complete 3 simple steps to be eligible." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">iPhone 14 Launch Giveaway</h1>
            <p className="text-lg text-gray-600">Complete all steps below to enter our exclusive giveaway!</p>
          </div>

          {/* Progress Card */}
          <Card className="p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Progress</h2>
              <p className="text-gray-600">
                {status.isEligible 
                  ? "All requirements completed! You're eligible to enter."
                  : `${completedSteps}/3 steps completed`
                }
              </p>
              <div className="mt-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  status.isEligible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {completedSteps}/3 Complete
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {/* Instagram Follow */}
              <div className={`flex items-center p-4 rounded-xl border-2 ${
                status.instagramFollowed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  status.instagramFollowed ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {status.instagramFollowed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Instagram className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">Follow @gatorex.shop on Instagram</h3>
                  <p className="text-sm text-gray-600">Stay connected with the GatorEx community</p>
                  {!status.instagramFollowed && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <span>1.</span>
                        <a 
                          href="https://instagram.com/gatorex.shop" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          Follow @gatorex.shop on Instagram
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="2. Enter your Instagram username"
                          value={instagramUsername}
                          onChange={(e) => setInstagramUsername(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                        <Button
                          onClick={handleInstagramVerification}
                          disabled={submitting}
                          size="sm"
                          className="bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {status.instagramFollowed && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>

              {/* UF Email Verified */}
              <div className={`flex items-center p-4 rounded-xl border-2 ${
                status.ufEmailVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  status.ufEmailVerified ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {status.ufEmailVerified ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Mail className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">UF Email Verified</h3>
                  <p className="text-sm text-gray-600">Confirm your University of Florida status</p>
                  {!status.ufEmailVerified && (
                    <Button
                      onClick={() => router.push('/verify')}
                      size="sm"
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Verify UF Email
                    </Button>
                  )}
                </div>
                <div className="ml-4">
                  {status.ufEmailVerified && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>

              {/* Posted Listing */}
              <div className={`flex items-center p-4 rounded-xl border-2 ${
                status.hasPostedListing 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  status.hasPostedListing ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {status.hasPostedListing ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Package className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">Posted at least 1 item to sell</h3>
                  <p className="text-sm text-gray-600">Show you're an active marketplace member</p>
                  {!status.hasPostedListing && (
                    <Button
                      onClick={() => router.push('/sell')}
                      size="sm"
                      className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Create Listing
                    </Button>
                  )}
                </div>
                <div className="ml-4">
                  {status.hasPostedListing && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Entry Button */}
          {status.isEligible ? (
            <Card className="p-6 text-center bg-gradient-to-r from-blue-500 to-orange-500 text-white">
              <Gift className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">🎉 Ready to Enter!</h3>
              <p className="mb-4">You've completed all verification steps. Click below to submit your entry for the iPhone 14 giveaway.</p>
              <Button
                onClick={handleGiveawayEntry}
                disabled={submitting}
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3"
              >
                {submitting ? 'Entering...' : 'Verify & Enter Giveaway'}
              </Button>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Complete All Steps</h3>
              <p className="text-gray-600 mb-4">
                Finish the remaining {3 - completedSteps} step{3 - completedSteps !== 1 ? 's' : ''} above to become eligible for the iPhone 14 giveaway.
              </p>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>By entering, you agree to GatorEx's Terms of Service and Privacy Policy.</p>
            <p>Winner will be announced on our Instagram page.</p>
          </div>
        </div>
      </div>
    </>
  );
}