import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, 
  MessageCircle, 
  Home as HomeIcon, 
  User,
  Search,
  X
} from 'lucide-react';
import ChatBot from '../chat/ChatBot';

interface WebNavProps {
  userVerified?: boolean;
  onSearch?: (query: string) => void;
}

export default function WebNav({ userVerified = false, onSearch }: WebNavProps) {
  const router = useRouter();
  const [showChatBot, setShowChatBot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSellClick = () => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackSellCTA('web_top_nav');

    if (!userVerified) {
      router.push('/login-otp');
      return;
    }

    router.push('/sell');
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

              <Link
                href="/sell"
                onClick={() => handleTabSwitch('sell')}
                className={`
                  px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 min-h-[44px] flex items-center shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                  ${router.pathname === '/sell' ? 'from-orange-600 to-orange-700' : ''}
                `}
                aria-label="Start selling"
                aria-current={router.pathname === '/sell' ? 'page' : undefined}
              >
                <MessageCircle size={16} className="mr-2" />
                Sell
              </Link>

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


    </>
  );
}