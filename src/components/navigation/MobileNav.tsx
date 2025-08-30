import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, 
  MessageCircle, 
  Home as HomeIcon, 
  User,
  QrCode,
  X
} from 'lucide-react';
import { generateWhatsAppBotLink } from '../../lib/whatsapp/sharing';

interface MobileNavProps {
  userVerified?: boolean;
}

export default function MobileNav({ userVerified = false }: MobileNavProps) {
  const router = useRouter();
  const [showSellModal, setShowSellModal] = useState(false);

  const handleSellClick = () => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackSellCTA('mobile_bottom_nav');

    if (!userVerified) {
      router.push('/verify');
      return;
    }

    setShowSellModal(true);
  };

  const handleTabSwitch = (tab: string) => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackTabSwitch(tab, 'mobile');
  };

  const navItems = [
    {
      id: 'buy',
      label: 'Buy',
      icon: ShoppingBag,
      href: '/',
      active: router.pathname === '/'
    },
    {
      id: 'sell',
      label: 'Sell',
      icon: MessageCircle,
      href: '/sell',
      active: router.pathname === '/sell',
      onClick: handleSellClick
    },
    {
      id: 'sublease',
      label: 'Sublease',
      icon: HomeIcon,
      href: '/sublease',
      active: router.pathname === '/sublease',
      badge: 'Coming Soon'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/me',
      active: router.pathname === '/me'
    }
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 md:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-4 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            
            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    handleTabSwitch(item.id);
                  }}
                  className={`
                    relative flex flex-col items-center justify-center p-3 min-h-[48px] min-w-[48px] rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'text-orange-600 bg-orange-100 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95'
                    }
                  `}
                  aria-label={`${item.label} tab`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleTabSwitch(item.id)}
                className={`
                  relative flex flex-col items-center justify-center p-3 min-h-[48px] min-w-[48px] rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-orange-600 bg-orange-100 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95'
                  }
                `}
                aria-label={`${item.label} tab`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowSellModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mb-4">
                <MessageCircle size={48} className="mx-auto text-orange-500 mb-2" />
                <h2 className="text-xl font-bold text-gray-900">Start Selling</h2>
                <p className="text-gray-600 mt-1">Chat with our bot to list your item</p>
              </div>

              <div className="space-y-3">
                <a
                  href={generateWhatsAppBotLink('sell')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  🚀 Open WhatsApp Bot
                </a>

                <button
                  onClick={() => {
                    // Show QR code or copy link functionality
                    navigator.clipboard.writeText(generateWhatsAppBotLink('sell'));
                    alert('Bot link copied to clipboard!');
                  }}
                  className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <QrCode size={16} className="inline mr-2" />
                  Copy Bot Link
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>📱 Quick & easy listing</p>
                <p>🔒 UF students only</p>
                <p>💬 Direct buyer contact</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}