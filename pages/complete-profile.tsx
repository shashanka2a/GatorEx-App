import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CompleteProfile() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Redirect to terms if not accepted
  useEffect(() => {
    if (session && (!session.user?.termsAccepted || !session.user?.privacyAccepted)) {
      router.push('/terms?returnUrl=/complete-profile');
    }
  }, [session, router]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!name.trim()) {
      setMessage('Please enter your name');
      setLoading(false);
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setMessage('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          phoneNumber: phoneNumber.replace(/\D/g, '') // Send digits only
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: name.trim(),
            profileCompleted: true
          }
        });
        
        setMessage('Profile completed! Redirecting...');
        setTimeout(() => router.push('/buy'), 1500);
      } else {
        setMessage(data.error || 'Failed to complete profile');
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
        <title>Complete Your Profile - GatorEx</title>
        <meta name="description" content="Complete your profile to start buying and selling" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-500 mb-2">🐊 GatorEx</h1>
            <p className="text-gray-600 mb-4">University of Florida Marketplace</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              We need a few details so buyers and sellers can contact you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be shown to other students when you list items
              </p>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(352) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={14}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                For buyers to contact you via iMessage/SMS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !validatePhone(phoneNumber)}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('completed') || message.includes('Redirecting')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Privacy:</strong> Your contact info is only shown to verified UF students when you list items for sale.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700">
                <strong>Legal:</strong> By completing your profile, you confirm acceptance of our Terms of Service and Privacy Policy during sign-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}