import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, 
  MessageCircle, 
  Home as HomeIcon, 
  User,
  Search,
  QrCode,
  X
} from 'lucide-react';
import { generateWhatsAppBotLink } from '../../lib/whatsapp/sharing';

interface WebNavProps {
  userVerified?: boolean;
  onSearch?: (query: string) => void;
}

export default function WebNav({ userVerified = false, onSearch }: WebNavProps) {
  const router = useRouter();
  const [showSellModal, setShowSellModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSellClick = () => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackSellCTA('web_top_nav');

    if (!userVerified) {
      router.push('/verify');
      return;
    }

    setShowSellModal(true);
  };

  const handleTabSwitch = (tab: string) => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackTabSwitch(tab, 'web');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <>
      {/* Top Navigation */}
      <nav 
        className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 hidden md:block"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-orange-600">🐊</span>
              <span className="text-xl font-bold text-gray-900">GatorEx</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              <Link
                href="/"
                onClick={() => handleTabSwitch('buy')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center
                  ${router.pathname === '/' 
                    ? 'text-orange-600 bg-orange-100 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                aria-current={router.pathname === '/' ? 'page' : undefined}
              >
                <ShoppingBag size={16} className="mr-2" />
                Buy
              </Link>

              <button
                onClick={() => {
                  handleSellClick();
                  handleTabSwitch('sell');
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all duration-200 min-h-[44px] flex items-center shadow-sm hover:shadow-md active:scale-95"
                aria-label="Start selling"
              >
                <MessageCircle size={16} className="mr-2" />
                Sell
              </button>

              <Link
                href="/sublease"
                onClick={() => handleTabSwitch('sublease')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center relative
                  ${router.pathname === '/sublease' 
                    ? 'text-orange-600 bg-orange-100 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                aria-current={router.pathname === '/sublease' ? 'page' : undefined}
              >
                <HomeIcon size={16} className="mr-2" />
                Sublease
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              </Link>

              <Link
                href="/me"
                onClick={() => handleTabSwitch('profile')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center
                  ${router.pathname === '/me' 
                    ? 'text-orange-600 bg-orange-100 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                aria-current={router.pathname === '/me' ? 'page' : undefined}
              >
                <User size={16} className="mr-2" />
                Profile
              </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[200px]"
                  aria-label="Search items"
                />
              </div>
            </form>
          </div>
        </div>
      </nav>

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 relative shadow-2xl">
            <button
              onClick={() => setShowSellModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mb-6">
                <MessageCircle size={56} className="mx-auto text-orange-500 mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Start Selling on GatorEx</h2>
                <p className="text-gray-600 mt-2">Chat with our bot to create your listing in minutes</p>
              </div>

              <div className="space-y-4">
                <a
                  href={generateWhatsAppBotLink('sell')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium text-lg"
                >
                  🚀 Open WhatsApp Bot
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateWhatsAppBotLink('sell'));
                    alert('Bot link copied to clipboard!');
                  }}
                  className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <QrCode size={16} className="inline mr-2" />
                  Copy Bot Link
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <div className="text-2xl mb-1">📱</div>
                  <p>Quick listing via chat</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <p>UF students only</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💬</div>
                  <p>Direct buyer contact</p>
                </div>
              </div>

              <div className="mt-6 text-left bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Click "Open WhatsApp Bot"</li>
                  <li>2. Tell the bot what you're selling</li>
                  <li>3. Add price and photos</li>
                  <li>4. Your listing goes live!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}