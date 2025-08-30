import { useState } from 'react';
import Head from 'next/head';
import { Home, Mail, Bell, Calendar } from 'lucide-react';
import Layout from '../src/components/layout/Layout';

export default function SubleasePage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'waitlist_signup', {
        event_category: 'sublease',
        event_label: 'coming_soon_page'
      });
    }

    // TODO: Implement actual waitlist signup
    console.log('Waitlist signup:', email);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      <Head>
        <title>Sublease - Coming Soon - GatorEx</title>
        <meta name="description" content="Sublease marketplace for UF students - Coming Soon! Join the waitlist to be notified when we launch." />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Home size={80} className="text-orange-500" />
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
              Coming Soon
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sublease Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find and list sublease opportunities around UF campus. 
            Safe, verified, and designed for Gator students.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <Bell size={32} className="text-blue-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Be the First to Know
            </h2>
            <p className="text-blue-700 text-sm mb-4">
              Join our waitlist and get early access when we launch the sublease marketplace.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSignup} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your UF email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Join Waitlist
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="text-green-600 mb-2">✅</div>
                <p className="text-blue-700 font-medium">
                  You're on the list! We'll email you when it's ready.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What's Coming
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Listings</h3>
              <p className="text-gray-600 text-sm">
                Post your sublease with photos, details, and availability dates in minutes
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600 text-sm">
                Filter by price, location, dates, and amenities to find your perfect match
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Users</h3>
              <p className="text-gray-600 text-sm">
                UF email verification ensures you're dealing with real students
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Development Timeline
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-green-500 w-4 h-4 rounded-full mt-1 mr-4 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Phase 1: Buy/Sell Marketplace</h3>
                <p className="text-gray-600 text-sm">✅ Complete - Now live for UF students</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-500 w-4 h-4 rounded-full mt-1 mr-4 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Phase 2: Sublease Platform</h3>
                <p className="text-gray-600 text-sm">🚧 In Development - Expected Spring 2026</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-gray-300 w-4 h-4 rounded-full mt-1 mr-4 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Phase 3: Enhanced Features</h3>
                <p className="text-gray-600 text-sm">📋 Planned - Roommate matching, lease templates, and more</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                When will the sublease feature launch?
              </h3>
              <p className="text-gray-600">
                We're targeting Spring 2026 for the initial launch. Waitlist members will get 
                early access and updates on our progress.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Will it cost anything to use?
              </h3>
              <p className="text-gray-600">
                Just like our current marketplace, the sublease platform will be completely 
                free for UF students. No listing fees or commissions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How will verification work?
              </h3>
              <p className="text-gray-600">
                Same as our current system - UF email verification ensures all users are 
                legitimate students. We may add additional verification for sublease listings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I suggest features?
              </h3>
              <p className="text-gray-600">
                Absolutely! Email us your ideas and feedback. We're building this for the 
                UF community and want to hear what you need.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Calendar size={32} className="mx-auto text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Stay Updated
          </h2>
          <p className="text-gray-600 mb-4">
            Follow our progress and be the first to try new features
          </p>
          
          {!isSubmitted && (
            <form onSubmit={handleWaitlistSignup} className="max-w-sm mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Your UF email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}