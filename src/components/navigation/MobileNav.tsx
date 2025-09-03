import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, 
  MessageCircle, 
  Home as HomeIcon, 
  User,
  X
} from 'lucide-react';
import ChatBot from '../chat/ChatBot';
import { useLoading } from '../../contexts/LoadingContext';

interface MobileNavProps {
  userVerified?: boolean;
}

export default function MobileNav({ userVerified = false }: MobileNavProps) {
  const router = useRouter();
  const { setNavigating } = useLoading();
  const [showChatBot, setShowChatBot] = useState(false);

  const handleSellClick = () => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackSellCTA('mobile_bottom_nav');

    if (!userVerified) {
      setNavigating(true);
      router.push('/login-otp').finally(() => setNavigating(false));
      return;
    }

    setNavigating(true);
    router.push('/sell').finally(() => setNavigating(false));
  };

  const handleTabSwitch = (tab: string, href: string) => {
    // Analytics event
    const { analytics } = require('../../lib/analytics');
    analytics.trackTabSwitch(tab, 'mobile');
    
    // Show loading animation
    setNavigating(true);
    router.push(href).finally(() => setNavigating(false));
  };

  const navItems = [
    {
      id: 'buy',
      label: 'Buy',
      icon: ShoppingBag,
      href: '/',
      active: router.pathname === '/' || router.pathname === '/buy'
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
      id: 'referrals',
      label: 'Referrals',
      icon: () => <span className="text-lg">🎁</span>,
      href: '/referrals',
      active: router.pathname === '/referrals',
      badge: 'New'
    },
    {
      id: 'sublease',
      label: 'Sublease',
      icon: HomeIcon,
      href: '/sublease',
      active: router.pathname === '/sublease',
      badge: 'Soon'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/me',
      active: router.pathname === '/me' || router.pathname === '/complete-profile'
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
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabSwitch(item.id, item.href);
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
                  <span className={`absolute -top-1 -right-1 text-white text-xs px-1.5 py-0.5 rounded-full ${
                    item.badge === 'New' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>


    </>
  );
}