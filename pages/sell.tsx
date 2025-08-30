import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { MessageCircle, CheckCircle, Clock, Users } from 'lucide-react';
import Layout from '../src/components/layout/Layout';
import { generateWhatsAppBotLink } from '../src/lib/whatsapp/sharing';

export default function SellPage() {
  const router = useRouter();

  // Check if user is verified (you'll need to implement user context)
  const userVerified = false; // Replace with actual user verification check

  useEffect(() => {
    if (!userVerified) {
      router.push('/verify');
    }
  }, [userVerified, router]);

  const handleStartSelling = () => {
    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sell_page_cta_click', {
        event_category: 'selling',
        event_label: 'main_cta'
      });
    }

    window.open(generateWhatsAppBotLink('sell'), '_blank');
  };

  return (
    <Layout userVerified={userVerified}>
      <Head>
        <title>Sell Items - GatorEx</title>
        <meta name="description" content="Sell your items to UF students safely and easily through our WhatsApp bot" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <MessageCircle size={64} className="mx-auto text-orange-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sell to Fellow Gators
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              List your items in minutes through our smart WhatsApp bot. 
              Reach UF students safely and get paid fast.
            </p>
          </div>

          <button
            onClick={handleStartSelling}
            className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center"
          >
            <MessageCircle size={20} className="mr-2" />
            Start Selling Now
          </button>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={24} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Chat with Bot</h3>
              <p className="text-gray-600 text-sm">
                Click the button to open WhatsApp and start chatting with our listing bot
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Describe Item</h3>
              <p className="text-gray-600 text-sm">
                Tell the bot what you're selling, set your price, and upload photos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Auto-Publish</h3>
              <p className="text-gray-600 text-sm">
                Your listing goes live automatically and reaches interested buyers
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Get Messages</h3>
              <p className="text-gray-600 text-sm">
                Buyers contact you directly through WhatsApp to arrange pickup
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Clock size={32} className="text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick & Easy
            </h3>
            <p className="text-gray-600">
              Create listings in under 2 minutes. No complex forms or lengthy processes.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Users size={32} className="text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              UF Students Only
            </h3>
            <p className="text-gray-600">
              Verified UF email required. Safe transactions within the Gator community.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <span className="text-3xl mb-4 block">🔒</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Safe & Secure
            </h3>
            <p className="text-gray-600">
              Meet on campus, verified users, and direct communication through WhatsApp.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do I need to download anything?
              </h3>
              <p className="text-gray-600">
                No! Everything works through WhatsApp, which you probably already have. 
                Just click the button and start chatting.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How much does it cost?
              </h3>
              <p className="text-gray-600">
                GatorEx is completely free for UF students. No listing fees, no commission, no hidden costs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How long do listings stay active?
              </h3>
              <p className="text-gray-600">
                Listings automatically expire after 14 days. You'll get a reminder 2 days before 
                with an option to renew for another 14 days.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What can I sell?
              </h3>
              <p className="text-gray-600">
                Almost anything! Electronics, textbooks, furniture, clothes, bikes, and more. 
                Just no illegal items, animals, or academic services.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={handleStartSelling}
            className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center"
          >
            <MessageCircle size={20} className="mr-2" />
            Ready to Sell? Start Now
          </button>
          <p className="text-gray-500 mt-2 text-sm">
            Takes less than 2 minutes to create your first listing
          </p>
        </div>
      </div>
    </Layout>
  );
}