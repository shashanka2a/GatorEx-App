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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
        className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 hidden md:block shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            >
              <span className="text-2xl font-bold text-orange-600">🐊</span>
              <span className="text-xl font-bold text-gray-900">GatorEx</span>
            </Link>

            {/* Center Navigation */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
              <Link
                href="/"
                onClick={() => handleTabSwitch('buy')}
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] min-w-[80px] flex items-center justify-center
                  ${router.pathname === '/' 
                    ? 'text-orange-600 bg-white shadow-sm border border-orange-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 min-h-[44px] flex items-center shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Start selling"
              >
                <MessageCircle size={16} className="mr-2" />
                Sell
              </button>

              <Link
                href="/sublease"
                onClick={() => handleTabSwitch('sublease')}
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] min-w-[100px] flex items-center justify-center relative
                  ${router.pathname === '/sublease' 
                    ? 'text-orange-600 bg-white shadow-sm border border-orange-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                `}
                aria-current={router.pathname === '/sublease' ? 'page' : undefined}
              >
                <HomeIcon size={16} className="mr-2" />
                Sublease
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                  Soon
                </span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center">
                <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
                  <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[240px] bg-gray-50 focus:bg-white transition-all duration-200"
                    aria-label="Search items"
                  />
                </div>
              </form>

              {/* User Status & Profile */}
              <div className="flex items-center space-x-2">
                {userVerified && (
                  <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Verified</span>
                  </div>
                )}
                
                <Link
                  href="/me"
                  onClick={() => handleTabSwitch('profile')}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center border
                    ${router.pathname === '/me' 
                      ? 'text-orange-600 bg-orange-50 border-orange-200 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                    }
                  `}
                  aria-current={router.pathname === '/me' ? 'page' : undefined}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sell Modal */}
      {showSellModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowSellModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl transform transition-all duration-300 scale-100">
            <button
              onClick={() => setShowSellModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Start Selling on GatorEx</h2>
                <p className="text-gray-600 text-lg">Chat with our bot to create your listing in minutes</p>
              </div>

              <div className="space-y-4 mb-8">
                <a
                  href={generateWhatsAppBotLink('sell')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  🚀 Open WhatsApp Bot
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateWhatsAppBotLink('sell'));
                    // Better feedback than alert
                    const button = document.activeElement as HTMLButtonElement;
                    const originalText = button.innerHTML;
                    button.innerHTML = '✅ Copied!';
                    button.classList.add('bg-green-50', 'text-green-600', 'border-green-200');
                    setTimeout(() => {
                      button.innerHTML = originalText;
                      button.classList.remove('bg-green-50', 'text-green-600', 'border-green-200');
                    }, 2000);
                  }}
                  className="block w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  <QrCode size={16} className="inline mr-2" />
                  Copy Bot Link
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📱</span>
                  </div>
                  <p className="font-medium text-gray-900">Quick Listing</p>
                  <p className="text-gray-600">Via chat interface</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="font-medium text-gray-900">UF Students</p>
                  <p className="text-gray-600">Verified community</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="font-medium text-gray-900">Direct Contact</p>
                  <p className="text-gray-600">No middleman</p>
                </div>
              </div>

              <div className="text-left bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">?</span>
                  How it works
                </h3>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                    <span>Click "Open WhatsApp Bot" above</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                    <span>Tell the bot what you're selling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                    <span>Add price, photos, and description</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                    <span>Your listing goes live instantly!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}